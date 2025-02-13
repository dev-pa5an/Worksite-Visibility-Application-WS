from http.server import BaseHTTPRequestHandler, HTTPServer
import requests

PORT = 8000

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Determine the target server based on the request path
        if self.path.startswith('/app1'):
            target_url = f'http://localhost:5000{self.path[5:]}'  # Remove "/app1" prefix
        elif self.path.startswith('/app2'):
            target_url = f'http://localhost:6000{self.path[5:]}'  # Remove "/app2" prefix
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')
            return

        # Forward the request to the target server
        try:
            response = requests.get(target_url)
            self.send_response(response.status_code)
            for key, value in response.headers.items():
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(response.content)
        except requests.exceptions.RequestException as e:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(f'Error: {str(e)}'.encode())

def run_proxy():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, ProxyHandler)
    print(f'Proxy server running on http://localhost:{PORT}')
    httpd.serve_forever()

if __name__ == '__main__':
    run_proxy()
