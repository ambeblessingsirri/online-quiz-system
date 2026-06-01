from flask import Blueprint, jsonify
from models.database import db, QuizAttempt, User
from ml.ai_engine import generate_study_plan, cluster_students
import json

ai_bp = Blueprint('ai', __name__)

def attempt_to_dict(a):
    return {
        'user_id': a.user_id,
        'topic': a.topic,
        'subject': a.subject,
        'score': a.score,
        'difficulty': a.difficulty,
        'confidence_ratings': json.loads(a.confidence_ratings) if a.confidence_ratings else {}
    }

@ai_bp.route('/recommendations/<int:user_id>', methods=['GET'])
def get_recommendations(user_id):
    user_attempts = QuizAttempt.query.filter_by(user_id=user_id).all()
    all_attempts = QuizAttempt.query.all()
    all_users = User.query.all()

    user_dicts = [attempt_to_dict(a) for a in user_attempts]
    all_dicts = [attempt_to_dict(a) for a in all_attempts]
    user_list = [{'id': u.id, 'username': u.username} for u in all_users]

    plan = generate_study_plan(user_id, user_dicts, all_dicts, user_list)
    return jsonify(plan), 200

@ai_bp.route('/clusters', methods=['GET'])
def get_clusters():
    users = User.query.filter_by(role='student').all()
    student_data = []
    for u in users:
        attempts = QuizAttempt.query.filter_by(user_id=u.id).all()
        if attempts:
            avg = round(sum(a.score for a in attempts) / len(attempts), 1)
            student_data.append({
                'user_id': u.id,
                'username': u.username,
                'avg_score': avg,
                'total_attempts': len(attempts),
                'total_points': u.total_points
            })

    if not student_data:
        return jsonify([]), 200

    clustered = cluster_students(student_data)
    return jsonify(clustered), 200
