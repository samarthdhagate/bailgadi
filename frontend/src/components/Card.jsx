import React from 'react';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, ...props }) => {
  return (
    <div className={twMerge("card", className)} {...props}>
      {children}
    </div>
  );
};

export default Card;
