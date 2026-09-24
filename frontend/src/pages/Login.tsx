import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../services/auth';
import { LogoIcon } from '../components/Logo';
import { GlowButton } from '../components/ui/GlowButton';

export const Login: React.FC = () => {
  const { login, switchRolePreset } = useAuth();
  const [username, setUsername] = useState('control_officer');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await login(username, password);
    setLoading(false);
    if (!ok) {
      setError('Invalid NetID credentials. Please check your username and password.');
    }
  };

  const quickRoles = [
    { username: 'control_officer', role: 'Traffic Control Officer', desc: 'Chief Controller with schedule approval & simulation rights', dept: 'Operations' },
    { username: 'eng_officer', role: 'Divisional Engineer (Track)', desc: 'Permanent Way, rails, tamping & ballast works', dept: 'Engineering' },
    { username: 'snt_officer', role: 'Divisional S&T Engineer', desc: 'Point machines, axle counters & signal interlocking', dept: 'S&T' },
    { username: 'trac_officer', role: 'Divisional Electrical Engineer', desc: '25kV AC OHE catenary, power cut & tower wagons', dept: 'Traction' },
    { username: 'admin', role: 'Chief Operations Manager', desc: 'Full administration, master data & audit controls', dept: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] railway-grid-bg flex flex-col justify-center items-center p-4 selection:bg-[#9C7B4F] selection:text-white relative">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-warm-lg mb-3">
            <LogoIcon className="w-16 h-16 drop-shadow-sm" />
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <h1 className="text-3xl font-extrabold font-mono tracking-tight text-stone-900">
              PATRI
            </h1>
            <span className="text-xl font-bold text-[#9C7B4F]">
              पट्री
            </span>
          </div>
          <p className="text-xs text-[#82653D] font-semibold tracking-wide mt-1">
            Predictive &amp; Adaptive Track Resource Intelligence
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            Indian Railways Maintenance Planning &amp; Optimization Platform (SIH26027)
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white/90 border border-[#E7E0D2] rounded-3xl p-6 md:p-8 shadow-warm-xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Railway NetID / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9C7B4F] focus:bg-white font-mono transition-all shadow-warm-xs"
                placeholder="e.g. control_officer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9C7B4F] focus:bg-white font-mono transition-all shadow-warm-xs"
                placeholder="••••••••"
              />
            </div>

            <GlowButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              {loading ? 'Authenticating...' : 'Sign In to RailNet Portal'}
            </GlowButton>
          </form>

          {/* SIH One-Click Evaluation Presets */}
          <div className="mt-6 pt-5 border-t border-[#EFE9DC]">
            <div className="flex items-center gap-1.5 mb-2.5">
              <UserCheck className="w-4 h-4 text-[#9C7B4F]" />
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider font-mono">
                SIH Evaluation — 1-Click Role Access:
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {quickRoles.map((r) => (
                <button
                  key={r.username}
                  type="button"
                  onClick={() => switchRolePreset(r.username)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#FAF6EE] hover:bg-white hover:border-[#9C7B4F]/40 border border-[#E7E0D2] transition-all flex items-center justify-between group shadow-warm-xs cursor-pointer"
                >
                  <div className="overflow-hidden min-w-0 mr-2">
                    <p className="text-xs font-semibold text-stone-900 group-hover:text-[#82653D] transition-colors truncate">
                      {r.role}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">{r.desc}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FAF5E4] border border-[#E7E0D2] text-[#82653D] font-mono shrink-0 font-semibold">
                    {r.dept}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Disclaimer Footer */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized Indian Railways Personnel Access Only &bull; 256-Bit Encrypted</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
