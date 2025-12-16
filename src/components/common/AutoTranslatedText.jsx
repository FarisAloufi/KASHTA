import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '../../utils/googleTranslate'; 
const AutoTranslatedText = ({ text, className = "" }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let isMounted = true;

    const resolveText = async () => {
      if (!text) {
        if (isMounted) setDisplayedText("");
        return;
      }

      if (typeof text === 'object') {
        const localized = text[currentLang] || text['en'] || text['ar'] || "";
        if (isMounted) setDisplayedText(localized);
        return;
      }

      if (typeof text === 'string') {
        if (currentLang === 'en' && /[\u0600-\u06FF]/.test(text)) {
          try {
            if (isMounted && !displayedText) setDisplayedText(text);
            
            const translated = await translateText(text, 'en');
            if (isMounted) setDisplayedText(translated);
          } catch (err) {
            console.error("Translation failed within component:", err);
            if (isMounted) setDisplayedText(text);
          }
        } else {
          if (isMounted) setDisplayedText(text);
        }
      }
    };

    resolveText();

    return () => { isMounted = false; };
  }, [text, currentLang]);

  return <span className={className}>{displayedText}</span>;
};

export default AutoTranslatedText;