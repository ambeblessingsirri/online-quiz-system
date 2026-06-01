import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const emptyQuestion = () => ({
  question_text: '', question_type: 'mcq', options: ['', '', '', ''],
  correct_answer: '', explanation: '', topic_tag: '', points: 10
});

export default function CreateQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: '', subject: '', topic: '', difficulty: 'medium', time_limit: 600, max_attempts: 3
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(false);

  const updateQ = (i, field, value) => {
    const qs = [...questions];
    qs[i] = { ...qs[i], [field]: value };
    setQuestions(qs);
  };

  const updateOption = (qi, oi, value) => {
    const qs = [...questions];
    qs[qi].options[oi] = value;
    setQuestions(qs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const q of questions) {
      if (!q.question_text.trim() || !q.correct_answer.trim()) {
        toast.error('All questions must have text and a correct answer');
        return;
      }
    }
    setLoading(true);
    try {
      await createQuiz({ ...quiz, created_by: user.id, questions });
      toast.success('Quiz created successfully!');
      navigate('/quizzes');
    } catch {
      toast.error('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">➕ Create New Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Details */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-700 dark:text-gray-200">Quiz Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input className="input" placeholder="e.g. Algebra Basics" value={quiz.title}
                onChange={e => setQuiz({ ...quiz, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <input className="input" placeholder="e.g. Mathematics" value={quiz.subject}
                onChange={e => setQuiz({ ...quiz, subject: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
              <input className="input" placeholder="e.g. Quadratic Equations" value={quiz.topic}
                onChange={e => setQuiz({ ...quiz, topic: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
              <select className="input" value={quiz.difficulty} onChange={e => setQuiz({ ...quiz, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (seconds)</label>
              <input className="input" type="number" min="60" value={quiz.time_limit}
                onChange={e => setQuiz({ ...quiz, time_limit: parseInt(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Attempts</label>
              <input className="input" type="number" min="1" value={quiz.max_attempts}
                onChange={e => setQuiz({ ...quiz, max_attempts: parseInt(e.target.value) })} />
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, qi) => (
          <div key={qi} className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-200">Question {qi + 1}</h3>
              {questions.length > 1 && (
                <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}
                  className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="Question text" value={q.question_text}
                onChange={e => updateQ(qi, 'question_text', e.target.value)} required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select className="input" value={q.question_type} onChange={e => updateQ(qi, 'question_type', e.target.value)}>
                    <option value="mcq">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Topic Tag</label>
                  <input className="input" placeholder="e.g. Equations" value={q.topic_tag}
                    onChange={e => updateQ(qi, 'topic_tag', e.target.value)} />
                </div>
              </div>

              {q.question_type === 'mcq' && (
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <input key={oi} className="input text-sm" placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      value={opt} onChange={e => updateOption(qi, oi, e.target.value)} />
                  ))}
                </div>
              )}

              <input className="input" placeholder="Correct answer (must match an option exactly)" value={q.correct_answer}
                onChange={e => updateQ(qi, 'correct_answer', e.target.value)} required />
              <input className="input" placeholder="Explanation (optional)" value={q.explanation}
                onChange={e => updateQ(qi, 'explanation', e.target.value)} />
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <button type="button" onClick={() => setQuestions([...questions, emptyQuestion()])}
            className="btn-secondary flex items-center gap-2">
            <Plus size={16} /> Add Question
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
            {loading ? 'Creating...' : '✅ Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
