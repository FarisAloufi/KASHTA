// src/utils/googleTranslate.js
import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; 

export const translateText = async (text, targetLang = 'en') => {
  if (!text) return "";

  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        q: text,
        target: targetLang
      }
    );
    
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Translation Error:", error);
    return text; 
  }
};