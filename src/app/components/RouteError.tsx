import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

// catches render errors so people see this instead of router's blank "Unexpected Application Error!" screen
export default function RouteError() {
  const error = useRouteError();
  const { lang } = useLanguage();

  if (import.meta.env.DEV) {
    console.error("Route error boundary caught:", error);
  }

  const is404 = isRouteErrorResponse(error) && error.status === 404;

  const copy = lang === "fi"
    ? {
        title: is404 ? "Sivua ei löytynyt" : "Jokin meni pieleen",
        body: is404
          ? "Etsimääsi sivua ei ole olemassa."
          : "Kohtasimme odottamattoman virheen. Selaimen laajennukset (esim. Grammarly, mainosten esto) aiheuttavat tämän joskus - kokeile poistaa ne käytöstä tai käyttää yksityistä selausikkunaa, jos ongelma toistuu.",
        reload: "Lataa sivu uudelleen",
        home: "Etusivulle",
      }
    : {
        title: is404 ? "Page not found" : "Something went wrong",
        body: is404
          ? "The page you're looking for doesn't exist."
          : "We hit an unexpected error. Browser extensions (e.g. Grammarly, ad blockers) sometimes cause this - try disabling them or using a private/incognito window if it keeps happening.",
        reload: "Reload page",
        home: "Go home",
      };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F2EDDE]">
      <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-sm p-10">
        <h1 className="text-2xl text-[#35322B] mb-3" style={{ fontFamily: "Nunito, sans-serif" }}>
          {copy.title}
        </h1>
        <p className="text-[#6B6660] mb-8 leading-relaxed">{copy.body}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] text-white rounded-full hover:shadow-lg transition-all"
          >
            {copy.reload}
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-white text-[#6E4FD1] border-2 border-[#6E4FD1] rounded-full hover:bg-[#6E4FD1] hover:text-white transition-all"
          >
            {copy.home}
          </a>
        </div>
      </div>
    </div>
  );
}
