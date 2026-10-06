import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Mail, 
  ShieldAlert, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Mode: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Forgot / Reset form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [demoCodeHint, setDemoCodeHint] = useState(null);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle Standard Login via Email
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();

      if (res.ok) {
        login(data.token, data.admin);
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Authentication failed. Please verify your email and password.');
      }
    } catch (err) {
      setError('Unable to reach the authentication service. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request Reset Code (Forgot Password)
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setDemoCodeHint(null);
    setLoading(true);

    try {
      const targetEmail = (resetEmail || email).trim();
      if (!targetEmail) {
        setError('Please enter your administrator email address.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();

      if (res.ok) {
        setResetEmail(targetEmail);
        setSuccessMsg(data.message || 'Verification code generated successfully.');
        if (data.code) {
          setDemoCodeHint(data.code);
          setResetCode(data.code);
        }
        setMode('reset');
      } else {
        setError(data.error || 'Unable to process reset request for this email.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Reset Code & New Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          code: resetCode.trim(),
          newPassword: newPassword.trim()
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg('Password updated successfully! You can now log in.');
        setEmail(resetEmail);
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setResetCode('');
        setDemoCodeHint(null);
        setMode('login');
      } else {
        setError(data.error || 'Failed to update password. Please check the code.');
      }
    } catch (err) {
      setError('Failed to contact server to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B231D] flex flex-col justify-center items-center p-4 selection:bg-[#B45309]/20 selection:text-[#B45309]">
      
      {/* Background ambient decorative glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-70">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#EEDDC8]/50 via-[#F5ECE0]/40 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
            <img
              src="/images/nirvana/nirvana_logo.png"
              alt="NIRVANA Logo"
              className="w-14 h-14 object-contain mx-auto rounded-xl drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#2B231D]">
              NIRVANA
            </h1>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#857467] uppercase mt-1">
              Executive Council &bull; Officer Portal
            </p>
          </div>
          <p className="text-xs text-[#6B5A4E] max-w-xs mx-auto">
            Secure administrative control room for NIRVANA Club officers & faculty coordinators.
          </p>
        </div>

        {/* Main Portal Card */}
        <div className="bg-[#FFFDF9] border border-[#E5DACB] rounded-3xl p-7 sm:p-9 shadow-xl shadow-[#D8C7B5]/20 space-y-6">
          
          {/* Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {demoCodeHint && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold">Reset Verification Code Generated:</p>
                <p className="font-mono text-sm tracking-wider font-bold text-[#B45309] mt-0.5">
                  {demoCodeHint}
                </p>
                <p className="text-[10px] text-amber-700 mt-1">
                  (Auto-filled below for instant password reset)
                </p>
              </div>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#574A40] mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#857467] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@nirvana.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD0C2] text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#B45309] focus:border-[#B45309] transition-all placeholder:text-[#9B8C80]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#574A40]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setError(null);
                      setSuccessMsg(null);
                      setMode('forgot');
                    }}
                    className="text-xs font-medium text-[#B45309] hover:text-[#92400E] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#857467] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD0C2] text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#B45309] focus:border-[#B45309] transition-all placeholder:text-[#9B8C80]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#2B231D] hover:bg-[#3D322A] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In With Email</span>
                    <ArrowRight className="w-4 h-4 text-[#E5DACB]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD (REQUEST CODE) */}
          {mode === 'forgot' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="flex items-center gap-2 text-[#2B231D] font-medium text-sm pb-1 border-b border-[#EFE7DE]">
                <KeyRound className="w-4 h-4 text-[#B45309]" />
                <span>Recover Administrator Password</span>
              </div>
              
              <p className="text-xs text-[#6B5A4E]">
                Enter your registered admin email address to generate a 6-digit recovery code.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#574A40] mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#857467] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@nirvana.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD0C2] text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#B45309] focus:border-[#B45309] transition-all placeholder:text-[#9B8C80]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode('login');
                  }}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-[#DDD0C2] text-[#574A40] hover:bg-[#F5ECE0] text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Get Reset Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* MODE: RESET PASSWORD (SUBMIT CODE & NEW PASSWORD) */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-[#EFE7DE]">
                <div className="flex items-center gap-2 text-[#2B231D] font-medium text-sm">
                  <KeyRound className="w-4 h-4 text-[#B45309]" />
                  <span>Set New Password</span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestCode}
                  className="text-[11px] text-[#B45309] hover:underline flex items-center gap-1"
                  title="Resend verification code"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#574A40] mb-1.5">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-digit code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD0C2] font-mono tracking-widest text-center text-base font-bold text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#B45309] focus:border-[#B45309] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#574A40] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#857467] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD0C2] text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#B45309] focus:border-[#B45309] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#574A40] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#857467] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD0C2] text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#B45309] focus:border-[#B45309] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode('login');
                  }}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-[#DDD0C2] text-[#574A40] hover:bg-[#F5ECE0] text-xs font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#2B231D] hover:bg-[#3D322A] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Quick Credential Guide Card */}
          <div className="pt-4 border-t border-[#EFE7DE] bg-[#F7F2EA]/60 p-3.5 rounded-2xl border border-[#E5DACB] text-[11px] text-[#6B5A4E] space-y-1">
            <div className="font-semibold text-[#2B231D] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Configured Administrator Credentials:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] mt-1 pt-1 border-t border-[#E5DACB]/50">
              <div>
                <span className="text-[#857467]">NIRVANA Admin:</span>
                <p className="font-mono text-[#2B231D]">admin@nirvana.edu</p>
                <p className="font-mono text-[#857467] text-[10px]">Pass: Admin@123</p>
              </div>
              <div>
                <span className="text-[#857467]">Default Admin:</span>
                <p className="font-mono text-[#2B231D]">admin@club.org</p>
                <p className="font-mono text-[#857467] text-[10px]">Pass: admin123</p>
              </div>
            </div>
          </div>

        </div>

        {/* Back Link to Main Website */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#857467] hover:text-[#2B231D] transition-colors py-1 px-3 rounded-lg hover:bg-[#F3EDE4]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
