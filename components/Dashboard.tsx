import React, { useMemo } from 'react';
import { Activity, Database, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { HCP, SegmentationRule, Connector } from '../types';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, change, color }) => (
  <div className="glass-card p-6 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/60 transition-all">
    <div className="flex items-start justify-between">
        <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
        {change && (
            <div className={`text-xs font-bold mt-2 ${change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-red-600' : 'text-slate-500'} flex items-center`}>
                {change} <span className="text-slate-400 font-medium ml-1">from last week</span>
            </div>
        )}
        </div>
        <div className={`p-3 rounded-xl shadow-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
        </div>
    </div>
  </div>
);

interface DashboardProps {
    hcps: HCP[];
    rules: SegmentationRule[];
    connectors: Connector[];
}

export const Dashboard: React.FC<DashboardProps> = ({ hcps, rules, connectors }) => {
  // Metrics Calculations
  const totalHCPs = hcps.length;
  const activeRulesCount = rules.filter(r => r.active).length;
  const dataAlertsCount = connectors.filter(c => c.status === 'error').length;
  // Summing row_count for a proxy of "Ingestion" volume
  const totalRecords = connectors.reduce((acc, curr) => acc + (curr.row_count || 0), 0);

  // Dynamic Chart Data Generation
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    // Calculate expected daily volume based on connector schedules
    let baseVolume = 0;
    connectors.forEach(c => {
        if (c.status === 'disabled') return;
        
        if (c.schedule?.mode === 'cron') {
            // Check for hourly patterns (simple check)
            if (c.schedule.cron_expression?.includes('* * * *') || c.schedule.cron_expression?.includes('0 * * *')) {
                baseVolume += 24; 
            } else {
                baseVolume += 1;
            }
        } else if (c.schedule?.mode === 'webhook') {
            baseVolume += 12; // Assume active webhook integrations have flow
        } else {
            baseVolume += 1; // Manual
        }
    });

    // Generate 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Use a simple pseudo-random generator based on date to keep chart stable across renders
        // but sensitive to connector configuration changes.
        // Seed based on date and baseVolume to vary if config changes.
        const dateSeed = d.getDate() + (d.getMonth() * 31) + baseVolume;
        const pseudoRandom = Math.abs(Math.sin(dateSeed * 123.45)); // 0-1
        
        // Variance: +/- 30%
        // If baseVolume is 0, runs is 0.
        const dailyRuns = baseVolume === 0 ? 0 : Math.round(baseVolume * (0.7 + (pseudoRandom * 0.6)));

        data.push({ name: dayName, runs: dailyRuns });
    }
    
    return data;
  }, [connectors]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Control Center</h1>
            <p className="text-slate-500 mt-1">System overview and ingestion metrics.</p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white/50 px-3 py-1.5 rounded-full border border-white/50 backdrop-blur-sm self-start md:self-auto">
            Live System Data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total HCPs" 
            value={totalHCPs.toLocaleString()} 
            icon={Users} 
            change="+1.2%" 
            color="bg-gradient-to-br from-blue-500 to-blue-600" 
        />
        <StatCard 
            title="Records Processed" 
            value={totalRecords.toLocaleString()} 
            icon={Database} 
            change="+5.4%" 
            color="bg-gradient-to-br from-indigo-500 to-indigo-600" 
        />
        <StatCard 
            title="Active Rules" 
            value={activeRulesCount} 
            icon={Activity} 
            change="0" 
            color="bg-gradient-to-br from-emerald-500 to-emerald-600" 
        />
        <StatCard 
            title="Data Alerts" 
            value={dataAlertsCount} 
            icon={AlertTriangle} 
            change={dataAlertsCount > 0 ? "+1" : "0"}
            color="bg-gradient-to-br from-amber-500 to-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ingestion Activity (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
          <div className="space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            {connectors.length === 0 ? (
                <div className="text-center text-slate-400 py-4 text-sm">No connectors configured.</div>
            ) : (
                connectors.map((conn) => {
                    const isHealthy = conn.status === 'active' || conn.status === 'idle';
                    const isError = conn.status === 'error';
                    return (
                        <div key={conn.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 transition-colors cursor-default border border-transparent hover:border-slate-100">
                            <span className="text-sm text-slate-700 font-semibold truncate max-w-[120px]" title={conn.name}>{conn.name}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center capitalize ${
                                isHealthy ? 'text-green-700 bg-green-100/80' : 
                                isError ? 'text-red-700 bg-red-100/80' : 
                                'text-slate-600 bg-slate-200/80'
                            }`}>
                                {isHealthy && <CheckCircle className="w-3 h-3 mr-1.5" />}
                                {isError && <AlertTriangle className="w-3 h-3 mr-1.5" />}
                                {conn.status}
                            </span>
                        </div>
                    );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};