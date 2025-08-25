import { useUser } from "@clerk/tanstack-react-start";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated && user?.emailAddresses?.[0]?.emailAddress 
      ? { email: user.emailAddresses[0].emailAddress }
      : "skip"
  );

  return {
    user: currentUser,
    userId: currentUser?._id,
    isLoading: isAuthenticated && !currentUser,
    isAuthenticated,
  };
}
