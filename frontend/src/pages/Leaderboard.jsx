import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const RANK_STYLE = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600'];
const RANK_EMOJI = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    getLeaderboard().then(r => setBoard(r.data)).catch(() => toast.error('Failed to load leaderboard'));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">🏆 Leaderboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Top students ranked by total points</p>
      </div>

      {/* Top 3 Podium */}
      {board.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {[board[1], board[0], board[2]].map((entry, i) => {
            const realRank = i === 0 ? 1 : i === 1 ? 0 : 2;
            return (
              <div key={entry.user_id} className={`flex flex-col items-center ${i === 1 ? 'mb-0' : 'mb-4'}`}>
                <span className="text-3xl mb-1">{entry.avatar}</span>
                <span className="font-bold text-sm text-gray-700 dark:text-gray-200">{entry.username}</span>
                <span className="text-xs text-gray-500">{entry.total_points} pts</span>
                <div className={`w-16 ${i === 1 ? 'h-20' : 'h-14'} ${RANK_STYLE[realRank]} rounded-t-xl mt-2 flex items-center justify-center text-2xl`}>
                  {RANK_EMOJI[realRank]}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <div className="card">
        <div className="space-y-3">
          {board.map((entry, i) => (
            <div key={entry.user_id}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${entry.user_id === user?.id ? 'bg-green-50 dark:bg-green-900/20 border border-green-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
              <div className="w-8 text-center font-bold text-gray-500 dark:text-gray-400">
                {i < 3 ? RANK_EMOJI[i] : `#${i + 1}`}
              </div>
              <span className="text-2xl">{entry.avatar}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  {entry.username}
                  {entry.user_id === user?.id && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-0.5 rounded-full">You</span>}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-3">
                  <span>{entry.quizzes_taken} quizzes</span>
                  <span>Avg: {entry.avg_score}%</span>
                  {entry.streak > 0 && <span className="flex items-center gap-1 text-orange-500"><Zap size={10}/>{entry.streak} streak</span>}
                </div>
                {entry.badges.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {entry.badges.map((b, j) => <span key={j} className="text-xs">{b}</span>)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{entry.total_points}</div>
                <div className="text-xs text-gray-400">points</div>
              </div>
            </div>
          ))}
        </div>
        {board.length === 0 && (
          <div className="text-center py-8 text-gray-400">No data yet. Be the first on the board!</div>
        )}
      </div>
    </div>
  );
}
