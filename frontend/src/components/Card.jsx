import React from 'react';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className }) => {
  return (
    <div className={twMerge("card", className)}>
      {children}
    </div>
  );
};

export default Card;
