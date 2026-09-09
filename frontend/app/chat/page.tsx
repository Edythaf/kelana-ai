"use client";

import { useEffect, useState } from "react";

type Conversation = {
  id: number;
  title: string;
  created_at: string;
};

type Message = {
  id: number;
  role: string;
  content: string;
  created_at: string;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setConversations(data);
      } else {
        console.error("Failed to load conversations:", data);
        setConversations([]);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: number) {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setSelectedConversationId(conversationId);
        setMessages(data);
      } else {
        console.error("Failed to load messages:", data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }

  async function sendMessage() {
    if (!selectedConversationId || !newMessage.trim()) return;

    const token = localStorage.getItem("token");

    if (!token) return;

    setSending(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newMessage,
          }),
        }
      );

      if (response.ok) {
        setNewMessage("");

        await loadMessages(selectedConversationId);
      } else {
        const data = await response.json();
        console.error("Failed to send message:", data);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ padding: "30px" }}>
      <h1>KelanaAI Chat</h1>

      <h2>Conversations</h2>

      {loading && <p>Loading...</p>}

      {!loading && conversations.length === 0 && (
        <p>No conversations found.</p>
      )}

      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => loadMessages(conversation.id)}
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            marginBottom: "8px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {conversation.title}
        </div>
      ))}

      {selectedConversationId && (
        <div style={{ marginTop: "30px" }}>
          <h2>Messages</h2>

          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px",
              }}
            >
              <strong>
                {message.role === "user" ? "You" : "KelanaAI"}
              </strong>

              <p style={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </p>
            </div>
          ))}

          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{
                width: "80%",
                padding: "12px",
                marginRight: "10px",
              }}
            />

            <button
              onClick={sendMessage}
              disabled={sending}
              style={{
                padding: "12px 20px",
                cursor: "pointer",
              }}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}