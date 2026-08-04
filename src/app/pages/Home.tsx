import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Heart,
  BookOpen,
  Brain,
  GraduationCap,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/media/ImageWithFallback";
import { usePageMeta } from "../hooks/usePageMeta";
import { useLanguage } from "../i18n/LanguageContext";
import lineupImg from "../../assets/CHARACTERS LINEUP.webp";

export default function Home() {
  const { t, tList } = useLanguage();

  usePageMeta(t("home.meta.title"), t("home.meta.description"));

  const [currentSlide, setCurrentSlide] = useState(0);

  const whyNuppuSlides = [
    {
      icon: <Heart className="w-12 h-12" />,
      title: t("home.why.slide1.title"),
      description: t("home.why.slide1.description"),
      color: "#FFD4C4",
    },
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: t("home.why.slide2.title"),
      description: t("home.why.slide2.description"),
      color: "#A8D5E2",
    },
    {
      icon: <Brain className="w-12 h-12" />,
      title: t("home.why.slide3.title"),
      description: t("home.why.slide3.description"),
      color: "#B8DDB8",
    },
  ];

  const targetAudiences = [
    {
      icon: <Heart className="w-10 h-10" />,
      title: t("home.audience.parents.title"),
      description: t("home.audience.parents.description"),
      benefits: tList("home.audience.parents.benefits"),
      color: "#FFD4C4",
    },
    {
      icon: <GraduationCap className="w-10 h-10" />,
      title: t("home.audience.teachers.title"),
      description: t("home.audience.teachers.description"),
      benefits: tList("home.audience.teachers.benefits"),
      color: "#F9E5A8",
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: t("home.audience.healthcare.title"),
      description: t("home.audience.healthcare.description"),
      benefits: tList("home.audience.healthcare.benefits"),
      color: "#D4C5F9",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % whyNuppuSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + whyNuppuSlides.length) % whyNuppuSlides.length);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#A8D5E2]/20 via-[#F9E5A8]/10 to-[#B8DDB8]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 bg-[#A8D5E2]/30 rounded-full mb-6"
              >
                <span className="text-[#6B9AC4]">{t("home.badge")}</span>
              </motion.div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl text-[#2D3748] mb-6 leading-tight"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {t("home.heroTitle")}{" "}
                <span className="text-[#6B9AC4]">{t("home.heroTitleHighlight")}</span>
              </h1>

              <p className="text-lg md:text-xl text-[#718096] mb-8 leading-relaxed">
                {t("home.heroSubtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] text-white rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {t("home.contactUs")}
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/characters"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#6B9AC4] border-2 border-[#6B9AC4] rounded-full hover:bg-[#6B9AC4] hover:text-white transition-all duration-300"
                >
                  {t("home.meetCharacters")}
                </Link>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="src/assets/_DSC2229.jpeg"
                  alt={t("home.heroImageAlt")}
                  className="w-full h-[400px] md:h-[500px] object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6B9AC4]/20 to-transparent" />
              </div>
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-[#F9E5A8] rounded-full opacity-60 blur-2xl"
              />
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#B8DDB8] rounded-full opacity-60 blur-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet the Gang */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              className="text-3xl md:text-4xl text-[#2D3748] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {t("home.meetGang.title")}
            </h2>
            <p className="text-lg text-[#718096] max-w-2xl mx-auto">
              {t("home.meetGang.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex justify-center mb-10"
          >
            <img
              src={lineupImg}
              alt={t("home.meetGang.title")}
              className="w-full max-w-2xl h-auto object-contain drop-shadow-xl"
              loading="lazy"
            />
          </motion.div>

          <div className="flex justify-center">
            <Link
              to="/characters"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#6B9AC4] border-2 border-[#6B9AC4] rounded-full hover:bg-[#6B9AC4] hover:text-white transition-all duration-300"
            >
              {t("home.meetGang.cta")}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Nuppu - Interactive Carousel */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl md:text-4xl text-[#2D3748] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {t("home.why.title")}
            </h2>
            <p className="text-lg text-[#718096] max-w-2xl mx-auto">
              {t("home.why.subtitle")}
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="p-12 text-center"
                  style={{ backgroundColor: whyNuppuSlides[currentSlide].color }}
                >
                  <div className="flex justify-center mb-6 text-white">
                    {whyNuppuSlides[currentSlide].icon}
                  </div>
                  <h3
                    className="text-2xl md:text-3xl text-white mb-4"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    {whyNuppuSlides[currentSlide].title}
                  </h3>
                  <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                    {whyNuppuSlides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-[#A8D5E2] text-white hover:bg-[#6B9AC4] transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex gap-2">
                {whyNuppuSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-[#6B9AC4] w-8"
                        : "bg-[#A8D5E2]/40"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-[#A8D5E2] text-white hover:bg-[#6B9AC4] transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl md:text-4xl text-[#2D3748] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {t("home.audience.title")}
            </h2>
            <p className="text-lg text-[#718096] max-w-2xl mx-auto">
              {t("home.audience.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {targetAudiences.map((audience, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white"
                  style={{ backgroundColor: audience.color }}
                >
                  {audience.icon}
                </div>
                <h3
                  className="text-xl mb-4 text-[#2D3748]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {audience.title}
                </h3>
                <p className="text-[#718096] mb-6 leading-relaxed">
                  {audience.description}
                </p>
                <ul className="space-y-3">
                  {audience.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[#718096]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6B9AC4]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl md:text-4xl text-white mb-6"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {t("home.cta.title")}
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              {t("home.cta.subtitle")}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#6B9AC4] rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {t("home.cta.button")}
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
