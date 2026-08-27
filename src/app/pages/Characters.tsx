import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Heart, Shield, Star, Lightbulb } from "lucide-react";
import nuppuImg from "../../assets/NUPPU BUNNY.png";
import muruImg from "../../assets/MURU BEAR.png";
import hippuImg from "../../assets/HIPPU CAT.png";
import lumoImg from "../../assets/LUMO FOX.png";
import lineupImg from "../../assets/Friends.png";
import { usePageMeta } from "../hooks/usePageMeta";
import { useLanguage } from "../i18n/LanguageContext";

export default function Characters() {
  const { t, tList } = useLanguage();

  usePageMeta(t("characters.meta.title"), t("characters.meta.description"));

  const characters = [
    {
      name: "Nuppu",
      personality: t("characters.nuppu.personality"),
      description: t("characters.nuppu.description"),
      emotions: tList("characters.nuppu.emotions"),
      color: "#F2984D",
      image: nuppuImg,
      icon: <Heart className="w-6 h-6" />,
    },
    {
      name: "Muru",
      personality: t("characters.muru.personality"),
      description: t("characters.muru.description"),
      emotions: tList("characters.muru.emotions"),
      color: "#F0B429",
      image: muruImg,
      icon: <Shield className="w-6 h-6" />,
    },
    {
      name: "Hippu",
      personality: t("characters.hippu.personality"),
      description: t("characters.hippu.description"),
      emotions: tList("characters.hippu.emotions"),
      color: "#EE7FB0",
      image: hippuImg,
      icon: <Star className="w-6 h-6" />,
    },
    {
      name: "Lumo",
      personality: t("characters.lumo.personality"),
      description: t("characters.lumo.description"),
      emotions: tList("characters.lumo.emotions"),
      color: "#4FB6E0",
      image: lumoImg,
      icon: <Lightbulb className="w-6 h-6" />,
    },
  ];

  return (
    <div className="w-full">
      <section className="bg-gradient-to-br from-[#C9BBF5]/20 via-[#F9E5A8]/10 to-[#D4C5F9]/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl text-[#35322B] mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {t("characters.heroTitle")}{" "}
              <span className="text-[#6E4FD1]">{t("characters.heroTitleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-[#6B6660] max-w-3xl mx-auto leading-relaxed">
              {t("characters.heroSubtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-12 flex justify-center"
          >
            <img
              src={lineupImg}
              alt={t("characters.heroTitleHighlight")}
              className="w-full max-w-2xl h-auto object-contain drop-shadow-xl"
              loading="eager"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {characters.map((character, index) => (
              <motion.div
                key={character.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-border"
              >
                <div
                  className="relative h-96 overflow-hidden"
                  style={{ background: `linear-gradient(to bottom right, white, ${character.color}14)` }}
                >
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full flex items-center justify-center p-4"
                  >
                    <img
                      src={character.image}
                      alt={character.name}
                      className="max-w-[70%] max-h-full w-auto h-auto object-contain drop-shadow-lg"
                      loading="lazy"
                      decoding="async"
                    />
                  </motion.div>
                  <div
                    className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: character.color }}
                  >
                    {character.icon}
                  </div>
                </div>

                <div className="p-8">
                  <h2
                    className="text-2xl md:text-3xl text-[#35322B] mb-2"
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    {character.name}
                  </h2>
                  <p
                    className="text-[#6E4FD1] mb-4"
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    {character.personality}
                  </p>
                  <p className="text-[#6B6660] mb-6 leading-relaxed">
                    {character.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {character.emotions.map((emotion, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 rounded-full text-sm text-white"
                        style={{ backgroundColor: character.color }}
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-[#F2EDDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#B8DDB8] rounded-3xl p-12 text-center"
          >
            <h2
              className="text-3xl md:text-4xl text-white mb-6"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {t("characters.bottom.title")}
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              {t("characters.bottom.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#6E4FD1] rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {t("characters.bottom.learnMore")}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white border-2 border-white rounded-full hover:bg-white hover:text-[#6E4FD1] transition-all duration-300"
              >
                {t("characters.bottom.joinWaitlist")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
