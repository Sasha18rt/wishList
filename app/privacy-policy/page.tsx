"use client";

import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
{`Last Updated: April 15, 2025

Thank you for using Wishlify ("we," "us," or "our"). This Privacy Policy outlines how we collect, use, and protect your information on our website https://${config.domainName} (the "Website").

By accessing or using the Website, you agree to this policy. If you do not agree, please discontinue use.

1. Information We Collect

1.1 Personal Information
- Name: Used for personalization and communication.
- Email Address: Used to send account-related notifications and updates.
- Payment Info: Collected via secure payment providers (e.g. Stripe). We do not store your payment data directly.

1.2 Non-Personal Information
- Cookies and analytics tools are used to collect device type, browser info, and visit behavior to improve our service.

2. Purpose of Collection

We collect personal and non-personal information to:
- Provide and improve our wishlist service
- Process purchases (if applicable)
- Notify users of updates and changes
- Deliver customer support

3. Data Sharing

We do not sell or rent your data. Information is only shared with trusted processors when required (e.g., Stripe for payments).

4. Children's Privacy

Wishlify is not intended for children under the age of 13. We do not knowingly collect data from children.

5. Changes to This Policy

We may update this policy periodically. Significant changes will be communicated via email or in-app notices.

6. Contact

For any questions about this Privacy Policy, please email us at ${config.mailgun.supportEmail}.

By using Wishlify, you consent to this policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
