"""
AI & Machine Learning Engine
Implements:
- K-Means Clustering (student performance tiers)
- Weak Area Detection (data mining)
- Adaptive Difficulty (rule-based ML)
- Collaborative Filtering (recommendation)
- Time-Series Trend Analysis
- Confidence vs Accuracy Mining
"""

import json
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from collections import defaultdict


# ─────────────────────────────────────────────
# 1. WEAK AREA DETECTION (Data Mining)
# ─────────────────────────────────────────────
def detect_weak_areas(attempts, threshold=60.0):
    """
    Scans all quiz attempts and flags topics where
    the student's average accuracy is below the threshold.
    """
    topic_scores = defaultdict(list)
    for attempt in attempts:
        topic = attempt.get('topic', 'General')
        score = attempt.get('score', 0)
        topic_scores[topic].append(score)

    weak_areas = []
    strong_areas = []
    for topic, scores in topic_scores.items():
        avg = round(sum(scores) / len(scores), 1)
        entry = {'topic': topic, 'avg_score': avg, 'attempts': len(scores)}
        if avg < threshold:
            weak_areas.append(entry)
        else:
            strong_areas.append(entry)

    weak_areas.sort(key=lambda x: x['avg_score'])
    return weak_areas, strong_areas


# ─────────────────────────────────────────────
# 2. K-MEANS CLUSTERING (Performance Tiers)
# ─────────────────────────────────────────────
def cluster_students(all_students_data):
    """
    Groups students into 3 performance tiers:
    Beginner, Intermediate, Advanced
    using K-Means clustering on avg_score & total_attempts.
    """
    if len(all_students_data) < 3:
        # Not enough data — assign basic tiers manually
        result = []
        for s in all_students_data:
            avg = s.get('avg_score', 0)
            tier = 'Advanced' if avg >= 75 else ('Intermediate' if avg >= 50 else 'Beginner')
            result.append({**s, 'tier': tier, 'tier_color': _tier_color(tier)})
        return result

    features = np.array([[s['avg_score'], s['total_attempts']] for s in all_students_data])
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    labels = kmeans.fit_predict(features_scaled)

    # Map cluster labels to tier names by cluster center avg_score
    centers = scaler.inverse_transform(kmeans.cluster_centers_)
    sorted_centers = sorted(enumerate(centers), key=lambda x: x[1][0])
    tier_map = {sorted_centers[0][0]: 'Beginner',
                sorted_centers[1][0]: 'Intermediate',
                sorted_centers[2][0]: 'Advanced'}

    result = []
    for i, s in enumerate(all_students_data):
        tier = tier_map[labels[i]]
        result.append({**s, 'tier': tier, 'tier_color': _tier_color(tier)})
    return result

def _tier_color(tier):
    return {'Beginner': '#ef4444', 'Intermediate': '#f59e0b', 'Advanced': '#22c55e'}.get(tier, '#6b7280')


# ─────────────────────────────────────────────
# 3. ADAPTIVE DIFFICULTY
# ─────────────────────────────────────────────
def recommend_difficulty(recent_scores):
    """
    Looks at the last 3 quiz scores and recommends
    the next difficulty level.
    """
    if not recent_scores:
        return 'easy'
    last3 = recent_scores[-3:]
    avg = sum(last3) / len(last3)
    if avg >= 80:
        return 'hard'
    elif avg >= 55:
        return 'medium'
    else:
        return 'easy'


# ─────────────────────────────────────────────
# 4. COLLABORATIVE FILTERING (Recommendations)
# ─────────────────────────────────────────────
def collaborative_recommendations(user_id, all_attempts, all_users):
    """
    Finds students with similar weak areas and recommends
    topics that helped them improve.
    """
    # Build user-topic score matrix
    user_topic_scores = defaultdict(lambda: defaultdict(list))
    for a in all_attempts:
        uid = a.get('user_id')
        topic = a.get('topic', 'General')
        score = a.get('score', 0)
        user_topic_scores[uid][topic].append(score)

    # Get current user's weak topics
    current_user_topics = user_topic_scores.get(user_id, {})
    current_weak = {t for t, scores in current_user_topics.items()
                    if sum(scores)/len(scores) < 60}

    # Find similar users (share weak topics)
    similar_users = []
    for uid, topics in user_topic_scores.items():
        if uid == user_id:
            continue
        other_weak = {t for t, scores in topics.items()
                      if sum(scores)/len(scores) < 60}
        overlap = len(current_weak & other_weak)
        if overlap > 0:
            similar_users.append((uid, overlap, topics))

    similar_users.sort(key=lambda x: -x[1])

    # Find topics where similar users improved
    recommendations = []
    seen = set()
    for uid, _, topics in similar_users[:5]:
        for topic, scores in topics.items():
            if topic in current_weak and topic not in seen:
                trend = scores[-1] - scores[0] if len(scores) > 1 else 0
                if trend > 0:
                    recommendations.append({
                        'topic': topic,
                        'reason': f'Students like you improved in this topic',
                        'improvement': round(trend, 1)
                    })
                    seen.add(topic)

    return recommendations[:5]


