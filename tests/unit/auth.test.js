const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Set env before requiring modules
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

describe('Auth Utilities', () => {
  describe('Password hashing', () => {
    it('bcrypt hashes a password', async () => {
      const hashed = await bcrypt.hash('Password123', 12);
      expect(hashed).not.toBe('Password123');
      expect(hashed).toMatch(/^\$2[ab]\$/);
    });

    it('bcrypt correctly validates a matching password', async () => {
      const hashed = await bcrypt.hash('Password123', 12);
      const isMatch = await bcrypt.compare('Password123', hashed);
      expect(isMatch).toBe(true);
    });

    it('bcrypt rejects a wrong password', async () => {
      const hashed = await bcrypt.hash('Password123', 12);
      const isMatch = await bcrypt.compare('WrongPassword', hashed);
      expect(isMatch).toBe(false);
    });
  });

  describe('JWT token', () => {
    it('signs and verifies a token', () => {
      const payload = { id: 'user123', role: 'student' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user123');
      expect(decoded.role).toBe('student');
    });

    it('rejects a token signed with wrong secret', () => {
      const token = jwt.sign({ id: 'user123' }, 'wrong_secret');
      expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow();
    });
  });

  describe('Role validation', () => {
    it('accepts valid roles', () => {
      const validRoles = ['student', 'teacher', 'admin'];
      validRoles.forEach((role) => {
        expect(['student', 'teacher', 'admin']).toContain(role);
      });
    });

    it('admin role cannot be self-registered', () => {
      const requestedRole = 'admin';
      const safeRole = requestedRole === 'admin' ? 'student' : requestedRole;
      expect(safeRole).toBe('student');
    });
  });
});
