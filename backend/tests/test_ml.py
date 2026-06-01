"""
Unit Tests for the AI/ML Engine
Covers: Weak Area Detection, Adaptive Difficulty,
        Trend Analysis, Confidence Mining
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.ai_engine import (
    detect_weak_areas,
    recommend_difficulty,
    analyze_trend,
    analyze_confidence,
    generate_study_plan
)

# ── Weak Area Detection ──────────────────────
def test_detect_weak_areas_identifies_low_scores():
    attempts = [
        {'topic': 'Algebra', 'score': 40},
        {'topic': 'Algebra', 'score': 50},
        {'topic': 'Geometry', 'score': 90},
    ]
    weak, strong = detect_weak_areas(attempts)
    assert any(w['topic'] == 'Algebra' for w in weak), "Algebra should be weak"
    assert any(s['topic'] == 'Geometry' for s in strong), "Geometry should be strong"

def test_detect_weak_areas_above_threshold_is_strong():
    attempts = [{'topic': 'Physics', 'score': 95}]
    weak, strong = detect_weak_areas(attempts)
    assert len(weak) == 0
    assert len(strong) == 1

# ── Adaptive Difficulty ──────────────────────
def test_recommend_difficulty_high_scores_gives_hard():
    assert recommend_difficulty([85, 90, 88]) == 'hard'

def test_recommend_difficulty_low_scores_gives_easy():
    assert recommend_difficulty([30, 40, 45]) == 'easy'

def test_recommend_difficulty_medium_scores_gives_medium():
    assert recommend_difficulty([60, 65, 70]) == 'medium'

def test_recommend_difficulty_empty_gives_easy():
    assert recommend_difficulty([]) == 'easy'

# ── Trend Analysis ───────────────────────────
def test_trend_improving():
    result = analyze_trend([50, 60, 70, 80, 90])
    assert 'Improving' in result['trend']

def test_trend_declining():
    result = analyze_trend([90, 80, 70, 60, 50])
    assert 'Declining' in result['trend']

def test_trend_insufficient_data():
    result = analyze_trend([75])
    assert 'Insufficient' in result['trend']

# ── Confidence Analysis ──────────────────────
def test_confidence_overconfident():
    data = [{'confidence': 5, 'is_correct': False}] * 5 + [{'confidence': 3, 'is_correct': True}]
    result = analyze_confidence(data)
    assert 'Overconfident' in result['pattern']

def test_confidence_no_data():
    result = analyze_confidence([])
    assert result['pattern'] == 'No data'

# ── Integration: Study Plan ──────────────────
def test_generate_study_plan_returns_keys():
    attempts = [
        {'topic': 'Algebra', 'score': 40, 'subject': 'Math', 'difficulty': 'easy'},
        {'topic': 'Geometry', 'score': 80, 'subject': 'Math', 'difficulty': 'medium'},
    ]
    plan = generate_study_plan(1, attempts, attempts, [])
    assert 'weak_areas' in plan
    assert 'study_plan' in plan
    assert 'recommended_difficulty' in plan
    assert 'trend' in plan

def test_generate_study_plan_empty_attempts():
    plan = generate_study_plan(1, [], [], [])
    assert plan['weak_areas'] == []
    assert len(plan['study_plan']) > 0

# ── Score Calculation Logic ──────────────────
def test_score_calculation():
    correct = 7
    total = 10
    score = round((correct / total) * 100, 2)
    assert score == 70.0

def test_perfect_score():
    assert round((10 / 10) * 100, 2) == 100.0

def test_zero_score():
    assert round((0 / 10) * 100, 2) == 0.0
