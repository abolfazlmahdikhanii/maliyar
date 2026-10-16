import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: String(params.email),
          firstName: String(params.firstName ?? ""),
          lastName: String(params.lastName ?? ""),
          username: String(params.username ?? "").toLowerCase(),
        };
      },
    }),
  ],
});