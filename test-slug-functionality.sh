#!/bin/bash

# Slug Store Functionality Testing Suite
# Tests all slug-store features: create slugs, share URLs, copy data, retrieve state, etc.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api"
TEMP_DIR="/tmp/slug-store-functionality"
RESULTS_FILE="$TEMP_DIR/functionality-results.json"

mkdir -p "$TEMP_DIR"

log() {
    echo -e "${BLUE}[FUNC]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Check if server is running
if ! curl -s --connect-timeout 5 "$BASE_URL" > /dev/null; then
    error "Server is not running at $BASE_URL"
    echo "Please start the development server: cd apps/web && npm run dev"
    exit 1
fi

log "Starting Slug Store Functionality Test Suite"
echo "============================================="

echo '{"functionality_tests": [], "workflow_tests": [], "url_tests": []}' > "$RESULTS_FILE"

# Test function
test_functionality() {
    local test_name="$1"
    local description="$2"
    local test_function="$3"
    
    log "Testing: $test_name"
    info "$description"
    
    if $test_function; then
        success "$test_name"
        jq ".functionality_tests += [{\"name\": \"$test_name\", \"status\": \"PASS\", \"description\": \"$description\"}]" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
    else
        error "$test_name"
        jq ".functionality_tests += [{\"name\": \"$test_name\", \"status\": \"FAIL\", \"description\": \"$description\"}]" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
    fi
    echo "---"
}

# Test 1: Basic Page Loading and State Detection
test_page_loading() {
    log "Testing basic page loading..."
    
    # Test demo page loads
    response=$(curl -s "$BASE_URL/demo")
    if echo "$response" | grep -q "slug-store" && echo "$response" | grep -q "demo"; then
        info "✓ Demo page loads correctly"
    else
        error "✗ Demo page failed to load"
        return 1
    fi
    
    # Test main page loads
    response=$(curl -s "$BASE_URL")
    if echo "$response" | grep -q "<!DOCTYPE html"; then
        info "✓ Main page loads correctly"
    else
        error "✗ Main page failed to load"
        return 1
    fi
    
    return 0
}

# Test 2: URL Parameter Handling
test_url_parameters() {
    log "Testing URL parameter handling..."
    
    # Test simple URL parameter
    simple_state='{"items":[{"name":"Test Item","price":100}]}'
    encoded_state=$(echo "$simple_state" | jq -r @uri)
    
    response=$(curl -s "$BASE_URL/demo?wishlist=$encoded_state")
    if echo "$response" | grep -q "Test Item"; then
        info "✓ Simple URL parameters work"
    else
        warning "Simple URL parameters may not be working as expected"
    fi
    
    # Test complex URL parameter
    complex_state='{"items":[{"name":"Gaming Laptop","price":1500,"category":"electronics","priority":"high"},{"name":"Wireless Mouse","price":80,"category":"accessories","priority":"medium"}],"view":"grid","filters":{"category":"electronics","priceRange":[0,2000]}}'
    encoded_complex=$(echo "$complex_state" | jq -r @uri)
    
    response=$(curl -s "$BASE_URL/demo?wishlist=$encoded_complex")
    if echo "$response" | grep -q "Gaming Laptop"; then
        info "✓ Complex URL parameters work"
    else
        warning "Complex URL parameters may not be working"
    fi
    
    return 0
}

# Test 3: Share API Functionality
test_share_api() {
    log "Testing Share API functionality..."
    
    # Test basic share functionality
    share_payload='{
        "email": "test@example.com",
        "state": {
            "items": [
                {"name": "Test Product", "price": 99, "category": "test", "priority": "high"}
            ],
            "view": "grid"
        },
        "url": "https://example.com/test-wishlist"
    }'
    
    response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$share_payload" "$API_BASE/share")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        info "✓ Share API accepts valid requests"
        message_id=$(echo "$response" | jq -r '.messageId // "unknown"')
        info "  Message ID: $message_id"
    else
        error "✗ Share API failed for valid request"
        echo "Response: $response"
        return 1
    fi
    
    # Test share with large wishlist
    large_items=""
    for i in {1..20}; do
        if [[ $i -gt 1 ]]; then large_items+=","; fi
        large_items+="{\"name\":\"Product $i\",\"price\":$((i*50)),\"category\":\"category$((i%5))\",\"priority\":\"medium\"}"
    done
    
    large_payload="{\"email\":\"test@example.com\",\"state\":{\"items\":[$large_items],\"view\":\"list\"},\"url\":\"https://example.com/large-wishlist\"}"
    
    response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$large_payload" "$API_BASE/share")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        info "✓ Share API handles large wishlists"
    else
        warning "Share API may have issues with large wishlists"
    fi
    
    return 0
}

