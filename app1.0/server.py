from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

data_store = []  # Store name & age data
markers = []

@app.route("/")
def index():
    return render_template("index.html")  # Load frontend

@socketio.on("connect")
def handle_connect():
    socketio.emit("initialize", data_store)  # Send stored data when a user connects
    socketio.emit("load_markers", markers)

@socketio.on("add_marker")
def handle_add_marker(data):
    markers.append(data)
    socketio.emit("update_markers", markers)
    
@socketio.on("update_marker")
def handle_update_marker(updated_marker):
    global markers  # Ensure we modify the global markers list
    markers = [updated_marker if m["id"] == updated_marker["id"] else m for m in markers]  # Update marker
    socketio.emit("update_markers", markers)  # Broadcast updated marker list

 
@socketio.on("newEntry")
def handle_new_entry(data):
    data_store.append(data)
    socketio.emit("newEntry", data)  # Broadcast update to all clients

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8000, debug=True)
