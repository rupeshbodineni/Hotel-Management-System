import { useState, useRef, useEffect } from "react";
import API from "../services/api";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Welcome to **The Royal Oasis**! 👑 I'm your AI concierge. Ask me about rooms, bookings, dining, spa, services, or anything about your stay!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await API.post("/chatbot/", { message: userMsg });
      setMessages((prev) => [...prev, { from: "bot", text: res.data.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I'm having trouble connecting right now. Please contact our front desk at **+91 9800-ROYAL-1** for immediate assistance.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const quickQuestions = ["Room rates?", "Check-in time?", "Spa services?", "Coupons?"];

  // Render text with basic bold markdown support
  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        id="chatbot-toggle"
        aria-label="Open AI Concierge Chat"
        onClick={() => setOpen((s) => !s)}
        style={styles.floatBtn}
        title="Chat with AI Concierge"
      >
        {open ? "✕" : "💬"}
        {!open && <span style={styles.floatBadge}>AI</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div id="chatbot-window" className="glass-panel" style={styles.window}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>👑</div>
              <div>
                <p style={styles.headerTitle}>Royal AI Concierge</p>
                <p style={styles.headerSub}>● Online · Always available</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={styles.closeBtn} aria-label="Close chat">✕</button>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.msgWrapper,
                  justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.from === "bot" && <div style={styles.botAvatar}>👑</div>}
                <div
                  style={
                    msg.from === "user" ? styles.userBubble : styles.botBubble
                  }
                >
                  {renderText(msg.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ ...styles.msgWrapper, justifyContent: "flex-start" }}>
                <div style={styles.botAvatar}>👑</div>
                <div style={{ ...styles.botBubble, ...styles.typingBubble }}>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && !loading && (
            <div style={styles.quickRow}>
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  style={styles.quickBtn}
                  onClick={() => handleQuickQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} style={styles.inputRow}>
            <input
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your stay..."
              style={styles.input}
              disabled={loading}
              autoComplete="off"
            />
            <button
              type="submit"
              id="chatbot-send"
              style={styles.sendBtn}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const styles = {
  floatBtn: {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c5a880, #e0c8a5)",
    border: "none",
    color: "#0b0f19",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 1000,
    boxShadow: "0 8px 24px rgba(197, 168, 128, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s",
    position: "fixed",
  },
  floatBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    background: "#10b981",
    color: "#fff",
    fontSize: "9px",
    fontWeight: "700",
    padding: "2px 5px",
    borderRadius: "8px",
    letterSpacing: "0.5px",
  },
  window: {
    position: "fixed",
    bottom: "100px",
    right: "28px",
    width: "360px",
    maxWidth: "calc(100vw - 32px)",
    height: "520px",
    maxHeight: "calc(100vh - 140px)",
    display: "flex",
    flexDirection: "column",
    zIndex: 999,
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(197, 168, 128, 0.3)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
  },
  header: {
    background: "linear-gradient(135deg, rgba(15,22,36,0.98), rgba(20,28,46,0.98))",
    borderBottom: "1px solid rgba(197, 168, 128, 0.2)",
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c5a880, #e0c8a5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },
  headerTitle: {
    color: "#f5f7fa",
    fontWeight: "600",
    fontSize: "14px",
    margin: 0,
  },
  headerSub: {
    color: "#10b981",
    fontSize: "11px",
    margin: 0,
    marginTop: "2px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#a0aec0",
    cursor: "pointer",
    fontSize: "18px",
    padding: "4px",
    lineHeight: 1,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "rgba(8, 12, 22, 0.8)",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(197, 168, 128, 0.3) transparent",
  },
  msgWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  botAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c5a880, #e0c8a5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },
  botBubble: {
    background: "rgba(20, 26, 43, 0.9)",
    border: "1px solid rgba(197, 168, 128, 0.15)",
    color: "#e2e8f0",
    padding: "10px 14px",
    borderRadius: "16px 16px 16px 4px",
    fontSize: "13px",
    lineHeight: "1.5",
    maxWidth: "85%",
    whiteSpace: "pre-wrap",
  },
  userBubble: {
    background: "linear-gradient(135deg, #c5a880, #b4966e)",
    color: "#0b0f19",
    padding: "10px 14px",
    borderRadius: "16px 16px 4px 16px",
    fontSize: "13px",
    lineHeight: "1.5",
    maxWidth: "80%",
    fontWeight: "500",
  },
  typingBubble: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    padding: "14px",
  },
  dot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#c5a880",
    animation: "dotBounce 1.2s infinite",
  },
  quickRow: {
    padding: "8px 12px",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    background: "rgba(8, 12, 22, 0.8)",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    flexShrink: 0,
  },
  quickBtn: {
    background: "rgba(197, 168, 128, 0.1)",
    border: "1px solid rgba(197, 168, 128, 0.25)",
    color: "#c5a880",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  inputRow: {
    padding: "12px",
    display: "flex",
    gap: "8px",
    background: "rgba(10, 15, 26, 0.95)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#f5f7fa",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    outline: "none",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #c5a880, #e0c8a5)",
    border: "none",
    color: "#0b0f19",
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    flexShrink: 0,
  },
};

export default Chatbot;