# ─────────────────────────────────────────────
# 5. TIME-SERIES TREND ANALYSIS
# ─────────────────────────────────────────────
def analyze_trend(scores):
    """
    Determines if a student is Improving, Declining, or Plateauing
    based on recent score trajectory.
    """
    if len(scores) < 2:
        return {'trend': 'Insufficient data', 'slope': 0}

    x = np.arange(len(scores), dtype=float)
    y = np.array(scores, dtype=float)
    slope = float(np.polyfit(x, y, 1)[0])

    if slope > 1.5:
        trend = '📈 Improving'
    elif slope < -1.5:
        trend = '📉 Declining'
    else:
        trend = '➡️ Plateauing'

    return {'trend': trend, 'slope': round(slope, 2)}


# ─────────────────────────────────────────────
# 6. CONFIDENCE vs ACCURACY MINING
# ─────────────────────────────────────────────
def analyze_confidence(attempts_with_confidence):
    """
    Compares student's self-reported confidence with actual accuracy.
    Identifies overconfident and underconfident patterns.
    """
    high_conf_wrong = 0
    low_conf_right = 0
    total = 0

    for item in attempts_with_confidence:
        confidence = item.get('confidence', 3)
        is_correct = item.get('is_correct', False)
        total += 1
        if confidence >= 4 and not is_correct:
            high_conf_wrong += 1
        if confidence <= 2 and is_correct:
            low_conf_right += 1

    if total == 0:
        return {'pattern': 'No data', 'advice': 'Take more quizzes'}

    overconfidence = round((high_conf_wrong / total) * 100, 1)
    underconfidence = round((low_conf_right / total) * 100, 1)

    if overconfidence > 20:
        pattern = '⚠️ Overconfident'
        advice = 'You often feel sure but get answers wrong. Review fundamentals carefully.'
    elif underconfidence > 20:
        pattern = '💡 Underconfident'
        advice = 'You know more than you think! Trust your instincts more.'
    else:
        pattern = '✅ Well-Calibrated'
        advice = 'Your confidence matches your performance well. Keep it up!'

    return {
        'pattern': pattern,
        'advice': advice,
        'overconfidence_rate': overconfidence,
        'underconfidence_rate': underconfidence
    }


# ─────────────────────────────────────────────
# 7. MASTER RECOMMENDATION GENERATOR
# ─────────────────────────────────────────────
def generate_study_plan(user_id, attempts, all_attempts, all_users):
    """
    Combines all ML techniques to generate a complete personalised study plan.
    """
    if not attempts:
        return {
            'weak_areas': [],
            'strong_areas': [],
            'recommended_difficulty': 'easy',
            'trend': {'trend': 'No data yet', 'slope': 0},
            'collaborative_recs': [],
            'confidence_analysis': {'pattern': 'No data', 'advice': 'Take your first quiz!'},
            'study_plan': ['Start with any available quiz to get personalised recommendations!']
        }

    scores = [a['score'] for a in attempts]
    weak_areas, strong_areas = detect_weak_areas(attempts)
    recommended_difficulty = recommend_difficulty(scores)
    trend = analyze_trend(scores)
    collab_recs = collaborative_recommendations(user_id, all_attempts, all_users)

    # Build study plan steps
    study_plan = []
    for w in weak_areas[:3]:
        study_plan.append(f"📚 Practice '{w['topic']}' — your avg is {w['avg_score']}% (below 60%)")
    for r in collab_recs[:2]:
        study_plan.append(f"🤝 {r['reason']}: focus on '{r['topic']}'")
    study_plan.append(f"🎯 Try {recommended_difficulty.upper()} difficulty quizzes next")
    if trend['trend'] == '📉 Declining':
        study_plan.append("⏰ Take a break and review your notes — your scores are dropping")

    return {
        'weak_areas': weak_areas,
        'strong_areas': strong_areas,
        'recommended_difficulty': recommended_difficulty,
        'trend': trend,
        'collaborative_recs': collab_recs,
        'study_plan': study_plan
    }
