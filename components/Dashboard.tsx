import React from 'react';
import { Activity, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', runs: 40 },
  { name: 'Tue', runs: 30 },
  { name: 'Wed', runs: 20 },
  { name: 'Thu', runs: 27 },
  { name: 'Fri', runs: 18 },
  { name: 'Sat', runs: 23 },
  { name: 'Sun', runs: 34 },
];

const StatCard = ({ title, value, icon: Icon, change, color }: any) => (
  <div className="glass-card p-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/60 transition-all">
    <div className="flex items-start justify-between">
        <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
        <div className={`text-xs font-bold mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'} flex items-center`}>
            {change} <span className="text-slate-400 font-medium ml-1">from last week</span>
        </div>
        </div>
        <div className={`p-3 rounded-xl shadow-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
        </div>
    </div>
  </div>
);

export const Dashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Control Center</h1>
            <p className="text-slate-500 mt-1">System overview and ingestion metrics.</p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white/50 px-3 py-1.5 rounded-full border border-white/50 backdrop-blur-sm self-start md:self-auto">
            Live Updates Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total HCPs" value="12,504" icon={Users} change="+2.5%" color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard title="Ingestion Runs" value="342" icon={Database} change="+12%" color="bg-gradient-to-br from-indigo-500 to-indigo-600" />
        <StatCard title="Active Rules" value="18" icon={Activity} change="+0%" color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard title="Data Alerts" value="3" icon={AlertTriangle} change="-1" color="bg-gradient-to-br from-amber-500 to-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ingestion Activity</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.4)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.9)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '10px 14px' }}
                />
                <Bar dataKey="runs" fill="url(#colorRun)" radius={[6, 6, 6, 6]} barSize={40} />
                <defs>
                    <linearGradient id="colorRun" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 mb-6">System Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Oracle Connector', status: 'Healthy', color: 'text-green-600 bg-green-100' },
              { label: 'PubMed API', status: 'Healthy', color: 'text-green-600 bg-green-100' },
              { label: 'LLM Service (Gemini)', status: 'Active', color: 'text-green-600 bg-green-100' },
              { label: 'Veeva Sync', status: 'Syncing...', color: 'text-blue-600 bg-blue-100' },
              { label: 'GCS Bucket', status: 'Warning', color: 'text-amber-600 bg-amber-100' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 transition-colors cursor-default">
                <span className="text-sm text-slate-700 font-semibold">{item.label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center ${item.color.split(' ')[1]} ${item.color.split(' ')[0]}`}>
                   {item.status === 'Healthy' && <CheckCircle className="w-3 h-3 mr-1.5" />}
                   {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Users = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);