import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronRight } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const QuestionBuilder = ({ questions = [], onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newQ, setNewQ] = useState({ label: '', type: 'text', required: false });

  const addQuestion = () => {
    if (!newQ.label) return;
    onChange([...questions, { ...newQ, id: Date.now() }]);
    setNewQ({ label: '', type: 'text', required: false });
    setIsAdding(false);
  };

  const removeQuestion = (id) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    onChange(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  return (
    <div className="space-y-6">
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">
          <div className="col-span-4">Question</div>
          <div className="col-span-3">Answer type</div>
          <div className="col-span-3">Answer</div>
          <div className="col-span-1 text-center">Mandatory</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div className="space-y-1">
          {questions.map((q) => (
            <div key={q.id} className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 items-center group hover:bg-gray-50 transition-colors">
              <div className="col-span-4 font-bold text-gray-700 italic">{q.label}</div>
              <div className="col-span-3 text-sm text-gray-400">
                {q.type === 'text' && 'Single line text'}
                {q.type === 'textarea' && 'Multi-line text'}
                {q.type === 'phone' && 'Phone Number'}
                {q.type === 'radio' && 'Radio(One Answer)'}
                {q.type === 'checkbox' && 'Checkboxes(Multiple Answers)'}
              </div>
              <div className="col-span-3 text-sm text-gray-300 italic">
                {q.type === 'text' && 'Sample text answer...'}
                {q.type === 'phone' && '9874563210'}
                {q.type === 'textarea' && 'Detailed message...'}
              </div>
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="p-1 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Inline Add Question */}
        {isAdding ? (
          <div className="mt-8 p-8 bg-gray-50 rounded-[30px] border-2 border-primary/20 space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {[
                { id: 'text', label: 'Single line text' },
                { id: 'textarea', label: 'Multi-line text' },
                { id: 'phone', label: 'Phone Number' },
                { id: 'radio', label: 'Radio(One Answer)' },
                { id: 'checkbox', label: 'Checkboxes(Multiple Answers)' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setNewQ({ ...newQ, type: type.id })}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border-2 ${
                    newQ.type === type.id ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question</p>
              <input
                type="text"
                autoFocus
                placeholder="Anything else we should know?"
                value={newQ.label}
                onChange={(e) => setNewQ({ ...newQ, label: e.target.value })}
                className="w-full text-2xl font-bold text-gray-800 border-b-2 border-gray-200 bg-transparent outline-none focus:border-primary transition-colors pb-2"
              />
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={newQ.required}
                  onChange={(e) => setNewQ({ ...newQ, required: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="font-bold text-gray-700 italic group-hover:text-primary transition-colors">Mandatory Answer</span>
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button onClick={addQuestion}>Add Question</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-6 px-6 py-3 font-bold text-primary hover:bg-primary/5 rounded-xl transition-all italic underline"
          >
            Add a question
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionBuilder;
