from flask import Flask, request, Response
import requests

app = Flask(__name__)

SERVICES = {
    "api": "http://localhost:8000",  
    "service": "http://localhost:5000"
}

def proxy_request(service_url):
    """Forward the request to the target service and return the response."""
    try:
        resp = requests.request(
            method=request.method,
            url=f"{service_url}{request.full_path}",
            headers={key: value for key, value in request.headers if key.lower() != "host"},
            data=request.get_data(),
            cookies=request.cookies,
            allow_redirects=False,
        )
        
        # Build a response to send back to the client
        response = Response(resp.content, resp.status_code)
        for key, value in resp.headers.items():
            if key.lower() not in ["content-encoding", "transfer-encoding"]:
                response.headers[key] = value
        return response
    except requests.exceptions.RequestException as e:
        return Response(f"Error: {str(e)}", status=502)

@app.route("/api/<path:path>", methods=["GET", "POST", "PUT", "DELETE"])
def proxy_to_api(path):
    return proxy_request(SERVICES["api"])

@app.route("/s
