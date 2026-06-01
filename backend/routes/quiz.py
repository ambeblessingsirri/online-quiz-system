from flask import Blueprint, request, jsonify
from models.database import db, Quiz, Question, QuizAttempt, User
import json
from datetime import datetime

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/', methods=['GET'])
def get_quizzes():
    subject = request.args.get('subject')
    difficulty = request.args.get('difficulty')
    query = Quiz.query.filter_by(is_active=True)
    if subject:
        query = query.filter_by(subject=subject)
    if difficulty:
        query = query.filter_by(difficulty=difficulty)
    quizzes = query.all()
    return jsonify([{
        'id': q.id,
        'title': q.title,
        'subject': q.subject,
        'topic': q.topic,
        'difficulty': q.difficulty,
        'time_limit': q.time_limit,
        'max_attempts': q.max_attempts,
        'question_count': len(q.questions),
        'created_at': q.created_at.isoformat()
    } for q in quizzes]), 200

@quiz_bp.route('/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    questions = []
    for q in quiz.questions:
        questions.append({
            'id': q.id,
            'question_text': q.question_text,
            'question_type': q.question_type,
            'options': json.loads(q.options),
            'topic_tag': q.topic_tag,
            'points': q.points
        })
    return jsonify({
        'id': quiz.id,
        'title': quiz.title,
        'subject': quiz.subject,
        'topic': quiz.topic,
        'difficulty': quiz.difficulty,
        'time_limit': quiz.time_limit,
        'questions': questions
    }), 200

@quiz_bp.route('/', methods=['POST'])
def create_quiz():
    data = request.get_json()
    quiz = Quiz(
        title=data['title'],
        subject=data['subject'],
        topic=data.get('topic', ''),
        difficulty=data.get('difficulty', 'medium'),
        time_limit=data.get('time_limit', 600),
        max_attempts=data.get('max_attempts', 3),
        created_by=data.get('created_by')
    )
    db.session.add(quiz)
    db.session.flush()

    for q_data in data.get('questions', []):
        question = Question(
            quiz_id=quiz.id,
            question_text=q_data['question_text'],
            question_type=q_data.get('question_type', 'mcq'),
            options=json.dumps(q_data.get('options', [])),
            correct_answer=q_data['correct_answer'],
            explanation=q_data.get('explanation', ''),
            topic_tag=q_data.get('topic_tag', ''),
            points=q_data.get('points', 10)
        )
        db.session.add(question)

    db.session.commit()
    return jsonify({'message': 'Quiz created', 'quiz_id': quiz.id}), 201

@quiz_bp.route('/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    db.session.delete(quiz)
    db.session.commit()
    return jsonify({'message': 'Quiz deleted'}), 200

@quiz_bp.route('/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    quiz_id = data['quiz_id']
    user_id = data['user_id']
    answers = data.get('answers', {})
    confidence_ratings = data.get('confidence_ratings', {})
    time_taken = data.get('time_taken', 0)

    quiz = Quiz.query.get_or_404(quiz_id)
    questions = quiz.questions

    correct = 0
    total_points = 0
    for q in questions:
        user_ans = str(answers.get(str(q.id), '')).strip().lower()
        correct_ans = str(q.correct_answer).strip().lower()
        if user_ans == correct_ans:
            correct += 1
            total_points += q.points

    score = round((correct / len(questions)) * 100, 2) if questions else 0

    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz_id,
        score=score,
        total_questions=len(questions),
        correct_answers=correct,
        time_taken=time_taken,
        answers=json.dumps(answers),
        confidence_ratings=json.dumps(confidence_ratings),
        subject=quiz.subject,
        topic=quiz.topic,
        difficulty=quiz.difficulty
    )
    db.session.add(attempt)

    # Update user points and streak
    user = User.query.get(user_id)
    if user:
        user.total_points += total_points
        if score >= 70:
            user.streak += 1
            # Award badges
            badges = json.loads(user.badges)
            if user.streak >= 3 and '🔥 Hot Streak' not in badges:
                badges.append('🔥 Hot Streak')
            if score == 100 and '⭐ Perfect Score' not in badges:
                badges.append('⭐ Perfect Score')
            if user.total_points >= 500 and '🏆 Champion' not in badges:
                badges.append('🏆 Champion')
            user.badges = json.dumps(badges)
        else:
            user.streak = 0

    db.session.commit()

    # Build answer feedback
    feedback = []
    for q in questions:
        user_ans = str(answers.get(str(q.id), '')).strip().lower()
        correct_ans = str(q.correct_answer).strip().lower()
        feedback.append({
            'question_id': q.id,
            'question_text': q.question_text,
            'your_answer': answers.get(str(q.id), ''),
            'correct_answer': q.correct_answer,
            'is_correct': user_ans == correct_ans,
            'explanation': q.explanation,
            'topic_tag': q.topic_tag
        })

    return jsonify({
        'score': score,
        'correct': correct,
        'total': len(questions),
        'points_earned': total_points,
        'feedback': feedback,
        'attempt_id': attempt.id
    }), 200

@quiz_bp.route('/attempts/<int:user_id>', methods=['GET'])
def get_user_attempts(user_id):
    attempts = QuizAttempt.query.filter_by(user_id=user_id).order_by(QuizAttempt.completed_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'quiz_id': a.quiz_id,
        'score': a.score,
        'correct_answers': a.correct_answers,
        'total_questions': a.total_questions,
        'time_taken': a.time_taken,
        'subject': a.subject,
        'topic': a.topic,
        'difficulty': a.difficulty,
        'completed_at': a.completed_at.isoformat()
    } for a in attempts]), 200

@quiz_bp.route('/subjects', methods=['GET'])
def get_subjects():
    quizzes = Quiz.query.filter_by(is_active=True).all()
    subjects = list(set(q.subject for q in quizzes))
    return jsonify(subjects), 200
