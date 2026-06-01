from flask import Blueprint, request, jsonify, session
from models.database import db, User
import hashlib
import json
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'student')

    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    avatars = {'student': '🎓', 'teacher': '👨‍🏫', 'admin': '⚙️'}
    user = User(
        username=username,
        email=email,
        password=hash_password(password),
        role=role,
        avatar=avatars.get(role, '🎓')
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'message': 'Registration successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'avatar': user.avatar
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    user = User.query.filter_by(username=username, password=hash_password(password)).first()

    if not user:
        return jsonify({'error': 'Invalid username or password'}), 401

    user.last_login = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'avatar': user.avatar,
            'streak': user.streak,
            'total_points': user.total_points,
            'badges': json.loads(user.badges)
        }
    }), 200

@auth_bp.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'role': u.role,
        'avatar': u.avatar,
        'streak': u.streak,
        'total_points': u.total_points,
        'created_at': u.created_at.isoformat()
    } for u in users]), 200

@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200
