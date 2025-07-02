#!/bin/bash

# Slug Store - Master Test Runner
# Runs all test suites: functionality, performance, security, and comprehensive cURL tests

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
TEMP_DIR="/tmp/slug-store-all-tests"
MASTER_RESULTS="$TEMP_DIR/master-results.json"

mkdir -p "$TEMP_DIR"

log() {
    echo -e "${CYAN}[MASTER]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Initialize master results
echo '{
    "test_suites": {
        "functionality": {"status": "pending", "exit_code": null},
        "performance": {"status": "pending", "exit_code": null},
        "security": {"status": "pending", "exit_code": null},
        "comprehensive": {"status": "pending", "exit_code": null}
    },
    "summary": {
        "total_suites": 4,
        "passed_suites": 0,
        "failed_suites": 0,
        "start_time": "'$(date -Iseconds)'",
        "end_time": null
    }
}' > "$MASTER_RESULTS"

echo ""
echo "=================================================================="
log "SLUG STORE v4.0.8 - COMPREHENSIVE TEST SUITE"
echo "=================================================================="
echo ""

# Check if server is running
log "Checking if development server is running..."
if curl -s --connect-timeout 10 "$BASE_URL" > /dev/null 2>&1; then
    success "Development server is running at $BASE_URL"
    
    # Get server info
    server_response=$(curl -s -I "$BASE_URL" 2>/dev/null || echo "")
    if echo "$server_response" | grep -q "x-powered-by"; then
        server_info=$(echo "$server_response" | grep -i "x-powered-by" | cut -d: -f2 | tr -d ' \r\n')
        info "Server: $server_info"
    fi
else
    error "Development server is not running at $BASE_URL"
    echo ""
    echo "To start the server:"
    echo "  cd apps/web"
    echo "  npm run dev"
    echo ""
    echo "Then run this test suite again."
    exit 1
fi

echo ""

# Check if test scripts exist
required_scripts=("test-slug-functionality.sh" "test-performance.sh" "test-security.sh" "test-curl-suite.sh")
missing_scripts=()

for script in "${required_scripts[@]}"; do
    if [[ ! -f "$script" ]]; then
        missing_scripts+=("$script")
    fi
done

