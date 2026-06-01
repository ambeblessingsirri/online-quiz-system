import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';

export default function QuizTaker() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confidence, setConfidence] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    getQuiz(id).then(r => {
      setQuiz(r.data);
      setTimeLeft(r.data.time_limit);
    }).catch(() => toast.error('Quiz not found'));
  }, [id]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    try {
      const res = await submitQuiz({
        quiz_id: parseInt(id),
        user_id: user.id,
        answers,
        confidence_ratings: confidence,
        time_taken: timeTaken
      });
      setResult(res.data);
      if (auto) toast('⏰ Time is up! Quiz auto-submitted.', { icon: '⏰' });
    } catch {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }, [answers, confidence, id, user, startTime, submitting]);

  useEffect(() => {
    if (!started || result) return;
    if (timeLeft <= 0) { handleSubmit(true); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, started, result, handleSubmit]);

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  if (!quiz) return <div className="flex justify-center items-center h-64 text-gray-400">Loading quiz...</div>;

  const q = quiz.questions[current];
  const totalQ = quiz.questions.length;
  const progress = ((current + 1) / totalQ) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerColor = timeLeft < 60 ? 'text-red-500 animate-pulse' : timeLeft < 180 ? 'text-yellow-500' : 'text-green-600';

  // ── Start Screen ──────────────────────
  if (!started) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="card">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{quiz.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{quiz.subject} • {quiz.topic} • {quiz.difficulty}</p>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            ['Questions', totalQ],
            ['Time Limit', `${Math.floor(quiz.time_limit / 60)} min`],
            ['Points Each', '10 pts'],
          ].map(([label, val]) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <div className="text-xl font-bold text-green-600">{val}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
        <button onClick={handleStart} className="btn-primary text-lg px-8 py-3">Start Quiz 🚀</button>
      </div>
    </div>
  );

  // ── Results Screen ──────────────────────
  if (result) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card text-center mb-6">
        <div className="text-6xl mb-3">{result.score >= 80 ? '🎉' : result.score >= 60 ? '👍' : '💪'}</div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{result.score}%</h1>
        <p className="text-gray-500 mt-1">{result.correct} out of {result.total} correct • +{result.points_earned} points</p>
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div className="h-4 rounded-full transition-all duration-1000"
              style={{ width: `${result.score}%`, backgroundColor: result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Question Review</h2>
        <div className="space-y-4">
          {result.feedback.map((f, i) => (
            <div key={i} className={`p-4 rounded-xl border-l-4 ${f.is_correct ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-red-500 bg-red-50 dark:bg-red-900/10'}`}>
              <div className="flex items-start gap-2">
                {f.is_correct ? <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" /> : <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-white text-sm">{f.question_text}</p>
                  {!f.is_correct && <p className="text-xs text-red-500 mt-1">Your answer: {f.your_answer || '(not answered)'}</p>}
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">✓ {f.correct_answer}</p>
                  {f.explanation && <p className="text-xs text-gray-500 mt-1 italic">{f.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/quizzes')} className="btn-secondary flex-1">Browse More Quizzes</button>
        <button onClick={() => navigate('/ai')} className="btn-primary flex-1">🤖 Get AI Recommendations</button>
      </div>
    </div>
  );

  // ── Quiz Taking Screen ──────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">Question {current + 1} of {totalQ}</span>
        <span className={`font-mono font-bold text-lg flex items-center gap-1 ${timerColor}`}>
          <Clock size={18} /> {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
        <div className="h-2 bg-green-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="card">
        {/* Topic Tag */}
        {q.topic_tag && (
          <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full mb-3">{q.topic_tag}</span>
        )}

        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">{q.question_text}</h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.question_type === 'true_false'
            ? ['True', 'False'].map(opt => (
                <button key={opt} onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${answers[q.id] === opt ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-600 hover:border-green-300'}`}>
                  {opt}
                </button>
              ))
            : q.options.map((opt, i) => (
                <button key={i} onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${answers[q.id] === opt ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-200 dark:border-gray-600 hover:border-green-300'}`}>
                  <span className="font-bold mr-2 text-gray-400">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              ))
          }
        </div>

        {/* Confidence Meter */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">How confident are you? (AI uses this)</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setConfidence({ ...confidence, [q.id]: n })}
                className={`flex-1 py-1 rounded-lg text-sm font-medium transition-all ${confidence[q.id] === n ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-green-100'}`}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Not sure</span><span>Very sure</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0} className="btn-secondary flex items-center gap-1 disabled:opacity-40">
            <ChevronLeft size={16} /> Prev
          </button>
          {current < totalQ - 1
            ? <button onClick={() => setCurrent(c => c + 1)} className="btn-primary flex-1 flex items-center justify-center gap-1">
                Next <ChevronRight size={16} />
              </button>
            : <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
                {submitting ? 'Submitting...' : '✅ Submit Quiz'}
              </button>
          }
        </div>
      </div>

      {/* Answer progress dots */}
      <div className="flex gap-1 mt-4 flex-wrap justify-center">
        {quiz.questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${i === current ? 'bg-green-500 text-white scale-110' : answers[quiz.questions[i].id] ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
