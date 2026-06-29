"use client";

import { useState, useCallback } from "react";
import { UserIcon, Eye, EyeOff, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import type { User } from "@/types";

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
      if (!email.trim()) {
        setError("Emailingizni kiriting");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Noto'g'ri email format");
        return;
      }
      if (!password) {
        setError("Parolni kiriting");
        return;
      }
      setLoading(true);
      try {
        await onLogin("", "", email.trim(), password);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kirish xatosi");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!name.trim()) {
      setError("Ismingizni kiriting");
      return;
    }

    if (!lastName.trim()) {
      setError("Familiyangizni kiriting");
      return;
    }

    if (!email.trim()) {
      setError("Emailingizni kiriting");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Noto'g'ri email format");
      return;
    }

    if (!password) {
      setError("Parolni kiriting");
      return;
    }

    if (password.length < 8) {
      setError("Parol kamida 8 belgidan iborat bo'lishi kerak");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parollar mos kelmadi");
      return;
    }

    if (!agreeToTerms) {
      setError("Tizim qoidalariga rozilik bildirishingiz kerak");
      return;
    }

    setLoading(true);
    try {
      await onRegister(name.trim(), lastName.trim(), email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xatolik")
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3) * 2,
              height: 2 + (i % 3) * 2,
              background: i % 2 === 0 ? '#378ADD' : '#93C5FD',
              left: `${10 + i * 16}%`,
              top: `${15 + (i * 21) % 70}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.35, 0],
              scale: [0, 1, 0],
              y: [0, -25 - i * 6, 0],
              x: [0, i % 2 === 0 ? 8 : -8, 0],
            }}
            transition={{
              duration: 4 + i * 0.6,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
        className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6 space-y-5"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 14, delay: 0.15 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <UserIcon className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}>
              <motion.h1
                className="text-xl font-bold text-gray-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
              >
                {mode === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
              </motion.h1>
              <motion.p
                className="text-sm text-gray-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.35 }}
              >
                {mode === "login" ? "Akkountingizga kiring" : "Yangi akkount yarating"}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Toggle tabs with sliding indicator */}
        <div className="relative flex bg-gray-100 rounded-xl p-1">
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm"
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              left: mode === 'login' ? '4px' : '50%',
              width: 'calc(50% - 4px)',
            }}
          />
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`relative flex-1 py-2 rounded-lg text-sm font-medium transition-colors z-10 ${
              mode === "login" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`relative flex-1 py-2 rounded-lg text-sm font-medium transition-colors z-10 ${
              mode === "register" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Ro&apos;yxatdan o&apos;tish
          </button>
        </div>

        {onGoogleLogin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <motion.span className="flex-1 h-px bg-gray-200" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.6, duration: 0.5 }} />
              <motion.span
                className="text-xs text-gray-400 font-medium"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
              >
                yoki
              </motion.span>
              <motion.span className="flex-1 h-px bg-gray-200" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.6, duration: 0.5 }} />
            </motion.div>
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      onGoogleLogin(credentialResponse.credential)
                    }
                  }}
                  onError={() => setError("Google orqali kirishda xatolik yuz berdi.")}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="300"
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {mode === "register" && (
              <motion.div
                key="name-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-3 overflow-hidden"
              >
                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Ismingiz</label>
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <input type="text" placeholder="Ismingiz" value={name}
                      onChange={(e) => { setName(e.target.value); setError(""); }}
                      className={inputClasses}
                    />
                  </motion.div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Familiyangiz</label>
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <input type="text" placeholder="Familiyangiz" value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setError(""); }}
                      className={inputClasses}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Emailingiz</label>
            <div className="relative">
              <motion.div whileFocus={{ scale: 1.01 }}>
                <input type="email" placeholder="email@example.com" value={email} onChange={handleEmailChange}
                  className={inputClasses}
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Parol</label>
            <div className="relative">
              <motion.div whileFocus={{ scale: 1.01 }}>
                <input type={showPassword ? "text" : "password"} placeholder={mode === "register" ? "Kamida 8 belgi" : "Parolingiz"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`${inputClasses} pr-10`}
                />
              </motion.div>
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: showPassword ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence>
            {mode === "register" && (
              <motion.div
                key="confirm-password"
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <label className="text-xs font-medium text-gray-500 mb-1 block">Parolni tasdiqlang</label>
                <div className="relative">
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <input type={showConfirmPassword ? "text" : "password"} placeholder="Parolni qayta kiriting" value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      className={`${inputClasses} pr-10`}
                    />
                  </motion.div>
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ rotate: showConfirmPassword ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mode === "register" && (
              <motion.label
                key="checkbox"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="flex items-start gap-2 cursor-pointer group"
              >
                <motion.div whileTap={{ scale: 0.85 }} className="mt-0.5">
                  <input type="checkbox" checked={agreeToTerms} onChange={(e) => { setAgreeToTerms(e.target.checked); setError(""); }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </motion.div>
                <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                  Tizim qoidalariga roziman
                </span>
              </motion.label>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-sm text-red-500 text-center bg-red-50 rounded-lg px-3 py-2 border border-red-100"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            whileHover={{ scale: 1.01, boxShadow: '0 8px 25px rgba(24, 95, 165, 0.35)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={
              loading ||
              !email.trim() ||
              !password ||
              (mode === "register" && (!name.trim() || !lastName.trim() || !confirmPassword || !agreeToTerms))
            }
            className="relative w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200 flex items-center justify-center overflow-hidden"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              initial={{ left: '-100%' }}
              animate={{ left: '200%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            />
            {loading ? (
              <motion.span className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Tekshirilmoqda...
              </motion.span>
            ) : (
              <motion.span className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {mode === "login" ? (
                  <>
                    Kirish
                    <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                      <ChevronRight className="w-4 h-4" />
                    </motion.span>
                  </>
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginForm(props: LoginFormProps) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginFormInner {...props} />
    </GoogleOAuthProvider>
  );
}
