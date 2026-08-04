import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import nuppuCharacter from "../../assets/NUPPU BUNNY.webp";
import { useLanguage, Lang } from "../i18n/LanguageContext";

function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  const option = (value: Lang, label: string) => (
    <button
      onClick={() => setLang(value)}
      aria-pressed={lang === value}
      className={`px-3 py-1 text-sm rounded-full transition-colors ${
        lang === value
          ? "bg-[#6B9AC4] text-white"
          : "text-[#718096] hover:text-[#6B9AC4]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`flex items-center gap-1 border border-[#A8D5E2] rounded-full p-1 ${className}`}
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
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="Nuppu home"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A8C5BA] to-[#A8C5BA]/60 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 overflow-hidden relative">
              <img
                src={nuppuCharacter}
                alt="Nuppu"
                className="w-10 h-10 object-contain"
              />
            </div>
            <span
              className="text-2xl text-[#A8C5BA] group-hover:text-[#98B5AA] transition-colors duration-300"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Nuppu
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 transition-colors duration-300 ${
                  isActive(link.path)
                    ? "text-[#6B9AC4]"
                    : "text-[#718096] hover:text-[#6B9AC4]"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B9AC4] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <LanguageToggle />
            <Link
              to="/contact"
              className="px-6 py-2.5 bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              {t("nav.getStarted")}
            </Link>
          </div>

          {/* Mobile: language toggle + menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#6B9AC4] hover:bg-[#F7F6F3] rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-border overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? "bg-[#A8D5E2]/20 text-[#6B9AC4]"
                      : "text-[#718096] hover:bg-[#F7F6F3]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-6 py-3 bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] text-white rounded-full hover:shadow-lg transition-shadow"
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
