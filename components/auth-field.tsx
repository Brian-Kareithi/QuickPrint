'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AuthField({ label, type = 'text', ...props }: Props) {
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label className="auth-field-label text-sm font-medium block">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={isPassword && shown ? 'text' : type}
          className={`auth-input block w-full rounded-xl border border-input bg-muted/40 px-3.5 text-sm placeholder:text-foreground/35 focus:bg-card ${isPassword ? 'pr-11' : ''}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShown(!shown)} aria-label={shown ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-foreground/45 hover:text-foreground">
            {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
