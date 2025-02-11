const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any origin (adjust for security)
  },
});

let markers = []; // Store all markers

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send existing markers to the newly connected client
  socket.emit("load_markers", markers);

  // Listen for new marker events
  socket.on("add_marker", (marker) => {
    markers.push(marker); // Store marker
    io.emit("update_markers", markers); // Broadcast to all clients
  });

  // Listen for marker updates (e.g., movement)
  socket.on("update_marker", (updatedMarker) => {
    markers = markers.map((m) => (m.id === updatedMarker.id ? updatedMarker : m));
    io.emit("update_markers", markers);
  });

  // Listen for marker removal
  socket.on("remove_marker", (markerId) => {
    markers = markers.filter((m) => m.id !== markerId);
    io.emit("update_markers", markers);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
