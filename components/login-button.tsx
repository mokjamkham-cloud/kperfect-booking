"use client";

import { LogIn, LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function refreshUser() {
    try {
      const result = await api.getMe();
      setUser(result.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function loginWithLine() {
    setMessage("");
    try {
      const { url } = await api.getLineLoginUrl();
      window.location.href = url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ยังไม่สามารถเปิด LINE Login ได้");
    }
  }

  async function loginAsDemo() {
    setMessage("");
    try {
      const result = await api.devLogin();
      setUser(result.user);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "โหมดทดลองยังไม่พร้อมใช้งาน");
    }
  }

  async function logout() {
    await api.logout();
    setUser(null);
  }

  if (loading) {
    return <span className="text-sm text-slate-500">กำลังตรวจสอบ...</span>;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {user ? (
        <>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {user.displayName}
          </span>
          <Button type="button" variant="ghost" onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            ออก
          </Button>
        </>
      ) : (
        <>
          <Button type="button" onClick={loginWithLine}>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            LINE Login
          </Button>
          <Button type="button" variant="secondary" onClick={loginAsDemo}>
            ทดลอง
          </Button>
        </>
      )}
      {message ? <span className="basis-full text-right text-xs text-red-600">{message}</span> : null}
    </div>
  );
}
