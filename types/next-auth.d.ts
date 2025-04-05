import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Розширюємо інтерфейс User, додаючи додаткові поля
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
   * Розширюємо інтерфейс Session, щоб user містив усі необхідні поля
   */
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      nickname: string;
      googleId: string;
      instagramHandle: string;
      premiumStatus: string;
      customerId: string;
      priceId: string;
      hasAccess: boolean;
    } & DefaultSession["user"];
  }
}
