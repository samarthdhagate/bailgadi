import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatbotFrame from './ChatbotFrame';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[400px] h-[600px] max-h-[80vh] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <ChatbotFrame />
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen 
          ? 'bg-white text-gray-500 hover:bg-gray-50' 
          : 'bg-primary text-white hover:rotate-12 shadow-primary/40'
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-4 border-white flex items-center justify-center animate-bounce">
            1
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
