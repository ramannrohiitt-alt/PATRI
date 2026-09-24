import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Layers,
  Printer,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { LogoIcon } from '../components/Logo';
import { PageHeader } from '../components/ui/PageHeader';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('weekly');

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        badge="Audit & Compliance"
        title="Divisional Engineering & Audit Reports"
        description="Generate certified maintenance logs, block utilization statements, and train punctuality compliance certificates."
        breadcrumbs={['Operations', 'Audit', 'Reports']}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-white/90 border border-[#E7E0D2] text-stone-800 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-accent-brown/30 font-medium shadow-warm-xs"
            >
              <option value="weekly">Weekly Divisional Report</option>
              <option value="monthly">Monthly Asset Reliability Statement</option>
              <option value="coordination">Multi-Department Coordination Audit</option>
            </select>
            <GlowButton
              variant="secondary"
              onClick={handleExport}
              icon={<Download className="w-4 h-4" />}
            >
              Export / Print Report
            </GlowButton>
          </div>
        }
      />

      {/* Printable Report Document Card */}
      <div className="bg-white/95 border border-[#E7E0D2] rounded-2xl p-8 sm:p-10 shadow-warm-lg space-y-8 text-xs text-stone-800 print:shadow-none print:border-stone-300 print:p-4">
        {/* Document Header */}
        <div className="border-b border-[#E7E0D2] pb-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <LogoIcon className="w-14 h-14 shadow-warm-md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-accent-brown uppercase tracking-widest block">
                  INDIAN RAILWAYS &bull; NORTHERN RAILWAY &bull; PATRI PLATFORM
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 mt-1 tracking-tight">
                Divisional Maintenance Coordination & Track Possession Report
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Division: Delhi &bull; Reporting Period: Week 36 (September 2026) &bull; Ref: NR/DEL/OPT/2026/09
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-xs space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>STATUS: VERIFIED</span>
            </div>
            <span className="text-stone-400 text-[10px] block font-mono">
              Generated: {new Date().toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E7E0D2] shadow-warm-xs">
            <span className="text-stone-500 block text-[11px] font-medium uppercase tracking-wider">
              Total Track Tasks Undertaken
            </span>
            <span className="text-2xl font-bold font-mono text-stone-900 mt-1 block">
              38 Tasks
            </span>
            <div className="mt-2 text-[10px] font-mono text-stone-500 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-white border border-[#E7E0D2] text-stone-700">ENG: 18</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-[#E7E0D2] text-stone-700">S&T: 12</span>
              <span className="px-1.5 py-0.5 rounded bg-white border border-[#E7E0D2] text-stone-700">TRAC: 8</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FAF8F5] to-accent-pale/50 p-5 rounded-xl border border-[#E7E0D2] shadow-warm-xs">
            <span className="text-stone-500 block text-[11px] font-medium uppercase tracking-wider">
              Total Block Window Hours
            </span>
            <span className="text-2xl font-bold font-mono text-accent-brown mt-1 block">
              22.0 Hours
            </span>
            <span className="text-[11px] text-emerald-700 font-medium block mt-2">
              &bull; 16.5 Hours saved via Coordination
            </span>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E7E0D2] shadow-warm-xs">
            <span className="text-stone-500 block text-[11px] font-medium uppercase tracking-wider">
              Train Operation Disruptions
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
              0 Passenger Delays
            </span>
            <span className="text-[11px] text-stone-500 font-medium block mt-2">
              &bull; 100% Punctuality Protected
            </span>
          </div>
        </div>

        {/* Corridor Breakdown Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-stone-900 text-sm">Corridor-wise Possession Log</h4>
            <span className="text-xs font-mono text-stone-500">Certified Section Matrix</span>
          </div>

          <div className="rounded-xl border border-[#E7E0D2] overflow-hidden shadow-warm-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F6EFE9] border-b border-[#E7E0D2] text-stone-600 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 font-semibold">Section Code</th>
                  <th className="p-3.5 font-semibold">Section Route</th>
                  <th className="p-3.5 font-semibold">Possession Hours</th>
                  <th className="p-3.5 font-semibold">Departments Combined</th>
                  <th className="p-3.5 font-semibold">Efficiency Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DC] bg-white">
                {[
                  { code: 'SEC-001', route: 'New Delhi &rarr; Tilak Bridge', hours: '3.0h', depts: 'ENG + S&T + TRAC', eff: '92%' },
                  { code: 'SEC-003', route: 'Nizamuddin &rarr; Faridabad', hours: '3.75h', depts: 'ENG + TRAC', eff: '88%' },
                  { code: 'SEC-007', route: 'Sahibabad &rarr; Ghaziabad', hours: '4.0h', depts: 'ENG + S&T', eff: '85%' },
                  { code: 'SEC-011', route: 'Ghaziabad &rarr; Anand Vihar', hours: '2.5h', depts: 'S&T + TRAC', eff: '90%' }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-accent-brown">{row.code}</td>
                    <td className="p-3.5 font-medium text-stone-800" dangerouslySetInnerHTML={{ __html: row.route }} />
                    <td className="p-3.5 font-mono font-semibold text-stone-700">{row.hours}</td>
                    <td className="p-3.5 font-semibold">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[10px]">
                        {row.depts}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">{row.eff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Officer Signature Disclaimer */}
        <div className="pt-8 border-t border-[#E7E0D2] flex flex-wrap items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            <p className="font-bold text-stone-800 text-xs">Certified by Divisional Traffic Control</p>
            <p className="mt-0.5">Northern Railway, New Delhi Headquarters</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-accent-brown block font-bold text-xs">
              DIGITALLY SIGNED &bull; PATRI OR-TOOLS ENGINE
            </span>
            <p className="font-mono text-[10px] text-stone-400 mt-0.5">Verification Hash: SHA256-8A3F192E-NR-DEL</p>
          </div>
        </div>
      </div>
    </div>
  );
};
