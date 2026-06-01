"""
Online Quiz & Practice System - Backend API
Built with Flask following Software Construction principles:
- Single Responsibility (each route module handles one concern)
- Modular Architecture (blueprints)
- Clean API Contracts (JSON REST)
- Agile Construction (incremental feature delivery)
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models.database import db
from routes.auth import auth_bp
from routes.quiz import quiz_bp
from routes.results import results_bp
from routes.ai_routes import ai_bp
import json
import os

def create_app():
    app = Flask(__name__)

    # Configuration (Practical Consideration: environment-based config)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quiz_system.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'quiz-system-secret-key-2026'

    # Enable CORS (allows React frontend to talk to Flask backend)
    CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'])

    # Initialize database
    db.init_app(app)

    # Register blueprints (Modular Construction)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(quiz_bp, url_prefix='/api/quizzes')
    app.register_blueprint(results_bp, url_prefix='/api/results')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'online', 'message': 'Quiz System API is running'}), 200

    return app

def seed_data(app):
    """Seed the database with sample quizzes and questions"""
    with app.app_context():
        from models.database import User, Quiz, Question
        import hashlib

        if User.query.first():
            return  # Already seeded

        # Create demo users
        def hp(p): return hashlib.sha256(p.encode()).hexdigest()

        admin = User(username='admin', email='admin@quiz.com', password=hp('admin123'), role='admin', avatar='⚙️', total_points=0)
        teacher = User(username='teacher1', email='teacher@quiz.com', password=hp('teacher123'), role='teacher', avatar='👨‍🏫', total_points=0)
        student1 = User(username='student1', email='student1@quiz.com', password=hp('student123'), role='student', avatar='🎓', total_points=150, streak=3)
        student2 = User(username='student2', email='student2@quiz.com', password=hp('student123'), role='student', avatar='🎓', total_points=80, streak=1)

        student1.badges = json.dumps(['🔥 Hot Streak'])
        db.session.add_all([admin, teacher, student1, student2])
        db.session.flush()

        # Mathematics Quiz
        math_quiz = Quiz(title='Algebra Fundamentals', subject='Mathematics', topic='Algebra',
                         difficulty='medium', time_limit=600, created_by=teacher.id)
        db.session.add(math_quiz)
        db.session.flush()

        math_questions = [
            ('What is 2x + 4 = 10? Solve for x.', 'mcq', ['x=2', 'x=3', 'x=4', 'x=5'], 'x=3', 'Subtract 4 from both sides: 2x=6, then divide by 2.', 'Equations'),
            ('What is the value of x² when x = 5?', 'mcq', ['10', '20', '25', '30'], '25', '5 squared = 5 × 5 = 25', 'Exponents'),
            ('Is every square a rectangle?', 'true_false', ['True', 'False'], 'True', 'A square has all properties of a rectangle.', 'Geometry'),
            ('What is the slope of y = 3x + 2?', 'mcq', ['2', '3', '5', '1'], '3', 'In y=mx+b, m is the slope. Here m=3.', 'Linear Functions'),
            ('Simplify: 3(x + 4) = ?', 'mcq', ['3x+4', '3x+7', '3x+12', 'x+12'], '3x+12', 'Distribute: 3×x + 3×4 = 3x+12', 'Algebra'),
        ]
        for qt, qtype, opts, ans, exp, tag in math_questions:
            db.session.add(Question(quiz_id=math_quiz.id, question_text=qt, question_type=qtype,
                                     options=json.dumps(opts), correct_answer=ans, explanation=exp, topic_tag=tag, points=10))

        # Science Quiz
        sci_quiz = Quiz(title='Physics Basics', subject='Science', topic='Physics',
                        difficulty='easy', time_limit=480, created_by=teacher.id)
        db.session.add(sci_quiz)
        db.session.flush()

        sci_questions = [
            ('What is the unit of force?', 'mcq', ['Watt', 'Newton', 'Joule', 'Pascal'], 'Newton', 'Force is measured in Newtons (N).', 'Forces'),
            ('What is Newton\'s First Law?', 'mcq', ['F=ma', 'An object stays at rest unless acted upon', 'Energy is conserved', 'Every action has a reaction'], 'An object stays at rest unless acted upon', 'Law of Inertia.', 'Laws of Motion'),
            ('Does light travel faster than sound?', 'true_false', ['True', 'False'], 'True', 'Light travels at ~3×10⁸ m/s vs sound at ~343 m/s.', 'Waves'),
            ('What is the formula for speed?', 'mcq', ['Speed=Mass×Acceleration', 'Speed=Distance/Time', 'Speed=Force/Mass', 'Speed=Work/Time'], 'Speed=Distance/Time', 'v = d/t', 'Kinematics'),
            ('What planet is closest to the Sun?', 'mcq', ['Venus', 'Earth', 'Mercury', 'Mars'], 'Mercury', 'Mercury is the innermost planet.', 'Astronomy'),
        ]
        for qt, qtype, opts, ans, exp, tag in sci_questions:
            db.session.add(Question(quiz_id=sci_quiz.id, question_text=qt, question_type=qtype,
                                     options=json.dumps(opts), correct_answer=ans, explanation=exp, topic_tag=tag, points=10))

        # History Quiz
        hist_quiz = Quiz(title='World History', subject='History', topic='Modern History',
                         difficulty='hard', time_limit=720, created_by=teacher.id)
        db.session.add(hist_quiz)
        db.session.flush()

        hist_questions = [
            ('In which year did World War II end?', 'mcq', ['1943', '1944', '1945', '1946'], '1945', 'WWII ended in 1945 with Japan\'s surrender.', 'World Wars'),
            ('Who was the first President of the USA?', 'mcq', ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'], 'George Washington', 'Washington served 1789-1797.', 'American History'),
            ('Was the Berlin Wall torn down in 1989?', 'true_false', ['True', 'False'], 'True', 'The Berlin Wall fell on November 9, 1989.', 'Cold War'),
            ('Which empire was known as the "Empire on which the sun never sets"?', 'mcq', ['Roman Empire', 'Ottoman Empire', 'British Empire', 'Mongol Empire'], 'British Empire', 'The British Empire was the largest in history.', 'Empires'),
            ('Who wrote the Declaration of Independence?', 'mcq', ['George Washington', 'Benjamin Franklin', 'Thomas Jefferson', 'John Adams'], 'Thomas Jefferson', 'Jefferson was the principal author in 1776.', 'American History'),
        ]
        for qt, qtype, opts, ans, exp, tag in hist_questions:
            db.session.add(Question(quiz_id=hist_quiz.id, question_text=qt, question_type=qtype,
                                     options=json.dumps(opts), correct_answer=ans, explanation=exp, topic_tag=tag, points=10))

        # Programming Quiz
        prog_quiz = Quiz(title='Python Programming', subject='Computer Science', topic='Programming',
                         difficulty='medium', time_limit=600, created_by=teacher.id)
        db.session.add(prog_quiz)
        db.session.flush()

        prog_questions = [
            ('What does "def" do in Python?', 'mcq', ['Defines a variable', 'Defines a function', 'Defines a class', 'Imports a module'], 'Defines a function', 'def keyword is used to define functions in Python.', 'Functions'),
            ('What is the output of print(2**3)?', 'mcq', ['6', '8', '9', '5'], '8', '2**3 = 2³ = 8', 'Operators'),
            ('Is Python case-sensitive?', 'true_false', ['True', 'False'], 'True', 'Python treats "Name" and "name" as different variables.', 'Basics'),
            ('Which of these is a Python list?', 'mcq', ['{"a": 1}', '(1,2,3)', '[1,2,3]', '{1,2,3}'], '[1,2,3]', 'Square brackets [] define a list in Python.', 'Data Structures'),
            ('What does len([1,2,3,4]) return?', 'mcq', ['3', '4', '5', '6'], '4', 'len() returns the number of items. List has 4 items.', 'Functions'),
        ]
        for qt, qtype, opts, ans, exp, tag in prog_questions:
            db.session.add(Question(quiz_id=prog_quiz.id, question_text=qt, question_type=qtype,
                                     options=json.dumps(opts), correct_answer=ans, explanation=exp, topic_tag=tag, points=10))

        db.session.commit()
        print("[OK] Database seeded with sample data!")

if __name__ == '__main__':
    import os
    app = create_app()
    with app.app_context():
        db.create_all()
        seed_data(app)
    port = int(os.environ.get('PORT', 5000))
    print("[START] Online Quiz System API starting on port", port)
    app.run(debug=False, host='0.0.0.0', port=port, use_reloader=False)
