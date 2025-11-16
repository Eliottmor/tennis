import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth();

  // For Convex auth, we get user info from the stored user data
  // The getCurrentUser query will need to be updated to work with Convex identity
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? { email: 'test@test.com' } : "skip"
  );

  return {
    user: currentUser,
    userId: currentUser?._id,
    isLoading: isAuthenticated && !currentUser,
    isAuthenticated,
    imageUrl: currentUser?.imageUrl,
  };
}
