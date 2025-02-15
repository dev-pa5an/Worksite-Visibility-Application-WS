from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

data_store = []  
markers = []

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("connect")
def handle_connect():
    socketio.emit("initialize", data_store)  
    socketio.emit("load_markers", markers)

@socketio.on("add_marker")
def handle_add_marker(data):
    markers.append(data)
    socketio.emit("update_markers", markers)
    
@socketio.on("update_marker")
def handle_update_marker(updated_marker):
    global markers  
    markers = [updated_marker if m["id"] == updated_marker["id"] else m for m in markers]
    socketio.emit("update_markers", markers) 

@socketio.on("newEntry")
def handle_new_entry(data):
    data_store.append(data)
    socketio.emit("newEntry", data)

@socketio.on("delete_marker")
def handle_delete_marker(data):
    global markers, data_store
    markers = [m for m in markers if m["id"] != data["id"]] 
    data_store = [r for r in data_store if r["id"] != data["id"]]
    socketio.emit("update_markers", markers)  
    socketio.emit("deleteEntry", data)  


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8000, debug=True)


