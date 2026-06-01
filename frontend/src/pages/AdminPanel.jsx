import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, getQuizzes, deleteQuiz } from '../api/api';
import toast from 'react-hot-toast';
import { Trash2, Users, BookOpen, Shield } from 'lucide-react';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [tab, setTab] = useState('users');

  const load = () => {
    getAllUsers().then(r => setUsers(r.data)).catch(() => {});
    getQuizzes().then(r => setQuizzes(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try { await deleteUser(id); toast.success('User deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    try { await deleteQuiz(id); toast.success('Quiz deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const roleBadge = { admin: 'bg-orange-100 text-orange-600', teacher: 'bg-purple-100 text-purple-600', student: 'bg-blue-100 text-blue-600' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={28} className="text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">⚙️ Admin Panel</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <Users size={24} className="text-blue-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{users.length}</div>
          <div className="text-xs text-gray-400">Total Users</div>
        </div>
        <div className="card text-center">
          <BookOpen size={24} className="text-green-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{quizzes.length}</div>
          <div className="text-xs text-gray-400">Total Quizzes</div>
        </div>
        <div className="card text-center">
          <Shield size={24} className="text-purple-500 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{users.filter(u => u.role === 'teacher').length}</div>
          <div className="text-xs text-gray-400">Teachers</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {['users', 'quizzes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-500'}`}>
            {t === 'users' ? `👥 Users (${users.length})` : `📚 Quizzes (${quizzes.length})`}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'users' && (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{u.avatar}</span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-xs ${roleBadge[u.role]}`}>{u.role}</span>
                  <span className="text-xs text-gray-400">{u.total_points} pts</span>
                  <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'quizzes' && (
          <div className="space-y-3">
            {quizzes.map(q => (
              <div key={q.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white text-sm">{q.title}</p>
                  <p className="text-xs text-gray-400">{q.subject} • {q.difficulty} • {q.question_count} questions</p>
                </div>
                <button onClick={() => handleDeleteQuiz(q.id)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
