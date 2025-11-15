import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, MapPin, Package, Heart } from "lucide-react";

function AboutUsPage() {
  return (
    <div className="bg-main-bg text-second-text min-h-screen">
      <header className="relative bg-main-bg text-second-text py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
        
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            نحن نجهز الكشتة
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-main-accent to-black">
             وأنت تعيش المغامرة!
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-second-text/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            كشتة وُجدت لحل مشكلة واحدة لجعل تجربة التخييم والرحلات البرية و البحرية
            سهلة، ممتعة، وبدون أي تعقيدات.
          </p>
        </div>
        
      </header>

    <section className="bg-main-bg text-second-text py-20 -mt-12 relative z-20 mb-20">        
      <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-second-text mb-4">
              ليش كشتة؟
            </h2>
            <p className="text-xl text-second-text/90 max-w-2xl mx-auto">
              لأننا نؤمن بأن أجمل اللحظات تُصنع في الطبيعة، وليس في التحضير لها.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-second-bg p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-main-text" />
              <h3 className="text-2xl font-bold text-main-text">من أي مكان</h3>
              <p className="text-main-text">
                اختر موقعك على الخريطة، حتى لو كان في وسط الصحراء، واترك الباقي
                علينا.
              </p>
            </div>

            <div className="bg-second-bg p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <Package className="w-12 h-12 mx-auto mb-4 text-main-text" />
              <h3 className="text-2xl font-bold text-main-text mb-2">
                كل شيء في منصة واحدة
              </h3>
              <p className="text-main-text">
                من الخيام والمفروشات إلى الإضاءة وأدوات الطبخ، كل ما تحتاجه في
                مكان واحد.
              </p>
            </div>

            <div className="bg-second-bg p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <Heart className="w-12 h-12 mx-auto mb-4 text-main-text" />
              <h3 className="text-2xl font-bold text-main-text">
                موثوقية تامة
              </h3>
              <p className="text-main-text">
                الجودة هي معيارنا. كل خدمة وكل خيمة في منصتنا يتم فحصها
                واختيارها بعناية، لنضمن لك تجربة "كشتة" فخمة ومطابقة تماماً لما
                تراه في الصور.
              </p>
            </div>
          </div>

          <div className="container mx-auto px-6 text-center mt-16">
            <h2 className="text-4xl md:text-5xl font-black text-second-text mb-6">
              مستعد لكشتتك الجاية؟
            </h2>
            <p className="text-xl text-second-text/90 mb-8 max-w-2xl mx-auto">
              تصفح خدماتنا الآن وابدأ التخطيط لرحلتك القادمة بدون أي هم.
            </p>
            <Link
              to="/services"
              className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300">
            
              تصفح الخدمات الآن
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUsPage;