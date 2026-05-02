import React from 'react';
import { Send, Bot, MessageSquare, Sparkles } from 'lucide-react';

const ChatbotFrame = () => {
  return (
    <div className="bg-white rounded-[30px] border border-gray-100 flex flex-col h-full overflow-hidden shadow-2xl shadow-black/5">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 relative">
          <Bot className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
        </div>
        <div>
          <h3 className="font-black text-sm uppercase tracking-[0.2em]">Zilla AI</h3>
          <p className="text-[10px] font-bold text-white/70 uppercase">Online Helper</p>
        </div>
        <Sparkles className="w-5 h-5 ml-auto text-white/50" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
            <Bot className="w-4 h-4" />
          </div>
          <div className="max-w-[80%] p-4 bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm font-medium text-gray-700 italic">
            Hi! I'm Zilla AI. How can I help you manage your appointments today?
          </div>
        </div>

        <div className="flex items-start gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
            <User className="w-4 h-4" />
          </div>
          <div className="max-w-[80%] p-4 bg-primary text-white rounded-2xl rounded-tr-none shadow-lg shadow-primary/20 text-sm font-medium">
            Show me my schedule for tomorrow.
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
            <Bot className="w-4 h-4" />
          </div>
          <div className="max-w-[80%] p-4 bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm font-medium text-gray-700 italic">
            You have 3 appointments scheduled for tomorrow starting at 9:00 AM.
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-50 bg-white">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Type your message..."
            className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all transition-duration-300"
          />
          <button className="absolute right-2 top-2 p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-4">
          Chat powered by Zilla Intelligence
        </p>
      </div>
    </div>
  );
};

// Mock User icon for Chatbot
const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default ChatbotFrame;
