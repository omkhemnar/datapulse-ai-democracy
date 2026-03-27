import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ActivitySquare, ShieldCheck, BarChart4 } from 'lucide-react';
import Button from '../components/ui/Button';
import ParticleBackground from '../components/ParticleBackground';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'voter') navigate('/citizen', { replace: true });
        else navigate('/dashboard', { replace: true });
      }
    } catch(e) {}
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white flex flex-col items-center justify-center selection:bg-primary-500/30">
      
      {/* Background Gradients & Effects */}
      <div className="pointer-events-none absolute inset-0 flex place-content-center items-center justify-center z-0">
        <div className="absolute top-[20%] left-[15%] h-96 w-96 rounded-full bg-primary-600/20 blur-[128px]" />
        <div className="absolute bottom-[20%] right-[15%] h-96 w-96 rounded-full bg-emerald-600/20 blur-[128px]" />
        {/* Interactive Particle Background */}
        <ParticleBackground />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        
        {/* Logo / Brand Concept */}
        <div className="group relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-400 to-emerald-400 blur-xl opacity-40 group-hover:opacity-60 group-hover:blur-2xl transition duration-500 ease-out" />
          <div className="relative flex items-center gap-3 bg-slate-900/80 border border-slate-700/50 rounded-full px-6 py-2.5 backdrop-blur-sm transform transition duration-500 hover:scale-105">
            <ActivitySquare className="h-6 w-6 text-primary-400 animate-[pulse_3s_ease-in-out_infinite]" />
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-100 to-slate-300 tracking-wider">
              DATAPULSE
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-1 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              India
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 mt-4">
          Transforming Voter Data into <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">
            Smart Governance Insights
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12">
          An AI-driven digital democracy platform enabling real-time booth intelligence, precision voter segmentation, and seamless citizen engagement.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-lg">
          <button 
            onClick={() => navigate('/booth-login')}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <ShieldCheck className="w-5 h-5 text-primary-600 transition-transform group-hover:rotate-12" />
            Login as Booth Officer
          </button>
          
          <button 
            onClick={() => navigate('/voter-login')}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-slate-800 border border-slate-600/50 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-slate-700 hover:border-slate-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <BarChart4 className="w-5 h-5 text-emerald-400 transition-transform group-hover:-translate-y-1" />
            Login as Voter
            <ArrowRight className="w-4 h-4 ml-1 opacity-60 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Footer / Decorative */}
      <div className="absolute bottom-8 left-0 text-center w-full z-10 pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600 font-semibold">
          AI Democracy Framework • v2.0
        </p>
      </div>

    </div>
  );
}
