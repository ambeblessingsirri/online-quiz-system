import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getClassPerformance, getQuizzes, deleteQuiz } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';

export default function TeacherPanel() {
  const { user } = useAuth();
  const [classData, setClassData] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);

  const load = () => {
    getClassPerformance(user.id).then(r => setClassData(r.data)).catch(() => {});
    getQuizzes().then(r => setMyQuizzes(r.data.filter(q => q.created_by === user.id || true))).catch(() => {});
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await deleteQuiz(id);
      toast.success('Quiz deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">👨‍🏫 Teacher Dashboard</h1>
        <Link to="/create-quiz" className="btn-primary flex items-center gap-2"><Plus size={16}/>Create Quiz</Link>
      </div>

      {/* Class Performance Chart */}
      {classData.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4">📊 Class Performance Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quiz_title" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avg_score" fill="#16a34a" radius={[6, 6, 0, 0]} name="Avg Score %" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {classData.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{d.quiz_title}</p>
                  <p className="text-xs text-gray-400">{d.attempts} students attempted</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{d.avg_score}%</p>
                  <p className="text-xs text-gray-400">High: {d.highest}% | Low: {d.lowest}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Quizzes */}
      <div className="card">
        <h2 className="font-bold text-gray-800 dark:text-white mb-4">📚 All Quizzes</h2>
        {myQuizzes.length === 0
          ? <div className="text-center py-8 text-gray-400">
              <p>No quizzes yet.</p>
              <Link to="/create-quiz" className="text-green-600 hover:underline mt-2 inline-block">Create your first quiz →</Link>
            </div>
          : <div className="space-y-3">
              {myQuizzes.map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{q.title}</p>
                    <p className="text-xs text-gray-400">{q.subject} • {q.difficulty} • {q.question_count} questions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/quiz/${q.id}`} className="text-xs text-green-600 hover:underline">Preview</Link>
                    <button onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
