import React from 'react';

const Loader = ({ fullPage }) => {
  const loader = (
    <div className="flex items-center justify-center p-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;
