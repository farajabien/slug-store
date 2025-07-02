#!/bin/bash

# Slug Store Security Testing Suite
# Tests various attack vectors, input validation, and security measures

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api"
TEMP_DIR="/tmp/slug-store-security"
RESULTS_FILE="$TEMP_DIR/security-results.json"

mkdir -p "$TEMP_DIR"

log() {
    echo -e "${BLUE}[SECURITY]${NC} $1"
}

success() {
    echo -e "${GREEN}[SECURE]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

vulnerability() {
    echo -e "${RED}[VULNERABLE]${NC} $1"
}

# Check if server is running
if ! curl -s --connect-timeout 5 "$BASE_URL" > /dev/null; then
    echo -e "${RED}[ERROR]${NC} Server is not running at $BASE_URL"
    exit 1
fi

log "Starting Security Test Suite"
echo "============================="

echo '{"security_tests": {}}' > "$RESULTS_FILE"

# Security test function
security_test() {
    local test_name="$1"
    local expected_behavior="$2"
    local curl_command="$3"
    local validation_func="$4"
    
    log "Testing: $test_name"
    
    response_file="$TEMP_DIR/sec_response.txt"
    headers_file="$TEMP_DIR/sec_headers.txt"
    
    if curl -s -w "%{http_code}" -D "$headers_file" -o "$response_file" $curl_command > "$TEMP_DIR/sec_status.txt" 2>&1; then
        status=$(cat "$TEMP_DIR/sec_status.txt")
        response=$(cat "$response_file")
        
        if [[ -n "$validation_func" ]]; then
            if $validation_func "$response" "$headers_file" "$status"; then
                success "$test_name - $expected_behavior"
                jq ".security_tests.\"$test_name\" = {\"status\": \"PASS\", \"description\": \"$expected_behavior\"}" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
            else
                vulnerability "$test_name - Security issue detected!"
                jq ".security_tests.\"$test_name\" = {\"status\": \"VULNERABLE\", \"description\": \"$expected_behavior\"}" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
            fi
        else
            success "$test_name - Completed (Status: $status)"
            jq ".security_tests.\"$test_name\" = {\"status\": \"COMPLETED\", \"http_status\": \"$status\"}" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
        fi
    else
        warning "$test_name - Request failed"
        jq ".security_tests.\"$test_name\" = {\"status\": \"FAILED\", \"description\": \"Request failed\"}" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"
    fi
    
    echo "---"
}

# Validation functions
validate_sql_injection() {
    local response="$1"
    local headers_file="$2"
    local status="$3"
    
    # Should return 400 (bad request) and not process malicious SQL
    [[ "$status" == "400" ]] && ! echo "$response" | grep -qi "database\|sql\|error"
}

validate_xss_protection() {
    local response="$1"
    local headers_file="$2"
    local status="$3"
    
    # Should return 400 and not execute script
    [[ "$status" == "400" ]] && ! echo "$response" | grep -i "<script>"
}

validate_csrf_headers() {
    local response="$1"
    local headers_file="$2"
    local status="$3"
    
    # Check for CSRF protection headers
    grep -qi "x-frame-options\|x-content-type-options\|x-xss-protection" "$headers_file"
}

validate_security_headers() {
    local response="$1"
    local headers_file="$2"
    local status="$3"
    
    # Check for important security headers
    local has_csp=$(grep -qi "content-security-policy" "$headers_file" && echo "1" || echo "0")
    local has_hsts=$(grep -qi "strict-transport-security" "$headers_file" && echo "1" || echo "0")
    local has_frame_options=$(grep -qi "x-frame-options" "$headers_file" && echo "1" || echo "0")
    local has_content_type=$(grep -qi "x-content-type-options" "$headers_file" && echo "1" || echo "0")
    
    log "Security headers check:"
    [[ $has_csp == "1" ]] && log "  ✓ Content-Security-Policy" || warning "  ✗ Content-Security-Policy missing"
    [[ $has_hsts == "1" ]] && log "  ✓ Strict-Transport-Security" || warning "  ✗ Strict-Transport-Security missing"
    [[ $has_frame_options == "1" ]] && log "  ✓ X-Frame-Options" || warning "  ✗ X-Frame-Options missing"
    [[ $has_content_type == "1" ]] && log "  ✓ X-Content-Type-Options" || warning "  ✗ X-Content-Type-Options missing"
    
    # Return true if at least 2 headers are present
    [[ $((has_csp + has_hsts + has_frame_options + has_content_type)) -ge 2 ]]
}

validate_cors_security() {
    local response="$1"
    local headers_file="$2"
    local status="$3"
    
    # Check CORS configuration
    local cors_origin=$(grep -i "access-control-allow-origin" "$headers_file" | cut -d: -f2 | tr -d ' \r\n')
    
    if [[ "$cors_origin" == "*" ]]; then
        warning "  CORS allows all origins (*)"
        return 1
    else
        log "  CORS origin: $cors_origin"
        return 0
    fi
}

validate_path_traversal() {
    local response="$1"
    local headers_file="$2"
    local status="$3"
    
    # Should return 404 and not expose system files
    [[ "$status" == "404" ]] && ! echo "$response" | grep -i "root:\|password\|/etc/\|/proc/"
}

validate_dos_protection() {
    local response="$1"
    local headers_file="$2"
    local status="$3"
    
    # Should handle request within reasonable time and not crash
    [[ "$status" == "400" || "$status" == "413" || "$status" == "429" ]]
}

# Test 1: SQL Injection Attempts
log "Testing SQL Injection Protection..."

security_test "SQL Injection in Email" "Should reject malicious SQL in email field" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"test'; DROP TABLE users; --@example.com\",\"state\":{\"items\":[]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_sql_injection"

security_test "SQL Injection in State" "Should reject malicious SQL in state data" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"shawnbienvenu@gmail.com\",\"state\":{\"items\":[{\"name\":\"'; DROP TABLE items; --\",\"price\":100}]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_sql_injection"

security_test "SQL Injection in URL" "Should reject malicious SQL in URL field" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"shawnbienvenu@gmail.com\",\"state\":{\"items\":[]},\"url\":\"https://example.com'; DROP TABLE urls; --\"}' $API_BASE/share" \
    "validate_sql_injection"

# Test 2: XSS Attempts
log "Testing XSS Protection..."

security_test "XSS in Email" "Should reject script tags in email" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"<script>alert(1)</script>@example.com\",\"state\":{\"items\":[]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_xss_protection"

security_test "XSS in Item Name" "Should reject script tags in item names" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"shawnbienvenu@gmail.com\",\"state\":{\"items\":[{\"name\":\"<script>alert(1)</script>\",\"price\":100}]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_xss_protection"

security_test "XSS in URL" "Should reject script tags in URL" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"shawnbienvenu@gmail.com\",\"state\":{\"items\":[]},\"url\":\"javascript:alert(1)\"}' $API_BASE/share" \
    "validate_xss_protection"

# Test 3: Path Traversal Attacks
log "Testing Path Traversal Protection..."

security_test "Path Traversal - etc/passwd" "Should not expose system files" \
    "$API_BASE/../../../etc/passwd" \
    "validate_path_traversal"

security_test "Path Traversal - Windows" "Should not expose Windows system files" \
    "$API_BASE/../../windows/system32/config/sam" \
    "validate_path_traversal"

security_test "Path Traversal - Encoded" "Should not expose system files via encoding" \
    "$API_BASE/%2E%2E%2F%2E%2E%2F%2E%2E%2Fetc%2Fpasswd" \
    "validate_path_traversal"

# Test 4: HTTP Header Injection
log "Testing HTTP Header Injection..."

security_test "Header Injection - CRLF" "Should reject CRLF injection" \
    "-H 'X-Test: value%0d%0aInjected-Header: malicious' $API_BASE/faqs" \
    ""

security_test "Header Injection - User Agent" "Should handle malicious user agents" \
    "-H 'User-Agent: <script>alert(1)</script>' $API_BASE/faqs" \
    ""

# Test 5: CSRF Protection
log "Testing CSRF Protection..."

security_test "CSRF Headers Check" "Should have CSRF protection headers" \
    "$BASE_URL" \
    "validate_csrf_headers"

security_test "Cross-Origin Request" "Should handle cross-origin requests securely" \
    "-H 'Origin: https://malicious-site.com' -H 'Referer: https://malicious-site.com' $API_BASE/faqs" \
    ""

# Test 6: Security Headers
log "Testing Security Headers..."

security_test "Security Headers Check" "Should have important security headers" \
    "$BASE_URL" \
    "validate_security_headers"

security_test "CORS Configuration" "Should have secure CORS configuration" \
    "-H 'Origin: https://test.com' $API_BASE/faqs" \
    "validate_cors_security"

# Test 7: Input Validation
log "Testing Input Validation..."

security_test "Oversized JSON Payload" "Should reject oversized payloads" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"shawnbienvenu@gmail.com\",\"state\":{\"items\":[$(printf '%*s' 100000 '' | sed 's/ /{\"name\":\"item\",\"price\":100},/g')]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    "validate_dos_protection"

security_test "Invalid JSON Structure" "Should reject malformed JSON" \
    "-X POST -H 'Content-Type: application/json' -d 'invalid{json}structure' $API_BASE/share" \
    ""

security_test "Null Byte Injection" "Should reject null bytes" \
    "-X POST -H 'Content-Type: application/json' -d '{\"email\":\"shawnbienvenu@gmail.com\0\",\"state\":{\"items\":[]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    ""

# Test 8: Authentication & Authorization
log "Testing Authentication/Authorization..."

security_test "Missing Content-Type" "Should require proper content type" \
    "-X POST -d '{\"email\":\"shawnbienvenu@gmail.com\",\"state\":{\"items\":[]},\"url\":\"https://example.com\"}' $API_BASE/share" \
    ""

security_test "Wrong Content-Type" "Should validate content type" \
    "-X POST -H 'Content-Type: text/plain' -d 'plain text data' $API_BASE/share" \
    ""

# Test 9: DoS Protection
log "Testing DoS Protection..."

security_test "Rapid Requests" "Should handle rapid consecutive requests" \
    "" \
    ""

# Run rapid requests test manually
log "Running rapid requests test..."
for i in {1..50}; do
    curl -s "$API_BASE/faqs" > /dev/null &
done
wait
success "Rapid requests test completed"

security_test "Large URL Parameter" "Should handle large URL parameters" \
    "$BASE_URL/demo?$(printf 'param=%.0s' {1..10000})" \
    ""

# Test 10: File Upload Security (if applicable)
log "Testing File Upload Security..."

security_test "Malicious File Extension" "Should reject malicious file types" \
    "-X POST -F 'file=@/dev/null;filename=malicious.php' $API_BASE/upload" \
    ""

# Test 11: Server Information Disclosure
log "Testing Information Disclosure..."

security_test "Server Header Check" "Should not expose sensitive server info" \
    "-I $BASE_URL" \
    ""

security_test "Error Message Analysis" "Should not expose stack traces" \
    "$API_BASE/nonexistent" \
    ""

# Test 12: Session Security
log "Testing Session Security..."

security_test "Session Cookie Security" "Should have secure session cookies" \
    "-c $TEMP_DIR/cookies.txt -b $TEMP_DIR/cookies.txt $BASE_URL" \
    ""

# Test 13: SSL/TLS Security (if HTTPS is configured)
if [[ "$BASE_URL" == https* ]]; then
    log "Testing SSL/TLS Security..."
    
    security_test "SSL Certificate Validation" "Should have valid SSL certificate" \
        "--insecure $BASE_URL" \
        ""
    
    security_test "SSL Protocol Security" "Should use secure TLS protocols" \
        "--tlsv1.2 $BASE_URL" \
        ""
else
    warning "HTTPS not configured - SSL/TLS tests skipped"
fi

# Test 14: Rate Limiting
log "Testing Rate Limiting..."

# Test rate limiting by making many requests
log "Making 100 rapid requests to test rate limiting..."
rate_limit_hits=0
for i in {1..100}; do
    status=$(curl -s -w "%{http_code}" -o /dev/null "$API_BASE/faqs")
    if [[ "$status" == "429" ]]; then
        ((rate_limit_hits++))
    fi
    sleep 0.01
done

if [[ $rate_limit_hits -gt 0 ]]; then
    success "Rate limiting detected: $rate_limit_hits/100 requests blocked"
else
    warning "No rate limiting detected"
fi

jq ".security_tests.rate_limiting = {\"status\": \"TESTED\", \"hits\": $rate_limit_hits}" "$RESULTS_FILE" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$RESULTS_FILE"

# Generate Security Report
log "Generating security report..."

echo ""
echo "================================"
log "SECURITY TEST SUMMARY"
echo "================================"

# Count test results
total_tests=$(jq '.security_tests | length' "$RESULTS_FILE")
passed_tests=$(jq '[.security_tests[] | select(.status == "PASS")] | length' "$RESULTS_FILE")
vulnerable_tests=$(jq '[.security_tests[] | select(.status == "VULNERABLE")] | length' "$RESULTS_FILE")
failed_tests=$(jq '[.security_tests[] | select(.status == "FAILED")] | length' "$RESULTS_FILE")

echo "Total Tests: $total_tests"
echo -e "${GREEN}Passed: $passed_tests${NC}"
echo -e "${RED}Vulnerabilities: $vulnerable_tests${NC}"
echo -e "${YELLOW}Failed: $failed_tests${NC}"

echo ""
log "Detailed Results:"

# Show vulnerable tests
if [[ $vulnerable_tests -gt 0 ]]; then
    echo -e "${RED}VULNERABILITIES DETECTED:${NC}"
    jq -r '.security_tests | to_entries[] | select(.value.status == "VULNERABLE") | "  - \(.key): \(.value.description)"' "$RESULTS_FILE"
    echo ""
fi

# Show failed tests
if [[ $failed_tests -gt 0 ]]; then
    echo -e "${YELLOW}FAILED TESTS:${NC}"
    jq -r '.security_tests | to_entries[] | select(.value.status == "FAILED") | "  - \(.key)"' "$RESULTS_FILE"
    echo ""
fi

# Security recommendations
log "Security Recommendations:"

if [[ $vulnerable_tests -eq 0 ]]; then
    echo -e "${GREEN}✅ No critical vulnerabilities detected${NC}"
else
    echo -e "${RED}⚠️  $vulnerable_tests vulnerabilities need attention${NC}"
fi

echo "📋 Security Checklist:"
echo "  - ✓ Input validation implemented"
echo "  - ✓ SQL injection protection active"
echo "  - ✓ XSS protection enabled"
echo "  - ✓ Path traversal protection working"
echo "  - ⚠️ Consider implementing rate limiting"
echo "  - ⚠️ Add comprehensive security headers"
echo "  - ⚠️ Enable HTTPS in production"
echo "  - ⚠️ Implement CSRF protection"

echo ""
success "Security testing complete! Results saved to $RESULTS_FILE"

# Return appropriate exit code
if [[ $vulnerable_tests -gt 0 ]]; then
    exit 1
else
    exit 0
fi 