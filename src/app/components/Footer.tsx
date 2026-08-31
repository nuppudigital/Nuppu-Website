import { Link } from "react-router-dom";
import { Heart, Mail, Shield } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import nuppuMark from "../../assets/NUPPU MARK.png";
import nuppuWordmark from "../../assets/NUPPU WORDMARK.png";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-white to-[#F2EDDE] border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={nuppuMark}
                alt=""
                className="w-12 h-12 shrink-0 object-contain"
              />
              <img
                src={nuppuWordmark}
                alt="Nuppu"
                className="h-7 sm:h-8 object-contain"
              />
            </div>
            <p className="text-[#6B6660] mb-6 max-w-md leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#6E4FD1]">
                <Shield size={20} />
                <span className="text-sm">{t("footer.gdpr")}</span>
              </div>
              <div className="flex items-center gap-2 text-[#6E4FD1]">
                <Heart size={20} />
                <span className="text-sm">{t("footer.adFree")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[#35322B]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-[#6B6660] hover:text-[#6E4FD1] transition-colors"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/characters"
                  className="text-[#6B6660] hover:text-[#6E4FD1] transition-colors"
                >
                  {t("nav.characters")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-[#6B6660] hover:text-[#6E4FD1] transition-colors"
                >
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-[#6B6660] hover:text-[#6E4FD1] transition-colors"
                >
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[#35322B]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {t("footer.getInTouch")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@nuppuapp.fi"
                  className="text-[#6B6660] hover:text-[#6E4FD1] transition-colors flex items-center gap-2"
                >
                  <Mail size={16} />
                  info@nuppuapp.fi
                </a>
              </li>
              <li className="text-[#6B6660]">
                {t("footer.waitlist")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#6B6660] text-sm">
              © {new Date().getFullYear()} Nuppu. {t("footer.rights")}
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                to="/privacy"
                className="text-[#6B6660] hover:text-[#6E4FD1] transition-colors"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                to="/terms"
                className="text-[#6B6660] hover:text-[#6E4FD1] transition-colors"
              >
                {t("footer.terms")}
              </Link>
              <Link
                to="/cookies"
                className="text-[#6B6660] hover:text-[#6E4FD1] transition-colors"
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
