// app/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import Header from "@/components/layout/Header";
import Hero from "@/components/main/Hero";
import FAQ from "@/components/main/FAQ";
import CTA from "@/components/main/CTA";
import Footer from "@/components/layout/Footer";
import FeaturesAccordion from "@/components/main/FeaturesAccordion";

export default async function Home() {
  const session = await getServerSession(); // якщо у тебе є authOptions — передай їх сюди

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturesAccordion />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
