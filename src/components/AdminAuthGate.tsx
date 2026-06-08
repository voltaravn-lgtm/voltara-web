"use client";

import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { auth } from "../lib/firebase";
import { isAdminEmail } from "../lib/adminAuth";

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });
  }, []);

  const isAllowed = isAdminEmail(user?.email);

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!isAdminEmail(result.user.email)) {
        await signOut(auth);
        setError("Email này không có quyền truy cập quản trị Voltara.");
      }
    } catch {
      setError("Không đăng nhập được. Kiểm tra lại email hoặc mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdminAccount = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Nhập email admin và mật khẩu trước khi tạo tài khoản.");
      return;
    }

    if (!isAdminEmail(normalizedEmail)) {
      setError("Email này không nằm trong danh sách quản trị Voltara.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu Firebase cần tối thiểu 6 ký tự.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      if (!isAdminEmail(result.user.email)) {
        await signOut(auth);
        setError("Email này không có quyền truy cập quản trị Voltara.");
      }
    } catch (error: any) {
      if (error?.code === "auth/email-already-in-use") {
        setError("Email này đã có tài khoản. Bấm Đăng nhập hoặc Quên mật khẩu.");
      } else if (error?.code === "auth/operation-not-allowed") {
        setError("Firebase chưa bật Email/Password. Vào Authentication > Sign-in method để bật.");
      } else {
        setError("Không tạo được tài khoản admin. Kiểm tra email/mật khẩu rồi thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (!isAdminEmail(result.user.email)) {
        await signOut(auth);
        setError("Tài khoản Google này không có quyền truy cập quản trị Voltara.");
      }
    } catch {
      setError("Không đăng nhập được bằng Google. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Nhập email admin trước khi yêu cầu đặt lại mật khẩu.");
      return;
    }

    if (!isAdminEmail(email.trim())) {
      setError("Email này không nằm trong danh sách quản trị.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setError("Đã gửi email đặt lại mật khẩu. Kiểm tra hộp thư của bạn.");
    } catch {
      setError("Không gửi được email đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="text-gold-light animate-pulse text-sm font-display tracking-widest uppercase">
          Đang kiểm tra quyền quản trị...
        </div>
      </div>
    );
  }

  if (user && isAllowed) {
    return (
      <div>
        <div className="sticky top-0 z-40 bg-black/90 border-b border-gold-dark/20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <ShieldCheck className="w-4 h-4 text-gold-light" />
              <span className="font-mono">{user.email}</span>
            </div>
            <button
              onClick={() => signOut(auth)}
              className="px-4 py-2 text-[11px] font-display font-bold uppercase tracking-widest border border-white/10 text-gray-300 hover:text-white hover:border-gold-dark transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ECECEC] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md border border-gold-dark/25 bg-[#0B0B0B] shadow-[0_0_50px_rgba(218,154,43,0.08)]">
        <div className="p-6 border-b border-white/5">
          <div className="w-12 h-12 border border-gold-dark/40 bg-gold-dark/10 flex items-center justify-center mb-5">
            <Lock className="w-6 h-6 text-gold-light" />
          </div>
          <p className="text-[10px] font-mono text-gold-dark tracking-[0.25em] uppercase mb-2">
            Voltara Admin
          </p>
          <h1 className="text-2xl font-display font-black tracking-wider text-white">
            Đăng nhập quản trị
          </h1>
        </div>

        <form onSubmit={handleEmailLogin} className="p-6 space-y-4" autoComplete="off">
          <label className="block space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-light"
              placeholder="Nhập email quản trị"
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-light"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="border border-gold-dark/30 bg-gold-dark/10 px-4 py-3 text-xs text-gold-light leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gold-light text-black px-4 py-3 text-xs font-display font-black uppercase tracking-widest disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <button
            type="button"
            onClick={handleCreateAdminAccount}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-gold-dark/40 text-gold-light px-4 py-3 text-xs font-display font-bold uppercase tracking-widest hover:border-gold-light disabled:opacity-60"
          >
            Tạo tài khoản admin
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-white/10 text-white px-4 py-3 text-xs font-display font-bold uppercase tracking-widest hover:border-gold-dark disabled:opacity-60"
          >
            <Mail className="w-4 h-4" />
            Đăng nhập bằng Google
          </button>

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full text-center text-xs text-gray-400 hover:text-gold-light transition-colors"
          >
            Quên mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
