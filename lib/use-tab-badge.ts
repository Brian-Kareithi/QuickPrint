'use client';

import { useEffect } from 'react';

const PREFIX = /^\(\d+\+?\)\s*/;
let originalIcon: string | null = null;
let iconCache: { href: string; img: HTMLImageElement } | null = null;

const label = (n: number) => (n > 99 ? '99+' : String(n));

function iconLinks(): HTMLLinkElement[] {
  return Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'));
}

function setTitle(count: number) {
  const base = document.title.replace(PREFIX, '');
  const next = count > 0 ? `(${label(count)}) ${base}` : base;
  if (document.title !== next) document.title = next;
}

/** Draws the unread count as a red badge over the site icon (like Gmail/WhatsApp Web). */
function setIcon(count: number) {
  const links = iconLinks();
  if (links.length === 0) return;
  if (originalIcon === null) originalIcon = links[0].href;
  if (count <= 0) {
    links.forEach((l) => { if (l.href !== originalIcon) l.href = originalIcon!; });
    return;
  }
  const draw = (img: HTMLImageElement) => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, size, size);
    const text = count > 9 ? '9+' : String(count);
    const r = 19;
    ctx.beginPath();
    ctx.arc(size - r, r, r, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${text.length > 1 ? 22 : 28}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size - r, r + 1);
    const url = canvas.toDataURL('image/png');
    links.forEach((l) => { l.href = url; });
  };
  if (iconCache?.href === originalIcon) return draw(iconCache.img);
  const img = new Image();
  img.onload = () => { iconCache = { href: originalIcon!, img }; draw(img); };
  img.src = originalIcon;
}

/**
 * Shows an unread count in the browser tab: "(3) Orders · QuickPrint" plus a red badge on the
 * tab icon. Re-applies itself when Next.js changes the page title on navigation.
 */
export function useTabBadge(count: number) {
  useEffect(() => {
    setTitle(count);
    setIcon(count);
    const titleEl = document.querySelector('title');
    const observer = new MutationObserver(() => setTitle(count));
    if (titleEl) observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [count]);

  // Clear the badge when the component using it goes away.
  useEffect(() => () => { setTitle(0); setIcon(0); }, []);
}
