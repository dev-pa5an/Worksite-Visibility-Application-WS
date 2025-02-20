import time, csv
from datetime import datetime
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

@socketio.on("delete_marker")
def handle_delete_marker(data):
    global markers, data_store
    markers = [m for m in markers if m["id"] != data["id"]]  # Remove marker from list
    data_store = [r for r in data_store if r["id"] != data["id"]]
    socketio.emit("update_markers", markers)  # Notify all clients
    socketio.emit("deleteEntry", data)  # 🔹 Broadcast deletion event

def print_data():
    csv_file = "data_log.csv"

    # Write CSV headers if the file does not exist
    try:
        with open(csv_file, "x", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["Timestamp", "Name", "Location", "Count"])
    except FileExistsError:
        pass  # File already exists, so do nothing

    while True:
        time.sleep(10)  # Wait for 1 minute
        if data_store:  # Only write if data_store is not empty
            with open(csv_file, "a", newline="") as file:
                writer = csv.writer(file)
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                for entry in data_store:
                    writer.writerow([timestamp, entry["name"], entry["location"], entry["count"]])
            print(f"Data saved to {csv_file} at {timestamp}")  # Optional logging
        
if __name__ == "__main__":
    socketio.start_background_task(print_data)
    socketio.run(app, host="0.0.0.0", port=8000, debug=True)


