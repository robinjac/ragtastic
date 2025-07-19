import React, { useState } from "react";
import { Send, Bot, User } from "lucide-react";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: messages.length + 1, role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: input.trim(),
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        console.error("Failed to get valid response from API");
      }
    } catch (err) {
      console.error("Error during chat submission", err);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-4">
            <h1 className="text-white text-xl font-semibold flex items-center gap-2">
              <Bot className="w-6 h-6" />
              AI Chat Assistant
            </h1>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                Start a conversation by sending a message below.
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[80%] ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {message.role === "user" ? "You" : "AI Assistant"}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Bot className="w-4 h-4 animate-pulse" />
                <span>AI is typing...</span>
              </div>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
