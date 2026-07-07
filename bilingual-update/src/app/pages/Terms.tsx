import { usePageMeta } from "../hooks/usePageMeta";
import { useLanguage } from "../i18n/LanguageContext";

export default function Terms() {
  const { t } = useLanguage();

  usePageMeta(t("terms.meta.title"), t("terms.meta.description"));

  const sections = ["use", "ip", "liability", "contact"];

  return (
    <div className="w-full bg-white">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl text-[#2D3748] mb-6" style={{ fontFamily: "Nunito, sans-serif" }}>
            {t("terms.title")}
          </h1>
          <p className="text-[#718096] mb-8">{t("terms.updated")}</p>

          <div className="space-y-8 text-[#4A5568] leading-relaxed">
            {sections.map((key) => (
              <section key={key}>
                <h2 className="text-2xl text-[#2D3748] mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
                  {t(`terms.${key}.title`)}
                </h2>
                <p>{t(`terms.${key}.text`)}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
