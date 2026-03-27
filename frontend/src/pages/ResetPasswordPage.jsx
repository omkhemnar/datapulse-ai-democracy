import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, BarChart4, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const { role, token } = useParams(); // role will be 'booth' or 'voter'
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isBooth = role === 'booth';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const endpoint = `/api/auth/${role}/reset-password/${token}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setMessage('Password successfully updated. Redirecting to your dashboard...');
      
      if (isBooth) {
        localStorage.setItem('token', data.token);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        localStorage.setItem('voterToken', data.token);
        setTimeout(() => navigate('/citizen', { state: { voterData: data.voterData } }), 2000);
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
        <div className={`absolute -top-24 -left-24 w-96 h-96 ${isBooth ? 'bg-primary-600/20' : 'bg-emerald-600/20'} rounded-full blur-[100px]`} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 hocus:transform transition">
          <button onClick={() => navigate('/')} className="inline-flex items-center justify-center p-3 rounded-full bg-slate-900 border border-slate-700/50 mb-4 hover:bg-slate-800 transition">
            {isBooth ? <Shield className="w-8 h-8 text-primary-400" /> : <BarChart4 className="w-8 h-8 text-emerald-400" />}
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-slate-400 text-sm">Enter your new secure password below.</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-2xl">
          {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 transition ${isBooth ? 'focus:border-primary-500 focus:ring-primary-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`}
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
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 transition ${isBooth ? 'focus:border-primary-500 focus:ring-primary-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg font-semibold transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed mt-6 ${isBooth ? 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Update Password
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
