/**
 * Auth helpers shared across all pages.
 */

export function saveAuth(token, user) {
  localStorage.setItem('qm_token', token);
  localStorage.setItem('qm_user', JSON.stringify(user));
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('qm_user'));
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('qm_token');
}

export function logout() {
  localStorage.removeItem('qm_token');
  localStorage.removeItem('qm_user');
  window.location.href = '/auth/login.html';
}

export function redirectByRole(role) {
  const destinations = {
    student: '/student/dashboard.html',
    teacher: '/teacher/dashboard.html',
    admin:   '/admin/panel.html',
  };
  window.location.href = destinations[role] || '/auth/login.html';
}

/** Call at the top of any protected page to bounce unauthenticated visitors. */
export function requireAuth(allowedRoles = []) {
  const token = getToken();
  const user  = getUser();

  if (!token || !user) {
    window.location.href = '/auth/login.html';
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    redirectByRole(user.role);
    return null;
  }
  return user;
}

/** Populate any element with class .user-name / .user-email / .user-avatar */
export function populateUserUI(user) {
  document.querySelectorAll('.user-name').forEach((el) => {
    el.textContent = user.name;
  });
  document.querySelectorAll('.user-email').forEach((el) => {
    el.textContent = user.email;
  });
  document.querySelectorAll('.user-avatar').forEach((el) => {
    el.textContent = user.name.charAt(0).toUpperCase();
  });
  document.querySelectorAll('.user-role-badge').forEach((el) => {
    el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  });
}
