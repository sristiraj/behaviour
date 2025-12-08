import React from 'react';
import { Code } from 'lucide-react';

interface OracleFormProps {
    config: any;
    onChange: (config: any) => void;
}

export const OracleForm: React.FC<OracleFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });
    const method = config.method || 'tns';

    const handleJarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            update('driverJarFile', e.target.files[0]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Connection Method</label>
                    <div className="flex bg-slate-100/50 p-1 rounded-xl">
                        <button 
                            type="button"
                            onClick={() => update('method', 'tns')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${method === 'tns' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            TNS (Host/Port/Service)
                        </button>
                        <button 
                            type="button"
                            onClick={() => update('method', 'jdbc')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${method === 'jdbc' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            JDBC URL
                        </button>
                    </div>
                </div>

                {method === 'tns' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Host</label>
                            <input required type="text" value={config.host || ''} onChange={(e) => update('host', e.target.value)} placeholder="oracle.example.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Port</label>
                            <input required type="text" value={config.port || '1521'} onChange={(e) => update('port', e.target.value)} placeholder="1521" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service Name</label>
                            <input required type="text" value={config.service || ''} onChange={(e) => update('service', e.target.value)} placeholder="ORCL" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">JDBC URL</label>
                            <input required type="text" value={config.jdbcUrl || ''} onChange={(e) => update('jdbcUrl', e.target.value)} placeholder="jdbc:oracle:thin:@//host:1521/service" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Driver JAR (Optional)</label>
                            <input type="file" onChange={handleJarChange} accept=".jar" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                        <input required type="text" value={config.username || ''} onChange={(e) => update('username', e.target.value)} className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                        <input required type="password" value={config.password || ''} onChange={(e) => update('password', e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                    </div>
                </div>
            </div>

            <div className="pt-2 border-t border-slate-200/50">
                 <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm uppercase tracking-wide mb-4">
                    <Code className="w-4 h-4 text-purple-500" />
                    <span>Source Definition</span>
                </div>
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
                        <span>SQL Extraction Query</span>
                        <span className="text-xs font-normal text-slate-500">Defines columns available for mapping</span>
                    </label>
                    <div className="relative">
                        <Code className="absolute top-3 left-3 w-4 h-4 text-slate-400" />
                        <textarea 
                            rows={4}
                            value={config.query || ''}
                            onChange={(e) => update('query', e.target.value)}
                            placeholder="SELECT npi_num, first_name, specialty FROM hcp_master"
                            className="w-full pl-10 pr-4 py-3 bg-slate-900 text-slate-200 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-mono text-xs leading-relaxed"
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};