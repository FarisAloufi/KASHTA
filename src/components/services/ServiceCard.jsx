import React from 'react';
import { Link } from 'react-router-dom'; 


function ServiceCard({ service }) {
  return (
 
    <Link to={`/service/${service.id}`} className="block border rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
      
 
      <img 
        src={service.imageUrl} 
        alt={service.name} 
        className="w-full h-48 object-cover" 
      />
      
      <div className="p-4">
    
        <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
        
  
        <p className="text-lg text-green-700 font-semibold mb-4">
          {service.price} ريال / الليلة
        </p>
        
 
        <div className="w-full bg-green-700 text-white text-center font-bold py-2 px-4 rounded">
          عرض التفاصيل والحجز
        </div>
      </div>
    </Link>
  );
}

export default ServiceCard;