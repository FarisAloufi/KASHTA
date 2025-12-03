import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Package, Heart } from "lucide-react";

// --- Constants & Data ---
// Static data for the "Why Kashta?" section.
// Extracting data makes the JSX cleaner and easier to maintain.
const FEATURES_DATA = [
  {
    id: 1,
    icon: MapPin,
    title: "من أي مكان",
    description: "اختر موقعك على الخريطة، حتى لو كان في وسط الصحراء، واترك الباقي علينا.",
  },
  {
    id: 2,
    icon: Package,
    title: "كل شيء في منصة واحدة",
    description: "من الخيام والمفروشات إلى الإضاءة، كل ما تحتاجه في مكان واحد.",
  },
  {
    id: 3,
    icon: Heart,
    title: "موثوقية تامة",
    description: "الجودة هي معيارنا. كل خدمة وكل خيمة في منصتنا يتم فحصها واختيارها بعناية.",
  },
];

// --- Sub-Components ---

/**
 * FeatureCard Component
 * Renders a single feature card with an icon, title, and description.
 * This promotes reusability and reduces code duplication (DRY).
 */
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-second-bg p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
    <Icon className="w-12 h-12 mx-auto mb-4 text-main-text" />
    <h3 className="text-2xl font-bold text-main-text mb-2">{title}</h3>
    <p className="text-main-text leading-relaxed">{description}</p>
  </div>
);

// --- Main Page Component ---

function AboutUsPage() {
  return (
    <div className="bg-main-bg text-second-text min-h-screen">

      {/* === Hero Section === */}
      {/* Introduces the brand mission */}
      <header className="relative bg-main-bg text-second-text py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            نحن نجهز الكشتة
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-main-accent to-black">
              وأنت تعيش المغامرة!
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-second-text/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            كشتة وُجدت لحل مشكلة واحدة: جعل تجربة التخييم والرحلات البرية والبحرية
            سهلة، ممتعة، وبدون أي تعقيدات.
          </p>
        </div>
      </header>

      {/* === Features Section === */}
      {/* Displays the core values/features of the platform */}
      <section className="bg-main-bg text-second-text py-20 -mt-12 relative z-20 mb-20">
        <div className="max-w-4xl mx-auto px-6">

          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-second-text mb-4">
              ليش كشتة؟
            </h2>
            <p className="text-xl text-second-text/90 max-w-2xl mx-auto">
              لأننا نؤمن بأن أجمل اللحظات تُصنع في الطبيعة، وليس في التحضير لها.
            </p>
          </div>

          {/* Features Grid (Mapped from Data) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {FEATURES_DATA.map((feature) => (
              <FeatureCard
                key={feature.id}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          {/* Call to Action (CTA) */}
          <div className="container mx-auto px-6 text-center mt-16">
            <h2 className="text-4xl md:text-5xl font-black text-second-text mb-6">
              مستعد لكشتتك الجاية؟
            </h2>
            <p className="text-xl text-second-text/90 mb-8 max-w-2xl mx-auto">
              تصفح خدماتنا الآن وابدأ التخطيط لرحلتك القادمة بدون أي هم.
            </p>
            <Link
              to="/services"
              className="inline-block bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
            >
              تصفح الخدمات الآن
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}

export default AboutUsPage;