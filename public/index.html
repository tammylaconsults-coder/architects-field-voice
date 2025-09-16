// public/client.js
const socket = io();

const conversation = document.getElementById("conversation");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

let recognition;
let isRecording = false;

// Add messages to the conversation box
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  conversation.appendChild(msg);
  conversation.scrollTop = conversation.scrollHeight;
}

// Handle sending typed message
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (text) {
    addMessage("Architect", text);
    socket.emit("message", text);
    messageInput.value = "";
  }
});

// Allow pressing Enter to send
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// Handle microphone input (speech-to-text)
micBtn.addEventListener("click", () => {
  if (!recognition) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      addMessage("Architect", transcript);
      socket.emit("message", transcript);
    };
  }

  if (!isRecording) {
    recognition.start();
    micBtn.textContent = "🛑 Stop";
    isRecording = true;
  } else {
    recognition.stop();
    micBtn.textContent = "🎤 Mic";
    isRecording = false;
  }
});

// Listen for Unified Field messages
socket.on("reply", (msg) => {
  addMessage("Unified Field", msg);

  // Speak reply aloud
  const utterance = new SpeechSynthesisUtterance(msg);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
});
