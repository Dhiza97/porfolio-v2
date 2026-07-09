import { Bebas_Neue, Cormorant_Garamond, DM_Sans } from "next/font/google";
import { RouteTransition } from "@/app/components/portfolio/motion";
import SiteNav from "@/app/components/portfolio/site-nav";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
});

export const metadata = {
  metadataBase: new URL("https://portfolio-v2.local"),
  title: {
    default: "Joseph Garba | Software Engineer",
    template: "%s | Joseph Garba",
  },
  description:
    "High-performance software engineering portfolio with selected projects, technical context, and measurable outcomes.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${bebasNeue.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="frame-shell pt-4 sm:pt-6">
          <SiteNav />
        </div>
        <RouteTransition>{children}</RouteTransition>
      </body>
    </html>
  );
}
