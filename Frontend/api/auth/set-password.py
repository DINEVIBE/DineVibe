from http.server import BaseHTTPRequestHandler
import json
import re

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}

            new_password = data.get('new_password', '')
            confirm_password = data.get('confirm_password', '')
            
            # Prepare response headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            # --- Password Validation Rules ---
            errors = []

            if len(new_password) < 8:
                errors.append("Password must be at least 8 characters")
            
            if not re.search(r'[A-Z]', new_password):
                errors.append("Password must contain at least one uppercase letter")
                
            if not re.search(r'[0-9]', new_password):
                errors.append("Password must contain at least one number")
                
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password):
                errors.append("Password must contain at least one special character")

            if new_password != confirm_password:
                errors.append("Passwords do not match")

            # Send Errors or Success
            if errors:
                self.wfile.write(json.dumps({"success": False, "errors": errors}).encode('utf-8'))
            else:
                # In a real app, hash and save to DB here
                self.wfile.write(json.dumps({"success": True, "message": "Password updated successfully"}).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))