"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif';

const STORAGE_KEY = "hz-theme";

type Theme = "light" | "dark";

const DARK_VARS = `
  --hz-bg: #010409;
  --hz-fg: #ffffff;
  --hz-strong: #ffffff;
  --hz-muted: #9198a1;
  --hz-border: #3d444d;
  --hz-border-hover: #6e7681;
  --hz-input-bg: #0d1117;
  --hz-link: #4493f8;
  --hz-focus: #4493f8;
  --hz-ring: rgba(68, 147, 248, 0.3);
  --hz-tint: rgba(255, 255, 255, 0.08);
  --hz-chip: #ffffff;
  --hz-btn-border: rgba(255, 255, 255, 0.3);
  --hz-btn-border-hover: rgba(255, 255, 255, 0.6);
  --hz-btn-shadow-hover: 0 8px 26px rgba(255, 255, 255, 0.12);
  --hz-soft-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
  --hz-glow-opacity: 0.16;
`;

const STYLES = `
  .hz-root {
    --hz-bg: #ffffff;
    --hz-fg: #1f2328;
    --hz-strong: #000000;
    --hz-muted: #59636e;
    --hz-border: #d1d9e0;
    --hz-border-hover: #9aa4af;
    --hz-input-bg: #ffffff;
    --hz-link: #0969da;
    --hz-focus: #0969da;
    --hz-ring: rgba(9, 105, 218, 0.25);
    --hz-tint: rgba(0, 0, 0, 0.04);
    --hz-chip: #000000;
    --hz-btn-border: #000000;
    --hz-btn-border-hover: #000000;
    --hz-btn-shadow-hover: 0 10px 24px rgba(0, 0, 0, 0.35);
    --hz-soft-shadow: 0 6px 18px rgba(31, 35, 40, 0.12);
    --hz-glow-opacity: 0.2;
  }
  .hz-root.hz-dark { ${DARK_VARS} }
  @media (prefers-color-scheme: dark) {
    .hz-root:not(.hz-light):not(.hz-dark) { ${DARK_VARS} }
  }

  @keyframes hz-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes hz-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes hz-float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(18px, -22px); } }
  .hz-enter { animation: hz-fade-up 0.55s ease-out both; }
  .hz-gradient-text { background-size: 200% 200%; animation: hz-shift 6s ease infinite; }
  .hz-blob { animation: hz-float 12s ease-in-out infinite; opacity: var(--hz-glow-opacity); }
  @media (prefers-reduced-motion: reduce) {
    .hz-enter, .hz-gradient-text, .hz-blob { animation: none; }
  }
`;

function HorizonMark() {
  return (
    <svg viewBox="0 0 16 16" width="56" height="56" fill="currentColor" aria-hidden="true">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const inputClass =
  "block h-[42px] w-full rounded-lg border border-[color:var(--hz-border)] bg-[color:var(--hz-input-bg)] px-3.5 text-[15px] text-[color:var(--hz-fg)] outline-none transition-all duration-200 " +
  "hover:border-[color:var(--hz-border-hover)] focus:border-[color:var(--hz-focus)] focus:shadow-[0_0_0_3px_var(--hz-ring)]";

const socialClass =
  "flex h-[42px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-[color:var(--hz-border)] bg-transparent text-[15px] font-medium text-[color:var(--hz-fg)] " +
  "transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--hz-border-hover)] hover:bg-[color:var(--hz-tint)] hover:[box-shadow:var(--hz-soft-shadow)] active:translate-y-0 active:scale-[0.98]";

const linkClass = "text-[color:var(--hz-link)] hover:underline";

export default function HorizonLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ username, password });
  };

  const themeClass = theme === "dark" ? "hz-dark" : theme === "light" ? "hz-light" : "";

  return (
    <div
      className={`hz-root ${themeClass} relative flex min-h-screen items-center justify-center overflow-hidden bg-[color:var(--hz-bg)] px-4 py-10 text-[color:var(--hz-fg)] transition-colors duration-300`}
      style={{ fontFamily: FONT }}
    >
      <style>{STYLES}</style>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="absolute right-5 top-5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[color:var(--hz-border)] bg-transparent text-[color:var(--hz-fg)] transition-all duration-300 hover:rotate-12 hover:scale-110 hover:border-[color:var(--hz-border-hover)] hover:bg-[color:var(--hz-tint)] active:scale-95"
      >
        <span className={`transition-opacity duration-200 ${theme ? "opacity-100" : "opacity-0"}`}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </span>
      </button>


      <div className="hz-enter relative w-full max-w-[400px] border-0 bg-transparent px-8 py-9">
        <div className="flex flex-col items-center">
          <a
            href="/"
            aria-label="Horizon home"
            className="mb-5 text-[color:var(--hz-fg)] transition-transform duration-300 hover:scale-110 hover:-rotate-6"
          >
            <HorizonMark />
          </a>

          <h1 className="mb-7 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-[26px] font-semibold leading-tight tracking-tight">
            <span>Sign in to Horizon</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="login_field" className="mb-2 block text-[14px] font-semibold">
            Username or email address
          </label>
          <input
            id="login_field"
            name="login"
            type="text"
            autoFocus
            autoCapitalize="off"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className={inputClass }
            placeholder="username@example.com"
          />

          <div className="mb-2 mt-4 flex items-center justify-between">
            <label htmlFor="password" className="block text-[14px] font-semibold">
              Password
            </label>
            <Link
              href="#"
              className="text-[14px] font-medium text-blue-600 underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            className="group relative mt-6 h-[46px] w-full cursor-pointer overflow-hidden rounded-lg bg-black dark:bg-white text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] "
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full skew-x-[-20deg] bg-black dark:bg-white transition-transform duration-700 group-hover:translate-x-[320%]" />
            <span className="relative">Sign In</span>
          </Button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <span className="absolute left-0 right-0 top-1/2 h-px bg-[color:var(--hz-border)]" />
          <span className="relative bg-[color:var(--hz-bg)] px-3 text-[13px] text-[color:var(--hz-muted)] transition-colors duration-300">
            or
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <button type="button" className={socialClass}>
            <GoogleIcon />
            Continue with Google
          </button>
          <button type="button" className={socialClass}>
            <AppleIcon />
            Continue with Apple
          </button>
        </div>

        <p className="mt-6 text-center text-[14px] font-medium text-blue-600">
          New to Horizon?{" "}
          <a href="#" className={`font-medium text-blue-600`}>
            Create an account
          </a>
        </p>
        <p className="mt-3 text-center text-[14px]">
          <a href="#" className={`font-medium text-blue-600`}>
            Sign in with a passkey
          </a>
        </p>
      </div>
    </div>
  );
}
