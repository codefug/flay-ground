"use client";

import { useTRPC } from "@/trpc/client/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const CHECK_INTERVAL_MS = 10 * 1000;
const THRESHOLD_MS = 60 * 1000; // 만료 1분 전부터 만료로 간주

function getRemainingMs(expiredAt: string): number {
  return new Date(expiredAt).getTime() - Date.now() - THRESHOLD_MS;
}

export function SessionManager() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: session } = useQuery(trpc.auth.getSession.queryOptions());
  const { mutateAsync: refreshToken } = useMutation(
    trpc.auth.refreshToken.mutationOptions()
  );
  const { mutateAsync: signOut } = useMutation(
    trpc.auth.signOut.mutationOptions()
  );
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!session?.expiredAt || !session.refreshToken) return;

    const checkAndRefresh = async () => {
      if (isRefreshingRef.current) return;
      const remaining = getRemainingMs(session.expiredAt);
      if (remaining > 0) return;

      isRefreshingRef.current = true;
      try {
        await refreshToken({ refreshToken: session.refreshToken });
        await queryClient.invalidateQueries(trpc.auth.getSession.queryFilter());
      } catch {
        // refresh 실패 → 로그아웃 + 토스트
        await signOut();
        await queryClient.invalidateQueries(trpc.auth.getSession.queryFilter());
        const toast = document.createElement("div");
        toast.setAttribute("data-testid", "session-expired-toast");
        toast.textContent = "세션이 만료되었습니다. 다시 로그인해주세요";
        document.body.appendChild(toast);
      } finally {
        isRefreshingRef.current = false;
      }
    };

    const id = setInterval(() => void checkAndRefresh(), CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [session?.expiredAt, session?.refreshToken, refreshToken, signOut, queryClient, trpc]);

  return null;
}
