import { Suspense } from 'react'
import Header from "@/components/layout/Header";
import Hero from "@/components/main/Hero";
import FAQ from "@/components/main/FAQ";
import CTA from "@/components/main/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
<Hero></Hero>
        <CTA />
        <FAQ></FAQ>

      </main>
      <Footer />
    </>
  );
}