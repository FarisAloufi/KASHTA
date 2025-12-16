import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Package, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from '../../components/common/SEO'; 

// --- Sub-Components ---

/**
 * FeatureCard Component
 * Renders a single feature card with an icon, title, and description.
 */
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-second-bg p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full border border-main-bg">
    <Icon className="w-12 h-12 mx-auto mb-4 text-main-text" />
    <h3 className="text-2xl font-bold text-main-text mb-2">{title}</h3>
    <p className="text-main-text/80 leading-relaxed">{description}</p>
  </div>
);

// --- Main Page Component ---

function AboutUsPage() {
  const { t } = useTranslation();

  // Data moved inside component to access 't' function
  const featuresData = [
    {
      id: 1,
      icon: MapPin,
      title: t('about_us.feature_1_title'),
      description: t('about_us.feature_1_desc'),
    },
    {
      id: 2,
      icon: Package,
      title: t('about_us.feature_2_title'),
      description: t('about_us.feature_2_desc'),
    },
    {
      id: 3,
      icon: Heart,
      title: t('about_us.feature_3_title'),
      description: t('about_us.feature_3_desc'),
    },
  ];

  return (
    <>
      <SEO 
        title={t('navbar.about')} 
        description={t('about_us.hero_desc')} 
      />

      <div className="bg-main-bg text-second-text min-h-screen pt-20">

        {/* === Hero Section === */}
        <header className="relative bg-main-bg text-second-text py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              {t('about_us.hero_title_1')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-main-accent to-main-text/80 mt-2">
                 {t('about_us.hero_title_2')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-second-text/80 mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
              {t('about_us.hero_desc')}
            </p>
          </div>
        </header>

        {/* === Features Section === */}
        <section className="bg-main-bg text-main-text py-10 relative z-20 mb-20">
          <div className="max-w-6xl mx-auto px-6">

            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-second-text mb-4">
                {t('about_us.why_kashta')}
              </h2>
              <p className="text-xl text-second-text max-w-2xl mx-auto">
                {t('about_us.why_desc')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {featuresData.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>

            {/* Call to Action (CTA) */}
            <div className="container mx-auto px-6 text-center mt-24 bg-second-bg rounded-3xl p-12 shadow-inner border border-main-bg">
              <h2 className="text-3xl md:text-5xl font-black text-main-text mb-6">
                {t('about_us.cta_title')}
              </h2>
              <p className="text-xl text-main-text/70 mb-8 max-w-2xl mx-auto">
                {t('about_us.cta_desc')}
              </p>
              <Link
                to="/services"
                className="inline-block bg-main-text text-second-text px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:bg-main-accent hover:text-main-text hover:scale-105 transition-all duration-300"
              >
                {t('about_us.btn_browse')}
              </Link>
            </div>

          </div>
        </section>
      </div>
    </>
  );
}

export default AboutUsPage;