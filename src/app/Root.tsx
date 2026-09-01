import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";

export default function Root() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
      <Analytics />
    </div>
  );
}
