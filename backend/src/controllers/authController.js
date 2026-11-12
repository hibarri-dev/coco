import { User } from '../models/User.js';
import { setAuthCookie, clearAuthCookie } from '../lib/authCookie.js';
import { str, EMAIL } from '../lib/http.js';
import { forwardLead } from '../lib/leads.js';
import { notifySignup } from '../services/notificationService.js';

const MIN_PASSWORD = 8;
const SELF_SERVICE_ROLES = ['user', 'investor'];

function signIn(res, user, status = 200) {
  setAuthCookie(res, user.generateAuthToken());
  return res.status(status).json({ success: true, user: user.toPublic() });
}

export async function register(req, res) {
  const body = req.body ?? {};
  const name = str(body.name, 120);
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const role = SELF_SERVICE_ROLES.includes(body.role) ? body.role : 'user';

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'missing_fields', message: 'Name, email, and password are required' });
  }
  if (!EMAIL.test(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'Please enter a valid email address' });
  }
  if (password.length < MIN_PASSWORD || password.length > 200) {
    return res.status(400).json({ error: 'weak_password', message: `Password must be at least ${MIN_PASSWORD} characters` });
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone: str(body.phone, 40),
      company: str(body.company, 200),
      marketingConsent: body.marketingConsent === true,
    });
    void forwardLead('signup', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      role: user.role,
      userId: String(user._id),
      marketingConsent: user.marketingConsent,
    });
    void notifySignup(user.toObject());
    return signIn(res, user, 201);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'email_taken', message: 'An account with this email already exists' });
    }
    throw err;
  }
}

export async function login(req, res) {
  const email = str(req.body?.email, 200).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'missing_fields', message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password' });
  }
  if (user.status !== 'active') {
    return res.status(403).json({ error: 'account_inactive', message: 'This account is not active. Please contact support.' });
  }

  return signIn(res, user);
}

export async function getMe(req, res) {
  return res.json({ success: true, user: req.user.toPublic() });
}

export async function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ success: true });
}
