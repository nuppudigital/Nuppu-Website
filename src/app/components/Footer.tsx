import { Link } from "react-router-dom";
import { Heart, Mail, Shield } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-white to-[#F7F6F3] border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A8D5E2] to-[#6B9AC4] flex items-center justify-center shadow-md">
                <span className="text-white text-xl" style={{ fontFamily: 'Nunito, sans-serif' }}>N</span>
              </div>
              <span
                className="text-2xl text-[#6B9AC4]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Nuppu
              </span>
            </div>
            <p className="text-[#718096] mb-6 max-w-md leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#6B9AC4]">
                <Shield size={20} />
                <span className="text-sm">{t("footer.gdpr")}</span>
              </div>
              <div className="flex items-center gap-2 text-[#6B9AC4]">
                <Heart size={20} />
                <span className="text-sm">{t("footer.adFree")}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-[#2D3748]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-[#718096] hover:text-[#6B9AC4] transition-colors"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/characters"
                  className="text-[#718096] hover:text-[#6B9AC4] transition-colors"
                >
                  {t("nav.characters")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-[#718096] hover:text-[#6B9AC4] transition-colors"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-[#718096] hover:text-[#6B9AC4] transition-colors"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-[#2D3748]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t("footer.getInTouch")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@nuppu.app"
                  className="text-[#718096] hover:text-[#6B9AC4] transition-colors flex items-center gap-2"
                >
                  <Mail size={16} />
                  hello@nuppu.app
                </a>
              </li>
              <li className="text-[#718096]">
                {t("footer.waitlist")}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#718096] text-sm">
              © {new Date().getFullYear()} Nuppu. {t("footer.rights")}
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                to="/privacy"
                className="text-[#718096] hover:text-[#6B9AC4] transition-colors"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                to="/terms"
                className="text-[#718096] hover:text-[#6B9AC4] transition-colors"
              >
                {t("footer.terms")}
              </Link>
              <Link
                to="/cookies"
                className="text-[#718096] hover:text-[#6B9AC4] transition-colors"
              >
                {t("footer.cookies")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
