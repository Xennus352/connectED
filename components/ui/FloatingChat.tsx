"use client";

import { MessageCircle } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const toggle = () => setIsOpen((s) => !s);

  // scroll to bottom when messages change
  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      const aiMessage: Message = {
        role: "assistant",
        content: data.reply ?? "No response.",
      };
      setMessages((m) => [...m, aiMessage]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Network error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggle}
          className="fixed bottom-6 right-1 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 cursor-pointer"
          aria-label="Open chat"
        >
          <MessageCircle />
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-end md:items-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={toggle}
            aria-hidden="true"
          />

          {/* modal card */}
          <div
            className="relative w-full max-w-md md:mx-4 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden"
            style={{
              // full-screen friendly: leave space at top/bottom on small screens
              height: "min(90vh, 700px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shrink-0">
              <h3 className="text-sm md:text-base font-semibold">
                Connect Ed Assistant
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    /* minimize behavior (keeps messages) */
                    setIsOpen(false);
                  }}
                  className="p-1 rounded-md hover:bg-blue-700/40"
                  aria-label="Minimize chat"
                >
                  ▢
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setMessages([]);
                  }}
                  className="p-1 rounded-md hover:bg-blue-700/40"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages area - fixed sized, scrollable */}
            <div
              ref={messagesRef}
              className="flex-1 px-4 py-3 overflow-y-auto bg-gray-50 space-y-3"
              // these styles ensure scroll containment and smooth scrolling on iOS
              style={{
                // calculate max height to keep header & input visible on small screens
                maxHeight: "calc(90vh - 120px)", // header + input ~120px
                overscrollBehavior: "contain", // prevents parent/body from capturing overscroll
                WebkitOverflowScrolling: "touch",
              }}
            >
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  Hi — ask me about Connect Ed.
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2 rounded-xl break-words text-sm md:text-base whitespace-pre-wrap`}
                    style={{
                      background: m.role === "user" ? "#0369A1" : "#ffffff",
                      color: m.role === "user" ? "#fff" : "#111827",
                      border:
                        m.role === "user"
                          ? "none"
                          : "1px solid rgba(0,0,0,0.06)",
                      // long words/wrapped code don't overflow
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div>{m.content}</div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="text-gray-500 text-sm italic">
                  Assistant is typing…
                </div>
              )}
            </div>

            {/* Input (always visible) */}
            <div className="px-3 py-2 border-t border-gray-200 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Ask about Connect Ed..."
                  className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none text-black"
                  style={{
                    // input remains accessible on mobile keyboards
                    WebkitTapHighlightColor: "transparent",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
