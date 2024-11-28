import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const roomInput = document.getElementById("roomInput");
const joinButton = document.getElementById("joinButton");
const myIdContainer = document.getElementById("myId");
const messageList = document.getElementById("messageList");
const messageInput = document.getElementById("messageInput");

const peer = new Peer();

peer.on("open", (id) => {
  myIdContainer.textContent = id;
});

peer.on("connection", (conn) => {
  handleChat(conn);
});

const localVideoStream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});

peer.on("call", (call) => {
  call.answer(localVideoStream);
  handleCall(call);
});

function handleCall(call) {
  call.on("stream", (remoteStream) => {
    remoteVideo.srcObject = remoteStream;
  });

  call.on("close", () => {
    remoteVideo.srcObject = null;
  });
}

joinButton.addEventListener("click", async () => {
  const room = roomInput.value;

  const call = peer.call(room, localVideoStream);
  handleCall(call);

  const conn = peer.connect(room);
  handleChat(conn);
});

localVideo.srcObject = localVideoStream;

function addChatMessage(message) {
  const li = document.createElement("li");
  li.textContent = message;
  messageList.appendChild(li);
}

function handleChat(conn) {
  conn.on("data", (data) => {
    addChatMessage(`Peer: ${data}`);
  });

  messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      conn.send(messageInput.value);
      addChatMessage(`Me: ${messageInput.value}`);
      messageInput.value = "";
    }
  });
}
