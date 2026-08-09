import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Mail, Clock3, Send, CheckCircle, AlertCircle } from "lucide-react";
import { contactAPI } from "../config/api";
import { usePageMeta } from "../hooks/usePageMeta";
import { useLanguage } from "../i18n/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();

  usePageMeta(t("contact.meta.title"), t("contact.meta.description"));

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage(t("contact.errors.name"));
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage(t("contact.errors.email"));
      return false;
    }
    if (!formData.role) {
      setErrorMessage(t("contact.errors.role"));
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMessage(t("contact.errors.message"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      setFormStatus("error");
      return;
    }

    setFormStatus("loading");

    try {
      await contactAPI.submit(formData);

      setFormStatus("success");
      setFormData({ name: "", email: "", role: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus("idle");
      }, 5000);
    } catch (error) {
      setFormStatus("error");
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(t("contact.errors.generic"));
      }
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
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
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {t("contact.heroTitle")} <span className="text-[#6E4FD1]">{t("contact.heroTitleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-[#6B6660] max-w-3xl mx-auto leading-relaxed">
              {t("contact.heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="text-3xl text-[#35322B] mb-6"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {t("contact.connect.title")}
              </h2>
              <p className="text-lg text-[#6B6660] mb-8 leading-relaxed">
                {t("contact.connect.text")}
              </p>

              {/* Contact Cards */}
              <div className="space-y-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4 p-6 bg-gradient-to-br from-[#C9BBF5]/10 to-[#C9BBF5]/5 rounded-2xl border border-[#C9BBF5]/30"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#C9BBF5] flex items-center justify-center text-white">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3
                      className="text-lg text-[#35322B] mb-1"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {t("contact.emailUs")}
                    </h3>
                    <a
                      href="mailto:nuppudigital@gmail.com"
                      className="text-[#6E4FD1] hover:underline"
                    >
                      nuppudigital@gmail.com
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-start gap-4 p-6 bg-gradient-to-br from-[#B8DDB8]/10 to-[#B8DDB8]/5 rounded-2xl border border-[#B8DDB8]/30"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#B8DDB8] flex items-center justify-center text-white">
                    <Clock3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3
                      className="text-lg text-[#35322B] mb-1"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      {t("contact.responseTime.title")}
                    </h3>
                    <p className="text-[#6B6660]">{t("contact.responseTime.text")}</p>
                  </div>
                </motion.div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-6 bg-[#F2EDDE] rounded-2xl">
                <h3
                  className="text-lg text-[#35322B] mb-3"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {t("contact.waitlist.title")}
                </h3>
                <p className="text-[#6B6660] leading-relaxed">
                  {t("contact.waitlist.text")}
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[#35322B] mb-2"
                  >
                    {t("contact.form.nameLabel")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    aria-invalid={formStatus === "error" && !formData.name.trim()}
                    className="w-full px-4 py-3 bg-[#F2EDDE] border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E4FD1] transition-all"
                    placeholder={t("contact.form.namePlaceholder")}
                    disabled={formStatus === "loading"}
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[#35322B] mb-2"
                  >
                    {t("contact.form.emailLabel")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    aria-invalid={formStatus === "error" && (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))}
                    className="w-full px-4 py-3 bg-[#F2EDDE] border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E4FD1] transition-all"
                    placeholder={t("contact.form.emailPlaceholder")}
                    disabled={formStatus === "loading"}
                  />
                </div>

                {/* Role Select */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-[#35322B] mb-2"
                  >
                    {t("contact.form.roleLabel")}
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    aria-invalid={formStatus === "error" && !formData.role}
                    className="w-full px-4 py-3 bg-[#F2EDDE] border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E4FD1] transition-all"
                    disabled={formStatus === "loading"}
                  >
                    <option value="">{t("contact.form.selectRole")}</option>
                    <option value="parent">{t("contact.form.roleParent")}</option>
                    <option value="teacher">{t("contact.form.roleTeacher")}</option>
                    <option value="healthcare">{t("contact.form.roleHealthcare")}</option>
                    <option value="other">{t("contact.form.roleOther")}</option>
                  </select>
                </div>

                {/* Message Textarea */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-[#35322B] mb-2"
                  >
                    {t("contact.form.messageLabel")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    required
                    aria-invalid={formStatus === "error" && !formData.message.trim()}
                    className="w-full px-4 py-3 bg-[#F2EDDE] border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E4FD1] transition-all resize-none"
                    placeholder={t("contact.form.messagePlaceholder")}
                    disabled={formStatus === "loading"}
                  />
                </div>

                {/* Error Message */}
                {formStatus === "error" && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    aria-live="assertive"
                    className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{errorMessage}</p>
                  </motion.div>
                )}

                {/* Success Message */}
                {formStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="status"
                    aria-live="polite"
                    className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600"
                  >
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{t("contact.form.success")}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formStatus === "loading"}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] text-white rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {formStatus === "loading" ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      {t("contact.form.sending")}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t("contact.form.send")}
                    </>
                  )}
                </button>

                <p className="text-sm text-[#6B6660] text-center">
                  {t("contact.form.agree")}
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F2EDDE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl md:text-4xl text-[#35322B] mb-6"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {t("contact.bottom.title")}
            </h2>
            <p className="text-lg text-[#6B6660] mb-8 max-w-2xl mx-auto">
              {t("contact.bottom.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/characters"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#6E4FD1] border-2 border-[#6E4FD1] rounded-full hover:bg-[#6E4FD1] hover:text-white transition-all duration-300"
              >
                {t("contact.bottom.characters")}
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#6E4FD1] border-2 border-[#6E4FD1] rounded-full hover:bg-[#6E4FD1] hover:text-white transition-all duration-300"
              >
                {t("contact.bottom.about")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
