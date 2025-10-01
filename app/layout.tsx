import { ReactNode } from "react";
import { Inter } from "next/font/google";
import PlausibleProvider from "next-plausible";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/layout/LayoutClient";
import config from "@/config";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
const font = Inter({ subsets: ["latin"] });

/**
 * Default metadata for SEO and social sharing,
 * auto-injected by Next.js App Router
 */
export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme={config.colors.theme} className={font.className}>
<Analytics/>      <body>
        <PlausibleProvider domain={config.domainName} trackOutboundLinks>{/* optional props */}
          {/* ClientLayout wraps client-only services (chat, toasts, tooltips, etc.) */}
          <ClientLayout>
            {children}
          </ClientLayout>
        </PlausibleProvider>
      </body>
    </html>
  );
}