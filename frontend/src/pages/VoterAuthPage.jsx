import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart4, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { API_BASE } from '../api';

export default function VoterAuthPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/citizen', { replace: true });
    }
  }, [navigate]);

  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [name, setName] = useState('');
  const [voterId, setVoterId] = useState('');
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
      let payload = { voterId };

      if (mode === 'login') endpoint = '/api/auth/voter/login';
      if (mode === 'signup') {
        endpoint = '/api/auth/voter/signup';
        payload.email = email;
        payload.name = name;
      }
      if (mode === 'forgot') {
        endpoint = '/api/auth/voter/forgot-password';
        payload = { email };
      }

      if (mode !== 'forgot') {
        payload.password = password;
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
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
        localStorage.setItem('voterName', data.name || 'Citizen');
        // Navigate and pass voterData to CitizenMobilePage
        navigate('/citizen', { state: { voterData: data.voterData, name: data.name, voterId: data.voterId } });
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
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 hocus:transform transition">
          <button onClick={() => navigate('/')} className="inline-flex items-center justify-center p-3 rounded-full bg-slate-900 border border-slate-700/50 mb-4 hover:bg-slate-800 transition">
            <BarChart4 className="w-8 h-8 text-emerald-400" />
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' && 'Voter Login'}
            {mode === 'signup' && 'Voter Registration'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'login' && 'Access tailored governance updates & schemes'}
            {mode === 'signup' && 'Register your 10-character VoterID'}
            {mode === 'forgot' && 'Enter your VoterID to reset your password'}
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-2xl">
          {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="Gauri Patil"
                />
              </div>
            )}
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Voter ID</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={voterId}
                  onChange={e => setVoterId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono tracking-widest uppercase focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="ABC1234567"
                />
              </div>
            )}
            {mode !== 'login' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="voter@example.com"
                />
              </div>
            )}
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
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
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {mode === 'login' && 'Secure Login'}
                  {mode === 'signup' && 'Register ID'}
                  {mode === 'forgot' && 'Request Reset'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-col gap-3 text-center text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('forgot')} className="text-slate-400 hover:text-white transition">Forgot password?</button>
                <div className="text-slate-500">Don't have an account? <button onClick={() => setMode('signup')} className="text-emerald-400 font-semibold hover:text-emerald-300 transition">Register now</button></div>
              </>
            )}
            {mode === 'signup' && (
              <div className="text-slate-500">Already registered? <button onClick={() => setMode('login')} className="text-emerald-400 font-semibold hover:text-emerald-300 transition">Log in</button></div>
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
