import React from "react";
import { Flame, Tent, Truck, Coffee, Star, MapPin } from "lucide-react";

const MarqueeStrip = () => {
  const items = [
    { text: "كشتات VIP", icon: Tent },
    { text: "خصومات قوية", icon: Star },
    { text: "دبابات", icon: Truck },
    { text: "قهوة مختصة", icon: Coffee },
    { text: "مواقع حصرية", icon: MapPin },
  ];

  return (
    // الخلفية سوداء، الشريط يميل، وله حدود
    <div className="relative w-full bg-yellow-400 border-y-[4px] border-black overflow-hidden py-4 -rotate-2 scale-105 shadow-hard z-20 my-10">
      <div className="flex w-max animate-marquee">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-16 px-8 shrink-0">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 text-black text-2xl font-black uppercase tracking-tighter">
                {/* الأيقونة أيضاً لها تأثير كرتوني */}
                <div className="bg-white border-2 border-black p-2 rounded-lg shadow-hard-sm">
                    <item.icon size={28} className="text-black" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeStrip;