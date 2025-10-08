#!/usr/bin/env python3
"""
Comprehensive Backend Testing for BM MANAGER
Tests all API endpoints with proper data validation
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Backend URL from environment
BACKEND_URL = "https://retail-scales.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        if not success:
            self.failed_tests.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "BM MANAGER" in data["message"]:
                    self.log_test("Root endpoint", True, f"Response: {data}")
                else:
                    self.log_test("Root endpoint", False, f"Unexpected response: {data}")
            else:
                self.log_test("Root endpoint", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Root endpoint", False, f"Exception: {str(e)}")
    
    def test_stores_endpoints(self):
        """Test stores-related endpoints"""
        # Test GET /stores
        try:
            response = self.session.get(f"{BACKEND_URL}/stores")
            if response.status_code == 200:
                stores = response.json()
                if isinstance(stores, list) and len(stores) > 0:
                    # Validate store structure
                    store = stores[0]
                    required_fields = ['id', 'name', 'comuna', 'sap_code', 'address', 'status']
                    missing_fields = [field for field in required_fields if field not in store]
                    
                    if not missing_fields:
                        # Check if naming fix worked (should be "Local" not "Sucursal")
                        local_stores = [s for s in stores if "Local" in s.get('name', '')]
                        sucursal_stores = [s for s in stores if "Sucursal" in s.get('name', '')]
                        
                        self.log_test("GET /stores", True, 
                                    f"Found {len(stores)} stores, {len(local_stores)} with 'Local', {len(sucursal_stores)} with 'Sucursal'")
                        
                        # Test individual store retrieval
                        store_id = store['id']
                        single_response = self.session.get(f"{BACKEND_URL}/stores/{store_id}")
                        if single_response.status_code == 200:
                            self.log_test("GET /stores/{id}", True, "Individual store retrieval works")
                        else:
                            self.log_test("GET /stores/{id}", False, f"Status: {single_response.status_code}")
                    else:
                        self.log_test("GET /stores", False, f"Missing required fields: {missing_fields}")
                else:
                    self.log_test("GET /stores", False, "No stores returned or invalid format")
            else:
                self.log_test("GET /stores", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /stores", False, f"Exception: {str(e)}")
    
    def test_fix_naming_endpoint(self):
        """Test POST /fix-naming endpoint"""
        try:
            response = self.session.post(f"{BACKEND_URL}/fix-naming")
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.log_test("POST /fix-naming", True, f"Response: {data}")
                else:
                    self.log_test("POST /fix-naming", False, f"Success not true: {data}")
            else:
                self.log_test("POST /fix-naming", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /fix-naming", False, f"Exception: {str(e)}")
    
    def test_ai_predictions_endpoint(self):
        """Test GET /ai-predictions endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/ai-predictions")
            if response.status_code == 200:
                predictions = response.json()
                if isinstance(predictions, list) and len(predictions) > 0:
                    # Validate prediction structure
                    prediction = predictions[0]
                    required_fields = ['id', 'title', 'content', 'category', 'priority', 'created_at']
                    missing_fields = [field for field in required_fields if field not in prediction]
                    
                    if not missing_fields:
                        # Check if we got exactly 5 predictions as expected
                        if len(predictions) == 5:
                            # Validate categories and priorities
                            valid_categories = ['maintenance', 'supply', 'fraud', 'optimization', 'seasonal']
                            valid_priorities = ['high', 'medium', 'low']
                            
                            invalid_cats = [p for p in predictions if p.get('category') not in valid_categories]
                            invalid_prios = [p for p in predictions if p.get('priority') not in valid_priorities]
                            
                            if not invalid_cats and not invalid_prios:
                                self.log_test("GET /ai-predictions", True, 
                                            f"Got {len(predictions)} predictions with valid structure")
                            else:
                                self.log_test("GET /ai-predictions", False, 
                                            f"Invalid categories: {len(invalid_cats)}, Invalid priorities: {len(invalid_prios)}")
                        else:
                            self.log_test("GET /ai-predictions", False, 
                                        f"Expected 5 predictions, got {len(predictions)}")
                    else:
                        self.log_test("GET /ai-predictions", False, f"Missing required fields: {missing_fields}")
                else:
                    self.log_test("GET /ai-predictions", False, "No predictions returned or invalid format")
            else:
                self.log_test("GET /ai-predictions", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /ai-predictions", False, f"Exception: {str(e)}")
    
    def test_tickets_endpoints(self):
        """Test ticket creation and retrieval endpoints"""
        # First, test GET /tickets (should work even if empty)
        try:
            response = self.session.get(f"{BACKEND_URL}/tickets")
            if response.status_code == 200:
                tickets = response.json()
                if isinstance(tickets, list):
                    self.log_test("GET /tickets", True, f"Retrieved {len(tickets)} tickets")
                else:
                    self.log_test("GET /tickets", False, "Response is not a list")
            else:
                self.log_test("GET /tickets", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /tickets", False, f"Exception: {str(e)}")
        
        # Test POST /tickets (create a ticket)
        try:
            ticket_data = {
                "device_id": str(uuid.uuid4()),
                "store_name": "Local Las Condes",
                "store_comuna": "Las Condes",
                "store_address": "Av. Apoquindo 4501, Las Condes",
                "sap_code": "SAP-1001",
                "issue": "Balanza no calibra correctamente",
                "description": "La balanza BMS_ASISTIDA presenta problemas de calibración. Los pesos no coinciden con la referencia estándar.",
                "reported_to": "Servicio Técnico"
            }
            
            response = self.session.post(f"{BACKEND_URL}/tickets", json=ticket_data)
            if response.status_code == 200:
                ticket = response.json()
                required_fields = ['id', 'device_id', 'store_name', 'issue', 'status', 'created_at']
                missing_fields = [field for field in required_fields if field not in ticket]
                
                if not missing_fields:
                    # Verify the ticket was created with correct data
                    if (ticket.get('store_name') == ticket_data['store_name'] and 
                        ticket.get('issue') == ticket_data['issue'] and
                        ticket.get('status') == 'Pendiente'):
                        self.log_test("POST /tickets", True, f"Ticket created with ID: {ticket.get('id')}")
                        
                        # Test that we can retrieve the created ticket
                        get_response = self.session.get(f"{BACKEND_URL}/tickets")
                        if get_response.status_code == 200:
                            all_tickets = get_response.json()
                            created_ticket = next((t for t in all_tickets if t.get('id') == ticket.get('id')), None)
                            if created_ticket:
                                self.log_test("Ticket persistence", True, "Created ticket found in GET /tickets")
                            else:
                                self.log_test("Ticket persistence", False, "Created ticket not found in GET /tickets")
                    else:
                        self.log_test("POST /tickets", False, f"Ticket data mismatch: {ticket}")
                else:
                    self.log_test("POST /tickets", False, f"Missing required fields: {missing_fields}")
            else:
                self.log_test("POST /tickets", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("POST /tickets", False, f"Exception: {str(e)}")
    
    def test_campaigns_endpoints(self):
        """Test campaigns endpoints"""
        try:
            response = self.session.get(f"{BACKEND_URL}/campaigns")
            if response.status_code == 200:
                campaigns = response.json()
                if isinstance(campaigns, list) and len(campaigns) > 0:
                    campaign = campaigns[0]
                    required_fields = ['id', 'name', 'start_date', 'end_date', 'status']
                    missing_fields = [field for field in required_fields if field not in campaign]
                    
                    if not missing_fields:
                        self.log_test("GET /campaigns", True, f"Found {len(campaigns)} campaigns")
                    else:
                        self.log_test("GET /campaigns", False, f"Missing required fields: {missing_fields}")
                else:
                    self.log_test("GET /campaigns", False, "No campaigns returned or invalid format")
            else:
                self.log_test("GET /campaigns", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /campaigns", False, f"Exception: {str(e)}")
    
    def test_alerts_endpoints(self):
        """Test alerts endpoints"""
        try:
            response = self.session.get(f"{BACKEND_URL}/alerts")
            if response.status_code == 200:
                alerts = response.json()
                if isinstance(alerts, list):
                    if len(alerts) > 0:
                        alert = alerts[0]
                        required_fields = ['id', 'store_id', 'store_name', 'type', 'message', 'priority']
                        missing_fields = [field for field in required_fields if field not in alert]
                        
                        if not missing_fields:
                            self.log_test("GET /alerts", True, f"Found {len(alerts)} alerts")
                        else:
                            self.log_test("GET /alerts", False, f"Missing required fields: {missing_fields}")
                    else:
                        self.log_test("GET /alerts", True, "No alerts found (valid empty response)")
                else:
                    self.log_test("GET /alerts", False, "Response is not a list")
            else:
                self.log_test("GET /alerts", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /alerts", False, f"Exception: {str(e)}")
    
    def test_metrics_endpoint(self):
        """Test metrics endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/metrics")
            if response.status_code == 200:
                metrics = response.json()
                required_fields = ['total_kg_today', 'active_balances', 'calibration_percentage', 
                                 'pending_updates', 'stores_online', 'stores_partial', 'stores_offline']
                missing_fields = [field for field in required_fields if field not in metrics]
                
                if not missing_fields:
                    # Validate data types
                    numeric_fields = ['total_kg_today', 'active_balances', 'calibration_percentage', 
                                    'pending_updates', 'stores_online', 'stores_partial', 'stores_offline']
                    invalid_types = []
                    for field in numeric_fields:
                        if not isinstance(metrics.get(field), (int, float)):
                            invalid_types.append(field)
                    
                    if not invalid_types:
                        self.log_test("GET /metrics", True, f"All metrics present with correct types")
                    else:
                        self.log_test("GET /metrics", False, f"Invalid types for fields: {invalid_types}")
                else:
                    self.log_test("GET /metrics", False, f"Missing required fields: {missing_fields}")
            else:
                self.log_test("GET /metrics", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /metrics", False, f"Exception: {str(e)}")
    
    def test_weight_data_endpoint(self):
        """Test weight data endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/weight-data")
            if response.status_code == 200:
                weight_data = response.json()
                if isinstance(weight_data, list) and len(weight_data) > 0:
                    item = weight_data[0]
                    required_fields = ['product', 'weights', 'dates']
                    missing_fields = [field for field in required_fields if field not in item]
                    
                    if not missing_fields:
                        # Validate that weights and dates are lists
                        if (isinstance(item['weights'], list) and isinstance(item['dates'], list) and
                            len(item['weights']) == len(item['dates'])):
                            self.log_test("GET /weight-data", True, f"Found {len(weight_data)} products with weight data")
                        else:
                            self.log_test("GET /weight-data", False, "Weights and dates arrays mismatch or invalid format")
                    else:
                        self.log_test("GET /weight-data", False, f"Missing required fields: {missing_fields}")
                else:
                    self.log_test("GET /weight-data", False, "No weight data returned or invalid format")
            else:
                self.log_test("GET /weight-data", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /weight-data", False, f"Exception: {str(e)}")
    
    def test_cors_functionality(self):
        """Test CORS headers"""
        try:
            # Add Origin header to simulate cross-origin request
            headers = {'Origin': 'https://example.com'}
            response = self.session.get(f"{BACKEND_URL}/stores", headers=headers)
            
            cors_origin = response.headers.get('Access-Control-Allow-Origin')
            cors_credentials = response.headers.get('Access-Control-Allow-Credentials')
            
            if cors_origin:
                self.log_test("CORS functionality", True, 
                            f"CORS headers present - Origin: {cors_origin}, Credentials: {cors_credentials}")
            else:
                self.log_test("CORS functionality", False, "No CORS headers found")
        except Exception as e:
            self.log_test("CORS functionality", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting comprehensive backend testing for BM MANAGER")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Test all endpoints
        self.test_root_endpoint()
        self.test_stores_endpoints()
        self.test_fix_naming_endpoint()
        self.test_ai_predictions_endpoint()
        self.test_tickets_endpoints()
        self.test_campaigns_endpoints()
        self.test_alerts_endpoints()
        self.test_metrics_endpoint()
        self.test_weight_data_endpoint()
        self.test_cors_functionality()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['success']])
        failed_tests = len(self.failed_tests)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if self.failed_tests:
            print("\n🔍 FAILED TESTS DETAILS:")
            for test in self.failed_tests:
                print(f"❌ {test['test']}: {test['details']}")
        
        print("\n" + "=" * 60)
        return failed_tests == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)