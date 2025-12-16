import { useEffect } from 'react';

const SEO = ({ title, description }) => {
  
  useEffect(() => {
    document.title = title ? `${title} | Kashta` : "Kashta";


    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || "منصة كشتة لخدمات الرحلات");
    }
  }, [title, description]);

  return null; 
};

export default SEO;