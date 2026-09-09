"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

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
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function loadConversations() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/conversations`,
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
        throw new Error("Failed to load conversations");
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setError("Unable to load your conversations.");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  async function createConversation() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "New Conversation",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      await loadConversations();

      setSelectedConversationId(data.conversation_id);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setError("Unable to create a new conversation.");
    } finally {
      setCreating(false);
    }
  }

  async function loadMessages(conversationId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoadingMessages(true);
      setError("");
      setSelectedConversationId(conversationId);

      const response = await fetch(
        `${API_URL}/conversations/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setMessages(data);
      } else {
        throw new Error("Failed to load messages");
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError("Unable to load this conversation.");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendMessage() {
    if (!selectedConversationId || !newMessage.trim()) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const messageToSend = newMessage.trim();

    setNewMessage("");
    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: messageToSend,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error("Failed to send message:", data);
        throw new Error("Failed to send message");
      }

      await loadMessages(selectedConversationId);
      await loadConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(messageToSend);
      setError("Your message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const selectedConversation = conversations.find(
    (conversation) =>
      conversation.id === selectedConversationId
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* PAGE HEADER */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            AI Travel Assistant
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Chat with KelanaAI
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Ask travel questions, continue previous conversations,
            and plan your journey with an AI assistant that remembers
            the context of your conversation.
          </p>
        </div>
      </section>

      {/* CHAT LAYOUT */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid min-h-[650px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
          {/* SIDEBAR */}
          <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 p-5">
              <button
                onClick={createConversation}
                disabled={creating}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating
                  ? "Creating..."
                  : "+ New Conversation"}
              </button>
            </div>

            <div className="p-4">
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Conversations
              </p>

              {loading && (
                <div className="rounded-xl px-3 py-4 text-sm text-slate-500">
                  Loading conversations...
                </div>
              )}

              {!loading && conversations.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                  <div className="text-2xl">
                    ◌
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    No conversations yet
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Start a new conversation with KelanaAI.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const active =
                    selectedConversationId === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() =>
                        loadMessages(conversation.id)
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-blue-200 bg-blue-50"
                          : "border-transparent hover:bg-white"
                      }`}
                    >
                      <p
                        className={`truncate text-sm font-semibold ${
                          active
                            ? "text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        {conversation.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(
                          conversation.created_at
                        ).toLocaleDateString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* MESSAGE AREA */}
          <div className="flex min-h-[650px] flex-col">
            {!selectedConversationId ? (
              <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                    ✦
                  </div>

                  <h2 className="mt-5 text-2xl font-bold">
                    Your AI travel companion
                  </h2>

                  <p className="mt-3 leading-7 text-slate-500">
                    Select a previous conversation or start a new one
                    to ask KelanaAI about destinations, itineraries,
                    travel tips, and more.
                  </p>

                  <button
                    onClick={createConversation}
                    disabled={creating}
                    className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    Start a Conversation
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* CHAT HEADER */}
                <div className="border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white">
                      K
                    </div>

                    <div>
                      <p className="font-semibold">
                        {selectedConversation?.title ||
                          "KelanaAI Conversation"}
                      </p>

                      <p className="text-xs text-slate-500">
                        Powered by Amazon Bedrock
                      </p>
                    </div>
                  </div>
                </div>

                {/* MESSAGES */}
                <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/60 px-5 py-6 sm:px-8">
                  {loadingMessages ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="max-w-sm text-center">
                        <div className="text-3xl">
                          👋
                        </div>

                        <h3 className="mt-3 font-semibold">
                          Start the conversation
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Ask KelanaAI anything about your next trip.
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isUser =
                        message.role === "user";

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isUser
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] ${
                              isUser
                                ? "order-2"
                                : ""
                            }`}
                          >
                            <div
                              className={`mb-2 flex items-center gap-2 ${
                                isUser
                                  ? "justify-end"
                                  : ""
                              }`}
                            >
                              <span className="text-xs font-semibold text-slate-500">
                                {isUser
                                  ? "You"
                                  : "KelanaAI"}
                              </span>

                              <span className="text-xs text-slate-400">
                                {new Date(
                                  message.created_at
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <div
                              className={`rounded-2xl px-5 py-4 text-sm leading-7 shadow-sm ${
                                isUser
                                  ? "rounded-br-md bg-blue-600 text-white"
                                  : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              <div className="prose prose-slate max-w-none">
                                <ReactMarkdown>
                                    {message.content}
                                </ReactMarkdown>
                                </div>
                              
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {sending && (
                    <div className="flex justify-start">
                      <div>
                        <p className="mb-2 text-xs font-semibold text-slate-500">
                          KelanaAI
                        </p>

                        <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
                          KelanaAI is thinking...
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* MESSAGE INPUT */}
                <div className="border-t border-slate-200 bg-white p-5">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) =>
                        setNewMessage(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey
                        ) {
                          e.preventDefault();

                          if (
                            !sending &&
                            newMessage.trim()
                          ) {
                            sendMessage();
                          }
                        }
                      }}
                      placeholder="Ask KelanaAI about your trip..."
                      disabled={sending}
                      rows={1}
                      className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      onClick={sendMessage}
                      disabled={
                        sending ||
                        !newMessage.trim()
                      }
                      className="h-[52px] rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending
                        ? "Sending..."
                        : "Send"}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Press Enter to send · Shift + Enter for a new line
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}