import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Package, Heart } from 'lucide-react'; 

function AboutUsPage() {
  return (
    <div className="bg-kashta-bg text-light-beige min-h-screen">
      
     
      <header className="relative bg-kashta-bg text-light-beige py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            نحن نجهز الكشتة،
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-kashta-accent to-orange-300">
              وأنت تعيش المغامرة!
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-light-beige/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            "كشتة" وُجدت لحل مشكلة واحدة: جعل تجربة التخييم والرحلات البرية سهلة، ممتعة، وبدون أي تعقيدات.
          </p>
        </div>
      </header>

     
      <section className="bg-kashta-beige text-kashta-brown container mx-auto px-6 py-20 rounded-t-3xl shadow-xl -mt-12 relative z-20">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-kashta-brown mb-4">
              ليش "كشتة"؟
            </h2>
            <p className="text-xl text-kashta-brown/70 max-w-2xl mx-auto">
              لأننا نؤمن بأن أجمل اللحظات تُصنع في الطبيعة، وليس في التحضير لها.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
           
            <div className="bg-[#d8ceb8ff] p-6 rounded-2xl shadow-lg border border-dark-brown/10">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-[#3e2723]" />
              <h3 className="text-2xl font-bold text-[#3e2723]">من أي مكان</h3>
              <p className="text-[#3e2723]">
                اختر موقعك على الخريطة، حتى لو كان في وسط الصحراء، واترك الباقي علينا.
              </p>
            </div>
            
            <div className="bg-[#d8ceb8ff] p-6 rounded-2xl shadow-lg border border-dark-brown/10">
              <Package className="w-12 h-12 mx-auto mb-4 text-[#3e2723]" />
              <h3 className="text-2xl font-bold text-[#3e2723] mb-2">كل شيء في منصة واحدة</h3>
              <p className="text-[#3e2723]">
                من الخيام والمفروشات إلى الإضاءة وأدوات الطبخ، كل ما تحتاجه في مكان واحد.
              </p>
            </div>
            
            <div className="bg-[#d8ceb8ff] p-6 rounded-2xl shadow-lg border border-dark-brown/10">
              <Heart className="w-12 h-12 mx-auto mb-4 text-[#3e2723]" />
              <h3 className="text-2xl font-bold text-[#3e2723]">موثوقية تامة</h3>
              <p className="text-[#3e2723]">
                نحن نربطك بأفضل مزودي الخدمة الموثوقين لضمان جودة وراحة لا تضاهى.
              </p>
            </div>
          </div>

        </div>
      </section>

      
      <section className="bg-kashta-bg py-20 border-t border-light-beige/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-light-beige mb-6">
            مستعد لكشتتك الجاية؟
          </h2>
          <p className="text-xl text-light-beige/90 mb-8 max-w-2xl mx-auto">
            تصفح خدماتنا الآن وابدأ التخطيط لرحلتك القادمة بدون أي هم.
          </p>
          <Link 
            to="/services" 
            className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
          >
            تصفح الخدمات الآن
          </Link>
        </div>
      </section>

    </div>
  );
}

export default AboutUsPage;