'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { MessageList } from '@/components/chat/message-list';
import { ChatBubblesSkeleton } from '@/components/skeleton';
import { useTabBadge } from '@/lib/use-tab-badge';
import { chatSocket, CUSTOMER_QUICK_MESSAGES, getChatToken, mergeMessages, setChatToken, type ChatMessage } from '@/lib/chat';

interface Props {
  shop: { id: string; name: string };
  /** When set, the order is linked to the chat (started or existing). */
  orderNumber?: string;
  customerName?: string;
  /** Open the panel immediately (e.g. from a "Message the shop" button). */
  defaultOpen?: boolean;
}

export function CustomerChat({ shop, orderNumber, customerName, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [token, setToken] = useState<string | null>(() => getChatToken(shop.id));
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [unseen, setUnseen] = useState(0);
  useTabBadge(unseen);
  const openRef = useRef(open);
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const forget = useCallback(() => {
    setChatToken(shop.id, null);
    setToken(null);
    setConversation(null);
    setMessages([]);
  }, [shop.id]);

  const load = useCallback(async (t: string, after?: string) => {
    try {
      const res = await api.chat.mine(t, after);
      setConversation(res.conversation);
      setMessages((prev) => (after ? mergeMessages(prev, res.messages) : res.messages));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) forget();
    }
  }, [forget]);

  // Initial load + live updates while we have a chat.
  useEffect(() => {
    if (!token) return;
    api.chat.mine(token)
      .then((res) => { setConversation(res.conversation); setMessages(res.messages); })
      .catch((e) => { if (e instanceof ApiError && e.status === 401) forget(); });
    const socket = chatSocket({ chatToken: token });
    socket.on('chat:message', (m: ChatMessage) => {
      setMessages((prev) => mergeMessages(prev, [m]));
      if (m.sender === 'SHOP' && !openRef.current) setUnseen((n) => n + 1);
    });
    // Fallback in case the socket can't connect (proxies, flaky networks).
    const poll = setInterval(() => {
      const list = messagesRef.current;
      load(token, list[list.length - 1]?.createdAt);
    }, 15000);
    return () => { socket.disconnect(); clearInterval(poll); };
  }, [token, load, forget]);

  // Link a freshly placed order to an existing chat.
  useEffect(() => {
    if (!token || !orderNumber || !conversation || conversation.orderNumber === orderNumber) return;
    api.chat.linkOrder(token, orderNumber).then(setConversation).then(() => load(token)).catch(() => {});
  }, [token, orderNumber, conversation, load]);

  const send = async (text: string) => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    try {
      let t = token;
      if (!t) {
        const started = await api.chat.start(shop.id, { orderNumber, customerName });
        t = started.token;
        setChatToken(shop.id, t);
        setToken(t);
        setConversation(started.conversation);
      }
      const msg = await api.chat.send(t, body);
      setMessages((prev) => mergeMessages(prev, [msg]));
      setDraft('');
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 401) forget();
      setError(e?.message || 'Could not send your message');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => { setOpen(true); setUnseen(0); }}
          className="fixed z-50 bottom-14 right-4 h-14 w-14 rounded-full bg-ink text-white shadow-lg shadow-black/20 flex items-center justify-center hover:scale-105"
          aria-label={`Chat with ${shop.name}`}
        >
          <MessageCircle className="h-6 w-6" />
          {unseen > 0 && (
            <span key={unseen} className="anim-badge absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center">{unseen}</span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed z-50 inset-x-2 bottom-2 top-16 sm:inset-auto sm:right-4 sm:bottom-14 sm:w-96 sm:h-[34rem] sm:max-h-[calc(100dvh-5rem)] rounded-3xl bg-background border shadow-2xl flex flex-col overflow-hidden anim-panel" role="dialog" aria-label={`Chat with ${shop.name}`}>
          <header className="flex items-center gap-3 px-4 py-3 bg-panel text-white">
            <span className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-lg">{conversation?.emoji || '💬'}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{shop.name}</p>
              <p className="text-[11px] text-white/65 truncate">
                {conversation ? <>You&apos;re chatting as <strong className="text-[#9ad1d4]">{conversation.alias}</strong></> : 'Ask about your order'}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-white/10" aria-label="Close chat"><X className="h-4 w-4" /></button>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto p-3">
            {token && !conversation ? (
              <ChatBubblesSkeleton />
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col justify-end gap-3">
                <p className="text-sm text-foreground/70 text-center px-4">
                  Cancelled your request or sent the wrong file? Message {shop.name} here. You&apos;ll get a fun nickname so they can find you, no account needed.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {CUSTOMER_QUICK_MESSAGES.map((q) => (
                    <button key={q} onClick={() => send(q)} disabled={sending} style={{ '--i': CUSTOMER_QUICK_MESSAGES.indexOf(q) } as React.CSSProperties}
                      className="anim-fade-up text-xs rounded-full border bg-card px-3 py-1.5 hover:border-primary hover:text-primary">{q}</button>
                  ))}
                </div>
              </div>
            ) : (
              <MessageList messages={messages} mine="CUSTOMER" />
            )}
          </div>

          {error && <p className="mx-3 mb-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl p-2">{error}</p>}

          <form onSubmit={(e) => { e.preventDefault(); send(draft); }} className="p-3 border-t bg-card flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft); } }}
              rows={1}
              maxLength={2000}
              placeholder="Type a message..."
              className="flex-1 resize-none max-h-28 rounded-2xl border border-input bg-background px-3 py-2.5 text-sm"
            />
            <button type="submit" disabled={sending || !draft.trim()} aria-label="Send"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 flex-shrink-0">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          <p className="text-[10px] text-center text-foreground/45 pb-2 bg-card">
            Chats are deleted after 30 days of inactivity. <Link href="/terms#chat" className="underline">Terms & privacy</Link>
          </p>
        </div>
      )}
    </>
  );
}
