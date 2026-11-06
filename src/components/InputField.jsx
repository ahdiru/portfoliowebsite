import React, { useState } from "react";

const InputField = ({ field, label, icon: Icon, formData, handleChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputClasses = (isTextArea = false) => {
    const baseClasses = `
      w-full p-4 rounded-xl bg-[#FFFFFF] text-[#1E3B2F] placeholder-transparent 
      border border-[#D8CFBE]
      focus:outline-none focus:ring-2 focus:ring-[#1E3B2F]/20 focus:border-[#1E3B2F]
      transition-all duration-200 peer shadow-2xs
    `;

    return `${baseClasses} ${isTextArea ? "h-44 pt-12" : "pl-12"}`;
  };

  const renderInputContent = () => {
    if (field === "message") {
      return (
        <textarea
          id={field}
          name={field}
          placeholder={label}
          value={formData[field]}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={getInputClasses(true)}
          required
        />
      );
    }

    return (
      <input
        id={field}
        type={field === "email" ? "email" : "text"}
        name={field}
        placeholder={label}
        value={formData[field]}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={getInputClasses()}
        required
      />
    );
  };

  return (
    <div className="relative w-full group">
      {/* Icon and Label */}
      <div className="absolute left-4 top-4 flex items-center space-x-2 text-[#5A6650] pointer-events-none">
        <Icon className="w-5 h-5 text-[#7F8C6A]" />
        <label
          htmlFor={field}
          className={`
            absolute left-10 top-1/2 transform -translate-y-1/2 text-[#5A6650] text-sm transition-all duration-200 
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:translate-y-0 
            peer-placeholder-shown:text-[#5A6650]/70 peer-placeholder-shown:text-base 
            peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[#1E3B2F] peer-focus:text-xs font-mono
          `}
        >
          {label}
        </label>
      </div>

      {renderInputContent()}
    </div>
  );
};

export default InputField;
