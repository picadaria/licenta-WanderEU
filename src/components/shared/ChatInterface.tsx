"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: number;
}

interface ChatInterfaceProps {
  tripId?: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  suggestions?: string[];
  className?: string;
  placeholder?: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex items-center gap-1 bg-bg-secondary text-text-primary rounded-[16px] rounded-bl-[4px] px-4 py-3 max-w-[80%]">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-text-tertiary"
          style={{ animation: "typingBounce 1.2s ease-in-out infinite" }}
        />
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-text-tertiary"
          style={{
            animation: "typingBounce 1.2s ease-in-out infinite",
            animationDelay: "0.2s",
          }}
        />
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-text-tertiary"
          style={{
            animation: "typingBounce 1.2s ease-in-out infinite",
            animationDelay: "0.4s",
          }}
        />
      </div>
    </div>
  );
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  suggestions = [],
  className,
  placeholder = "Ask me anything about your trip...",
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
      <div
        className={cn(
          "flex flex-col h-full min-h-0 bg-bg-primary",
          className
        )}
      >
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        >
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <p className="text-text-secondary text-sm">
                Start a conversation to plan your trip!
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "px-4 py-2 max-w-[80%] text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-accent text-white rounded-[16px] rounded-br-[4px]"
                    : "bg-bg-secondary text-text-primary rounded-[16px] rounded-bl-[4px]"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && <TypingIndicator />}
        </div>

        {/* Quick suggestions */}
        {suggestions.length > 0 && (
          <div className="px-3 pt-2 pb-0">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSendMessage(s)}
                  disabled={isLoading}
                  className={cn(
                    "shrink-0 text-xs border border-border-default rounded-full px-3 py-1.5",
                    "text-text-secondary hover:border-accent hover:text-text-primary",
                    "transition-colors whitespace-nowrap",
                    isLoading && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="sticky bottom-0 border-t border-border-subtle bg-bg-primary p-3 flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "flex-1 rounded-full border border-border-default px-4 py-2 text-sm",
              "bg-bg-primary text-text-primary placeholder:text-text-tertiary",
              "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted",
              "transition-colors",
              isLoading && "opacity-60"
            )}
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white",
              "transition-all duration-150 hover:bg-accent-hover active:scale-95",
              (!input.trim() || isLoading) && "opacity-40 cursor-not-allowed"
            )}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
