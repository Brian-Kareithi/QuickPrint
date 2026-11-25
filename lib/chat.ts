import { io, type Socket } from 'socket.io-client';
import { API_ORIGIN } from '@/lib/api';

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: 'CUSTOMER' | 'SHOP' | 'SYSTEM';
  senderName?: string | null;
  body: string;
  createdAt: string;
};

const tokenKey = (shopId: string) => `qp-chat:${shopId}`;

export function getChatToken(shopId: string): string | null {
  try { return localStorage.getItem(tokenKey(shopId)); } catch { return null; }
}

export function setChatToken(shopId: string, token: string | null) {
  try {
    if (token) localStorage.setItem(tokenKey(shopId), token);
    else localStorage.removeItem(tokenKey(shopId));
  } catch {}
}

export function chatSocket(auth: { chatToken: string } | { jwt: string; shopId: string }): Socket {
  return io(`${API_ORIGIN}/chat`, { auth, transports: ['websocket', 'polling'], reconnectionDelayMax: 10000 });
}

/** Append messages we don't have yet, keeping chronological order. */
export function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (incoming.length === 0) return current;
  const seen = new Set(current.map((m) => m.id));
  const fresh = incoming.filter((m) => !seen.has(m.id));
  if (fresh.length === 0) return current;
  return [...current, ...fresh].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

const ALIAS_COLORS = ['#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#ef4444', '#0ea5e9', '#84cc16', '#f97316'];

/** A stable colour per alias so the same customer always looks the same in the inbox. */
export function aliasColor(alias: string): string {
  let h = 0;
  for (let i = 0; i < alias.length; i++) h = (h * 31 + alias.charCodeAt(i)) >>> 0;
  return ALIAS_COLORS[h % ALIAS_COLORS.length];
}

export const CUSTOMER_QUICK_MESSAGES = [
  'I want to cancel my order',
  'I sent the wrong document',
  'When will my order be ready?',
  'I need to change my print options',
];

export const SHOP_QUICK_REPLIES = [
  "No problem, I've cancelled it for you.",
  'Please upload the correct file and send me the new order number.',
  'Your order is ready for pickup.',
  'Give us about 10 minutes.',
];

/** Which conversation the shop has open right now (so the global listener doesn't toast it). */
export const chatPresence: { conversationId: string | null } = { conversationId: null };
