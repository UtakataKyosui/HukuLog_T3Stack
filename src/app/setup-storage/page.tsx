"use client";

import { StorageSelection } from "@/components/setup/storage-selection";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SetupStoragePage() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        if (!sessionData) {
          router.push("/login");
          return;
        }
        setSession(sessionData);
      } catch (error) {
        console.error("Session check error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <div>セッションを確認中...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // リダイレクト中
  }

  return <StorageSelection />;
}