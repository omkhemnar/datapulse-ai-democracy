import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Shield, User } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('login') // login | otp
  const [role, setRole] = useState('officer') // officer | voter
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setStep('otp')
  }

  const handleVerify = (e) => {
    e.preventDefault()
    if (role === 'officer') {
      navigate('/dashboard')
    } else {
      navigate('/citizen', { state: { phone } })
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col lg:flex-row">
      {/* Left: Visually rich but not busy hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-10 h-64 w-64 rounded-full bg-primary-500/25 blur-3xl" />
          <div className="absolute bottom-0 -right-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-95" />
        </div>

        <div className="relative flex flex-col justify-center px-16 py-12 w-full">
          <div className="max-w-lg space-y-7">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-slate-700 px-3 py-1 text-[11px] tracking-[0.22em] uppercase text-slate-300">
                Datapulse • AI Democracy
              </p>
              <h1 className="mt-4 text-3xl lg:text-4xl font-bold leading-tight">AI Booth Management</h1>
              <p className="mt-2 text-sm md:text-base text-slate-300">
                Orchestrate polling booths, officers, and local issues in one simple, secure control panel.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex gap-3 items-start">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/15">
                  <Shield className="h-5 w-5 text-primary-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Secure access</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Role-based login with OTP verification for every booth.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex gap-3 items-start">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
                  <User className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Booth insights</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Keep track of officers and ground reports in real time.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 text-[11px] text-slate-300">
              <div className="flex-1 rounded-2xl bg-slate-900/80 border border-slate-800 px-3 py-2">
                <p className="uppercase tracking-[0.22em] text-slate-500 text-[10px]">Booths onboarded</p>
                <p className="mt-1 text-xl font-semibold text-white">120+</p>
              </div>
              <div className="flex-1 rounded-2xl bg-slate-900/80 border border-slate-800 px-3 py-2">
                <p className="uppercase tracking-[0.22em] text-slate-500 text-[10px]">Officers live</p>
                <p className="mt-1 text-xl font-semibold text-white">300+</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Polished auth card */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:text-left">
            <p className="text-xs font-medium tracking-[0.25em] text-slate-400 uppercase mb-2">
              Secure sign-in
            </p>
            <h2 className="text-2xl font-semibold text-white">
              {step === 'login' ? 'Choose how you want to log in' : 'Verify one-time passcode'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {step === 'login'
                ? 'Select your role and confirm your mobile number to continue.'
                : `Enter the 6-digit code sent to ${phone || 'your mobile number'}.`}
            </p>
          </div>

          <div className="relative rounded-3xl bg-gradient-to-br from-sky-500/40 via-slate-800 to-emerald-500/40 p-[1px] shadow-[0_22px_65px_rgba(15,23,42,0.9)]">
            <div className="rounded-[1.4rem] bg-slate-950/95 border border-slate-800/80 p-6 space-y-6">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {role === 'officer'
                      ? 'Officer login • Admin dashboard view'
                      : 'Voter login • Citizen portal view'}
                  </span>
                </span>
                <span className="hidden sm:inline">
                  Step {step === 'login' ? '1' : '2'} of 2
                </span>
              </div>
              {step === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-2">Login type</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('officer')}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition ${
                          role === 'officer'
                            ? 'border-primary-500 bg-primary-500/15 text-primary-100 shadow-[0_0_0_1px_rgba(56,189,248,0.4)]'
                            : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-900'
                        }`}
                      >
                        Officer Login
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('voter')}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition ${
                          role === 'voter'
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-100 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]'
                            : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-900'
                        }`}
                      >
                        Voter Login
                      </button>
                    </div>
                  </div>
                  <Input
                    label="Mobile Number"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>OTP will be sent via SMS.</span>
                    <span className="inline-flex items-center gap-1">
                      <Shield className="h-3 w-3 text-primary-300" />
                      <span>Encrypted</span>
                    </span>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-3">Enter 6-digit OTP</label>
                    <div className="flex gap-2 justify-between">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <input
                          key={i}
                          id={`otp-input-${i}`}
                          type="text"
                          maxLength={1}
                          className="w-10 h-12 sm:w-12 sm:h-12 text-center text-lg font-semibold rounded-lg border-2 border-slate-700 bg-slate-900 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 outline-none"
                          value={otp[i - 1] || ''}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '')
                            setOtp((prev) => (prev.slice(0, i - 1) + v + prev.slice(i)).slice(0, 6))
                            if (v) {
                              document.getElementById(`otp-input-${i + 1}`)?.focus()
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otp[i - 1]) {
                              document.getElementById(`otp-input-${i - 1}`)?.focus()
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Verify &amp; Sign In
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="w-full text-xs sm:text-sm text-slate-400 hover:text-primary-300"
                  >
                    Change mobile number
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
