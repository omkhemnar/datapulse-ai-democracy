import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function BoothAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let endpoint = '';
      let payload = { email };

      if (mode === 'login') endpoint = '/api/auth/booth/login';
      if (mode === 'signup') endpoint = '/api/auth/booth/signup';
      if (mode === 'forgot') endpoint = '/api/auth/booth/forgot-password';

      if (mode !== 'forgot') {
        payload.password = password;
      }

      const res = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (mode === 'login') {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else if (mode === 'signup') {
        setMessage('Registration successful. Please login.');
        setTimeout(() => setMode('login'), 2000);
      } else {
        setMessage(data.message);
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 hocus:transform transition">
          <button onClick={() => navigate('/')} className="inline-flex items-center justify-center p-3 rounded-full bg-slate-900 border border-slate-700/50 mb-4 hover:bg-slate-800 transition">
            <Shield className="w-8 h-8 text-primary-400" />
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' && 'Officer Login'}
            {mode === 'signup' && 'Officer Registration'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'login' && 'Access the DataPulse command center'}
            {mode === 'signup' && 'Create your official booth manager account'}
            {mode === 'forgot' && 'Enter your email to receive reset instructions'}
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-2xl">
          {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Official Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                placeholder="officer@datapulse.gov.in"
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {mode === 'login' && 'Secure Login'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-col gap-3 text-center text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('forgot')} className="text-slate-400 hover:text-white transition">Forgot password?</button>
                <div className="text-slate-500">Don't have an account? <button onClick={() => setMode('signup')} className="text-primary-400 font-semibold hover:text-primary-300 transition">Register now</button></div>
              </>
            )}
            {mode === 'signup' && (
              <div className="text-slate-500">Already have an account? <button onClick={() => setMode('login')} className="text-primary-400 font-semibold hover:text-primary-300 transition">Log in</button></div>
            )}
            {mode === 'forgot' && (
              <button onClick={() => setMode('login')} className="text-slate-400 hover:text-white transition flex items-center justify-center gap-1 mx-auto">
                <ArrowRight className="w-3 h-3 rotate-180" /> Back to login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
