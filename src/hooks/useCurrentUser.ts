import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentUser() {
  // Get the authenticated user from the users table using auth identity
  const currentUser = useQuery(api.users.getCurrentUserByAuth, {});
  const isAuthenticated = currentUser !== undefined && currentUser !== null;

  return {
    user: currentUser,
    userId: currentUser?._id,
    isLoading: currentUser === undefined,
    isAuthenticated,
    imageUrl: currentUser?.imageUrl,
  };
}
