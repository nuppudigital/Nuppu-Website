import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { useLanguage } from "../i18n/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  usePageMeta(t("notFound.meta.title"), t("notFound.meta.description"));

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-[#A8D5E2]/20 via-[#F9E5A8]/10 to-[#B8DDB8]/20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="text-8xl md:text-9xl text-[#6B9AC4] mb-4"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            404
          </h1>
          <h2
            className="text-3xl md:text-4xl text-[#2D3748] mb-4"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {t("notFound.title")}
          </h2>
          <p className="text-lg text-[#718096] mb-8">
            {t("notFound.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] text-white rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Home size={20} />
              {t("notFound.goHome")}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-[#6B9AC4] border-2 border-[#6B9AC4] rounded-full hover:bg-[#6B9AC4] hover:text-white transition-all duration-300"
            >
              <ArrowLeft size={20} />
              {t("notFound.goBack")}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
