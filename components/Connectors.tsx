import React, { useState } from 'react';
import { Database, Plus, RefreshCw, Settings2, X, Globe, Server, Clock, Zap, Edit, Trash2, ArrowRightLeft, Copy, PauseCircle, PlayCircle, Linkedin, Twitter, Stethoscope, Cloud, Briefcase, GraduationCap, MessageSquare, Loader2, FileCode } from 'lucide-react';
import { Connector, ScheduleConfig } from '../types';
import { RestApiForm } from './connectors/RestApiForm';
import { OracleForm } from './connectors/OracleForm';
import { GcsForm } from './connectors/GcsForm';
import { LocalFileForm } from './connectors/LocalFileForm';
import { LinkedInForm, TwitterForm } from './connectors/SocialConnectors';
import { DoximityForm, VeevaForm, SalesforceForm } from './connectors/CrmConnectors';
import { GoogleScholarForm, RepFeedbackForm } from './connectors/OtherConnectors';

interface ConnectorsProps {
  connectors: Connector[];
  onAddConnector: (connector: Connector) => void;
  onUpdateConnector?: (connector: Connector) => void;
  onDeleteConnector?: (id: string) => void;
}

export const Connectors: React.FC<ConnectorsProps> = ({ connectors, onAddConnector, onUpdateConnector, onDeleteConnector }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  
  // Add Connector Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<Connector['type']>('rest_api');
  const [config, setConfig] = useState<Record<string, any>>({});
  
  // Schedule Modal State
  const [scheduleMode, setScheduleMode] = useState<'manual' | 'cron' | 'webhook'>('manual');
  const [scheduleCron, setScheduleCron] = useState('');
  const [schedulePreset, setSchedulePreset] = useState('manual');
  const [scheduleToken, setScheduleToken] = useState('');

  const generateToken = () => {
    return 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const resetForm = () => {
    setName('');
    setType('rest_api');
    setConfig({});
    setEditingConnector(null);
  };

  const populateForm = (connector: Connector) => {
    setName(connector.name);
    setType(connector.type);
    // Clone config to avoid mutation references
    setConfig({ ...connector.config } || {});
  };

  const handleAddNew = () => {
      resetForm();
      setIsModalOpen(true);
  };

  const handleEditConnector = (connector: Connector) => {
      setEditingConnector(connector);
      populateForm(connector);
      setIsModalOpen(true);
  };
  
  const handleOpenSchedule = (connector: Connector) => {
    setEditingConnector(connector);
    if (connector.schedule) {
        setScheduleMode(connector.schedule.mode);
        setScheduleCron(connector.schedule.cron_expression || '0 0 * * *');
        setScheduleToken(connector.schedule.webhook_secret || '');
        
        // Determine preset
        const cron = connector.schedule.cron_expression;
        if (cron === '0 * * * *') setSchedulePreset('hourly');
        else if (cron === '0 0 * * *') setSchedulePreset('daily');
        else if (cron === '0 0 * * 0') setSchedulePreset('weekly');
        else if (connector.schedule.mode === 'manual') setSchedulePreset('manual');
        else if (connector.schedule.mode === 'webhook') {
             setSchedulePreset('webhook');
             if (!connector.schedule.webhook_secret) {
                 setScheduleToken(generateToken());
             }
        }
        else setSchedulePreset('custom');
    } else {
        setScheduleMode('manual');
        setScheduleCron('0 0 * * *');
        setSchedulePreset('manual');
        setScheduleToken('');
    }
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!editingConnector || !onUpdateConnector) return;

    const updatedSchedule: ScheduleConfig = {
        mode: scheduleMode,
        cron_expression: scheduleMode === 'cron' ? scheduleCron : undefined,
        webhook_url: scheduleMode === 'webhook' ? `https://api.behaviour.com/hooks/v1/${editingConnector.id}` : undefined,
        webhook_secret: scheduleMode === 'webhook' ? scheduleToken : undefined
    };

    const updatedConnector = {
        ...editingConnector,
        schedule: updatedSchedule
    };

    onUpdateConnector(updatedConnector);
    setIsScheduleModalOpen(false);
    setEditingConnector(null);
  };

  const handleTriggerSync = async (connector: Connector) => {
    if (!onUpdateConnector || syncingIds.has(connector.id)) return;
    if (connector.status === 'disabled') return;

    setSyncingIds(prev => new Set(prev).add(connector.id));
    onUpdateConnector({ ...connector, status: 'active' });

    setTimeout(() => {
        onUpdateConnector({
            ...connector,
            status: 'active',
            last_run: new Date().toLocaleString(),
            row_count: connector.row_count + Math.floor(Math.random() * 50) + 1
        });

        setTimeout(() => {
             onUpdateConnector({ ...connector, status: 'idle' });
             setSyncingIds(prev => {
                 const newSet = new Set(prev);
                 newSet.delete(connector.id);
                 return newSet;
             });
        }, 1000);
    }, 2000);
  };
  
  const handleToggleStatus = (connector: Connector) => {
    if (!onUpdateConnector) return;
    const newStatus = connector.status === 'disabled' ? 'idle' : 'disabled';
    onUpdateConnector({ ...connector, status: newStatus });
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSchedulePreset(val);
    if (val === 'manual') {
        setScheduleMode('manual');
    } else if (val === 'hourly') {
        setScheduleMode('cron');
        setScheduleCron('0 * * * *');
    } else if (val === 'daily') {
        setScheduleMode('cron');
        setScheduleCron('0 0 * * *');
    } else if (val === 'weekly') {
        setScheduleMode('cron');
        setScheduleCron('0 0 * * 0');
    } else if (val === 'custom') {
        setScheduleMode('cron');
    } else if (val === 'webhook') {
        setScheduleMode('webhook');
        if (!scheduleToken) setScheduleToken(generateToken());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare final config object
    let finalConfig = { ...config };

    // Handle Local File specific logic (metadata generation)
    if (type === 'local_file' && config.selectedFile) {
        finalConfig = {
            ...finalConfig,
            fileName: config.selectedFile.name,
            fileSize: config.selectedFile.size,
            uploadDate: new Date().toISOString(),
            // In a real app, we'd upload the file here and store the URL/Path
            // Here we just store the metadata
        };
    }
    
    // Handle Oracle JAR logic
    if (type === 'oracle' && config.driverJarFile) {
        finalConfig = {
             ...finalConfig,
             driverJar: config.driverJarFile.name
        };
    }

    // Preserve existing mapping if editing
    if (editingConnector && editingConnector.config.mapping) {
        finalConfig.mapping = editingConnector.config.mapping;
    }

    if (editingConnector && onUpdateConnector) {
        const updatedConnector: Connector = {
            ...editingConnector,
            name,
            type,
            config: finalConfig,
        };
        onUpdateConnector(updatedConnector);
    } else {
        const newConnector: Connector = {
            id: `conn_${Date.now()}`,
            name,
            type,
            status: 'idle',
            last_run: 'Never',
            row_count: 0,
            config: finalConfig,
            schedule: { mode: 'manual' }
        };
        onAddConnector(newConnector);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId && onDeleteConnector) {
        onDeleteConnector(deleteConfirmationId);
        setDeleteConfirmationId(null);
    }
  };

  const getIconForType = (type: string) => {
      switch(type) {
          case 'oracle': return Database;
          case 'gcs': return Server;
          case 'local_file': return FileCode;
          case 'linkedin': return Linkedin;
          case 'twitter': return Twitter;
          case 'doximity': return Stethoscope;
          case 'veeva': return Briefcase;
          case 'salesforce': return Cloud;
          case 'google_scholar': return GraduationCap;
          case 'rep_feedback': return MessageSquare;
          default: return Globe;
      }
  };

  const renderConfigForm = () => {
      switch(type) {
          case 'rest_api': return <RestApiForm config={config} onChange={setConfig} />;
          case 'oracle': return <OracleForm config={config} onChange={setConfig} />;
          case 'gcs': return <GcsForm config={config} onChange={setConfig} />;
          case 'local_file': return <LocalFileForm config={config} onChange={setConfig} />;
          case 'linkedin': return <LinkedInForm config={config} onChange={setConfig} />;
          case 'twitter': return <TwitterForm config={config} onChange={setConfig} />;
          case 'doximity': return <DoximityForm config={config} onChange={setConfig} />;
          case 'veeva': return <VeevaForm config={config} onChange={setConfig} />;
          case 'salesforce': return <SalesforceForm config={config} onChange={setConfig} />;
          case 'google_scholar': return <GoogleScholarForm config={config} onChange={setConfig} />;
          case 'rep_feedback': return <RepFeedbackForm config={config} onChange={setConfig} />;
          default: return <div className="p-4 text-slate-500 italic">Configuration not available for this type.</div>;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Data Connectors</h1>
            <p className="text-slate-500 mt-1">Manage ingestion sources and connection definitions.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Connector
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectors.map((conn) => {
          const isSyncing = syncingIds.has(conn.id);
          const Icon = getIconForType(conn.type);
          
          return (
          <div key={conn.id} className={`glass-card p-6 rounded-2xl transition-all group relative overflow-hidden ${conn.status === 'disabled' ? 'bg-slate-100/50 opacity-80' : 'hover:bg-white/60'}`}>
             <div className={`absolute top-0 left-0 w-1 h-full ${
                  conn.status === 'active' ? 'bg-green-500' : 
                  conn.status === 'error' ? 'bg-red-500' : 
                  conn.status === 'disabled' ? 'bg-slate-300' : 'bg-blue-400'
             }`}></div>

            <div className="flex justify-between items-start mb-4 pl-3">
              <div className={`p-3 rounded-xl transition-colors shadow-sm ${conn.status === 'disabled' ? 'bg-slate-200' : 'bg-white/50 group-hover:bg-blue-50'}`}>
                <Icon className={`w-6 h-6 ${conn.status === 'disabled' ? 'text-slate-400' : 'text-slate-600 group-hover:text-blue-600'}`} />
              </div>
              <div className="flex space-x-1 relative z-10">
                <button 
                    onClick={() => handleToggleStatus(conn)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-full transition-colors"
                    title={conn.status === 'disabled' ? "Enable Connector" : "Disable Connector"}
                >
                    {conn.status === 'disabled' ? <PlayCircle className="w-4 h-4 text-green-600" /> : <PauseCircle className="w-4 h-4" />}
                </button>
                <div className="w-px bg-slate-200 mx-1 my-1"></div>
                <button 
                    onClick={() => handleTriggerSync(conn)}
                    disabled={isSyncing || conn.status === 'disabled'}
                    className={`p-2 rounded-full transition-colors ${
                        isSyncing ? 'text-blue-600 bg-blue-50' : 
                        conn.status === 'disabled' ? 'text-slate-300 cursor-not-allowed' :
                        'text-slate-400 hover:text-blue-600 hover:bg-white/80'
                    }`}
                    title="Trigger Sync"
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </button>
                <button 
                    onClick={() => handleEditConnector(conn)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-full transition-colors"
                    title="Edit Configuration"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => handleOpenSchedule(conn)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-full transition-colors"
                    title="Configure Schedule"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                {onDeleteConnector && (
                  <button 
                      type="button"
                      onClick={(e) => handleDeleteClick(e, conn.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-white/80 rounded-full transition-colors"
                      title="Delete Connector"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="pl-3">
                <h3 className={`text-lg font-bold ${conn.status === 'disabled' ? 'text-slate-500' : 'text-slate-800'}`}>{conn.name}</h3>
                <p className="text-sm text-slate-500 capitalize mb-6">{conn.type.replace('_', ' ')}</p>

                <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500">Status</span>
                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full capitalize ${
                        conn.status === 'active' ? 'text-green-700 bg-green-100' : 
                        conn.status === 'error' ? 'text-red-700 bg-red-100' : 
                        conn.status === 'disabled' ? 'text-slate-500 bg-slate-200' : 'text-blue-700 bg-blue-100'
                    }`}>
                        {conn.status}
                    </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500">Schedule</span>
                    <div className="flex items-center text-slate-800 font-medium">
                        {conn.schedule?.mode === 'cron' ? (
                            <>
                                <Clock className="w-3 h-3 mr-1 text-slate-400" />
                                <span className="text-xs">{conn.schedule.cron_expression}</span>
                            </>
                        ) : conn.schedule?.mode === 'webhook' ? (
                            <>
                                <Zap className="w-3 h-3 mr-1 text-amber-500" />
                                <span className="text-xs">Webhook</span>
                            </>
                        ) : (
                            <span className="text-xs text-slate-400">Manual</span>
                        )}
                    </div>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500">Last Run</span>
                    <span className="text-slate-800 font-medium">{conn.last_run}</span>
                </div>
                <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Records</span>
                    <span className="text-slate-800 font-mono font-bold">{conn.row_count.toLocaleString()}</span>
                </div>
                </div>
            </div>
          </div>
          );
        })}

        {/* Add New Placeholder */}
        <button 
          onClick={handleAddNew}
          className="border-2 border-dashed border-slate-300/60 bg-white/20 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all group backdrop-blur-sm"
        >
            <div className="bg-white/50 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Plus className="w-8 h-8" />
            </div>
            <span className="font-semibold">Configure New Source</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Connector?</h3>
                <p className="text-sm text-slate-600 mb-6">
                    Are you sure you want to remove this data source? This action cannot be undone.
                </p>
                <div className="flex space-x-3 justify-center">
                    <button 
                        onClick={() => setDeleteConfirmationId(null)}
                        className="px-4 py-2 text-slate-700 hover:bg-white/50 rounded-xl text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-red-500/30"
                    >
                        Delete
                    </button>
                </div>
           </div>
        </div>
      )}

      {/* Add/Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/40 flex items-center justify-between bg-white/40">
              <h3 className="text-lg font-bold text-slate-800">
                  {editingConnector ? 'Edit Connector' : 'Add New Connector'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors bg-white/50 p-1.5 rounded-lg hover:bg-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* Basic Info Section */}
                <div className="space-y-5">
                    <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm uppercase tracking-wide border-b border-slate-200/50 pb-1">
                        <Server className="w-4 h-4 text-blue-500" />
                        <span>Connection Details</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Connector Name</label>
                            <input 
                                required
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. CRM Daily Extract"
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow text-slate-800"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Source Type</label>
                            <select 
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-shadow text-slate-800"
                            >
                                <option value="rest_api">REST API</option>
                                <option value="oracle">Oracle Database</option>
                                <option value="gcs">Google Cloud Storage</option>
                                <option value="local_file">Local File</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="twitter">Twitter (X)</option>
                                <option value="doximity">Doximity</option>
                                <option value="veeva">Veeva CRM (Vault)</option>
                                <option value="salesforce">Salesforce</option>
                                <option value="google_scholar">Google Scholar</option>
                                <option value="rep_feedback">Rep Feedback Aggregator</option>
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Configuration Form */}
                    {renderConfigForm()}

                </div>
              </div>

              <div className="px-6 py-4 bg-white/40 border-t border-white/40 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-white/50 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-500/30">
                  {editingConnector ? 'Save Changes' : 'Create Connector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Configuration Modal - Glass Style */}
      {isScheduleModalOpen && editingConnector && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-md p-6">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-lg text-slate-800">Configure Sync</h3>
                     <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-500 hover:text-slate-700"><X className="w-5 h-5"/></button>
                 </div>
                 
                 <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Frequency / Trigger</label>
                        <select 
                            value={schedulePreset}
                            onChange={handlePresetChange}
                            className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                        >
                            <option value="manual">Manual Only</option>
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily (Midnight)</option>
                            <option value="weekly">Weekly (Sunday)</option>
                            <option value="custom">Custom Cron Expression</option>
                            <option value="webhook">Webhook Trigger</option>
                        </select>
                     </div>

                     {scheduleMode === 'cron' && (
                         <div className="animate-in fade-in slide-in-from-top-2">
                             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cron Expression</label>
                             <div className="relative">
                                 <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                 <input 
                                     type="text" 
                                     value={scheduleCron}
                                     onChange={(e) => setScheduleCron(e.target.value)}
                                     placeholder="0 0 * * *"
                                     className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-mono text-sm"
                                 />
                             </div>
                             <p className="text-xs text-slate-500 mt-1.5 ml-1">UTC Timezone</p>
                         </div>
                     )}

                     {scheduleMode === 'webhook' && (
                         <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                             <div className="flex items-center text-blue-800 font-bold text-sm mb-2">
                                 <Zap className="w-4 h-4 mr-2" />
                                 Webhook Endpoint
                             </div>
                             <div className="bg-white p-2 rounded border border-blue-100 text-xs font-mono text-slate-600 break-all select-all">
                                 https://api.behaviour.com/hooks/v1/{editingConnector.id}
                             </div>
                             <p className="text-xs text-blue-600 mt-2 mb-4">
                                 POST to this URL to trigger ingestion run.
                             </p>

                             <div className="mt-3">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Security Token (Secret)</label>
                                <div className="flex">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={scheduleToken} 
                                        className="flex-1 px-3 py-2 bg-white/80 border border-slate-200 rounded-l-lg text-xs font-mono text-slate-600 outline-none"
                                    />
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(scheduleToken)}
                                        className="bg-white hover:bg-slate-50 border border-l-0 border-slate-200 rounded-r-lg px-3 flex items-center justify-center transition-colors"
                                        title="Copy Token"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    </button>
                                    <button
                                        onClick={() => setScheduleToken(generateToken())}
                                        className="ml-2 p-2 text-slate-400 hover:text-blue-600"
                                        title="Regenerate Token"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Include this token in the <code>X-Webhook-Secret</code> header.
                                </p>
                            </div>
                         </div>
                     )}

                     <button 
                        onClick={handleSaveSchedule} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all mt-4"
                     >
                        Save Configuration
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};