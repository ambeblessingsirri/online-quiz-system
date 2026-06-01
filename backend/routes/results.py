from flask import Blueprint, jsonify, request
from models.database import db, QuizAttempt, User, Quiz
import json

results_bp = Blueprint('results', __name__)

@results_bp.route('/leaderboard', methods=['GET'])
def leaderboard():
    users = User.query.filter_by(role='student').order_by(User.total_points.desc()).limit(20).all()
    board = []
    for i, u in enumerate(users):
        attempts = QuizAttempt.query.filter_by(user_id=u.id).all()
        avg_score = round(sum(a.score for a in attempts) / len(attempts), 1) if attempts else 0
        board.append({
            'rank': i + 1,
            'user_id': u.id,
            'username': u.username,
            'avatar': u.avatar,
            'total_points': u.total_points,
            'streak': u.streak,
            'avg_score': avg_score,
            'quizzes_taken': len(attempts),
            'badges': json.loads(u.badges)
        })
    return jsonify(board), 200

@results_bp.route('/performance/<int:user_id>', methods=['GET'])
def user_performance(user_id):
    attempts = QuizAttempt.query.filter_by(user_id=user_id).order_by(QuizAttempt.completed_at).all()
    if not attempts:
        return jsonify({'message': 'No attempts yet', 'data': []}), 200

    # Time series data
    timeline = [{
        'date': a.completed_at.strftime('%Y-%m-%d %H:%M'),
        'score': a.score,
        'subject': a.subject,
        'topic': a.topic,
        'difficulty': a.difficulty
    } for a in attempts]

    # Subject breakdown
    subject_stats = {}
    for a in attempts:
        s = a.subject
        if s not in subject_stats:
            subject_stats[s] = {'scores': [], 'count': 0}
        subject_stats[s]['scores'].append(a.score)
        subject_stats[s]['count'] += 1

    subject_summary = [{
        'subject': s,
        'avg_score': round(sum(d['scores']) / len(d['scores']), 1),
        'attempts': d['count']
    } for s, d in subject_stats.items()]

    user = User.query.get(user_id)
    return jsonify({
        'timeline': timeline,
        'subject_summary': subject_summary,
        'total_attempts': len(attempts),
        'overall_avg': round(sum(a.score for a in attempts) / len(attempts), 1),
        'streak': user.streak if user else 0,
        'total_points': user.total_points if user else 0,
        'badges': json.loads(user.badges) if user else []
    }), 200

@results_bp.route('/class/<int:teacher_id>', methods=['GET'])
def class_performance(teacher_id):
    quizzes = Quiz.query.filter_by(created_by=teacher_id).all()
    quiz_ids = [q.id for q in quizzes]
    if not quiz_ids:
        return jsonify([]), 200

    results = []
    for q in quizzes:
        attempts = QuizAttempt.query.filter_by(quiz_id=q.id).all()
        if attempts:
            results.append({
                'quiz_id': q.id,
                'quiz_title': q.title,
                'subject': q.subject,
                'attempts': len(attempts),
                'avg_score': round(sum(a.score for a in attempts) / len(attempts), 1),
                'highest': max(a.score for a in attempts),
                'lowest': min(a.score for a in attempts)
            })
    return jsonify(results), 200

@results_bp.route('/export/<int:user_id>', methods=['GET'])
def export_results(user_id):
    attempts = QuizAttempt.query.filter_by(user_id=user_id).all()
    user = User.query.get(user_id)
    rows = ['Subject,Topic,Difficulty,Score,Correct,Total,Time(s),Date']
    for a in attempts:
        rows.append(f"{a.subject},{a.topic},{a.difficulty},{a.score},{a.correct_answers},{a.total_questions},{a.time_taken},{a.completed_at.strftime('%Y-%m-%d')}")
    csv_content = '\n'.join(rows)
    from flask import Response
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename={user.username}_results.csv'}
    )
