import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, User as UserIcon } from 'lucide-react';
import axiosInstance from '@services/api/axiosInstance';

const ChatbotFrame = () => {
  const quickPrompts = [
    'Show my appointments',
    'Free slots tomorrow',
    'Available services',
    'How payment works',
  ];

  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hi! I'm Zilla AI. How can I help you manage your appointments today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isTyping) return;

    const userMessage = { role: 'user', content: trimmedMessage };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Connect to Zilla Backend AI API
      const response = await axiosInstance.post('/ai/chat', { message: trimmedMessage });
      
      if (response.data && response.data.success) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: response.data.data.content 
        }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I couldn't reach the assistant service. Please try again in a moment."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  return (
    <div className="bg-white rounded-[30px] border border-gray-100 flex flex-col h-full overflow-hidden shadow-2xl shadow-black/5">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gradient-to-r from-primary to-primary/80 text-white flex-shrink-0">
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
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/30 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              msg.role === 'bot' 
              ? 'bg-primary/10 text-primary border border-primary/10' 
              : 'bg-gray-200 text-gray-500'
            }`}>
              {msg.role === 'bot' ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm border text-sm font-medium ${
              msg.role === 'bot' 
              ? 'bg-white rounded-tl-none border-gray-100 text-gray-700 italic' 
              : 'bg-primary text-white rounded-tr-none border-primary shadow-lg shadow-primary/20'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-white rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
              <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-50 bg-white flex-shrink-0">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isTyping}
              onClick={() => sendMessage(prompt)}
              className="shrink-0 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-500 transition-all hover:border-primary/30 hover:text-primary disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Type your message..."
            value={input}
            disabled={isTyping}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="absolute right-2 top-2 p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-4">
          Chat powered by Zilla Intelligence
        </p>
      </div>
    </div>
  );
};

export default ChatbotFrame;
