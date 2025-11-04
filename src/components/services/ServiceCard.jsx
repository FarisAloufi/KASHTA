import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Trash2 } from 'lucide-react';


export const StarsReadOnly = ({ rating, size = 16 }) => {
    return (
        <div className="flex gap-0.5" dir="rtl">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <Star
                        key={ratingValue}
                        fill={ratingValue <= rating ? "#ffc107" : "none"} 
                        stroke={ratingValue <= rating ? "#ffc107" : "#3e2723"}
                        size={size}
                        className="transition-all"
                    />
                );
            })}
        </div>
    );
};

function ServiceCard({ service, userRole, onDelete }) {
  
  const handleDeleteClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (window.confirm('هل أنت متأكد أنك تريد حذف هذه الخدمة؟')) {
      onDelete(service.id);
    }
  };

  return (
    <div className="group relative bg-[#d8ceb8ff] text-[#3e2723] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-dark-brown/10">
      
      {/* (4) زر الحذف */}
      {userRole === 'provider' && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-4 left-4 z-10 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          aria-label="Delete service"
        >
          <Trash2 size={18} />
        </button>
      )}

      <Link to={`/service/${service.id}`}>
        <div className="relative h-64 overflow-hidden">
          <img 
            src={service.imageUrl || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"} 
            alt={service.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {service.rating >= 4.5 && (
            <div className="absolute top-4 right-4 bg-accent-orange text-[#3e2723] px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
              <Award size={14} />
              <span>الأفضل</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-[#3e2723] mb-3 group-hover:text-accent-orange transition-colors">
          {service.name}
        </h3>
        
        <div className="flex items-center gap-3 mb-4" dir="rtl">
          {/* (5) صار يستخدم كومبوننت النجوم اللي فوق */}
          <StarsReadOnly rating={service.rating} size={18} /> 
          <span className="text-lg font-bold text-[#3e2723]">{service.rating}</span>
          <span className="text-sm text-[#3e2723]">({service.ratingCount} تقييم)</span>
        </div>
        
        <div className="flex justify-between items-center pt-5 border-t border-dark-brown/10">
          <div>
            <div className="text-sm text-dark-brown/70 mb-1">السعر يبدأ من</div>
            <span className="text-3xl font-black text-dark-brown">
              {service.price} ريال
            </span>
          </div>
          
          <Link 
            to={`/service/${service.id}`}
            className="bg-black text-white px-7 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
          >
            احجز الآن
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;