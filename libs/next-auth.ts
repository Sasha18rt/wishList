import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
import connectMongo from "./mongo";
//@ts-ignore
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      async profile(profile) {
        // Form the user 
        return {
          id: profile.sub,
          name: profile.given_name || profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
          // Additional fields
          role: "user",
          nickname: (profile.given_name || profile.name).toLowerCase(), 
          googleId: profile.sub,
          instagramHandle: "", 
          premiumStatus: false, 
          customerId: "",
          priceId: "",
        };
      },
    }), 
  ],
  //MongoDBAdapter
  ...(connectMongo && { adapter: MongoDBAdapter(connectMongo) }),
  callbacks: {
    // JWT callback – store additional fields in the token
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
    // Session callback – transfer data from token to session
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
