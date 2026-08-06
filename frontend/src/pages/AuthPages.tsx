import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

const authCard = 'mx-auto mt-20 w-full max-w-sm rounded-lg border border-slate-800 bg-slate-950/80 p-5';
const input = 'w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-xs';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@exchange.local');
  const [password, setPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await login({ email, password, rememberMe });
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#04070d] text-slate-200">
      <form onSubmit={onSubmit} className={authCard}>
        <h1 className="mb-4 text-lg font-semibold text-blue-300">Exchange Terminal</h1>
        <input className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className={`${input} mt-2`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me
        </label>
        {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
        <button className="mt-3 w-full rounded bg-blue-600 py-2 text-xs font-semibold">Login</button>
        <div className="mt-3 flex justify-between text-xs text-slate-400">
          <Link to="/register">Register</Link>
          <Link to="/forgot-password">Forgot password</Link>
        </div>
      </form>
    </div>
  );
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/login');
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#04070d] text-slate-200">
      <form onSubmit={onSubmit} className={authCard}>
        <h1 className="mb-4 text-lg font-semibold text-blue-300">Create account</h1>
        <input className={input} placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className={`${input} mt-2`} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className={`${input} mt-2`} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
        <button className="mt-3 w-full rounded bg-blue-600 py-2 text-xs font-semibold">Register</button>
        <p className="mt-3 text-xs text-slate-400">
          Have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export const ForgotPasswordPage = () => (
  <div className="min-h-screen bg-[#04070d] text-slate-200">
    <div className={authCard}>
      <h1 className="mb-2 text-lg font-semibold text-blue-300">Forgot Password</h1>
      <p className="text-xs text-slate-400">
        Password reset automation is not enabled in this phase. Please contact an administrator.
      </p>
      <Link to="/login" className="mt-3 inline-block text-xs text-blue-300">
        Back to login
      </Link>
    </div>
  </div>
);
