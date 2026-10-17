import Header from "@/components/royal/Header";
import "./globals.css";
import Footer from "@/components/royal/Footer";
import BackToTopButton from "@/components/backToTopButton";
import { ToastProvider } from "@/context/toastContext";
import { Suspense } from "react";

export const metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL || "https://royalssignaturehotelandsuites.com"),
  title: "Royal Signature Hotel and Suites | Hotel in Ojo, Lagos",
  description: "Discover Royal Signature Hotel and Suites in Ojo, Lagos State. Explore our rooms and suites and plan your stay.",
  keywords: "Royal Signature Hotel and Suites, Hotel in Ojo Lagos, rooms and suites in Ojo, accommodation in Ojo Lagos State",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Royal Signature Hotel and Suites | Hotel in Ojo, Lagos",
    description: "Discover Royal Signature Hotel and Suites in Ojo, Lagos State. Explore our rooms and suites and plan your stay.",
    url: "/",
    siteName: "Royal Signature Hotel and Suites",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0F1B2D" />
      </head>
      <body>
        <Header />
        <ToastProvider>
          <Suspense>
            {children}
          </Suspense>
        </ToastProvider>
        <BackToTopButton />
        <Footer />
      </body>
    </html>
  );
}
