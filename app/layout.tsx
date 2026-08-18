import type { Metadata } from "next";
import { Fraunces, Inter, Lora } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yuvlex — Academic Result Management System for Nigerian Institutions",
    template: "%s | Yuvlex"
  },
  description: "Yuvlex is a comprehensive academic result management platform designed for Nigerian universities, polytechnics, colleges, and secondary schools. Streamline advising sheet delivery, report sheet management, and student result communication with secure, efficient email automation.",
  keywords: [
    "Yuvlex",
    "academic result management",
    "Nigerian universities",
    "advising sheet delivery",
    "report sheet management",
    "student results",
    "email automation",
    "academic administration",
    "university management system",
    "polytechnic results",
    "college results",
    "secondary school results",
    "Nigeria education technology",
    "result delivery system",
    "academic records"
  ],
  authors: [{ name: "Yuvlex" }],
  creator: "Yuvlex",
  publisher: "Yuvlex",
  alternates: {
    canonical: "https://yuvlex.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yuvlex.com",
    title: "Yuvlex — Academic Result Management System",
    description: "Streamline academic result delivery for Nigerian institutions with secure, efficient email automation.",
    siteName: "Yuvlex",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yuvlex - Academic Result Management System"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuvlex — Academic Result Management System",
    description: "Streamline academic result delivery for Nigerian institutions with secure, efficient email automation.",
    images: ["/og-image.png"],
    creator: "@yuvlex"
  },
  category: "Education Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Yuvlex",
    "url": "https://yuvlex.com",
    "logo": "https://yuvlex.com/yuvlex.png",
    "description": "Yuvlex is a comprehensive academic result management platform designed for Nigerian universities, polytechnics, colleges, and secondary schools. Streamline advising sheet delivery, report sheet management, and student result communication with secure, efficient email automation.",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@yuvlex.com",
      "contactType": "customer support",
      "areaServed": "NG",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://twitter.com/yuvlex",
      "https://linkedin.com/company/yuvlex"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NG",
      "addressRegion": "Nigeria"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${fraunces.variable} ${inter.variable} ${lora.variable}`}>
        {children}
      </body>
    </html>
  );
}
