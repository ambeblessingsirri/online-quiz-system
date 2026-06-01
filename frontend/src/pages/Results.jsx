import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserPerformance } from '../api/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

export default function Results() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    getUserPerformance(user.id).then(r => setData(r.data)).catch(() => toast.error('Failed to load results'));
  }, [user]);

  if (!data) return <div className="flex justify-center items-center h-64 text-gray-400">Loading results...</div>;
  if (!data.timeline || data.timeline.length === 0)
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
      <div className="text-5xl mb-4">📊</div>
      <p className="text-xl">No quiz attempts yet. Take your first quiz!</p>
    </div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">📊 My Performance</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Attempts', value: data.total_attempts, color: 'text-blue-600' },
          { label: 'Overall Average', value: `${data.overall_avg}%`, color: data.overall_avg >= 70 ? 'text-green-600' : 'text-yellow-500' },
          { label: 'Current Streak', value: `${data.streak} 🔥`, color: 'text-orange-500' },
          { label: 'Total Points', value: data.total_points, color: 'text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="card text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {data.badges.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-800 dark:text-white mb-3">🏅 My Badges</h2>
          <div className="flex flex-wrap gap-2">
            {data.badges.map((b, i) => (
              <span key={i} className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm">{b}</span>
            ))}
          </div>
        </div>
      )}

      {/* Score Timeline */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-800 dark:text-white mb-4">📈 Score Over Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
            <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={2} dot={{ r: 4, fill: '#16a34a' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Breakdown */}
      <div className="card">
        <h2 className="font-bold text-gray-800 dark:text-white mb-4">📚 Performance by Subject</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.subject_summary}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
            <Bar dataKey="avg_score" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.subject_summary.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{s.subject}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400">{s.attempts} attempts</span>
                <span className={`font-bold ${s.avg_score >= 70 ? 'text-green-600' : s.avg_score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {s.avg_score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