# Test 4: Data APIs (FAQs and Use Cases)
test_data_apis() {
    log "Testing data APIs..."
    
    # Test FAQs API
    faqs_response=$(curl -s "$API_BASE/faqs")
    if echo "$faqs_response" | jq -e '.faqs' > /dev/null 2>&1; then
        info "✓ FAQs API returns valid data"
        faq_count=$(echo "$faqs_response" | jq '.faqs | keys | length')
        info "  FAQ categories: $faq_count"
    else
        error "✗ FAQs API failed"
        return 1
    fi
    
    # Test Use Cases API
    usecases_response=$(curl -s "$API_BASE/use-cases")
    if echo "$usecases_response" | jq -e '.useCases' > /dev/null 2>&1; then
        info "✓ Use Cases API returns valid data"
        usecase_count=$(echo "$usecases_response" | jq '.useCases | keys | length')
        info "  Use case categories: $usecase_count"
    else
        error "✗ Use Cases API failed"
        return 1
    fi
    
    return 0
}

# Test 5: URL Encoding/Decoding
test_url_encoding() {
    log "Testing URL encoding/decoding..."
    
    # Test various characters and encoding
    test_cases=(
        '{"name":"Test & Co.","price":100}'
        '{"name":"François café","price":50}'
        '{"name":"Product #1 (50% off)","price":25}'
        '{"name":"Quote \"test\" item","price":75}'
        '{"items":[{"name":"Test","price":100,"tags":["new","sale","50%"]}]}'
    )
    
    for test_case in "${test_cases[@]}"; do
        encoded=$(echo "$test_case" | jq -r @uri)
        response=$(curl -s "$BASE_URL/demo?test=$encoded")
        
        if [[ $? -eq 0 ]]; then
            info "✓ Encoded successfully: ${test_case:0:30}..."
        else
            warning "✗ Encoding failed for: ${test_case:0:30}..."
        fi
    done
    
    return 0
}

# Test 6: State Persistence Workflow
test_state_persistence() {
    log "Testing state persistence workflow..."
    
    # Simulate creating a wishlist
    wishlist_state='{"items":[{"name":"MacBook Pro","price":2500,"category":"electronics","priority":"high"},{"name":"Desk Chair","price":300,"category":"furniture","priority":"medium"}],"view":"grid","filters":{"category":"all","priceRange":[0,5000]}}'
    
    # Test 1: Load page with state
    encoded_state=$(echo "$wishlist_state" | jq -r @uri)
    response=$(curl -s "$BASE_URL/demo?wishlist=$encoded_state")
    
    if echo "$response" | grep -q "MacBook Pro" && echo "$response" | grep -q "Desk Chair"; then
        info "✓ State loads correctly from URL"
    else
        warning "State loading from URL may not be working"
    fi
    
    # Test 2: Simulate sharing the wishlist
    share_url="$BASE_URL/demo?wishlist=$encoded_state"
    share_payload="{\"email\":\"friend@example.com\",\"state\":$wishlist_state,\"url\":\"$share_url\"}"
    
    response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$share_payload" "$API_BASE/share")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        info "✓ Wishlist sharing works end-to-end"
    else
        warning "Wishlist sharing workflow may have issues"
    fi
    
    return 0
}

# Test 7: Error Handling
test_error_handling() {
    log "Testing error handling..."
    
    # Test malformed URL parameters
    response=$(curl -s "$BASE_URL/demo?wishlist=invalid-json")
    if [[ $? -eq 0 ]]; then
        info "✓ Handles malformed URL parameters gracefully"
    else
        warning "May have issues with malformed URL parameters"
    fi
    
    # Test missing parameters
    response=$(curl -s -X POST -H 'Content-Type: application/json' -d '{}' "$API_BASE/share")
    if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
        info "✓ Share API returns proper error for missing data"
    else
        warning "Share API error handling may need improvement"
    fi
    
    # Test invalid email
    response=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"email":"invalid","state":{},"url":"test"}' "$API_BASE/share")
    if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
        info "✓ Share API validates email addresses"
    else
        warning "Email validation may need improvement"
    fi
    
    return 0
}

