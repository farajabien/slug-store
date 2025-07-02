#!/bin/bash

# Slug Store v4.0.8 - Comprehensive cURL Test Suite
# Tests all API endpoints, error conditions, and functionality

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api"
TEMP_DIR="/tmp/slug-store-tests"
RESULTS_FILE="$TEMP_DIR/test-results.json"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Create temp directory
mkdir -p "$TEMP_DIR"

# Initialize results file
echo '{"tests": []}' > "$RESULTS_FILE"

# Utility functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test runner function
run_test() {
    local test_name="$1"
    local expected_status="$2"
    local curl_command="$3"
    local validation_func="$4"
    
    ((TOTAL_TESTS++))
    log "Running test: $test_name"
    
    # Execute curl command and capture response
    local response_file="$TEMP_DIR/response_${TOTAL_TESTS}.txt"
    local headers_file="$TEMP_DIR/headers_${TOTAL_TESTS}.txt"
    
    # Run curl with detailed output
    if curl -s -w "%{http_code}" -D "$headers_file" -o "$response_file" $curl_command > "$TEMP_DIR/status_${TOTAL_TESTS}.txt" 2>&1; then
        local actual_status=$(cat "$TEMP_DIR/status_${TOTAL_TESTS}.txt")
        local response_body=$(cat "$response_file")
        
        # Check status code
        if [[ "$actual_status" == "$expected_status" ]]; then
            # Run custom validation if provided
            if [[ -n "$validation_func" ]]; then
                if $validation_func "$response_body" "$headers_file"; then
                    success "$test_name (Status: $actual_status)"
                else
                    error "$test_name - Validation failed (Status: $actual_status)"
                    echo "Response: $response_body"
                fi
            else
                success "$test_name (Status: $actual_status)"
            fi
        else
            error "$test_name - Expected status $expected_status, got $actual_status"
            echo "Response: $response_body"
        fi
    else
        error "$test_name - cURL command failed"
        cat "$TEMP_DIR/status_${TOTAL_TESTS}.txt"
    fi
    
    echo "---"
}

# Validation functions
validate_json() {
    local response="$1"
    echo "$response" | jq . > /dev/null 2>&1
}

validate_faqs() {
    local response="$1"
    echo "$response" | jq -e '.faqs' > /dev/null 2>&1
}

validate_use_cases() {
    local response="$1"
    echo "$response" | jq -e '.useCases' > /dev/null 2>&1
}

validate_share_success() {
    local response="$1"
    echo "$response" | jq -e '.success' > /dev/null 2>&1
}

validate_share_error() {
    local response="$1"
    echo "$response" | jq -e '.error' > /dev/null 2>&1
}

validate_html() {
    local response="$1"
    echo "$response" | grep -q "<!DOCTYPE html"
}

validate_demo_page() {
    local response="$1"
    echo "$response" | grep -q "slug-store" && echo "$response" | grep -q "demo"
}

validate_cors_headers() {
    local response="$1"
    local headers_file="$2"
    grep -q "Access-Control-Allow-Origin" "$headers_file"
}

# Start test server check
log "Testing if server is running at $BASE_URL"
if ! curl -s --connect-timeout 5 "$BASE_URL" > /dev/null; then
    error "Server is not running at $BASE_URL"
    echo "Please start the development server with: cd apps/web && npm run dev"
    exit 1
fi
success "Server is running"

echo ""
log "Starting comprehensive cURL test suite for Slug Store v4.0.8"
echo "=================================================================="

# Test 1: Basic API Health Check
run_test "API Health Check" "200" \
    "$API_BASE/faqs" \
    "validate_json"

# Test 2: FAQs API - GET request
run_test "FAQs API - Valid GET" "200" \
    "$API_BASE/faqs" \
    "validate_faqs"

# Test 3: FAQs API - With headers
run_test "FAQs API - With Accept header" "200" \
    "-H 'Accept: application/json' $API_BASE/faqs" \
    "validate_faqs"

# Test 4: Use Cases API - GET request
run_test "Use Cases API - Valid GET" "200" \
    "$API_BASE/use-cases" \
    "validate_use_cases"

# Test 5: Use Cases API - With headers
run_test "Use Cases API - With Accept header" "200" \
    "-H 'Accept: application/json' $API_BASE/use-cases" \
    "validate_use_cases"

# Test 6: Share API - Valid POST request
run_test "Share API - Valid POST" "200" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"state\":{\"items\":[{\"name\":\"Test Item\",\"price\":100,\"category\":\"test\",\"priority\":\"high\"}]},\"url\":\"https://example.com/test\"}' $API_BASE/share" \
    "validate_share_success"

# Test 7: Share API - Missing email
run_test "Share API - Missing email" "400" \
    "-X POST -H 'Content-Type: application/json' -d '{\"state\":{\"items\":[]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_share_error"

# Test 8: Share API - Invalid email
run_test "Share API - Invalid email" "400" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"invalid-email\",\"state\":{\"items\":[]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_share_error"

# Test 9: Share API - Missing state
run_test "Share API - Missing state" "400" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_share_error"

# Test 10: Share API - Missing URL
run_test "Share API - Missing URL" "400" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"state\":{\"items\":[]}}' $API_BASE/share" \
    "validate_share_error"

# Test 11: Share API - Empty JSON
run_test "Share API - Empty JSON" "400" \
    "-X POST -H 'Content-Type: application/json' -d '{}' $API_BASE/share" \
    "validate_share_error"

# Test 12: Share API - Invalid JSON
run_test "Share API - Invalid JSON" "400" \
    "-X POST -H 'Content-Type: application/json' -d 'invalid-json' $API_BASE/share" \
    "validate_share_error"

