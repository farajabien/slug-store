#!/bin/bash

# Slug Store Performance Testing Suite
# Tests response times, concurrent load, and API throughput

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api"
TEMP_DIR="/tmp/slug-store-perf"
RESULTS_FILE="$TEMP_DIR/performance-results.json"

mkdir -p "$TEMP_DIR"

log() {
    echo -e "${BLUE}[PERF]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if server is running
if ! curl -s --connect-timeout 5 "$BASE_URL" > /dev/null; then
    echo -e "${RED}[ERROR]${NC} Server is not running at $BASE_URL"
    exit 1
fi

log "Starting Performance Test Suite"
echo "==============================="

# Test 1: Response Time Measurements
log "Measuring API response times..."

echo '{"response_times": {}}' > "$RESULTS_FILE"

measure_response_time() {
    local endpoint="$1"
    local name="$2"
    local total_time=0
    local runs=10
    
    log "Testing $name ($runs runs)..."
    
    for i in $(seq 1 $runs); do
        start=$(date +%s%N)
        curl -s "$endpoint" > /dev/null
        end=$(date +%s%N)
        time_ms=$(( (end - start) / 1000000 ))
        total_time=$((total_time + time_ms))
        echo -n "."
    done
    echo ""
    
    avg_time=$((total_time / runs))
    
    if [[ $avg_time -lt 100 ]]; then
        success "$name: ${avg_time}ms average (Excellent)"
    elif [[ $avg_time -lt 300 ]]; then
        success "$name: ${avg_time}ms average (Good)"
    elif [[ $avg_time -lt 1000 ]]; then
        warning "$name: ${avg_time}ms average (Acceptable)"
    else
        echo -e "${RED}[SLOW]${NC} $name: ${avg_time}ms average (Needs optimization)"
    fi
    
    # Update results file
    jq ".response_times.\"$name\" = $avg_time" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
}

# Measure different endpoints
measure_response_time "$API_BASE/faqs" "FAQs_API"
measure_response_time "$API_BASE/use-cases" "UseCases_API"
measure_response_time "$BASE_URL" "Main_Page"
measure_response_time "$BASE_URL/demo" "Demo_Page"
measure_response_time "$BASE_URL/faq" "FAQ_Page"

# Test 2: Concurrent Load Testing
log "Testing concurrent load handling..."

test_concurrent_load() {
    local concurrent_users="$1"
    local requests_per_user="$2"
    local endpoint="$3"
    local test_name="$4"
    
    log "Running $test_name: $concurrent_users users, $requests_per_user requests each"
    
    start_time=$(date +%s)
    
    for i in $(seq 1 $concurrent_users); do
        (
            for j in $(seq 1 $requests_per_user); do
                curl -s "$endpoint" > /dev/null 2>&1
            done
        ) &
    done
    
    wait
    
    end_time=$(date +%s)
    total_time=$((end_time - start_time))
    total_requests=$((concurrent_users * requests_per_user))
    rps=$((total_requests / total_time))
    
    success "$test_name completed: $total_requests requests in ${total_time}s (${rps} RPS)"
    
    # Update results
    jq ".load_tests.\"$test_name\" = {\"users\": $concurrent_users, \"requests_per_user\": $requests_per_user, \"total_time\": $total_time, \"rps\": $rps}" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
}

# Initialize load tests section
jq '. + {"load_tests": {}}' "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"

# Run concurrent load tests
test_concurrent_load 5 10 "$API_BASE/faqs" "Light_Load"
test_concurrent_load 10 20 "$API_BASE/faqs" "Medium_Load"
test_concurrent_load 20 10 "$API_BASE/faqs" "Heavy_Load"

# Test 3: Share API Performance with different payload sizes
log "Testing Share API with different payload sizes..."

jq '. + {"share_api_performance": {}}' "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"

test_share_payload() {
    local items_count="$1"
    local test_name="$2"
    
    log "Testing Share API with $items_count items..."
    
    # Generate test items
    items=""
    for i in $(seq 1 $items_count); do
        if [[ $i -gt 1 ]]; then items+=","; fi
        items+="{\"name\":\"Item $i\",\"price\":$((i*10)),\"category\":\"category$((i%5))\",\"priority\":\"medium\",\"description\":\"Test item description for item number $i\"}"
    done
    
    payload="{\"email\":\"shawnbienvenu@gmail.com\",\"state\":{\"items\":[$items],\"view\":\"grid\",\"filters\":{\"category\":\"all\"}},\"url\":\"https://example.com\"}"
    
    # Measure response time
    start=$(date +%s%N)
    response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$payload" "$API_BASE/share")
    end=$(date +%s%N)
    time_ms=$(( (end - start) / 1000000 ))
    
    # Check if successful
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        success "$test_name: ${time_ms}ms (${items_count} items)"
    else
        echo -e "${RED}[FAIL]${NC} $test_name: ${time_ms}ms (${items_count} items) - Request failed"
    fi
    
    # Update results
    jq ".share_api_performance.\"$test_name\" = {\"items_count\": $items_count, \"response_time_ms\": $time_ms, \"payload_size\": $(echo -n "$payload" | wc -c)}" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
}

test_share_payload 1 "Small_Payload"
test_share_payload 10 "Medium_Payload"
test_share_payload 50 "Large_Payload"
test_share_payload 100 "XLarge_Payload"

# Test 4: Memory Usage Simulation
log "Testing memory usage with large payloads..."

# Test with very large state data
large_state=""
for i in {1..1000}; do
    if [[ $i -gt 1 ]]; then large_state+=","; fi
    large_state+="{\"id\":\"$i\",\"name\":\"Very Long Item Name That Contains Many Characters And Should Test The Limits Of Our System $i\",\"price\":$((RANDOM % 1000 + 100)),\"category\":\"category$((i%10))\",\"priority\":\"high\",\"description\":\"This is a very long description that contains many words and should test how well our system handles large amounts of text data in JSON payloads. Item number $i has special characteristics.\",\"metadata\":{\"created\":\"2025-01-15T$(printf '%02d' $((i%24))):$(printf '%02d' $((i%60))):$(printf '%02d' $((i%60)))Z\",\"tags\":[\"tag1\",\"tag2\",\"tag3\"],\"extra\":\"Additional data field $i\"}}"
done

large_payload="{\"email\":\"shawnbienvenu@gmail.com\",\"state\":{\"items\":[$large_state],\"view\":\"grid\",\"filters\":{\"category\":\"all\",\"priceRange\":[0,10000],\"tags\":[\"tag1\",\"tag2\"]},\"sorting\":{\"field\":\"price\",\"direction\":\"asc\"},\"pagination\":{\"page\":1,\"limit\":50}},\"url\":\"https://example.com/large-test\"}"

log "Testing with payload size: $(echo -n "$large_payload" | wc -c) bytes"

start=$(date +%s%N)
response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$large_payload" "$API_BASE/share" 2>&1)
end=$(date +%s%N)
time_ms=$(( (end - start) / 1000000 ))

if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    success "Large payload test: ${time_ms}ms"
else
    if echo "$response" | grep -q "413\|Request Entity Too Large"; then
        warning "Large payload rejected (413 - Request Too Large): ${time_ms}ms"
    else
        echo -e "${RED}[FAIL]${NC} Large payload test failed: ${time_ms}ms"
        echo "Response: $response"
    fi
fi

# Test 5: Stress Testing
log "Running stress test..."

stress_test() {
    local duration_seconds="$1"
    local concurrent_users="$2"
    
    log "Stress test: $concurrent_users concurrent users for ${duration_seconds}s"
    
    start_time=$(date +%s)
    end_time=$((start_time + duration_seconds))
    request_count=0
    success_count=0
    
    for i in $(seq 1 $concurrent_users); do
        (
            local user_requests=0
            local user_success=0
            while [[ $(date +%s) -lt $end_time ]]; do
                if curl -s "$API_BASE/faqs" > /dev/null 2>&1; then
                    ((user_success++))
                fi
                ((user_requests++))
                sleep 0.1
            done
            echo "$user_requests $user_success" > "$TEMP_DIR/user_$i.txt"
        ) &
    done
    
    wait
    
    # Collect results
    for i in $(seq 1 $concurrent_users); do
        if [[ -f "$TEMP_DIR/user_$i.txt" ]]; then
            read user_requests user_success < "$TEMP_DIR/user_$i.txt"
            request_count=$((request_count + user_requests))
            success_count=$((success_count + user_success))
        fi
    done
    
    actual_duration=$(($(date +%s) - start_time))
    rps=$((request_count / actual_duration))
    success_rate=$((success_count * 100 / request_count))
    
    success "Stress test completed: $request_count requests, $success_count successful (${success_rate}%), ${rps} RPS"
    
    # Update results
    jq ".stress_test = {\"duration\": $actual_duration, \"concurrent_users\": $concurrent_users, \"total_requests\": $request_count, \"successful_requests\": $success_count, \"success_rate\": $success_rate, \"rps\": $rps}" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
}

stress_test 30 10

# Test 6: URL Parameter Performance
log "Testing URL parameter performance..."

test_url_params() {
    local param_size="$1"
    local test_name="$2"
    
    # Create large URL parameter
    param_value=$(printf 'a%.0s' $(seq 1 $param_size))
    encoded_param=$(printf "%s" "$param_value" | sed 's/ /%20/g')
    
    start=$(date +%s%N)
    curl -s "$BASE_URL/demo?test=$encoded_param" > /dev/null
    end=$(date +%s%N)
    time_ms=$(( (end - start) / 1000000 ))
    
    success "$test_name (${param_size} chars): ${time_ms}ms"
    
    # Update results
    jq ".url_params.\"$test_name\" = {\"param_size\": $param_size, \"response_time_ms\": $time_ms}" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
}

jq '. + {"url_params": {}}' "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"

test_url_params 100 "Small_URL_Param"
test_url_params 1000 "Medium_URL_Param"
test_url_params 5000 "Large_URL_Param"

# Generate performance report
log "Generating performance report..."

echo ""
echo "=============================="
log "PERFORMANCE TEST SUMMARY"
echo "=============================="

# Display results
jq -r '
"Response Times (Average):",
(.response_times | to_entries[] | "  \(.key): \(.value)ms"),
"",
"Load Test Results:",
(.load_tests | to_entries[] | "  \(.key): \(.value.rps) RPS (\(.value.users) users)"),
"",
"Share API Performance:",
(.share_api_performance | to_entries[] | "  \(.key): \(.value.response_time_ms)ms (\(.value.items_count) items)"),
"",
"Stress Test:",
"  Success Rate: \(.stress_test.success_rate)%",
"  Average RPS: \(.stress_test.rps)",
"",
"URL Parameter Tests:",
(.url_params | to_entries[] | "  \(.key): \(.value.response_time_ms)ms")
' "$RESULTS_FILE"

echo ""
success "Performance testing complete! Results saved to $RESULTS_FILE"

# Check for performance issues
echo ""
log "Performance Analysis:"

# Check for slow endpoints
slow_endpoints=$(jq -r '.response_times | to_entries[] | select(.value > 500) | .key' "$RESULTS_FILE")
if [[ -n "$slow_endpoints" ]]; then
    echo -e "${YELLOW}⚠️  Slow endpoints detected:${NC}"
    echo "$slow_endpoints" | while read endpoint; do
        time=$(jq -r ".response_times.\"$endpoint\"" "$RESULTS_FILE")
        echo "  - $endpoint: ${time}ms"
    done
else
    echo -e "${GREEN}✅ All endpoints performing well${NC}"
fi

# Check stress test success rate
success_rate=$(jq -r '.stress_test.success_rate' "$RESULTS_FILE")
if [[ $success_rate -lt 95 ]]; then
    echo -e "${YELLOW}⚠️  Stress test success rate low: ${success_rate}%${NC}"
else
    echo -e "${GREEN}✅ Stress test success rate good: ${success_rate}%${NC}"
fi

echo ""
log "Performance testing complete!" 