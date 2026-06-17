"use client";

import { sendAdvisorMessage } from "@/app/[locale]/(investor)/investor/advisor/actions";
import { useRef, useState, useTransition } from "react";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
type ServerMessage = { role: "user" | "assistant"; content: string };

let messageSeq = 0;
const nextId = () => `m${messageSeq++}`;

type Props = {
  sessionId: string;
  initialMessages: ServerMessage[];
  labels: {
    placeholder: string;
    send: string;
    sending: string;
    empty: string;
    you: string;
    advisor: string;
    disclaimer: string;
  };
};

export function AdvisorChat({ sessionId, initialMessages, labels }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialMessages.map((m) => ({ ...m, id: nextId() })),
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToEnd() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isPending) return;

    setError(null);
    setMessages((m) => [...m, { id: nextId(), role: "user", content: text }]);
    setInput("");
    scrollToEnd();

    startTransition(async () => {
      const res = await sendAdvisorMessage(sessionId, text);
      if (res.ok) {
        setMessages((m) => [...m, { id: nextId(), role: "assistant", content: res.reply }]);
      } else {
        setError(res.error);
      }
      scrollToEnd();
    });
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-400">{labels.empty}</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <span className="mb-1 text-xs font-medium text-gray-400">
                {m.role === "user" ? labels.you : labels.advisor}
              </span>
              <div
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[var(--color-navy)] text-white"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-navy)]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {isPending && (
          <div className="flex items-start">
            <span className="mb-1 text-xs font-medium text-gray-400">{labels.advisor}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mb-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <form
        onSubmit={submit}
        className="flex items-end gap-2 border-t border-[var(--color-border)] p-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) submit(e);
          }}
          rows={2}
          maxLength={2000}
          placeholder={labels.placeholder}
          className="flex-1 resize-none rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)]"
        />
        <button
          type="submit"
          disabled={isPending || input.trim().length === 0}
          className="rounded-lg bg-[var(--color-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {isPending ? labels.sending : labels.send}
        </button>
      </form>
      <p className="px-5 pb-3 text-xs text-gray-400">{labels.disclaimer}</p>
    </div>
  );
}
