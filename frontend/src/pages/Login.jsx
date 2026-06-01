import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.user);
      toast.success(`Welcome back, ${res.data.user.username}! ${res.data.user.avatar}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (username, password) => {
    setForm({ username, password });
    setLoading(true);
    try {
      const res = await loginUser({ username, password });
      login(res.data.user);
      toast.success(`Logged in as ${username}`);
      navigate('/dashboard');
    } catch {
      toast.error('Demo login failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QuizMaster</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Online Quiz & Practice System</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-white">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input className="input" placeholder="Enter your username"
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input className="input" type="password" placeholder="Enter your password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full text-center mt-2 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => demoLogin('student1', 'student123')}
                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                🎓 Student
              </button>
              <button onClick={() => demoLogin('teacher1', 'teacher123')}
                className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                👨‍🏫 Teacher
              </button>
              <button onClick={() => demoLogin('admin', 'admin123')}
                className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 py-2 rounded-lg hover:bg-orange-200 transition-colors">
                ⚙️ Admin
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            No account? <Link to="/register" className="text-green-600 hover:underline font-medium">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
