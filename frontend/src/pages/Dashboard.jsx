import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAttempts, getQuizzes } from '../api/api';
import { BookOpen, Trophy, Zap, Target, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    if (user?.role === 'student') {
      getUserAttempts(user.id).then(r => setAttempts(r.data)).catch(() => {});
    }
    getQuizzes().then(r => setQuizzes(r.data)).catch(() => {});
  }, [user]);

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
    : 0;

  const recentAttempts = attempts.slice(0, 3);

  const difficultyColor = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{user?.avatar} Welcome back, {user?.username}!</h1>
            <p className="text-green-100 mt-1 capitalize">Role: {user?.role} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-3xl font-bold">{user?.total_points || 0}</div>
            <div className="text-green-100 text-sm">Total Points</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Quizzes Taken', value: attempts.length, icon: <BookOpen size={22} />, color: 'text-blue-600' },
            { label: 'Avg Score', value: `${avgScore}%`, icon: <Target size={22} />, color: 'text-green-600' },
            { label: 'Study Streak', value: `${user?.streak || 0} days 🔥`, icon: <Zap size={22} />, color: 'text-orange-500' },
            { label: 'Badges', value: (JSON.parse(localStorage.getItem('quiz_user') || '{}').badges || []).length, icon: <Trophy size={22} />, color: 'text-yellow-500' },
          ].map((stat, i) => (
            <div key={i} className="card text-center">
              <div className={`flex justify-center mb-2 ${stat.color}`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {user?.role === 'student' && <>
                <Link to="/quizzes" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                  <BookOpen size={20} className="text-green-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">Take a Quiz</span>
                </Link>
                <Link to="/ai" className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 transition-colors">
                  <TrendingUp size={20} className="text-purple-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">AI Study Plan</span>
                </Link>
                <Link to="/leaderboard" className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 transition-colors">
                  <Trophy size={20} className="text-yellow-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">Leaderboard</span>
                </Link>
              </>}
              {user?.role === 'teacher' && <>
                <Link to="/create-quiz" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 transition-colors">
                  <BookOpen size={20} className="text-green-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">Create New Quiz</span>
                </Link>
                <Link to="/teacher" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-colors">
                  <TrendingUp size={20} className="text-blue-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">Class Performance</span>
                </Link>
              </>}
              {user?.role === 'admin' && <>
                <Link to="/admin" className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 transition-colors">
                  <Target size={20} className="text-orange-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">Admin Panel</span>
                </Link>
                <Link to="/ai" className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 transition-colors">
                  <TrendingUp size={20} className="text-purple-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">AI Clusters</span>
                </Link>
              </>}
            </div>
          </div>

          {/* Badges */}
          {user?.role === 'student' && (
            <div className="card mt-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">My Badges</h2>
              {(user?.badges || []).length === 0
                ? <p className="text-gray-400 text-sm">Complete quizzes to earn badges!</p>
                : <div className="flex flex-wrap gap-2">
                    {(user?.badges || []).map((b, i) => (
                      <span key={i} className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm px-3 py-1 rounded-full">{b}</span>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>

        {/* Available Quizzes / Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Available Quizzes</h2>
              <Link to="/quizzes" className="text-green-600 text-sm hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {quizzes.slice(0, 4).map(q => (
                <Link key={q.id} to={`/quiz/${q.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">{q.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{q.subject} • {q.question_count} questions</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${difficultyColor[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>{q.difficulty}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} />{Math.floor(q.time_limit / 60)}m</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {user?.role === 'student' && recentAttempts.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentAttempts.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white text-sm">{a.subject} — {a.topic}</div>
                      <div className="text-xs text-gray-500">{new Date(a.completed_at).toLocaleDateString()}</div>
                    </div>
                    <div className={`text-lg font-bold ${a.score >= 70 ? 'text-green-600' : a.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {a.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
