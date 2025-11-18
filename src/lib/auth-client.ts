import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

// Use window.location.origin for client-side baseURL
const baseURL = typeof window !== 'undefined' ? window.location.origin : '';

export const authClient = createAuthClient({
  baseURL,
  plugins: [convexClient()],
});

export const signInWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
  });
};

export const signOut = async () => {
  await authClient.signOut({});
};