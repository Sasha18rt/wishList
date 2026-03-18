import type { DefaultUser, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: string;
    nickname: string;
    googleId: string;
    instagramHandle: string;
    premiumStatus: boolean;
    customerId: string;
    priceId: string;
  }

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

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    nickname?: string;
    googleId?: string;
    instagramHandle?: string;
    premiumStatus?: boolean;
    customerId?: string;
    priceId?: string;
  }
}