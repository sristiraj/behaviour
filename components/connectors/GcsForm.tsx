import React from 'react';

interface GcsFormProps {
    config: any;
    onChange: (config: any) => void;
}

export const GcsForm: React.FC<GcsFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bucket Name</label>
                <input 
                    required
                    type="text" 
                    value={config.bucket || ''}
                    onChange={(e) => update('bucket', e.target.value)}
                    placeholder="my-data-bucket"
                    className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                />
            </div>
            
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Authentication Type</label>
                <select 
                    value={config.authType || 'system'}
                    onChange={(e) => update('authType', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                >
                    <option value="system">System Credentials (ADC)</option>
                    <option value="service_account">Service Account Key (JSON)</option>
                    <option value="access_token">Access Token</option>
                </select>
            </div>

            {config.authType === 'access_token' && (
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Access Token</label>
                    <input 
                        required
                        type="password" 
                        value={config.accessToken || ''}
                        onChange={(e) => update('accessToken', e.target.value)}
                        placeholder="ya29..."
                        className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                    />
                </div>
            )}

            {config.authType === 'service_account' && (
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service Account Key JSON</label>
                    <textarea 
                        rows={3}
                        value={config.serviceAccountKey || ''}
                        onChange={(e) => update('serviceAccountKey', e.target.value)}
                        placeholder="{ 'type': 'service_account', ... }"
                        className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-mono text-xs"
                    />
                </div>
            )}
        </div>
    );
};