import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRecommendations, getClusters } from '../api/api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Users } from 'lucide-react';

export default function AIAdvisor() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [tab, setTab] = useState('plan');

  useEffect(() => {
    getRecommendations(user.id).then(r => setPlan(r.data)).catch(() => toast.error('AI service unavailable'));
    getClusters().then(r => setClusters(r.data)).catch(() => {});
  }, [user]);

  if (!plan) return <div className="flex justify-center items-center h-64 text-gray-400">🤖 AI is analyzing your data...</div>;

  const radarData = [
    ...plan.weak_areas.map(w => ({ topic: w.topic, score: w.avg_score })),
    ...plan.strong_areas.map(s => ({ topic: s.topic, score: s.avg_score })),
  ].slice(0, 6);

  const difficultyColor = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
          <Brain size={24} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🤖 AI Learning Advisor</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Powered by Machine Learning & Data Mining</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {['plan', 'analysis', 'clusters'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white dark:bg-gray-700 shadow text-green-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t === 'plan' ? '📋 Study Plan' : t === 'analysis' ? '📊 Analysis' : '👥 ML Clusters'}
          </button>
        ))}
      </div>

      {/* STUDY PLAN TAB */}
      {tab === 'plan' && (
        <div className="space-y-5">
          {/* Trend + Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-blue-500" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Performance Trend</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{plan.trend.trend}</p>
              <p className="text-sm text-gray-400">Slope: {plan.trend.slope} per quiz</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={18} className="text-purple-500" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Adaptive Difficulty</h3>
              </div>
              <span className={`inline-block px-4 py-2 rounded-xl text-lg font-bold capitalize ${difficultyColor[plan.recommended_difficulty] || 'bg-gray-100 text-gray-600'}`}>
                {plan.recommended_difficulty} quizzes recommended
              </span>
              <p className="text-xs text-gray-400 mt-1">Based on your last 3 quiz scores</p>
            </div>
          </div>

          {/* Personalised Study Plan */}
          <div className="card">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span>📋</span> Your Personalised Study Plan
            </h3>
            {plan.study_plan.length === 0
              ? <p className="text-gray-400">Take more quizzes to generate your study plan!</p>
              : <div className="space-y-3">
                  {plan.study_plan.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-gray-700 dark:text-gray-200 text-sm">{step}</p>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Collaborative Filtering */}
          {plan.collaborative_recs.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Users size={18} className="text-blue-500" /> Collaborative Filtering Recommendations
              </h3>
              <p className="text-xs text-gray-400 mb-3">Based on students with similar performance profiles</p>
              <div className="space-y-2">
                {plan.collaborative_recs.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">{r.topic}</p>
                      <p className="text-xs text-gray-400">{r.reason}</p>
                    </div>
                    <span className="text-green-600 font-semibold text-sm">+{r.improvement}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ANALYSIS TAB */}
      {tab === 'analysis' && (
        <div className="space-y-5">
          {/* Weak vs Strong */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-bold text-red-500 mb-3 flex items-center gap-2"><AlertTriangle size={16}/>Weak Areas (Data Mining)</h3>
              {plan.weak_areas.length === 0
                ? <p className="text-gray-400 text-sm">No weak areas detected! Great job! 🎉</p>
                : plan.weak_areas.map((w, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-200">{w.topic}</span>
                        <span className="font-bold text-red-500">{w.avg_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="h-2 bg-red-400 rounded-full" style={{ width: `${w.avg_score}%` }} />
                      </div>
                    </div>
                  ))
              }
            </div>
            <div className="card">
              <h3 className="font-bold text-green-600 mb-3 flex items-center gap-2"><CheckCircle size={16}/>Strong Areas</h3>
              {plan.strong_areas.length === 0
                ? <p className="text-gray-400 text-sm">Keep taking quizzes to discover your strengths!</p>
                : plan.strong_areas.map((s, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-200">{s.topic}</span>
                        <span className="font-bold text-green-600">{s.avg_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="h-2 bg-green-400 rounded-full" style={{ width: `${s.avg_score}%` }} />
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">📡 Topic Performance Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11 }} />
                  <Radar dataKey="score" stroke="#16a34a" fill="#16a34a" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ML CLUSTERS TAB */}
      {tab === 'clusters' && (
        <div className="space-y-5">
          <div className="card">
            <h3 className="font-bold text-gray-800 dark:text-white mb-2">🔬 K-Means Student Clustering</h3>
            <p className="text-xs text-gray-400 mb-4">Students are automatically grouped into performance tiers using the K-Means algorithm (scikit-learn)</p>

            {clusters.length === 0
              ? <p className="text-gray-400">Not enough students yet to cluster.</p>
              : <>
                  {/* Scatter Plot */}
                  <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="total_attempts" name="Attempts" label={{ value: 'Attempts', position: 'insideBottom', offset: -5 }} />
                      <YAxis dataKey="avg_score" name="Avg Score" label={{ value: 'Score %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                        if (!payload?.length) return null;
                        const d = payload[0].payload;
                        return <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs shadow">
                          <p className="font-bold">{d.username}</p>
                          <p>Score: {d.avg_score}%</p>
                          <p>Tier: <span style={{ color: d.tier_color }}>{d.tier}</span></p>
                        </div>;
                      }} />
                      <Scatter data={clusters} fill="#16a34a">
                        {clusters.map((entry, i) => (
                          <circle key={i} fill={entry.tier_color} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>

                  {/* Cluster List */}
                  <div className="mt-4 space-y-2">
                    {clusters.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{s.avatar || '🎓'}</span>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white text-sm">{s.username}</p>
                            <p className="text-xs text-gray-400">{s.total_attempts} attempts</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-700 dark:text-gray-200">{s.avg_score}%</span>
                          <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: s.tier_color + '20', color: s.tier_color }}>{s.tier}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Beginner (&lt;60%)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Intermediate (60-80%)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Advanced (&gt;80%)</span>
                  </div>
                </>
            }
          </div>
        </div>
      )}
    </div>
  );
}
