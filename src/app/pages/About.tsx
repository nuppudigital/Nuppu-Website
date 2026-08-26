import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  Heart,
  Shield,
  Brain,
  Users,
  Smile,
  Eye,
  Sparkles,
  Target,
  Lock,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/media/ImageWithFallback";
import { usePageMeta } from "../hooks/usePageMeta";
import { useLanguage } from "../i18n/LanguageContext";
import brainImg from "../../assets/_DSC2126.jpeg";
import whyImg from "../../assets/_DSC2163 copy.jpeg";
import founderImg from "../../assets/_DSC1990.jpeg";
import cofounderImg from "../../assets/_DSC2052.jpeg";
import nuppuLogoStacked from "../../assets/NUPPU LOGO STACKED.png";

export default function About() {
  const { t } = useLanguage();

  usePageMeta(t("about.meta.title"), t("about.meta.description"));

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: t("about.values.childFirst.title"),
      description: t("about.values.childFirst.description"),
      color: "#FFD4C4",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t("about.values.safety.title"),
      description: t("about.values.safety.description"),
      color: "#A8C5BA",
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: t("about.values.evidence.title"),
      description: t("about.values.evidence.description"),
      color: "#B8D4C7",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t("about.values.family.title"),
      description: t("about.values.family.description"),
      color: "#D4C5F9",
    },
  ];

  const frameworks = [
    {
      title: t("about.brain.f1.title"),
      description: t("about.brain.f1.description"),
    },
    {
      title: t("about.brain.f2.title"),
      description: t("about.brain.f2.description"),
    },
    {
      title: t("about.brain.f3.title"),
      description: t("about.brain.f3.description"),
    },
    {
      title: t("about.brain.f4.title"),
      description: t("about.brain.f4.description"),
    },
  ];

  const features = [
    {
      icon: <Eye className="w-7 h-7 text-white" />,
      gradient: "from-[#D4C5F9] to-[#B8D4C7]",
      title: t("about.features.visual.title"),
      p1: t("about.features.visual.p1"),
      p2: t("about.features.visual.p2"),
      delay: 0,
    },
    {
      icon: <Smile className="w-7 h-7 text-white" />,
      gradient: "from-[#E8C468] to-[#A8C5BA]",
      title: t("about.features.ux.title"),
      p1: t("about.features.ux.p1"),
      p2: t("about.features.ux.p2"),
      delay: 0.1,
    },
    {
      icon: <Users className="w-7 h-7 text-white" />,
      gradient: "from-[#A8C5BA] to-[#E8C468]",
      title: t("about.features.value.title"),
      p1: t("about.features.value.p1"),
      p2: t("about.features.value.p2"),
      delay: 0.2,
    },
    {
      icon: <Sparkles className="w-7 h-7 text-white" />,
      gradient: "from-[#B8D4C7] to-[#D4C5F9]",
      title: t("about.features.tech.title"),
      p1: t("about.features.tech.p1"),
      p2: t("about.features.tech.p2"),
      delay: 0.3,
    },
  ];

  const whyItems = [
    {
      icon: <Lock className="w-6 h-6 text-[#6E4FD1]" />,
      bg: "bg-[#C9BBF5]/20",
      title: t("about.why.security.title"),
      description: t("about.why.security.description"),
    },
    {
      icon: <Brain className="w-6 h-6 text-[#6E4FD1]" />,
      bg: "bg-[#B8DDB8]/20",
      title: t("about.why.development.title"),
      description: t("about.why.development.description"),
    },
    {
      icon: <Target className="w-6 h-6 text-[#6E4FD1]" />,
      bg: "bg-[#FFD4C4]/20",
      title: t("about.why.purpose.title"),
      description: t("about.why.purpose.description"),
    },
  ];

  return (
    <div className="w-full">
      <section className="bg-gradient-to-br from-[#C9BBF5]/20 via-[#F9E5A8]/10 to-[#B8DDB8]/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl text-[#35322B] mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {t("about.heroTitle")} <span className="text-[#6E4FD1]">{t("about.heroTitleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-[#6B6660] max-w-3xl mx-auto leading-relaxed">
              {t("about.heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl text-[#35322B] mb-4"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {t("about.background.title")}
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-lg text-[#6B6660] mb-4 leading-relaxed">
                {t("about.background.p1")}
              </p>
              <p className="text-lg text-[#6B6660] leading-relaxed">
                {t("about.background.p2")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-[#F2EDDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={founderImg}
                  alt={t("about.founder.imageAlt")}
                  className="w-full h-[600px] object-cover object-top"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="text-3xl md:text-4xl text-[#35322B] mb-4"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("about.founder.title")}
              </h2>
              <h3
                className="text-xl text-[#6E4FD1] mb-6"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("about.founder.name")}
              </h3>
              <p className="text-lg text-[#6B6660] mb-4 leading-relaxed">
                {t("about.founder.p1")}
              </p>
              <p className="text-lg text-[#6B6660] mb-4 leading-relaxed">
                {t("about.founder.p2")}
              </p>
              <p className="text-lg text-[#6B6660] leading-relaxed">
                {t("about.founder.p3")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-[#F2EDDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={cofounderImg}
                  alt={t("about.cofounder.imageAlt")}
                  className="w-full h-[600px] object-cover object-top"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="text-3xl md:text-4xl text-[#35322B] mb-4"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("about.cofounder.title")}
              </h2>
              <h3
                className="text-xl text-[#6E4FD1] mb-6"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("about.cofounder.name")}
              </h3>
              <p className="text-lg text-[#6B6660] mb-4 leading-relaxed">
                {t("about.cofounder.p1")}
              </p>
              <p className="text-lg text-[#6B6660] mb-4 leading-relaxed">
                {t("about.cofounder.p2")}
              </p>
              <p className="text-lg text-[#6B6660] leading-relaxed">
                {t("about.cofounder.p3")}
              </p>
              <p className="text-lg text-[#6B6660] leading-relaxed">
                {t("about.cofounder.p4")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2
              className="text-3xl md:text-4xl text-[#35322B] mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {t("about.promise.title")}
            </h2>
            <p className="text-lg text-[#6B6660] mb-6 leading-relaxed">
              {t("about.promise.intro")}
            </p>
            <div className="bg-gradient-to-br from-[#A8C5BA]/10 to-[#E8C468]/10 rounded-3xl p-8 md:p-15">
              <p
                className="text-xl md:text-2xl text-[#3A4536] leading-relaxed"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("about.promise.p1")}
              </p>
              <br />
              <p
                className="text-xl md:text-2xl text-[#3A4536] leading-relaxed"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("about.promise.p2")}
              </p>
              <br />
              <p
                className="text-xl md:text-2xl text-[#3A4536] leading-relaxed"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("about.promise.p3")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-[#F2EDDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl md:text-4xl text-[#35322B] mb-4"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {t("about.values.title")}
            </h2>
            <p className="text-lg text-[#6B6660] max-w-2xl mx-auto">
              {t("about.values.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white"
                  style={{ backgroundColor: value.color }}
                >
                  {value.icon}
                </div>
                <h3
                  className="text-xl mb-3 text-[#35322B]"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  {value.title}
                </h3>
                <p className="text-[#6B6660] leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-2 md:order-1"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={brainImg}
                  alt={t("about.brain.imageAlt")}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 md:order-2"
            >
              <h2
                className="text-3xl md:text-4xl text-[#35322B] mb-6"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("about.brain.title")}
              </h2>
              <p className="text-lg text-[#6B6660] mb-6 leading-relaxed">
                {t("about.brain.intro")}
              </p>

              <div className="space-y-6">
                {frameworks.map((framework, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#6E4FD1] mt-2" />
                    <div>
                      <h4
                        className="text-lg text-[#35322B] mb-2"
                        style={{ fontFamily: "Nunito, sans-serif" }}
                      >
                        {framework.title}
                      </h4>
                      <p className="text-[#6B6660] leading-relaxed">
                        {framework.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-[#F2EDDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay }}
                className="bg-white rounded-3xl p-8 md:p-10 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                    {feature.icon}
                  </div>
                  <h3
                    className="text-2xl md:text-3xl text-[#35322B]"
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    {feature.title}
                  </h3>
                </div>
                <p className="text-[#6B6660] leading-relaxed mb-4">
                  {feature.p1}
                </p>
                <p className="text-[#6B6660] leading-relaxed">
                  {feature.p2}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-[#F2EDDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="text-3xl md:text-4xl text-[#35322B] mb-6"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                {t("about.why.title")}
              </h2>
              <p className="text-lg text-[#6B6660] mb-4 leading-relaxed">
                {t("about.why.intro")}
              </p>

              <div className="space-y-6 mb-8">
                {whyItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4
                        className="text-lg text-[#35322B] mb-1"
                        style={{ fontFamily: "Nunito, sans-serif" }}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[#6B6660]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={whyImg}
                  alt={t("about.why.imageAlt")}
                  className="w-full h-[650px] object-cover object-top"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#B8DDB8] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full mb-6">
                <Sparkles size={16} className="text-white" />
                <span className="text-white">{t("home.appPreview.badge")}</span>
              </div>
              <h2
                className="text-3xl md:text-4xl text-white mb-4"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {t("home.appPreview.title")}
              </h2>
              <p className="text-lg text-white/85 mb-8 leading-relaxed max-w-xl">
                {t("home.appPreview.subtitle")}
              </p>
              <a
                href="/app-preview/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#6E4FD1] rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Smartphone size={20} />
                {t("home.appPreview.button")}
                <ArrowRight size={20} />
              </a>
            </div>

            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="flex justify-center"
            >
              <div className="w-56 h-[420px] rounded-[2.5rem] border-4 border-white/30 bg-[#FFF2A6] shadow-2xl flex items-center justify-center p-8">
                <img
                  src={nuppuLogoStacked}
                  alt="Nuppu"
                  className="w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-[#F2EDDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl md:text-4xl text-[#35322B] mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {t("about.cta.title")}
            </h2>
            <p className="text-lg text-[#35322B] mb-8 max-w-2xl mx-auto">
              {t("about.cta.subtitle")}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#6E4FD1] rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {t("about.cta.button")}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
