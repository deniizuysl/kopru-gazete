"use client";
import { Suspense } from "react";
import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function MobilGirisIcerik() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (status === "authenticated" && session?.user && redirect) {
      fetch("/api/auth/mobil-token")
        .then((r) => r.json())
        .then((data) => {
          if (data.token) {
            const name = encodeURIComponent(session.user?.name || "");
            const email = encodeURIComponent(session.user?.email || "");
            const role = data.role || "USER";
            const separator = redirect.includes("?") ? "&" : "?";
            window.location.href = `${redirect}${separator}token=${data.token}&name=${name}&email=${email}&role=${role}`;
          }
        });
    }
  }, [status, session, redirect]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <p className="text-white">Yükleniyor...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <p className="text-white">Uygulamaya yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="text-6xl mb-4">📰</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Köprübaşı Gazetesi</h1>
        <p className="text-gray-500 text-sm mb-6">Mobil uygulamaya giriş yapın</p>
        <button
          onClick={() => signIn("google", { callbackUrl: `/mobil-giris?redirect=${encodeURIComponent(redirect || "")}` })}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <span className="text-blue-500 font-black text-lg">G</span>
          Google ile Giriş Yap
        </button>
      </div>
    </div>
  );
}

export default function MobilGiris() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <p className="text-white">Yükleniyor...</p>
      </div>
    }>
      <MobilGirisIcerik />
    </Suspense>
  );
}
