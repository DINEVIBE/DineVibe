from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        data = json.loads(body) if body else {}

        otp = data.get('otp', '')
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        # Simulating MFA verification
        if otp == "123456": 
            # First login detected: Force password setup
            self.wfile.write(json.dumps({
                "success": True, 
                "requirePasswordSetup": True,
                "message": "OTP Verified"
            }).encode('utf-8'))
        else:
            self.wfile.write(json.dumps({
                "success": False, 
                "error": "Invalid OTP"
            }).encode('utf-8'))