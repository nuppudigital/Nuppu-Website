import { usePageMeta } from "../hooks/usePageMeta";
import { useLanguage } from "../i18n/LanguageContext";

export default function Cookies() {
  const { t } = useLanguage();

  usePageMeta(t("cookies.meta.title"), t("cookies.meta.description"));

  const sections = ["what", "how", "manage"];

  return (
    <div className="w-full bg-white">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl text-[#35322B] mb-6" style={{ fontFamily: "Nunito, sans-serif" }}>
            {t("cookies.title")}
          </h1>
          <p className="text-[#6B6660] mb-8">{t("cookies.updated")}</p>

          <div className="space-y-8 text-[#55504A] leading-relaxed">
            {sections.map((key) => (
              <section key={key}>
                <h2 className="text-2xl text-[#35322B] mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
                  {t(`cookies.${key}.title`)}
                </h2>
                <p>{t(`cookies.${key}.text`)}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
