from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='student')  # student, teacher, admin
    avatar = db.Column(db.String(10), default='🎓')
    streak = db.Column(db.Integer, default=0)
    total_points = db.Column(db.Integer, default=0)
    badges = db.Column(db.Text, default='[]')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)

    quiz_attempts = db.relationship('QuizAttempt', backref='user', lazy=True)

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(100), nullable=False)
    difficulty = db.Column(db.String(20), default='medium')  # easy, medium, hard
    time_limit = db.Column(db.Integer, default=600)  # seconds
    max_attempts = db.Column(db.Integer, default=3)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete-orphan')
    attempts = db.relationship('QuizAttempt', backref='quiz', lazy=True)

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), default='mcq')  # mcq, true_false, short_answer
    options = db.Column(db.Text, default='[]')   # JSON string of options
    correct_answer = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, default='')
    topic_tag = db.Column(db.String(100), default='')
    points = db.Column(db.Integer, default=10)

class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    score = db.Column(db.Float, default=0)
    total_questions = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)
    time_taken = db.Column(db.Integer, default=0)  # seconds
    answers = db.Column(db.Text, default='{}')     # JSON: {question_id: answer}
    confidence_ratings = db.Column(db.Text, default='{}')  # JSON: {question_id: 1-5}
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    subject = db.Column(db.String(100), default='')
    topic = db.Column(db.String(100), default='')
    difficulty = db.Column(db.String(20), default='medium')
