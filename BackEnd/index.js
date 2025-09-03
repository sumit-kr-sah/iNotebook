//---------------------------------------------------------------
//this line imports rxpress
const express = require("express");
//this line sets express as app
const app = express();
//---------------------------------------------------------------


//---------------------------------------------------------------
//mongo is made a function in db file and sent here as a function ,running it
const connectToMongo = require("./db");
connectToMongo();
//---------------------------------------------------------------



//---------------------------------------------------------------
//cors required
const cors = require("cors");
//cors syntax placed
app.use(cors());
//---------------------------------------------------------------


//---------------------------------------------------------------
//necessary to use json as CRUD operators
app.use(express.json({ limit: '50mb' })); //middleware
app.use(express.urlencoded({ limit: '50mb', extended: true }));
//---------------------------------------------------------------


//---------------------------------------------------------------
//this is direct endpoint
app.get("/", (req, res) => {
  res.send("Hello ADARSH this is backend");
});
//---------------------------------------------------------------


//--------------------------------------------------------------
//this is routing
const auth = require("./routes/auth");
app.use("/api/auth", auth);
// app.use("/api/auth", require("./routes/auth"));

app.use("/api/notes", require("./routes/notes"));
app.use("/api/images", require("./routes/images"));
app.use("/api/messages", require("./routes/messages"));
//--------------------------------------------------------------


//--------------------------------------------------------------
//port listing and using
const port = 5000;
const server = app.listen(port, () => {
  console.log(`INoteBOOK ==> listening at http://localhost:${port}`);
});
//--------------------------------------------------------------

//--------------------------------------------------------------
// Socket.io setup
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Allow connections from any origin
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000 // Increase timeout for better connection stability
});

// Store online users
let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  // User adds their user ID to socket for tracking
  socket.on("addUser", (userId) => {
    if (userId) {
      console.log("User online:", userId, "Socket ID:", socket.id);
      onlineUsers.set(userId, socket.id);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    }
  });
  
  // Handle sending/receiving messages
  socket.on("sendMessage", async (messageData) => {
    try {
      const { receiver, content, sender, _id } = messageData;
      
      console.log("Message sent:", { from: sender, to: receiver, content: content.substring(0, 20) + (content.length > 20 ? '...' : '') });
      
      // Find receiver's socket if they're online
      const receiverSocket = onlineUsers.get(receiver);
      
      if (receiverSocket) {
        // Send to specific user if online
        io.to(receiverSocket).emit("getMessage", {
          _id,
          sender,
          receiver,
          content,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });
  
  // Handle disconnect
  socket.on("disconnect", () => {
    // Remove user from online users
    for (const [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        console.log("User offline:", key);
        break;
      }
    }
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });
  
  // Handle message deletion
  socket.on("deleteMessage", (data) => {
    try {
      const { messageId, receiverId } = data;
      console.log("Message deleted:", messageId, "notifying receiver:", receiverId);
      
      // Find receiver's socket if they're online
      const receiverSocket = onlineUsers.get(receiverId);
      
      if (receiverSocket) {
        // Notify receiver about deleted message
        io.to(receiverSocket).emit("messageDeleted", { messageId });
      }
    } catch (error) {
      console.error("Error handling message deletion:", error);
    }
  });
  
  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});
//--------------------------------------------------------------
