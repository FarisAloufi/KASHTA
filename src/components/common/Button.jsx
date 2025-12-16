import React from "react";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next"; 

const Button = ({ 
  children, 
  onClick, 
  variant = "primary", // primary, secondary, danger, outline
  isLoading = false, 
  disabled = false, 
  type = "button",
  className = "",
  icon: Icon
}) => {
  const { t } = useTranslation(); 

  const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg";

  const variants = {
    primary: "bg-main-bg text-second-text hover:bg-main-accent hover:text-main-text",
    secondary: "bg-second-bg text-main-text border border-main-bg hover:bg-main-bg/10",
    danger: "bg-red-100 text-red-600 border border-red-200 hover:bg-red-200",
    outline: "bg-transparent border-2 border-main-text text-main-text hover:bg-main-text hover:text-second-text"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader className="animate-spin" size={20} />
          <span>{t('common.loading')}...</span> 
        </>
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;