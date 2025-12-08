import React, { useState, useEffect } from 'react';
import { Save, Server, Shield, Activity, Globe, Zap, AlertCircle, Loader2, Users, Lock, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '../services/settingsService';
import { getGroups, getUsers, updateGroup, createGroup, deleteGroup, updateUserProfile } from '../services/userService';
import { SystemSettings, Group, User, Entitlements } from '../types';

// --- Sub-components for Access Control ---

const EntitlementInput = ({ label, values, onChange }: { label: string, values: string[], onChange: (vals: string[]) => void }) => {
    const [inputValue, setInputValue] = useState('');
    
    const handleAdd = () => {
        if (inputValue.trim() && !values.includes(inputValue.trim())) {
            onChange([...values, inputValue.trim()]);
            setInputValue('');
        }
    };

    const remove = (val: string) => {
        onChange(values.filter(v => v !== val));
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2">
                {values.map(v => (
                    <span key={v} className="bg-blue-100/70 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                        {v}
                        <button onClick={() => remove(v)} className="ml-1.5 hover:text-blue-900 bg-white/30 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                    </span>
                ))}
            </div>
            <div className="flex shadow-sm rounded-xl overflow-hidden">
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder={`Add ${label}...`}
                    className="flex-1 px-4 py-2.5 bg-white/70 border-r-0 border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                />
                <button 
                    onClick={handleAdd} 
                    type="button"
                    className="bg-slate-100/80 border border-slate-200 px-4 hover:bg-slate-200/80 text-slate-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const GroupModal = ({ group, onClose, onSave, allUsers }: { group: Group | null, onClose: () => void, onSave: (g: Group) => void, allUsers: User[] }) => {
    const [formData, setFormData] = useState<Group>(group || {
        id: `grp_${Date.now()}`,
        name: '',
        description: '',
        entitlements: { regions: [], countries: [], territories: [] },
        memberIds: []
    });

    const updateEntitlements = (field: keyof Entitlements, vals: string[]) => {
        setFormData({
            ...formData,
            entitlements: { ...formData.entitlements, [field]: vals }
        });
    };

    const toggleMember = (userId: string) => {
        const members = formData.memberIds.includes(userId)
            ? formData.memberIds.filter(id => id !== userId)
            : [...formData.memberIds, userId];
        setFormData({ ...formData, memberIds: members });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-white/40 bg-white/40 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg">{group ? 'Edit Group' : 'Create Group'}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Group Name</label>
                            <input 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                            <input 
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"
                            />
                        </div>
                        
                        <div className="border-t border-white/40 pt-5">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center"><Lock className="w-4 h-4 mr-2 text-blue-500" /> Entitlements</h4>
                            <EntitlementInput label="Regions" values={formData.entitlements.regions} onChange={(v) => updateEntitlements('regions', v)} />
                            <EntitlementInput label="Countries" values={formData.entitlements.countries} onChange={(v) => updateEntitlements('countries', v)} />
                            <EntitlementInput label="Territories" values={formData.entitlements.territories} onChange={(v) => updateEntitlements('territories', v)} />
                        </div>

                        <div className="border-t border-white/40 pt-5">
                             <h4 className="font-bold text-slate-800 mb-4 flex items-center"><Users className="w-4 h-4 mr-2 text-blue-500" /> Members</h4>
                             <div className="max-h-40 overflow-y-auto bg-white/40 border border-slate-200/50 rounded-xl p-2 space-y-1">
                                {allUsers.map(u => (
                                    <label key={u.id} className="flex items-center p-2.5 hover:bg-white/60 rounded-lg cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.memberIds.includes(u.id)} 
                                            onChange={() => toggleMember(u.id)}
                                            className="mr-3 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-slate-700">{u.name} <span className="text-slate-500 text-xs ml-1">({u.role})</span></span>
                                    </label>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-white/40 border-t border-white/40 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-white/50 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                    <button onClick={() => onSave(formData)} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Save Group</button>
                </div>
            </div>
        </div>
    );
};

const UserEntitlementModal = ({ user, onClose, onSave, allGroups }: { user: User, onClose: () => void, onSave: (u: User) => void, allGroups: Group[] }) => {
    const [formData, setFormData] = useState<User>(user);

    const updateEntitlements = (field: keyof Entitlements, vals: string[]) => {
        setFormData({
            ...formData,
            entitlements: { ...(formData.entitlements || {regions: [], countries: [], territories: []}), [field]: vals }
        });
    };

    const toggleGroup = (groupId: string) => {
        const currentGroups = formData.groupIds || [];
        const newGroups = currentGroups.includes(groupId) 
            ? currentGroups.filter(id => id !== groupId)
            : [...currentGroups, groupId];
        setFormData({ ...formData, groupIds: newGroups });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-white/40 bg-white/40 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg">Edit User Access: {user.name}</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div>
                         <h4 className="font-bold text-slate-800 mb-3 flex items-center"><Users className="w-4 h-4 mr-2 text-blue-500" /> Group Memberships</h4>
                         <div className="max-h-40 overflow-y-auto bg-white/40 border border-slate-200/50 rounded-xl p-2 space-y-1">
                                {allGroups.map(g => (
                                    <label key={g.id} className="flex items-center p-2.5 hover:bg-white/60 rounded-lg cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.groupIds?.includes(g.id)} 
                                            onChange={() => toggleGroup(g.id)}
                                            className="mr-3 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                        />
                                        <div>
                                            <div className="text-sm text-slate-800 font-semibold">{g.name}</div>
                                            <div className="text-xs text-slate-500">{g.description}</div>
                                        </div>
                                    </label>
                                ))}
                         </div>
                    </div>

                    <div className="border-t border-white/40 pt-5">
                         <h4 className="font-bold text-slate-800 mb-3 flex items-center"><Lock className="w-4 h-4 mr-2 text-blue-500" /> Direct Entitlements (Overrides)</h4>
                         <p className="text-xs text-slate-500 mb-4 bg-blue-50/50 p-2 rounded-lg">Specify regions, countries, or territories this user can access directly, in addition to their group permissions.</p>
                         <EntitlementInput label="Regions" values={formData.entitlements?.regions || []} onChange={(v) => updateEntitlements('regions', v)} />
                         <EntitlementInput label="Countries" values={formData.entitlements?.countries || []} onChange={(v) => updateEntitlements('countries', v)} />
                         <EntitlementInput label="Territories" values={formData.entitlements?.territories || []} onChange={(v) => updateEntitlements('territories', v)} />
                    </div>
                </div>
                <div className="px-6 py-4 bg-white/40 border-t border-white/40 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-white/50 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                    <button onClick={() => onSave(formData)} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Save User Access</button>
                </div>
             </div>
        </div>
    );
};

// --- Main Settings Component ---

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'access'>('system');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // System Config State
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  
  // Access Control State
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const [sys, usrs, grps] = await Promise.all([
            getSystemSettings(),
            getUsers(),
            getGroups()
        ]);
        setSettings(sys);
        setUsers(usrs);
        setGroups(grps);
    } catch (e) {
        console.error("Failed to load settings data", e);
    } finally {
        setLoading(false);
    }
  };

  const handleSystemSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
        await updateSystemSettings(settings);
        setMessage({ type: 'success', text: 'System settings updated successfully.' });
    } catch (e) {
        setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
        setSaving(false);
    }
  };

  const handleGroupSave = async (group: Group) => {
      setSaving(true);
      try {
          if (groups.find(g => g.id === group.id)) {
              await updateGroup(group);
          } else {
              await createGroup(group);
          }
          setGroups(await getGroups());
          setUsers(await getUsers()); // Refresh users as their groupIds might change
          setIsGroupModalOpen(false);
          setEditingGroup(null);
      } catch (e) {
          console.error(e);
      } finally {
          setSaving(false);
      }
  };

  const handleGroupDelete = async (id: string) => {
      if(!window.confirm("Delete this group?")) return;
      setSaving(true);
      try {
          await deleteGroup(id);
          setGroups(await getGroups());
          setUsers(await getUsers());
      } catch(e) { console.error(e); } finally { setSaving(false); }
  };

  const handleUserSave = async (user: User) => {
      setSaving(true);
      try {
          await updateUserProfile(user);
          setUsers(await getUsers());
          setGroups(await getGroups()); // Refresh groups as memberIds might change
          setEditingUser(null);
      } catch(e) { console.error(e); } finally { setSaving(false); }
  };

  const updateLLMConfig = (field: keyof SystemSettings['llmConfig'], value: any) => {
    if (!settings) return;
    setSettings({
        ...settings,
        llmConfig: { ...settings.llmConfig, [field]: value }
    });
  };

  const updateTracingConfig = (field: keyof SystemSettings['tracingConfig'], value: any) => {
    if (!settings) return;
    setSettings({
        ...settings,
        tracingConfig: { ...settings.tracingConfig, [field]: value }
    });
  };

  if (loading || !settings) {
      return (
          <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h1>
            <p className="text-slate-500 mt-1">Manage system configuration and access controls.</p>
        </div>
        <div className="flex bg-white/50 backdrop-blur-sm rounded-xl p-1.5 border border-white/50 shadow-sm">
             <button 
                onClick={() => setActiveTab('system')}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
             >
                System Configuration
             </button>
             <button 
                onClick={() => setActiveTab('access')}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'access' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Access Control
             </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center shadow-sm animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-100/80 text-green-800 border border-green-200' : 'bg-red-100/80 text-red-800 border border-red-200'}`}>
            {message.type === 'success' ? <Shield className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
            {message.text}
        </div>
      )}

      {/* --- SYSTEM CONFIGURATION TAB --- */}
      {activeTab === 'system' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
             <div className="flex justify-end">
                <button 
                    onClick={handleSystemSave}
                    disabled={saving}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:shadow-none"
                >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Configuration
                </button>
             </div>

            {/* LLM Integration */}
            <div className="glass-panel rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 border-b border-white/40 bg-white/40 flex items-center">
                    <div className="bg-indigo-100/50 p-2 rounded-lg mr-3">
                        <Server className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">LLM Integration Strategy</h3>
                </div>
                <div className="p-8 space-y-8">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-4">Integration Mode</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
                                onClick={() => updateLLMConfig('mode', 'direct')}
                                className={`cursor-pointer border-2 rounded-xl p-5 transition-all relative overflow-hidden ${settings.llmConfig.mode === 'direct' ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-transparent bg-white/50 hover:bg-white/70 hover:shadow-sm'}`}
                            >
                                <div className="flex items-center justify-between mb-2 relative z-10">
                                    <span className="font-bold text-slate-900">Direct API (SDK)</span>
                                    {settings.llmConfig.mode === 'direct' && <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm"></div>}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed relative z-10">Connects directly to Gemini API via Client SDK. Best for development and demos.</p>
                            </div>
                            <div 
                                onClick={() => updateLLMConfig('mode', 'gcp_agent')}
                                className={`cursor-pointer border-2 rounded-xl p-5 transition-all relative overflow-hidden ${settings.llmConfig.mode === 'gcp_agent' ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-transparent bg-white/50 hover:bg-white/70 hover:shadow-sm'}`}
                            >
                                <div className="flex items-center justify-between mb-2 relative z-10">
                                    <span className="font-bold text-slate-900">GCP Agent (Deployed)</span>
                                    {settings.llmConfig.mode === 'gcp_agent' && <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm"></div>}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed relative z-10">Proxies requests through a managed Google Cloud Agent endpoint. Enforces server-side policies and tracing.</p>
                            </div>
                        </div>
                    </div>

                    {settings.llmConfig.mode === 'gcp_agent' && (
                        <div className="space-y-6 pt-6 border-t border-white/40 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Agent Endpoint URL</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            value={settings.llmConfig.agentEndpoint}
                                            onChange={(e) => updateLLMConfig('agentEndpoint', e.target.value)}
                                            placeholder="https://my-agent-service-xyz.a.run.app/v1/query"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Agent Location</label>
                                    <input 
                                        type="text" 
                                        value={settings.llmConfig.location}
                                        onChange={(e) => updateLLMConfig('location', e.target.value)}
                                        placeholder="us-central1"
                                        className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Auth Token (Optional)</label>
                                    <input 
                                        type="password" 
                                        value={settings.llmConfig.agentAuthToken || ''}
                                        onChange={(e) => updateLLMConfig('agentAuthToken', e.target.value)}
                                        placeholder="Service Account Token"
                                        className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Observability & Tracing */}
            <div className="glass-panel rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 border-b border-white/40 bg-white/40 flex items-center">
                    <div className="bg-emerald-100/50 p-2 rounded-lg mr-3">
                        <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">Observability & Tracing</h3>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex items-start bg-amber-50/70 p-4 rounded-xl border border-amber-100/50 mb-6">
                        <Zap className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-900">
                            <p className="font-bold">Google Agents Integration</p>
                            <p className="mt-1 opacity-80 leading-relaxed">When using the GCP Agent mode, distributed tracing context is propagated automatically via headers.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Trace Provider</label>
                            <select 
                                value={settings.tracingConfig.provider}
                                onChange={(e) => updateTracingConfig('provider', e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                            >
                                <option value="none">None (Disabled)</option>
                                <option value="google_cloud_trace">Google Cloud Trace</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Google Project ID</label>
                            <input 
                                type="text" 
                                value={settings.tracingConfig.projectId || ''}
                                onChange={(e) => updateTracingConfig('projectId', e.target.value)}
                                placeholder="my-gcp-project-id"
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Sampling Rate (0.0 - 1.0)</label>
                            <input 
                                type="number" 
                                min="0"
                                max="1"
                                step="0.1"
                                value={settings.tracingConfig.sampleRate}
                                onChange={(e) => updateTracingConfig('sampleRate', parseFloat(e.target.value))}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow"
                            />
                        </div>
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* --- ACCESS CONTROL TAB --- */}
      {activeTab === 'access' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Groups Section */}
              <div className="glass-panel rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-5 border-b border-white/40 bg-white/40 flex items-center justify-between">
                     <div className="flex items-center">
                        <div className="bg-indigo-100/50 p-2 rounded-lg mr-3">
                            <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-800">Authorization Groups</h3>
                     </div>
                     <button 
                        onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }}
                        className="flex items-center text-sm font-semibold bg-white/60 hover:bg-white/90 border border-white/50 px-4 py-2 rounded-xl text-slate-700 transition-all shadow-sm"
                     >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Group
                     </button>
                  </div>
                  <div className="divide-y divide-white/40">
                      {groups.length === 0 && <div className="p-10 text-center text-slate-500 text-sm">No groups defined.</div>}
                      {groups.map(grp => (
                          <div key={grp.id} className="p-5 flex items-center justify-between hover:bg-white/30 transition-colors">
                              <div>
                                  <div className="font-bold text-slate-900 flex items-center">
                                    {grp.name}
                                    <span className="ml-3 bg-white/60 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                                        {grp.memberIds.length} members
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1 max-w-lg font-medium">{grp.description}</div>
                                  <div className="flex flex-wrap gap-2 mt-3">
                                      {grp.entitlements.regions.map(r => <span key={r} className="text-[10px] uppercase font-bold bg-indigo-100/70 text-indigo-700 px-2 py-1 rounded-md">{r}</span>)}
                                      {grp.entitlements.countries.map(c => <span key={c} className="text-[10px] uppercase font-bold bg-blue-100/70 text-blue-700 px-2 py-1 rounded-md">{c}</span>)}
                                      {grp.entitlements.territories.map(t => <span key={t} className="text-[10px] uppercase font-bold bg-emerald-100/70 text-emerald-700 px-2 py-1 rounded-md">{t}</span>)}
                                  </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <button onClick={() => { setEditingGroup(grp); setIsGroupModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white/60 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleGroupDelete(grp.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white/60 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Users Section */}
              <div className="glass-panel rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-5 border-b border-white/40 bg-white/40 flex items-center">
                    <div className="bg-emerald-100/50 p-2 rounded-lg mr-3">
                        <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">User Access & Overrides</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/40">
                        <thead className="bg-slate-50/30">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Groups</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Entitlements</th>
                                <th className="relative px-6 py-4"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40">
                            {users.map(user => {
                                const userGroupNames = groups.filter(g => user.groupIds?.includes(g.id)).map(g => g.name);
                                const hasDirect = user.entitlements && (user.entitlements.regions.length > 0 || user.entitlements.countries.length > 0 || user.entitlements.territories.length > 0);

                                return (
                                    <tr key={user.id} className="hover:bg-white/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-9 w-9 rounded-full bg-slate-200/80 flex items-center justify-center text-xs font-bold text-slate-600 mr-3 shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full bg-slate-100 text-slate-600 capitalize border border-slate-200">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {userGroupNames.length > 0 ? userGroupNames.map(gn => (
                                                    <span key={gn} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 whitespace-nowrap">{gn}</span>
                                                )) : <span className="text-xs text-slate-400 italic">None</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {hasDirect ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                     {user.entitlements?.regions.map(r => <span key={r} className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">{r}</span>)}
                                                     {user.entitlements?.countries.map(c => <span key={c} className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded border border-purple-100">{c}</span>)}
                                                     {user.entitlements?.territories.map(t => <span key={t} className="text-[10px] font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded border border-pink-100">{t}</span>)}
                                                </div>
                                            ) : <span className="text-xs text-slate-400 italic">Inherited only</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">Edit Access</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {/* Modals */}
      {isGroupModalOpen && <GroupModal group={editingGroup} onClose={() => setIsGroupModalOpen(false)} onSave={handleGroupSave} allUsers={users} />}
      {editingUser && <UserEntitlementModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUserSave} allGroups={groups} />}
    </div>
  );
};