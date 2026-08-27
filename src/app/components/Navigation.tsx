import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import nuppuMark from "../../assets/NUPPU MARK.png";
import nuppuWordmark from "../../assets/NUPPU WORDMARK.png";
import { useLanguage, Lang } from "../i18n/LanguageContext";

function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  const option = (value: Lang, label: string) => (
    <button
      onClick={() => setLang(value)}
      aria-pressed={lang === value}
      className={`px-3 py-1 text-sm rounded-full transition-colors ${
        lang === value
          ? "bg-[#6E4FD1] text-white"
          : "text-[#6B6660] hover:text-[#6E4FD1]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`flex items-center gap-1 border border-[#C9BBF5] rounded-full p-1 ${className}`}
      role="group"
      aria-label="Language / Kieli"
    >
      {option("fi", "FI")}
      {option("en", "EN")}
    </div>
  );
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.characters"), path: "/characters" },
    { name: t("nav.emotionalSupport"), path: "/emotional-support" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="Nuppu home"
          >
            <img
              src={nuppuMark}
              alt=""
              className="w-12 h-12 shrink-0 object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <img
              src={nuppuWordmark}
              alt="Nuppu"
              className="h-7 sm:h-8 object-contain group-hover:opacity-80 transition-opacity duration-300"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 transition-colors duration-300 ${
                  isActive(link.path)
                    ? "text-[#6E4FD1]"
                    : "text-[#6B6660] hover:text-[#6E4FD1]"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6E4FD1] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <LanguageToggle />
            <Link
              to="/contact"
              className="px-6 py-2.5 bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              {t("nav.getStarted")}
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#6E4FD1] hover:bg-[#F2EDDE] rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t border-border overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? "bg-[#C9BBF5]/20 text-[#6E4FD1]"
                      : "text-[#6B6660] hover:bg-[#F2EDDE]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-6 py-3 bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] text-white rounded-full hover:shadow-lg transition-shadow"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
