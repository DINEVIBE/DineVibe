from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        data = json.loads(body) if body else {}
        
        otp = data.get('otp', '')
        email = data.get('email', 'demo@dinevibe.com')
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if otp == "123456":
            # Always go to password setup for demo
            response = {
                "status": "MFA_SETUP_COMPLETE",
                "must_change_password": True,
                "user": {
                    "name": email.split('@')[0].title(),
                    "email": email,
                    "role": "admin"
                }
            }
        else:
            response = {"status": "ERROR", "message": "Invalid OTP"}
        
        self.wfile.write(json.dumps(response).encode())
        return

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        return
