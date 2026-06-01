import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzes } from '../api/api';
import { Clock, BookOpen, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DIFFICULTY_STYLE = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getQuizzes().then(r => {
      setQuizzes(r.data);
      setFiltered(r.data);
    }).catch(() => toast.error('Could not load quizzes'));
  }, []);

  useEffect(() => {
    let result = quizzes;
    if (subject) result = result.filter(q => q.subject === subject);
    if (difficulty) result = result.filter(q => q.difficulty === difficulty);
    if (search) result = result.filter(q => q.title.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [subject, difficulty, search, quizzes]);

  const subjects = [...new Set(quizzes.map(q => q.subject))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📚 All Quizzes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{filtered.length} quizzes available</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="🔍 Search quizzes..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Quiz Grid */}
      {filtered.length === 0
        ? <div className="text-center py-16 text-gray-400">No quizzes found.</div>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(q => (
              <div key={q.id} className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{
                    q.subject === 'Mathematics' ? '📐' :
                    q.subject === 'Science' ? '🔬' :
                    q.subject === 'History' ? '🏛️' :
                    q.subject === 'Computer Science' ? '💻' : '📚'
                  }</span>
                  <span className={`badge ${DIFFICULTY_STYLE[q.difficulty]}`}>{q.difficulty}</span>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">{q.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{q.subject} • {q.topic}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><BookOpen size={12}/> {q.question_count} questions</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> {Math.floor(q.time_limit / 60)} min</span>
                  <span className="flex items-center gap-1"><BarChart2 size={12}/> {q.max_attempts} attempts</span>
                </div>
                <div className="mt-auto">
                  <Link to={`/quiz/${q.id}`} className="btn-primary w-full text-center block text-sm">
                    Start Quiz →
                  </Link>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}
