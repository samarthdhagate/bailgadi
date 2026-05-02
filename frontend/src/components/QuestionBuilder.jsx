import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const QuestionBuilder = ({ questions = [], onChange }) => {
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      label: '',
      type: 'text',
      required: false
    };
    onChange([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    onChange(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Booking Questions</h3>
          <p className="text-sm text-gray-500">Add custom questions for your customers to answer when booking.</p>
        </div>
        <Button variant="secondary" onClick={addQuestion} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400">No custom questions added yet.</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q.id} className="flex gap-4 p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow group">
              <div className="pt-2 text-gray-300">
                <GripVertical className="w-5 h-5 cursor-move" />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label={`Question ${index + 1}`}
                    placeholder="e.g. Do you have any allergies?"
                    value={q.label}
                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                  />
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      Required
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-700"
                    >
                      <option value="text">Short Answer</option>
                      <option value="textarea">Long Answer</option>
                      <option value="number">Number</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionBuilder;
