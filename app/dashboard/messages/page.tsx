'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, MessageCircle, RotateCcw, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { ListSkeleton } from '@/components/skeleton';
import { ErrorState } from '@/components/error-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageList } from '@/components/chat/message-list';
import { aliasColor, chatSocket, mergeMessages, SHOP_QUICK_REPLIES, type ChatMessage } from '@/lib/chat';
import { formatCurrency, formatTime, formatDate, getStatusColor } from '@/lib/utils';

type Conversation = {
  id: string;
  shopId: string;
  alias: string;
  emoji: string;
  customerName?: string | null;
  orderNumber?: string | null;
  status: 'OPEN' | 'CLOSED';
  unreadByShop: number;
  lastMessageAt: string;
  lastMessagePreview?: string | null;
};

const when = (d: string) => {
  const date = new Date(d);
  return date.toDateString() === new Date().toDateString() ? formatTime(date) : formatDate(date, { year: undefined });
};

function Avatar({ c, size = 'h-10 w-10' }: { c: Conversation; size?: string }) {
  return (
    <span className={`${size} rounded-full flex items-center justify-center text-lg flex-shrink-0`} style={{ backgroundColor: aliasColor(c.alias) + '26' }}>
      {c.emoji}
    </span>
  );
}

// useSearchParams needs a Suspense boundary for static rendering.
export default function MessagesPage() {
  return <Suspense fallback={<ListSkeleton />}><MessagesInbox /></Suspense>;
}

