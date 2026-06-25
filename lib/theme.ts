export function applyTheme(branding: {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  buttonStyle?: string;
  backgroundStyle?: string;
}) {
  const root = document.documentElement;
  if (branding.primaryColor) root.style.setProperty('--primary', branding.primaryColor);
  if (branding.secondaryColor) root.style.setProperty('--secondary', branding.secondaryColor);
  if (branding.backgroundColor) root.style.setProperty('--background', branding.backgroundColor);
}
