import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronRight, MessageSquare, Type, Phone, Radio, CheckSquare, X } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const QuestionBuilder = ({ questions = [], onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newQ, setNewQ] = useState({ label: '', type: 'text', required: false, options: [''] });

  const questionTypes = [
    { id: 'text', label: 'Single line text', icon: Type },
    { id: 'textarea', label: 'Multi-line text', icon: MessageSquare },
    { id: 'phone', label: 'Phone Number', icon: Phone },
    { id: 'radio', label: 'Radio(One Answer)', icon: Radio },
    { id: 'checkbox', label: 'Checkboxes(Multiple Answers)', icon: CheckSquare }
  ];

  const addQuestion = () => {
    if (!newQ.label) return;
    // Filter out empty options for choice types
    const filteredOptions = (newQ.type === 'radio' || newQ.type === 'checkbox') 
      ? newQ.options.filter(opt => opt.trim() !== '') 
      : [];
      
    onChange([...questions, { ...newQ, id: Date.now(), options: filteredOptions }]);
    setNewQ({ label: '', type: 'text', required: false, options: [''] });
    setIsAdding(false);
  };

  const removeQuestion = (id) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    onChange(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQ.options];
    updatedOptions[index] = value;
    setNewQ({ ...newQ, options: updatedOptions });
  };

  const addOptionField = () => {
    setNewQ({ ...newQ, options: [...newQ.options, ''] });
  };

  const removeOptionField = (index) => {
    const updatedOptions = newQ.options.filter((_, i) => i !== index);
    setNewQ({ ...newQ, options: updatedOptions });
  };

  return (
    <div className="space-y-8">
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-8 py-4 bg-gray-50/50 rounded-2xl text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6">
          <div className="col-span-4">Question</div>
          <div className="col-span-3">Answer type</div>
          <div className="col-span-3">Preview</div>
          <div className="col-span-1 text-center">Mandatory</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q.id} className="grid grid-cols-12 px-8 py-5 border border-transparent border-b-gray-100 items-center group hover:border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-black/5 hover:rounded-2xl transition-all duration-300">
              <div className="col-span-4 font-bold text-gray-800 italic">{q.label}</div>
              <div className="col-span-3">
                <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-tighter">
                  {questionTypes.find(t => t.id === q.type)?.label || q.type}
                </span>
              </div>
              <div className="col-span-3 text-sm text-gray-300 font-medium">
                {q.type === 'text' && 'Sample text answer...'}
                {q.type === 'phone' && '+91 98765 43210'}
                {q.type === 'textarea' && 'Detailed multi-line message...'}
                {(q.type === 'radio' || q.type === 'checkbox') && (q.options?.join(', ') || 'Option A, Option B...')}
              </div>
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                  className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary cursor-pointer transition-all"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Question UI */}
        {isAdding ? (
          <div className="mt-10 p-10 bg-white border-2 border-primary/20 rounded-[40px] shadow-2xl shadow-primary/5 animate-in slide-in-from-top-4 duration-500 space-y-10">
            {/* Type Selector */}
            <div className="space-y-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Select Answer Type</p>
               <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {questionTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewQ({ ...newQ, type: type.id })}
                      className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                        newQ.type === type.id 
                        ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' 
                        : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-100 hover:text-gray-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${newQ.type === type.id ? 'text-primary' : 'text-gray-300'}`} />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Question Title</p>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. What is your blood group?"
                  value={newQ.label}
                  onChange={(e) => setNewQ({ ...newQ, label: e.target.value })}
                  className="w-full text-3xl font-bold text-gray-800 border-b-2 border-gray-100 bg-transparent outline-none focus:border-primary transition-all pb-4 placeholder:text-gray-100"
                />
              </div>

              {/* Dynamic Options for Radio/Checkbox */}
              {(newQ.type === 'radio' || newQ.type === 'checkbox') && (
                <div className="space-y-4 bg-gray-50 p-8 rounded-[30px] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Options</p>
                  <div className="space-y-3">
                    {newQ.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3 animate-in fade-in duration-300">
                        <div className={`w-4 h-4 border-2 rounded-${newQ.type === 'radio' ? 'full' : 'md'} border-gray-300`} />
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="flex-1 bg-white border border-gray-100 px-4 py-2 rounded-xl font-bold text-sm text-gray-700 focus:border-primary outline-none"
                        />
                        <button 
                          onClick={() => removeOptionField(idx)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={addOptionField}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-all italic underline"
                    >
                      <Plus className="w-3 h-3" />
                      Add another option
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    newQ.required ? 'bg-primary border-primary' : 'border-gray-200 group-hover:border-primary/50'
                  }`}>
                    {newQ.required && <Plus className="w-4 h-4 text-white rotate-45" />}
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={newQ.required}
                      onChange={(e) => setNewQ({ ...newQ, required: e.target.checked })}
                    />
                  </div>
                  <span className="font-bold text-gray-700 italic group-hover:text-primary transition-colors">Mandatory Answer</span>
                </label>

                <div className="flex gap-4">
                  <Button variant="secondary" className="px-8" onClick={() => setIsAddingUser(false)}>Cancel</Button>
                  <Button className="px-10" onClick={addQuestion}>Add Question</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingUser(true)}
            className="mt-8 group flex items-center gap-3 px-8 py-4 bg-primary/5 text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Add a question
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionBuilder;