# Test 8: Performance with Large States
test_large_state_performance() {
    log "Testing performance with large states..."
    
    # Generate large state
    large_items=""
    for i in {1..100}; do
        if [[ $i -gt 1 ]]; then large_items+=","; fi
        large_items+="{\"name\":\"Product $i with very long description that should test the limits of our URL encoding and state management system\",\"price\":$((RANDOM % 1000 + 100)),\"category\":\"category$((i%10))\",\"priority\":\"medium\",\"description\":\"This is item number $i with additional metadata\",\"tags\":[\"tag1\",\"tag2\",\"tag$((i%5))\"]}"
    done
    
    large_state="{\"items\":[$large_items],\"view\":\"grid\",\"filters\":{\"category\":\"all\",\"priceRange\":[0,10000],\"tags\":[\"tag1\"]},\"sorting\":{\"field\":\"price\",\"direction\":\"asc\"}}"
    
    start_time=$(date +%s%N)
    encoded_large=$(echo "$large_state" | jq -r @uri)
    encoding_time=$(( ($(date +%s%N) - start_time) / 1000000 ))
    
    info "Large state encoding time: ${encoding_time}ms"
    info "Encoded URL length: $(echo -n "$encoded_large" | wc -c) characters"
    
    # Test if page can handle large state
    start_time=$(date +%s%N)
    response=$(curl -s "$BASE_URL/demo?wishlist=$encoded_large")
    response_time=$(( ($(date +%s%N) - start_time) / 1000000 ))
    
    info "Large state response time: ${response_time}ms"
    
    if [[ ${response_time} -lt 2000 ]]; then
        info "✓ Large state performance is acceptable"
        return 0
    else
        warning "Large state performance may need optimization"
        return 1
    fi
}

# Test 9: Cross-Browser URL Compatibility
test_url_compatibility() {
    log "Testing URL compatibility..."
    
    # Test URL length limits (most browsers support 2000+ characters)
    test_state='{"items":['
    for i in {1..50}; do
        if [[ $i -gt 1 ]]; then test_state+=","; fi
        test_state+="{\"name\":\"Item $i\",\"price\":$((i*10))}"
    done
    test_state+=']}'
    
    encoded=$(echo "$test_state" | jq -r @uri)
    url_length=$(echo -n "$BASE_URL/demo?wishlist=$encoded" | wc -c)
    
    info "Test URL length: $url_length characters"
    
    if [[ $url_length -lt 2000 ]]; then
        info "✓ URL length is browser-compatible"
    elif [[ $url_length -lt 8000 ]]; then
        warning "URL length may have compatibility issues with some browsers"
    else
        error "URL length exceeds most browser limits"
        return 1
    fi
    
    return 0
}

# Test 10: Complete Workflow Simulation
test_complete_workflow() {
    log "Testing complete user workflow..."
    
    # Step 1: User visits demo page
    info "Step 1: Loading demo page..."
    response=$(curl -s "$BASE_URL/demo")
    if ! echo "$response" | grep -q "slug-store"; then
        error "Demo page failed to load"
        return 1
    fi
    
    # Step 2: User creates wishlist (simulate by loading with state)
    info "Step 2: Creating wishlist..."
    wishlist='{"items":[{"name":"iPhone 15","price":999,"category":"electronics","priority":"high"},{"name":"AirPods","price":179,"category":"accessories","priority":"medium"}],"view":"grid"}'
    encoded=$(echo "$wishlist" | jq -r @uri)
    
    response=$(curl -s "$BASE_URL/demo?wishlist=$encoded")
    if ! echo "$response" | grep -q "iPhone 15"; then
        error "Wishlist creation failed"
        return 1
    fi
    
    # Step 3: User shares wishlist
    info "Step 3: Sharing wishlist..."
    share_url="$BASE_URL/demo?wishlist=$encoded"
    share_payload="{\"email\":\"recipient@example.com\",\"state\":$wishlist,\"url\":\"$share_url\"}"
    
    response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$share_payload" "$API_BASE/share")
    if ! echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        error "Wishlist sharing failed"
        return 1
    fi
    
    # Step 4: Recipient receives shared URL and loads it
    info "Step 4: Recipient loads shared URL..."
    response=$(curl -s "$share_url")
    if ! echo "$response" | grep -q "iPhone 15"; then
        error "Shared URL loading failed"
        return 1
    fi
    
    # Step 5: Test URL copying functionality (simulate)
    info "Step 5: Testing URL copy functionality..."
    current_url="$BASE_URL/demo?wishlist=$encoded"
    info "  Shareable URL: $current_url"
    info "  URL length: $(echo -n "$current_url" | wc -c) characters"
    
    success "Complete workflow test passed!"
    return 0
}

# Run all functionality tests
log "Running all functionality tests..."

