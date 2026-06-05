import { useState } from "react";
import API from "../services/api";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
    const res = await API.post("/chatbot", {
      message,
    });

    setReply(res.data.response);
  };

  return (
    <div>
      <h3>AI Assistant</h3>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <p>{reply}</p>
    </div>
  );
}

export default Chatbot;