'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { chatPresence, chatSocket, type ChatMessage } from '@/lib/chat';
import { toast } from '@/components/toaster';

/**
 * Dashboard-wide chat listener for owners and cashiers. Keeps one live connection for the shop and:
 *  - shows a toast with the customer's message (unless that conversation is already open),
 *  - shows a desktop notification when the tab is in the background (if the browser allows it),
 *  - tells the layout to refresh the unread badge immediately.
 */
export function ChatListener({ shopId, onActivity }: { shopId: string; onActivity: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const activity = useRef(onActivity);
  const emojis = useRef(new Map<string, string>());
  useEffect(() => { pathRef.current = pathname; }, [pathname]);
  useEffect(() => { activity.current = onActivity; }, [onActivity]);

  useEffect(() => {
    const jwt = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!jwt) return;
    api.chat.list(shopId).then((list) => list.forEach((c: any) => emojis.current.set(c.id, c.emoji))).catch(() => {});

    const socket = chatSocket({ jwt, shopId });
    socket.on('chat:conversation', (c: any) => {
      emojis.current.set(c.id, c.emoji);
      activity.current();
    });
    socket.on('chat:message', (m: ChatMessage) => {
      if (m.sender !== 'CUSTOMER') return;
      const looking = pathRef.current === '/dashboard/messages' && chatPresence.conversationId === m.conversationId && document.visibilityState === 'visible';
      if (looking) return;
      const open = () => router.push(`/dashboard/messages?c=${m.conversationId}`);
      const who = m.senderName || 'a customer';
      toast({ id: `chat-${m.conversationId}`, icon: emojis.current.get(m.conversationId) || '💬', title: `New message from ${who}`, body: m.body, onClick: open });
      if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const n = new Notification(`New message from ${who}`, { body: m.body, tag: `chat-${m.conversationId}`, icon: '/favicon_io/android-chrome-192x192.png' });
          n.onclick = () => { window.focus(); open(); n.close(); };
        } catch {}
      }
    });
    return () => { socket.disconnect(); };
  }, [shopId, router]);

  return null;
}