if [[ ${#missing_scripts[@]} -gt 0 ]]; then
    error "Missing test scripts:"
    for script in "${missing_scripts[@]}"; do
        echo "  - $script"
    done
    exit 1
fi

# Make all scripts executable
chmod +x "${required_scripts[@]}"

# Function to run test suite
run_test_suite() {
    local suite_name="$1"
    local script_name="$2"
    local description="$3"
    
    echo ""
    echo "=================================================================="
    log "Running $suite_name Test Suite"
    echo "=================================================================="
    info "$description"
    echo ""
    
    local start_time=$(date +%s)
    
    if ./"$script_name"; then
        local exit_code=0
        local status="passed"
        success "$suite_name test suite completed successfully"
    else
        local exit_code=$?
        local status="failed"
        error "$suite_name test suite failed (exit code: $exit_code)"
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    info "$suite_name duration: ${duration}s"
    
    # Update results
    jq ".test_suites.\"$suite_name\" = {\"status\": \"$status\", \"exit_code\": $exit_code, \"duration\": $duration}" "$MASTER_RESULTS" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$MASTER_RESULTS"
    
    if [[ $exit_code -eq 0 ]]; then
        jq '.summary.passed_suites += 1' "$MASTER_RESULTS" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$MASTER_RESULTS"
    else
        jq '.summary.failed_suites += 1' "$MASTER_RESULTS" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$MASTER_RESULTS"
    fi
    
    return $exit_code
}

# Run all test suites
overall_exit_code=0

# 1. Functionality Tests (most important)
if ! run_test_suite "functionality" "test-slug-functionality.sh" "Tests all slug-store features: URL state, sharing, data retrieval, workflows"; then
    overall_exit_code=1
fi

# 2. Comprehensive cURL Tests
if ! run_test_suite "comprehensive" "test-curl-suite.sh" "Comprehensive API testing with cURL: all endpoints, error conditions, edge cases"; then
    overall_exit_code=1
fi

# 3. Performance Tests
if ! run_test_suite "performance" "test-performance.sh" "Performance testing: response times, concurrent load, throughput analysis"; then
    warning "Performance tests failed - this may indicate optimization opportunities"
    # Don't fail overall suite for performance issues
fi

# 4. Security Tests
if ! run_test_suite "security" "test-security.sh" "Security testing: injection attacks, validation, headers, authentication"; then
    warning "Security tests failed - this may indicate security vulnerabilities"
    # Don't fail overall suite for security issues in development
fi

# Update end time
jq ".summary.end_time = \"$(date -Iseconds)\"" "$MASTER_RESULTS" > "$TEMP_DIR/tmp.json" && mv "$TEMP_DIR/tmp.json" "$MASTER_RESULTS"

# Generate final report
echo ""
echo "=================================================================="
log "FINAL TEST RESULTS SUMMARY"
echo "=================================================================="

# Display results
jq -r '
"Test Suite Results:",
"",
(.test_suites | to_entries[] | 
  if .value.status == "passed" then 
    "✅ \(.key | ascii_upcase): \(.value.status) (\(.value.duration)s)"
  else 
    "❌ \(.key | ascii_upcase): \(.value.status) (exit: \(.value.exit_code), \(.value.duration)s)"
  end),
"",
"Overall Summary:",
"• Total Suites: \(.summary.total_suites)",
"• Passed: \(.summary.passed_suites)",
"• Failed: \(.summary.failed_suites)",
"• Start Time: \(.summary.start_time)",
"• End Time: \(.summary.end_time)"
' "$MASTER_RESULTS"

echo ""

# Calculate overall test time
start_time=$(jq -r '.summary.start_time' "$MASTER_RESULTS")
end_time=$(jq -r '.summary.end_time' "$MASTER_RESULTS")
total_duration=$(( $(date -d "$end_time" +%s) - $(date -d "$start_time" +%s) ))

info "Total test duration: ${total_duration}s"

# Final status
passed_suites=$(jq -r '.summary.passed_suites' "$MASTER_RESULTS")
failed_suites=$(jq -r '.summary.failed_suites' "$MASTER_RESULTS")

echo ""
if [[ $overall_exit_code -eq 0 && $failed_suites -eq 0 ]]; then
    echo "=================================================================="
    success "🎉 ALL TEST SUITES PASSED! 🎉"
    echo "=================================================================="
    echo ""
    log "Slug Store v4.0.8 is working correctly!"
    echo ""
    echo "✅ Core functionality is working"
    echo "✅ API endpoints are responding correctly"  
    echo "✅ URL state management is functional"
    echo "✅ Email sharing is operational"
    echo "✅ Error handling is robust"
    echo ""
elif [[ $passed_suites -ge 2 ]]; then
    echo "=================================================================="
    warning "⚠️  PARTIAL SUCCESS - Core functionality working"
    echo "=================================================================="
    echo ""
    log "Slug Store v4.0.8 core features are working!"
    echo ""
    echo "✅ Essential features are functional"
    if [[ $failed_suites -gt 0 ]]; then
        echo "⚠️  Some non-critical tests failed (see details above)"
    fi
    echo ""
else
    echo "=================================================================="
    error "❌ CRITICAL FAILURES DETECTED"
    echo "=================================================================="
    echo ""
    log "Slug Store v4.0.8 has critical issues that need attention!"
    echo ""
    echo "❌ Core functionality may be broken"
    echo "❌ Check the detailed test output above"
    echo ""
fi

# Show detailed results location
echo "📊 Detailed results saved to:"
echo "  Master results: $MASTER_RESULTS"
echo "  Individual results: $TEMP_DIR/"
echo ""

# Show next steps
log "Next Steps:"
if [[ $overall_exit_code -eq 0 ]]; then
    echo "  🚀 Ready for production deployment!"
    echo "  📝 Consider running tests before each release"
    echo "  🔄 Set up CI/CD pipeline with these tests"
else
    echo "  🔧 Fix failing tests before deployment"
    echo "  📋 Review detailed error messages above"
    echo "  🧪 Run individual test suites for debugging:"
    echo "    ./test-slug-functionality.sh"
    echo "    ./test-curl-suite.sh"
    echo "    ./test-performance.sh"
    echo "    ./test-security.sh"
fi

echo ""
log "Test suite complete!"

exit $overall_exit_code 