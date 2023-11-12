const express = require("express");
const cors = require("cors");

// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const {
  collection,
  getFirestore,
  addDoc,
  getDocs,
  limit,
  query,
  orderBy,
  serverTimestamp,
} = require("firebase/firestore");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTtmmcsP-5jt_CLZvmPMILHGGH0r-yUXA",
  authDomain: "web-chat-application-a6c5a.firebaseapp.com",
  projectId: "web-chat-application-a6c5a",
  storageBucket: "web-chat-application-a6c5a.appspot.com",
  messagingSenderId: "195838222303",
  appId: "1:195838222303:web:92717d8c0a62ff547f2e6a",
  measurementId: "G-97DZYEJV6Y",
};

// Initialize Firebase
const proj = initializeApp(firebaseConfig);

const db = getFirestore(proj);

const app = express();

const server = app.listen(3000, () => {
  console.log("server is running on port 3000...");
});

app.use(express.static("public"));

const io = require("socket.io")(server, {
  cors: {
    origin: "https://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("made socket connection", socket.id);

  socket.on("connection", async () => {
    console.log("sending recent messages");
    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc"),
      limit(10)
    );
    try {
      const querySnapshot = await getDocs(q);

      const messages = [];

      querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        messages.push(messageData);
      });

      console.log(messages);

      io.sockets.emit("connection", messages);
    } catch (error) {
      console.error("Error getting documents:", error);
    }
  });

  socket.on("chat", async (data) => {
    // Add a new document with a generated id.
    const docRef = await addDoc(collection(db, "messages"), {
      message: data.message,
      username: data.username,
      timestamp: serverTimestamp(), // Automatically generate the timestamp
    });
    console.log("Document written with ID: ", docRef.id);

    console.log("emitted recieved");
    io.sockets.emit("chat", data);
  });

  socket.on("typing", (data) => {
    console.log("recieved typing data");
    socket.broadcast.emit("typing", data);
  });
});
