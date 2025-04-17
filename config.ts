import themes from "daisyui/src/theming/themes.js";
import { ConfigProps } from "./types/config";

const config = {
  appName: "Wishlify",

  // REQUIRED: SEO description
  appDescription: "Create and share beautiful wishlists. Perfect for birthdays, holidays, or special moments.",

  // REQUIRED: naked domain
  domainName: "wishlify.me",
  keywords: [
    "wishlist maker",
    "gift list creator",
    "wish list app",
    "gift ideas organizer",
    "holiday wishlist",
    "birthday wishlist",
    "wish manager",
  ],
  
  crisp: {
    // Crisp chat is disabled for now (optional)
    id: "", // add Crisp ID if needed
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    plans: [
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_test_starter"
            : "price_prod_starter",
        name: "Starter",
        description: "Perfect for personal wishlists",
        price: 0,
        priceAnchor: 0,
        features: [
          { name: "Create unlimited wishlists" },
          { name: "Share with friends" },
          { name: "Public & private options" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_test_premium"
            : "price_prod_premium",
        isFeatured: true,
        name: "Premium",
        description: "Unlock powerful wishlist features",
        price: 5,
        priceAnchor: 10,
        features: [
          { name: "Custom themes" },
          { name: "Priority support" },
          { name: "Advanced privacy options" },
          { name: "Early access to new features" },
        ],
      },
    ],
  },
  aws: {
    bucket: "wishlify-uploads",
    bucketUrl: `https://wishlify-uploads.s3.amazonaws.com/`,
    cdn: "https://d1234abcd.cloudfront.net/", // replace with your real CloudFront domain
  },
  mailgun: {
    subdomain: "mg",
    fromNoReply: `Wishlify <noreply@mg.wishlify.me>`,
    fromAdmin: `Wishlify Support <support@mg.wishlify.me>`,
    supportEmail: "support@wishlify.me",
    forwardRepliesTo: "sasharotaenko1@gmail.com",
  },
  colors: {
    theme: "",
    main: themes[`[data-theme=light]`]["primary"],
  },
  
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/api/auth/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
