import React from "react";

const Input = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = ""
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-main-text text-base font-bold mb-2 rtl:text-right ltr:text-left">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-3 rounded-xl outline-none transition-all duration-300
          bg-main-bg/5 border-2 
          text-main-text
          placeholder:text-main-text/50 placeholder:opacity-100
          focus:ring-4 focus:ring-main-accent/20
          ${error
            ? "border-red-400 focus:border-red-500 text-red-900"
            : "border-main-bg/20 focus:border-main-accent hover:border-main-accent/50"
          }
        `}
      />
      {error && <p className="text-red-500 text-sm mt-1 font-bold">{error}</p>}
    </div>
  );
};

export default Input;