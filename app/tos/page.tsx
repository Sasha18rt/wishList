
import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
{`Last Updated: April 15, 2025

Welcome to Wishlify!

These Terms of Service ("Terms") govern your use of the Wishlify website at https://${config.domainName} ("Website") and the services provided by Wishlify. By using our Website and services, you agree to these Terms.

1. Description of Wishlify

Wishlify is an online wishlist maker and gift organizer that allows users to create, manage, and share personal wishlists for birthdays, holidays, or any special occasion.

2. Ownership and Usage

All wishlists and content you create using Wishlify are owned by you. However, you agree not to use the service for any unlawful or commercial redistribution purposes. Any content shared publicly remains your intellectual property, but you grant Wishlify permission to display and process it within the app.

3. Refunds and Subscriptions

Paid plans are billed via Stripe. Users may cancel their subscriptions at any time. For refunds, please contact our support team within 7 days of purchase.

4. User Data and Privacy

We collect and store necessary personal data such as name, email, and payment details to provide our services. For full information, refer to our Privacy Policy at https://${config.domainName}/privacy-policy.

5. Non-Personal Data

We use cookies and analytics tools to collect non-personal information for improving the user experience.

6. Support

You can contact our support team at ${config.mailgun.supportEmail} for any questions or assistance.

7. Governing Law

These Terms are governed by the laws of your country of residence, unless otherwise required by law.

8. Updates to Terms

We may update these Terms occasionally. Users will be notified of significant changes via email or in-app notifications.

Thank you for using Wishlify!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
