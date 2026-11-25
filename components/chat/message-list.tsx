'use client';

import { useEffect, useRef } from 'react';
import { formatTime } from '@/lib/utils';
import type { ChatMessage } from '@/lib/chat';

export function MessageList({ messages, mine, className = '' }: { messages: ChatMessage[]; mine: 'CUSTOMER' | 'SHOP'; className?: string }) {
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <div className={`flex flex-col gap-2 ${className}`} role="log" aria-live="polite">
      {messages.map((m) => {
        if (m.sender === 'SYSTEM') {
          return (
            <p key={m.id} className="anim-pop self-center max-w-[90%] text-center text-[11px] text-foreground/55 bg-muted rounded-full px-3 py-1">
              {m.body}
            </p>
          );
        }
        const isMine = m.sender === mine;
        return (
          <div key={m.id} className={`anim-pop flex flex-col max-w-[85%] sm:max-w-[80%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
            <div
              className={`whitespace-pre-wrap break-words text-sm leading-snug px-3 py-2 rounded-2xl ${
                isMine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border rounded-bl-md'
              }`}
            >
              {m.body}
            </div>
            <span className="text-[10px] text-foreground/45 mt-0.5 px-1">
              {!isMine && m.senderName ? `${m.senderName} · ` : ''}{formatTime(m.createdAt)}
            </span>
          </div>
        );
      })}
      <div ref={end} />
    </div>
  );
}