function MessagesInbox() {
  const [shopId, setShopId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'OPEN' | 'CLOSED' | ''>('OPEN');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const activeRef = useRef<string | null>(null);
  useEffect(() => { activeRef.current = activeId; }, [activeId]);

  const loadList = useCallback((id: string) => {
    return api.chat.list(id).then(setConversations).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    api.shops.mine()
      .then((shops) => {
        if (shops.length === 0) { setError('You are not linked to a shop yet.'); return; }
        setShopId(shops[0].id);
        return loadList(shops[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [loadList]);

  const openThread = useCallback(async (id: string) => {
    setActiveId(id);
    setThreadLoading(true);
    setMessages([]);
    setOrder(null);
    try {
      const res = await api.chat.get(id);
      setMessages(res.messages);
      setOrder(res.order);
      setConversations((list) => list.map((c) => (c.id === id ? { ...c, unreadByShop: 0 } : c)));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  // Open a specific chat from a link, e.g. /dashboard/messages?c=<conversationId>.
  const linkedId = useSearchParams().get('c');
  useEffect(() => {
    if (shopId && linkedId) openThread(linkedId);
  }, [shopId, linkedId, openThread]);

  // Live updates for the whole shop inbox.
  useEffect(() => {
    if (!shopId) return;
    const jwt = localStorage.getItem('token');
    if (!jwt) return;
    const socket = chatSocket({ jwt, shopId });
    socket.on('chat:conversation', (c: Conversation) => {
      setConversations((list) => {
        const next = list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [c, ...list];
        return [...next].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
      });
    });
    socket.on('chat:message', (m: ChatMessage) => {
      if (m.conversationId !== activeRef.current) return;
      setMessages((prev) => mergeMessages(prev, [m]));
      // We're looking at it, so tell the server it's read.
      if (m.sender === 'CUSTOMER') api.chat.get(m.conversationId, m.createdAt).catch(() => {});
    });
    const poll = setInterval(() => loadList(shopId), 30000);
    return () => { socket.disconnect(); clearInterval(poll); };
  }, [shopId, loadList]);

  const active = conversations.find((c) => c.id === activeId) || null;
  const visible = useMemo(() => conversations.filter((c) => !filter || c.status === filter), [conversations, filter]);
  const unreadTotal = conversations.reduce((n, c) => n + (c.unreadByShop || 0), 0);

  const send = async (text: string) => {
    const body = text.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    try {
      const msg = await api.chat.reply(activeId, body);
      setMessages((prev) => mergeMessages(prev, [msg]));
      setDraft('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async () => {
    if (!active) return;
    const updated = await api.chat.setStatus(active.id, active.status === 'OPEN' ? 'CLOSED' : 'OPEN').catch((e) => { setError(e.message); return null; });
    if (updated) {
      setConversations((list) => list.map((c) => (c.id === updated.id ? updated : c)));
      const res = await api.chat.get(active.id).catch(() => null);
      if (res) setMessages(res.messages);
    }
  };

  if (loading) return <ListSkeleton />;
  if (error && conversations.length === 0 && !shopId) return <ErrorState title="Couldn't load messages" message={error} />;

  return (
    <div className="h-full min-h-[30rem] flex gap-4">
      {/* Inbox */}
      <section className={`${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 flex-col bg-card rounded-3xl border overflow-hidden`}>
        <div className="p-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Customer chats</h2>
            {unreadTotal > 0 && <span className="text-[11px] font-semibold rounded-full bg-primary text-primary-foreground px-2 py-0.5">{unreadTotal} new</span>}
          </div>
          <p className="text-xs text-foreground/55 mt-0.5">Customers get a fun nickname so you can tell them apart.</p>
          <div className="flex gap-1.5 mt-3">
            {([['OPEN', 'Open'], ['CLOSED', 'Resolved'], ['', 'All']] as const).map(([v, l]) => (
              <button key={l} onClick={() => setFilter(v)}
                className={`text-xs rounded-full px-3 py-1 ${filter === v ? 'bg-ink text-white' : 'bg-muted text-foreground/65 hover:text-foreground'}`}>{l}</button>
            ))}
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {visible.length === 0 && (
            <li className="p-6 text-center text-sm text-foreground/55">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-foreground/25" />
              No {filter === 'CLOSED' ? 'resolved' : filter === 'OPEN' ? 'open' : ''} chats yet.
            </li>
          )}
          {visible.map((c) => (
            <li key={c.id}>
              <button onClick={() => openThread(c.id)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-border/60 hover:bg-muted/60 ${c.id === activeId ? 'bg-muted' : ''}`}>
                <Avatar c={c} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={`text-sm truncate ${c.unreadByShop > 0 ? 'font-semibold' : 'font-medium'}`}>{c.alias}</span>
                    <span className="ml-auto text-[10px] text-foreground/45 flex-shrink-0">{when(c.lastMessageAt)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`text-xs truncate ${c.unreadByShop > 0 ? 'text-foreground' : 'text-foreground/55'}`}>{c.lastMessagePreview || 'No messages yet'}</span>
                    {c.unreadByShop > 0 && <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center flex-shrink-0">{c.unreadByShop}</span>}
                  </span>
                  {c.orderNumber && <span className="block text-[10px] text-primary mt-0.5">{c.orderNumber}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Thread */}
      <section className={`${activeId ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col bg-card rounded-3xl border overflow-hidden`}>
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-foreground/55">
            <MessageCircle className="h-10 w-10 mb-2 text-foreground/25" />
            <p className="text-sm">Pick a chat to read and reply.</p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 px-4 py-3 border-b">
              <button onClick={() => setActiveId(null)} className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-muted" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button>
              <Avatar c={active} size="h-9 w-9" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{active.alias}</p>
                <p className="text-[11px] text-foreground/55 truncate">
                  {active.customerName ? `Gave name: ${active.customerName}` : 'Guest customer'}{active.orderNumber ? ` · ${active.orderNumber}` : ''}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={toggleStatus}>
                {active.status === 'OPEN' ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolve</> : <><RotateCcw className="h-3.5 w-3.5 mr-1" /> Reopen</>}
              </Button>
            </header>

            {order && (
              <div className="mx-4 mt-3 rounded-2xl bg-muted/60 border p-3 text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-semibold">{order.orderNumber}</span>
                <Badge className={getStatusColor(order.status)}>{order.status.replace(/_/g, ' ')}</Badge>
                <span>{formatCurrency(order.totalAmount)} · {order.isPaid ? 'Paid' : 'Unpaid'}</span>
                <span className="text-foreground/55 truncate">{order.items.map((i: any) => i.fileName).join(', ')}</span>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              {threadLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-foreground/40" /></div>
                : <MessageList messages={messages} mine="SHOP" />}
            </div>

            {error && <p className="mx-4 mb-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl p-2">{error}</p>}

            <div className="px-4 pt-2 flex gap-1.5 overflow-x-auto">
              {SHOP_QUICK_REPLIES.map((q) => (
                <button key={q} onClick={() => setDraft(q)} className="text-[11px] whitespace-nowrap rounded-full border px-2.5 py-1 hover:border-primary hover:text-primary">{q}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(draft); }} className="p-3 flex items-end gap-2">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft); } }}
                rows={1} maxLength={2000} placeholder={`Reply to ${active.alias}...`}
                className="flex-1 resize-none max-h-32 rounded-2xl border border-input bg-background px-3 py-2.5 text-sm" />
              <button type="submit" disabled={sending || !draft.trim()} aria-label="Send"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 flex-shrink-0">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
