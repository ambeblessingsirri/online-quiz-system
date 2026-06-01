import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, LogOut, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = {
    student: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/quizzes', label: 'Quizzes' },
      { to: '/results', label: 'My Progress' },
      { to: '/leaderboard', label: '🏆 Leaderboard' },
      { to: '/ai', label: '🤖 AI Advisor' },
    ],
    teacher: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/quizzes', label: 'Browse Quizzes' },
      { to: '/teacher', label: 'My Quizzes' },
      { to: '/create-quiz', label: '+ Create Quiz' },
      { to: '/leaderboard', label: '🏆 Leaderboard' },
    ],
    admin: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/admin', label: '⚙️ Admin Panel' },
      { to: '/leaderboard', label: '🏆 Leaderboard' },
      { to: '/ai', label: '🤖 AI Clusters' },
    ],
  };

  const links = user ? (navLinks[user.role] || []) : [];

  return (
    <nav className="bg-green-700 dark:bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen size={24} />
          <span>QuizMaster</span>
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className="hover:text-green-200 dark:hover:text-yellow-300 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="text-green-100 text-sm hidden md:block">
              {user.avatar} {user.username}
            </span>
          )}
          <button onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-green-600 dark:hover:bg-gray-700 transition-colors">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user && (
            <button onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-sm">
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