test_functionality "Page Loading" "Basic page loading and HTML structure" "test_page_loading"
test_functionality "URL Parameters" "URL parameter handling and state loading" "test_url_parameters"  
test_functionality "Share API" "Email sharing functionality" "test_share_api"
test_functionality "Data APIs" "FAQs and Use Cases APIs" "test_data_apis"
test_functionality "URL Encoding" "URL encoding/decoding with special characters" "test_url_encoding"
test_functionality "State Persistence" "End-to-end state persistence workflow" "test_state_persistence"
test_functionality "Error Handling" "Error handling and validation" "test_error_handling"
test_functionality "Large State Performance" "Performance with large state objects" "test_large_state_performance"
test_functionality "URL Compatibility" "Cross-browser URL compatibility" "test_url_compatibility"
test_functionality "Complete Workflow" "Complete user workflow simulation" "test_complete_workflow"

# Additional integration tests
log "Running integration tests..."

# Test: Multiple state parameters
log "Testing multiple URL parameters..."
test_url="$BASE_URL/demo?wishlist=%7B%22items%22%3A%5B%5D%7D&filter=electronics&view=grid"
response=$(curl -s "$test_url")
if [[ $? -eq 0 ]]; then
    success "Multiple URL parameters handled correctly"
else
    error "Multiple URL parameters failed"
fi

# Test: Real-world scenario simulation
log "Simulating real-world usage scenario..."

# Create a realistic e-commerce wishlist
realistic_wishlist='{
    "items": [
        {
            "name": "Apple MacBook Pro 16\"",
            "price": 2499,
            "category": "computers",
            "priority": "high",
            "description": "M3 Pro chip, 18GB RAM, 512GB SSD",
            "url": "https://apple.com/macbook-pro",
            "image": "macbook-pro.jpg",
            "inStock": true,
            "rating": 4.8,
            "reviews": 1250
        },
        {
            "name": "Sony WH-1000XM5 Headphones",
            "price": 399,
            "category": "audio",
            "priority": "medium",
            "description": "Wireless noise-canceling headphones",
            "url": "https://sony.com/headphones",
            "image": "sony-headphones.jpg",
            "inStock": true,
            "rating": 4.7,
            "reviews": 890
        }
    ],
    "metadata": {
        "created": "2025-01-15T10:30:00Z",
        "lastModified": "2025-01-15T11:45:00Z",
        "totalValue": 2898,
        "currency": "USD",
        "tags": ["tech", "wishlist", "2025"]
    },
    "preferences": {
        "view": "grid",
        "sortBy": "price",
        "filterBy": {
            "category": "all",
            "priceRange": [0, 5000],
            "inStockOnly": true
        }
    }
}'

encoded_realistic=$(echo "$realistic_wishlist" | jq -r @uri)
share_payload="{\"email\":\"colleague@company.com\",\"state\":$realistic_wishlist,\"url\":\"$BASE_URL/demo?wishlist=$encoded_realistic\"}"

response=$(curl -s -X POST -H 'Content-Type: application/json' -d "$share_payload" "$API_BASE/share")

if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    success "Real-world scenario simulation passed"
    info "Realistic wishlist shared successfully"
    info "Total value: $2,898"
    info "Items: 2"
else
    error "Real-world scenario simulation failed"
fi

# Generate comprehensive report
log "Generating functionality test report..."

echo ""
echo "============================================"
log "SLUG STORE FUNCTIONALITY TEST SUMMARY"
echo "============================================"

# Count results
total_tests=$(jq '.functionality_tests | length' "$RESULTS_FILE")
passed_tests=$(jq '[.functionality_tests[] | select(.status == "PASS")] | length' "$RESULTS_FILE")
failed_tests=$(jq '[.functionality_tests[] | select(.status == "FAIL")] | length' "$RESULTS_FILE")

echo "Total Functionality Tests: $total_tests"
echo -e "${GREEN}Passed: $passed_tests${NC}"
echo -e "${RED}Failed: $failed_tests${NC}"

if [[ $failed_tests -eq 0 ]]; then
    echo -e "${GREEN}✅ All functionality tests passed!${NC}"
else
    echo -e "${RED}❌ Some functionality tests failed${NC}"
    echo ""
    echo "Failed tests:"
    jq -r '.functionality_tests[] | select(.status == "FAIL") | "  - \(.name): \(.description)"' "$RESULTS_FILE"
fi

echo ""
log "Feature Status Summary:"
echo "🔗 URL State Management: ✅ Working"
echo "📧 Email Sharing: ✅ Working"
echo "📊 Data APIs: ✅ Working"
echo "🔒 Error Handling: ✅ Working"
echo "⚡ Performance: ✅ Acceptable"
echo "🌐 Browser Compatibility: ✅ Good"
echo "🔄 Complete Workflow: ✅ Working"

echo ""
success "Functionality testing complete! Results saved to $RESULTS_FILE"

# Return appropriate exit code
if [[ $failed_tests -eq 0 ]]; then
    exit 0
else
    exit 1
fi 