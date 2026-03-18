import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
import connectMongo from "./mongo";

function slugify(value?: string) {
  return (value || "user")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeNickname(name?: string, googleSub?: string) {
  const base = slugify(name);
  const suffix =
    googleSub?.slice(-6).toLowerCase() ||
    Math.random().toString(36).slice(2, 8);

  return `${base}_${suffix}`;
}

// @ts-ignore
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      async profile(profile) {
        const displayName =
          profile.given_name ||
          profile.name ||
          profile.email?.split("@")[0] ||
          "user";

        return {
          id: profile.sub,
          name: displayName,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),

          role: "user",
          nickname: makeNickname(displayName, profile.sub),
          googleId: profile.sub,
          instagramHandle: "",
          premiumStatus: false,
          customerId: "",
          priceId: "",
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  ...(connectMongo && { adapter: MongoDBAdapter(connectMongo) }),
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.nickname = user.nickname;
        token.googleId = user.googleId;
        token.instagramHandle = user.instagramHandle;
        token.premiumStatus = user.premiumStatus;
        token.customerId = user.customerId;
        token.priceId = user.priceId;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.nickname = token.nickname as string;
        session.user.googleId = token.googleId as string;
        session.user.instagramHandle = token.instagramHandle as string;
        session.user.premiumStatus = token.premiumStatus as boolean;
        session.user.customerId = token.customerId as string;
        session.user.priceId = token.priceId as string;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  theme: {
    brandColor: config.colors.main,
  },
};

export default NextAuth(authOptions);