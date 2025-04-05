// extendedUser.d.ts
import type { DefaultUser, DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the NextAuth User interface with additional fields.
   */
  interface User extends DefaultUser {
    role: string;
    nickname: string;
    googleId: string;
    instagramHandle: string;
    premiumStatus: boolean;
    customerId: string;
    priceId: string;
  }

  /**
   * Extend the NextAuth Session interface so that the user object contains all the additional fields.
   */
  interface Session {
    user: {
      id: string;
      role: string;
      nickname: string;
      googleId: string;
      instagramHandle: string;
      premiumStatus: boolean;
      customerId: string;
      priceId: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/adapters" {
  /**
   * Extend the AdapterUser interface used by the Auth.js adapter.
   */
  interface AdapterUser extends DefaultUser {
    role: string;
    nickname: string;
    googleId: string;
    instagramHandle: string;
    premiumStatus: boolean;
    customerId: string;
    priceId: string;
  }
}
