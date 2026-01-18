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
      <!-- BEGIN PLERDY CODE -->
<script type="text/javascript" defer data-plerdy_code='1'>
    var _protocol="https:"==document.location.protocol?"https://":"http://";
    _site_hash_code = "1d7fe47d78d3dc90802bab2a811c4a5f",_suid=72066, plerdyScript=document.createElement("script");
    plerdyScript.setAttribute("defer",""),plerdyScript.dataset.plerdymainscript="plerdymainscript",
    plerdyScript.src="https://a.plerdy.com/public/js/click/main.js?v="+Math.random();
    var plerdymainscript=document.querySelector("[data-plerdymainscript='plerdymainscript']");
    plerdymainscript&&plerdymainscript.parentNode.removeChild(plerdymainscript);
    try{document.head.appendChild(plerdyScript)}catch(t){console.log(t,"unable add script tag")}
</script>
<!-- END PLERDY CODE -->


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