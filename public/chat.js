var socket = io("http://localhost:3000", {
  transports: ["websocket", "polling", "flashsocket"],
});

socket.emit("connection");

const message = document.getElementById("message");
const username = document.getElementById("username");
const button = document.getElementById("submit");
const output = document.getElementById("output");
const feedback = document.getElementById("feedback");

button.addEventListener("click", () => {
  console.log("clicked");
  socket.emit("chat", { message: message.value, username: username.value });
  message.value = ``;
});

message.addEventListener("keypress", () => {
  socket.emit("typing", username.value);
});

// listening for events
socket.on("chat", (data) => {
  //query last 10 from database and display

  feedback.innerHTML = ``;
  output.innerHTML +=
    "<p><strong>" + data.username + ":</strong>" + data.message + "</p>";
});

socket.on("typing", (data) => {
  feedback.innerHTML = `<p><em>${data} is typing a message...</em></p>`;
});

socket.on("connection", (data) => {
  data.forEach((element) => {
    const p = document.createElement("p");
    p.innerHTML =
      "<p><strong>" +
      element.username +
      ":</strong>" +
      element.message +
      "</p>";
    output.appendChild(p);
  });
});
