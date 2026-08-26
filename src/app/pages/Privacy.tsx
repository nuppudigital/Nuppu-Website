import { Fragment } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { useLanguage } from "../i18n/LanguageContext";

// turns **bold** markers in translated text into <strong>
function rich(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
  );
}

export default function Privacy() {
  const { t } = useLanguage();

  usePageMeta(t("privacy.meta.title"), t("privacy.meta.description"));

  return (
    <div className="w-full bg-white">
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl text-[#35322B] mb-6" style={{ fontFamily: "Nunito, sans-serif" }}>
            {t("privacy.title")}
          </h1>
          <p className="text-[#6B6660] mb-8">{t("privacy.updated")}</p>

          <div className="space-y-8 text-[#55504A] leading-relaxed">
            <section>
              <h2 className="text-2xl text-[#35322B] mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
                {t("privacy.collect.title")}
              </h2>
              <p>{t("privacy.collect.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl text-[#35322B] mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
                {t("privacy.why.title")}
              </h2>
              <p>{t("privacy.why.text")}</p>
            </section>

            <section>
              <h2 className="text-2xl text-[#35322B] mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
                {t("privacy.payments.title")}
              </h2>
              <p>{rich(t("privacy.payments.p1"))}</p>
              <p className="mt-3">{rich(t("privacy.payments.p2"))}</p>
              <p className="mt-3">{rich(t("privacy.payments.p3"))}</p>
              <p className="mt-3">{rich(t("privacy.payments.p4"))}</p>
            </section>

            <section>
              <h2 className="text-2xl text-[#35322B] mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
                {t("privacy.protection.title")}
              </h2>
              <p>
                {t("privacy.protection.text")}{" "}
                {t("privacy.protection.seeBefore")}{" "}
                <Link to="/cookies" className="text-[#6E4FD1] hover:underline">
                  {t("privacy.protection.seeLink")}
                </Link>{" "}
                {t("privacy.protection.seeAfter")}
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#35322B] mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
                {t("privacy.rights.title")}
              </h2>
              <p>{t("privacy.rights.text")}</p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
