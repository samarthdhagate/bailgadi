import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, className, variant = 'primary', isLoading, ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-xl transition-colors',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl transition-colors',
    danger: 'bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-xl transition-colors',
  };

  return (
    <button
      className={twMerge(variants[variant], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
