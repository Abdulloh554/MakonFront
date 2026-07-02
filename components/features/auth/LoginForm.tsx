"use client";

import { useState, useCallback } from "react";
import { UserIcon, Eye, EyeOff, ChevronRight } from "lucide-react";
import type { User } from "@/types";
import GoogleAuthWrapper from "@/app/login/GoogleAuthWrapper";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const inputClasses =
  "w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none";

interface LoginFormProps {
  onLogin: (name: string, lastName: string, email: string, password: string) => Promise<User>;
  onRegister: (name: string, lastName: string, email: string, password: string) => Promise<User>;
  onGoogleLogin?: (idToken: string) => Promise<void>;
}

function LoginFormInner({ onLogin, onRegister, onGoogleLogin }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      setError("");
    },
    [],
  );

  async function handleSubmit() {
    setError("");

    if (mode === "login") {
      if (!email.trim()) { setError("Emailingizni kiriting"); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Noto'g'ri email format"); return; }
      if (!password) { setError("Parolni kiriting"); return; }
      setLoading(true);
      try {
        await onLogin("", "", email.trim(), password);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kirish xatosi");
      } finally { setLoading(false); }
      return;
    }

    if (!name.trim()) { setError("Ismingizni kiriting"); return; }
    if (!lastName.trim()) { setError("Familiyangizni kiriting"); return; }
    if (!email.trim()) { setError("Emailingizni kiriting"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Noto'g'ri email format"); return; }
    if (!password) { setError("Parolni kiriting"); return; }
    if (password.length < 8) { setError("Parol kamida 8 belgidan iborat bo'lishi kerak"); return; }
    if (password !== confirmPassword) { setError("Parollar mos kelmadi"); return; }
    if (!agreeToTerms) { setError("Tizim qoidalariga rozilik bildirishingiz kerak"); return; }

    setLoading(true);
    try {
      await onRegister(name.trim(), lastName.trim(), email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik");
    } finally { setLoading(false); }
  }

  return (
    <div className="relative flex items-center justify-center px-4 py-8 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full animate-login-particle"
            style={{
              width: `${3 + i * 2}px`,
              height: `${3 + i * 2}px`,
              background: i % 2 === 0 ? '#378ADD' : '#93C5FD',
              left: `${15 + i * 22}%`,
              top: `${20 + (i * 25) % 60}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${4.5 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-gray-900">
              {mode === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
            </h1>
            <p className="text-sm text-gray-600">
              {mode === "login" ? "Akkountingizga kiring" : "Yangi akkount yarating"}
            </p>
          </div>
        </div>

        <div className="relative flex bg-gray-100 rounded-xl p-1">
          <div
            className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-all duration-300"
            style={{
              left: mode === 'login' ? '4px' : '50%',
              width: 'calc(50% - 4px)',
            }}
          />
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`relative flex-1 py-2 rounded-lg text-sm font-medium transition-colors z-10 ${
              mode === "login" ? "text-gray-900" : "text-gray-600 hover:text-gray-800"
            }`}
            aria-pressed={mode === "login"}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`relative flex-1 py-2 rounded-lg text-sm font-medium transition-colors z-10 ${
              mode === "register" ? "text-gray-900" : "text-gray-600 hover:text-gray-800"
            }`}
            aria-pressed={mode === "register"}
          >
            Ro&apos;yxatdan o&apos;tish
          </button>
        </div>

        {onGoogleLogin && (
          <div className="space-y-3">
            <GoogleAuthWrapper
              clientId={GOOGLE_CLIENT_ID}
               onSuccess={(cr) => onGoogleLogin?.(cr.credential ?? '')}
              onError={() => setError("Google orqali kirishda xatolik yuz berdi.")}
            />
          </div>
        )}

        <div className="space-y-3">
          {mode === "register" && (
            <div className="space-y-3 overflow-hidden animate-slide-down">
              <div>
                <label htmlFor="lf-name" className="text-xs font-medium text-gray-600 mb-1 block">Ismingiz</label>
                <input id="lf-name" type="text" placeholder="Ismingiz" value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="lf-lastname" className="text-xs font-medium text-gray-600 mb-1 block">Familiyangiz</label>
                <input id="lf-lastname" type="text" placeholder="Familiyangiz" value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setError(""); }}
                  className={inputClasses}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="lf-email" className="text-xs font-medium text-gray-600 mb-1 block">Emailingiz</label>
            <input id="lf-email" type="email" placeholder="email@example.com" value={email} onChange={handleEmailChange}
              className={inputClasses}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="lf-password" className="text-xs font-medium text-gray-600 mb-1 block">Parol</label>
            <div className="relative">
              <input id="lf-password" type={showPassword ? "text" : "password"} placeholder={mode === "register" ? "Kamida 8 belgi" : "Parolingiz"} value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`${inputClasses} pr-11`}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="overflow-hidden animate-slide-down">
              <label htmlFor="lf-confirm" className="text-xs font-medium text-gray-600 mb-1 block">Parolni tasdiqlang</label>
              <div className="relative">
                <input id="lf-confirm" type={showConfirmPassword ? "text" : "password"} placeholder="Parolni qayta kiriting" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className={`${inputClasses} pr-11`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  aria-label={showConfirmPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
          )}

          {mode === "register" && (
            <label className="flex items-start gap-2 cursor-pointer group">
              <div className="mt-0.5">
                <input type="checkbox" checked={agreeToTerms} onChange={(e) => { setAgreeToTerms(e.target.checked); setError(""); }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
                Tizim qoidalariga roziman
              </span>
            </label>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600 text-center bg-red-50 rounded-lg px-3 py-2 border border-red-200">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading ||
              !email.trim() ||
              !password ||
              (mode === "register" && (!name.trim() || !lastName.trim() || !confirmPassword || !agreeToTerms))
            }
            className="relative w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 flex items-center justify-center overflow-hidden active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Tekshirilmoqda...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                {mode === "login" ? (
                  <>
                    Kirish
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </>
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginForm(props: LoginFormProps) {
  return <LoginFormInner {...props} />;
}
