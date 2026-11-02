/** Only the signed-in portal has a theme switch; the landing page and auth screens are always light. */
export const PORTAL_PREFIXES = ['/dashboard', '/admin', '/my-orders', '/profile', '/notifications'];

export const isPortalPath = (pathname: string) =>
  PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

/** Runs before first paint (inline in <head>) so a saved dark theme never flashes light. */
export const THEME_INIT_SCRIPT = `try{var p=${JSON.stringify(PORTAL_PREFIXES)},n=location.pathname,i=p.some(function(x){return n===x||n.indexOf(x+'/')===0}),t=localStorage.getItem('theme');if(i&&(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)))document.documentElement.classList.add('dark')}catch(e){}`;
