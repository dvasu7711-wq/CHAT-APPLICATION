const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/collabEditor")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const documentSchema = new mongoose.Schema({
  content: String
});

const Document = mongoose.model("Document", documentSchema);

io.on("connection", async (socket) => {
  console.log("User Connected");

  let doc = await Document.findOne();

  if (!doc) {
    doc = await Document.create({ content: "" });
  }

  socket.emit("load-document", doc.content);

  socket.on("send-changes", async (data) => {
    await Document.updateOne({}, { content: data });
    socket.broadcast.emit("receive-changes", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});