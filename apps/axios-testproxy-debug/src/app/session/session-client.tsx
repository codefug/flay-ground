"use client";

import { useTRPC } from "@/trpc/client/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SessionManager } from "./session-manager";

export function SessionClient() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useQuery(
    trpc.auth.getSession.queryOptions()
  );
  const { mutateAsync: signIn, isPending: isSigningIn } = useMutation(
    trpc.auth.signIn.mutationOptions()
  );
  const { mutateAsync: signOut, isPending: isSigningOut } = useMutation(
    trpc.auth.signOut.mutationOptions()
  );

  const handleSignIn = async () => {
    await signIn();
    await queryClient.invalidateQueries(trpc.auth.getSession.queryFilter());
  };

  const handleSignOut = async () => {
    await signOut();
    await queryClient.invalidateQueries(trpc.auth.getSession.queryFilter());
  };

  if (isPending) return <p data-testid="session-loading">Loading...</p>;

  return (
    <div>
      <SessionManager />

      {session ? (
        <div data-testid="session-authenticated">
          <p>
            상태: <span data-testid="session-status">authenticated</span>
          </p>
          <p>
            만료: <span data-testid="session-expired-at">{session.expiredAt}</span>
          </p>
          <button
            data-testid="sign-out-button"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div data-testid="session-unauthenticated">
          <p>
            상태: <span data-testid="session-status">unauthenticated</span>
          </p>
          <button
            data-testid="sign-in-button"
            onClick={handleSignIn}
            disabled={isSigningIn}
          >
            로그인
          </button>
        </div>
      )}
    </div>
  );
}
