from http.server import BaseHTTPRequestHandler, HTTPServer
import requests
import threading

PORT = 8000

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Determine the target server based on the request path
        if self.path.startswith('/contractor-map'):
            target_url = f'http://localhost:5000{self.path[5:]}'  
        elif self.path.startswith('/dashboard'):
            target_url = f'http://localhost:5001{self.path[5:]}' 
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')
            return

        # Forward the request to the target server
        try:
            response = requests.get(target_url, stream=True)
            self.send_response(response.status_code)
            for key, value in response.headers.items():
                self.send_header(key, value)
            self.end_headers()
            
            # Send the response content in chunks
            for chunk in response.iter_content(1024):
                self.wfile.write(chunk)
        except requests.exceptions.RequestException as e:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(f'Error: {str(e)}'.encode())

def run_proxy():
    server_address = ('', PORT)
    httpd = ThreadedHTTPServer(server_address, ProxyHandler)
    print(f'Proxy server running on http://localhost:{PORT}')
    httpd.serve_forever()

class ThreadedHTTPServer(HTTPServer):
    """Handle requests in a separate thread."""
    def process_request_thread(self, request, client_address):
        """Start a new thread to process a request."""
        thread = threading.Thread(target=self.process_request, args=(request, client_address))
        thread.daemon = True
        thread.start()

    def process_request(self, request, client_address):
        """Process a request."""
        self.RequestHandlerClass(request, client_address, self)

if __name__ == '__main__':
    run_proxy()
