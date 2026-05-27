/**
 * Centralised API client — all fetch calls go through here.
 * Automatically attaches JWT and handles error normalisation.
 */

const BASE_URL = '';

async function request(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };

  const token = localStorage.getItem('qm_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.error ||
      (data.errors && data.errors[0]?.msg) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  get:    (endpoint)       => request('GET',    endpoint),
  post:   (endpoint, body) => request('POST',   endpoint, body),
  put:    (endpoint, body) => request('PUT',    endpoint, body),
  patch:  (endpoint, body) => request('PATCH',  endpoint, body),
  delete: (endpoint)       => request('DELETE', endpoint),
};
