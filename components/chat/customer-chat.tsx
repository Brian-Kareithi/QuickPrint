'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { MessageList } from '@/components/chat/message-list';
import { ChatBubblesSkeleton } from '@/components/skeleton';
import { useTabBadge } from '@/lib/use-tab-badge';
import { toast } from '@/components/toaster';
import { chatSocket, CUSTOMER_QUICK_MESSAGES, getChatToken, mergeMessages, setChatToken, type ChatMessage } from '@/lib/chat';

interface Props {
  shop: { id: string; name: string };
  orderNumber?: string;
  customerName?: string;
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

  useEffect(() => {
    if (!token) return;
    api.chat.mine(token)
      .then((res) => { setConversation(res.conversation); setMessages(res.messages); })
      .catch((e) => { if (e instanceof ApiError && e.status === 401) forget(); });
    const socket = chatSocket({ chatToken: token });
    socket.on('chat:message', (m: ChatMessage) => {
      setMessages((prev) => mergeMessages(prev, [m]));
      if (m.sender === 'SHOP' && !openRef.current) {
        setUnseen((n) => n + 1);
        toast({ id: 'shop-reply', icon: '💬', title: `New message from ${shop.name}`, body: m.body, onClick: () => { setOpen(true); setUnseen(0); } });
      }
    });
    const poll = setInterval(() => {
      const list = messagesRef.current;
      load(token, list[list.length - 1]?.createdAt);
    }, 15000);
    return () => { socket.disconnect(); clearInterval(poll); };
  }, [token, load, forget, shop.name]);

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

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('chat') !== 'open') return;
    const t = setTimeout(() => setOpen(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {!open && (
        <button
          onClick={() => { setOpen(true); setUnseen(0); }}
          className="glass-ink anim-pop fixed z-50 bottom-14 right-4 h-14 w-14 rounded-full flex items-center justify-center hover:scale-105"
          aria-label={`Chat with ${shop.name}`}
        >
          <MessageCircle className="h-6 w-6" />
          {unseen > 0 && (
            <span key={unseen} className="anim-badge absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center">{unseen}</span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-6">
          <button aria-label="Close chat" onClick={() => setOpen(false)} className="glass-backdrop absolute inset-0 anim-pop cursor-default" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Chat with ${shop.name}`}
            className="glass glass-strong anim-panel relative w-full sm:max-w-md h-[calc(100dvh-1rem)] sm:h-[min(40rem,calc(100dvh-3rem))] rounded-[2rem] overflow-hidden"
          >
            <div className="absolute inset-0 overflow-y-auto overscroll-contain px-3 pt-24 pb-36">
              {token && !conversation ? (
                <ChatBubblesSkeleton />
              ) : messages.length === 0 ? (
                <div className="min-h-full flex flex-col justify-end gap-3 pb-2">
                  <p className="text-4xl text-center" aria-hidden="true">🍍🍌🥭</p>
                  <p className="text-sm text-foreground/70 text-center px-4">
                    Cancelled your request or sent the wrong file? Message {shop.name} here. You&apos;ll get a fun nickname so they can find you, no account needed.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {CUSTOMER_QUICK_MESSAGES.map((q, i) => (
                      <button key={q} onClick={() => send(q)} disabled={sending} style={{ '--i': i } as React.CSSProperties}
                        className="glass anim-fade-up text-xs rounded-full px-3 py-1.5 hover:text-primary">{q}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <MessageList messages={messages} mine="CUSTOMER" />
              )}
            </div>

            <header className="glass-ink absolute top-3 inset-x-3 z-10 rounded-3xl flex items-center gap-3 pl-3 pr-2 py-2.5">
              <span className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">{conversation?.emoji || '💬'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{shop.name}</p>
                <p className="text-[11px] text-white/70 truncate">
                  {conversation ? <>You&apos;re chatting as <strong className="text-[#9ad1d4]">{conversation.alias}</strong></> : 'Ask about your order'}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Close chat"><X className="h-4 w-4" /></button>
            </header>

            <div className="absolute bottom-3 inset-x-3 z-10 space-y-1.5">
              {error && <p className="anim-pop text-xs text-red-700 bg-red-50 border border-red-100 rounded-2xl p-2">{error}</p>}
              <form onSubmit={(e) => { e.preventDefault(); send(draft); }} className="glass rounded-[1.75rem] flex items-end gap-2 p-1.5 pl-4">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft); } }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Type a message…"
                  aria-label="Message"
                  className="flex-1 resize-none max-h-28 bg-transparent border-0 py-2.5 text-sm focus:!shadow-none"
                />
                <button type="submit" disabled={sending || !draft.trim()} aria-label="Send"
                  className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 flex-shrink-0 transition-transform active:scale-95">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
              <p className="text-[10px] text-center text-foreground/50">
                Chats are deleted after 30 days of inactivity. <Link href="/terms#chat" className="underline">Terms &amp; privacy</Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