# Test 13: Share API - Complex state data
run_test "Share API - Complex state" "200" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"state\":{\"items\":[{\"name\":\"Gaming Laptop\",\"price\":1500,\"category\":\"electronics\",\"priority\":\"high\",\"description\":\"High-end gaming laptop with RTX 4080\"},{\"name\":\"Wireless Mouse\",\"price\":80,\"category\":\"accessories\",\"priority\":\"medium\"}],\"view\":\"grid\",\"filters\":{\"category\":\"electronics\",\"priceRange\":[0,2000]}},\"url\":\"https://example.com/wishlist\"}' $API_BASE/share" \
    "validate_share_success"

# Test 14: Share API - Large payload
large_items=$(for i in {1..50}; do echo "{\"name\":\"Item $i\",\"price\":$((i*10)),\"category\":\"category$((i%5))\",\"priority\":\"medium\"}"; done | paste -sd,)
run_test "Share API - Large payload" "200" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"state\":{\"items\":[$large_items]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_share_success"

# Test 15: Main page - GET request
run_test "Main Page - GET" "200" \
    "$BASE_URL" \
    "validate_html"

# Test 16: Demo page - GET request
run_test "Demo Page - GET" "200" \
    "$BASE_URL/demo" \
    "validate_demo_page"

# Test 17: FAQ page - GET request
run_test "FAQ Page - GET" "200" \
    "$BASE_URL/faq" \
    "validate_html"

# Test 18: Non-existent API endpoint
run_test "Non-existent API endpoint" "404" \
    "$API_BASE/nonexistent"

# Test 19: Non-existent page
run_test "Non-existent page" "404" \
    "$BASE_URL/nonexistent"

# Test 20: API with wrong method - FAQs POST
run_test "FAQs API - Wrong method (POST)" "405" \
    "-X POST $API_BASE/faqs"

# Test 21: API with wrong method - Use Cases POST
run_test "Use Cases API - Wrong method (POST)" "405" \
    "-X POST $API_BASE/use-cases"

# Test 22: Share API - Wrong method (GET)
run_test "Share API - Wrong method (GET)" "405" \
    "$API_BASE/share"

# Test 23: Demo page with URL parameters (testing slug-store functionality)
run_test "Demo with URL params" "200" \
    "$BASE_URL/demo?wishlist=%7B%22items%22%3A%5B%7B%22name%22%3A%22Test%22%2C%22price%22%3A100%7D%5D%7D" \
    "validate_demo_page"

# Test 24: CORS preflight request
run_test "CORS Preflight - FAQs" "200" \
    "-X OPTIONS -H 'Origin: https://example.com' -H 'Access-Control-Request-Method: GET' $API_BASE/faqs" \
    "validate_cors_headers"

# Test 25: CORS preflight request - Share API
run_test "CORS Preflight - Share" "200" \
    "-X OPTIONS -H 'Origin: https://example.com' -H 'Access-Control-Request-Method: POST' $API_BASE/share" \
    "validate_cors_headers"

# Test 26: Rate limiting test (multiple rapid requests)
log "Testing rate limiting with rapid requests..."
for i in {1..10}; do
    run_test "Rate Limit Test $i" "200" \
        "$API_BASE/faqs" \
        "validate_json"
    sleep 0.1
done

# Test 27: Concurrent requests test
log "Testing concurrent requests..."
for i in {1..5}; do
    curl -s "$API_BASE/faqs" > "$TEMP_DIR/concurrent_$i.txt" &
done
wait
success "Concurrent requests completed"

# Test 28: Large URL parameter test
long_param=$(printf 'a%.0s' {1..1000})
run_test "Large URL Parameter" "200" \
    "$BASE_URL/demo?test=$long_param" \
    "validate_demo_page"

# Test 29: Special characters in URL
run_test "Special Characters in URL" "200" \
    "$BASE_URL/demo?test=%20%21%40%23%24%25%5E%26%2A%28%29" \
    "validate_demo_page"

# Test 30: Testing with different User-Agent headers
run_test "Different User-Agent - Chrome" "200" \
    "-H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' $API_BASE/faqs" \
    "validate_json"

run_test "Different User-Agent - Mobile" "200" \
    "-H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' $BASE_URL" \
    "validate_html"

# Performance tests
log "Running performance tests..."

# Test response times
start_time=$(date +%s%N)
curl -s "$API_BASE/faqs" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))
log "FAQs API response time: ${response_time}ms"

start_time=$(date +%s%N)
curl -s "$BASE_URL" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))
log "Main page response time: ${response_time}ms"

# Security tests
log "Running security tests..."

# Test 31: SQL injection attempt
run_test "SQL Injection Test" "400" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"state\":{\"items\":[{\"name\":\"'; DROP TABLE users; --\",\"price\":100}]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_share_error"

# Test 32: XSS attempt
run_test "XSS Test" "400" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"<script>alert(1)</script>@example.com\",\"state\":{\"items\":[]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_share_error"

# Test 33: Path traversal attempt
run_test "Path Traversal Test" "404" \
    "$API_BASE/../../../etc/passwd"

# Final results
echo ""
echo "=================================================================="
log "Test Suite Complete!"
echo ""
echo -e "${BLUE}Total Tests:${NC} $TOTAL_TESTS"
echo -e "${GREEN}Passed:${NC} $PASSED_TESTS"
echo -e "${RED}Failed:${NC} $FAILED_TESTS"

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check the output above for details.${NC}"
    exit 1
fi 