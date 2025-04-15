import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import clientPromise from "@/libs/mongo";

clientPromise.catch((err) => console.error("MongoDB connection error:", err));
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  return <><Header/>{children} <Footer/></>;
}
