import React, { useState } from 'react';
import { Database, Plus, RefreshCw, Settings2, X, Upload, FileCode, Globe, Server, Clock, Zap, Edit, Trash2, ArrowRightLeft, Braces, Code, Loader2, Copy, PauseCircle, PlayCircle, Linkedin, Twitter, Stethoscope, Cloud, Briefcase, GraduationCap, MessageSquare } from 'lucide-react';
import { Connector, ScheduleConfig } from '../types';

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
  
  // Generic / REST Config
  const [configEndpoint, setConfigEndpoint] = useState('');
  const [restAuthType, setRestAuthType] = useState<'none' | 'pat' | 'jwt' | 'oauth2'>('none');
  const [restToken, setRestToken] = useState('');
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
  const [oauthTokenUrl, setOauthTokenUrl] = useState('');
  const [oauthScopes, setOauthScopes] = useState('');
  const [jsonSample, setJsonSample] = useState('');
  
  // Oracle Config
  const [oracleMethod, setOracleMethod] = useState<'tns' | 'jdbc'>('tns');
  const [oracleHost, setOracleHost] = useState('');
  const [oraclePort, setOraclePort] = useState('1521');
  const [oracleSid, setOracleSid] = useState('');
  const [oracleUser, setOracleUser] = useState('');
  const [oraclePass, setOraclePass] = useState('');
  const [oracleJdbcUrl, setOracleJdbcUrl] = useState('');
  const [oracleJar, setOracleJar] = useState<File | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');

  // GCS Config
  const [configBucket, setConfigBucket] = useState('');
  const [gcsAuthType, setGcsAuthType] = useState<'system' | 'access_token' | 'service_account'>('system');
  const [gcsToken, setGcsToken] = useState('');
  
  // Local File Config
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Social Connectors Config
  const [linkedinClientId, setLinkedinClientId] = useState('');
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('');
  const [linkedinOrgId, setLinkedinOrgId] = useState('');
  
  const [twitterApiKey, setTwitterApiKey] = useState('');
  const [twitterApiSecret, setTwitterApiSecret] = useState('');
  const [twitterBearerToken, setTwitterBearerToken] = useState('');

  // CRM Connectors Config
  const [doximityClientId, setDoximityClientId] = useState('');
  const [doximityClientSecret, setDoximityClientSecret] = useState('');

  const [veevaUrl, setVeevaUrl] = useState('');
  const [veevaUser, setVeevaUser] = useState('');
  const [veevaPass, setVeevaPass] = useState('');
  
  const [sfInstanceUrl, setSfInstanceUrl] = useState('');
  const [sfClientId, setSfClientId] = useState('');
  const [sfClientSecret, setSfClientSecret] = useState('');
  const [sfUser, setSfUser] = useState('');
  const [sfPass, setSfPass] = useState(''); // Pass + Security Token

  // New Connectors Config
  const [scholarApiKey, setScholarApiKey] = useState('');
  const [repFeedbackUrl, setRepFeedbackUrl] = useState('');
  const [repFeedbackKey, setRepFeedbackKey] = useState('');

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
    setConfigEndpoint('');
    setRestAuthType('none');
    setRestToken('');
    setOauthClientId('');
    setOauthClientSecret('');
    setOauthTokenUrl('');
    setOauthScopes('');
    setJsonSample('');
    setOracleMethod('tns');
    setOracleHost('');
    setOraclePort('1521');
    setOracleSid('');
    setOracleUser('');
    setOraclePass('');
    setOracleJdbcUrl('');
    setOracleJar(null);
    setSqlQuery('');
    setConfigBucket('');
    setGcsAuthType('system');
    setGcsToken('');
    setSelectedFile(null);
    setLinkedinClientId('');
    setLinkedinClientSecret('');
    setLinkedinOrgId('');
    setTwitterApiKey('');
    setTwitterApiSecret('');
    setTwitterBearerToken('');
    setDoximityClientId('');
    setDoximityClientSecret('');
    setVeevaUrl('');
    setVeevaUser('');
    setVeevaPass('');
    setSfInstanceUrl('');
    setSfClientId('');
    setSfClientSecret('');
    setSfUser('');
    setSfPass('');
    setScholarApiKey('');
    setRepFeedbackUrl('');
    setRepFeedbackKey('');
    setEditingConnector(null);
  };

  const populateForm = (connector: Connector) => {
    setName(connector.name);
    setType(connector.type);
    
    const config = connector.config || {};

    if (connector.type === 'rest_api') {
        setConfigEndpoint(config.endpoint || '');
        setRestAuthType(config.authType || 'none');
        setRestToken(config.token || '');
        setOauthClientId(config.clientId || '');
        setOauthClientSecret(config.clientSecret || '');
        setOauthTokenUrl(config.tokenUrl || '');
        setOauthScopes(config.scopes || '');
        setJsonSample(config.jsonSample || '');
    } else if (connector.type === 'oracle') {
        setOracleMethod(config.method || 'tns');
        setOracleHost(config.host || '');
        setOraclePort(config.port || '1521');
        setOracleSid(config.service || '');
        setOracleUser(config.username || '');
        setOraclePass('');
        setOracleJdbcUrl(config.jdbcUrl || '');
        setSqlQuery(config.query || '');
    } else if (connector.type === 'gcs') {
        setConfigBucket(config.bucket || '');
        setGcsAuthType(config.authType || 'system');
        setGcsToken(config.accessToken || '');
    } else if (connector.type === 'linkedin') {
        setLinkedinClientId(config.clientId || '');
        setLinkedinClientSecret(config.clientSecret || '');
        setLinkedinOrgId(config.organizationId || '');
    } else if (connector.type === 'twitter') {
        setTwitterApiKey(config.apiKey || '');
        setTwitterApiSecret(config.apiSecret || '');
        setTwitterBearerToken(config.bearerToken || '');
    } else if (connector.type === 'doximity') {
        setDoximityClientId(config.clientId || '');
        setDoximityClientSecret(config.clientSecret || '');
    } else if (connector.type === 'veeva') {
        setVeevaUrl(config.url || '');
        setVeevaUser(config.username || '');
        setVeevaPass('');
    } else if (connector.type === 'salesforce') {
        setSfInstanceUrl(config.instanceUrl || '');
        setSfClientId(config.clientId || '');
        setSfClientSecret(config.clientSecret || '');
        setSfUser(config.username || '');
        setSfPass('');
    } else if (connector.type === 'google_scholar') {
        setScholarApiKey(config.apiKey || '');
    } else if (connector.type === 'rep_feedback') {
        setRepFeedbackUrl(config.url || '');
        setRepFeedbackKey(config.apiKey || '');
    }
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
    
    let config: Record<string, any> = { };

    if (type === 'gcs') {
        config = { 
            bucket: configBucket,
            authType: gcsAuthType,
            ...(gcsAuthType === 'access_token' ? { accessToken: gcsToken } : {}),
            ...(gcsAuthType === 'service_account' ? { serviceAccountKey: '*****' } : {}),
        };
    } else if (type === 'local_file') {
        if (selectedFile) {
            config = { 
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                uploadDate: new Date().toISOString()
            };
        } else if (editingConnector && editingConnector.type === 'local_file') {
            config = { ...editingConnector.config };
        }
    } else if (type === 'oracle') {
        config = {
            method: oracleMethod,
            username: oracleUser,
            authType: 'password',
            query: sqlQuery
        };
        if (oraclePass) config.password = oraclePass;

        if (oracleMethod === 'tns') {
            config.host = oracleHost;
            config.port = oraclePort;
            config.service = oracleSid;
        } else {
            config.jdbcUrl = oracleJdbcUrl;
            config.driverJar = oracleJar ? oracleJar.name : (editingConnector?.config.driverJar || 'ojdbc8.jar (Bundled)');
        }
    } else if (type === 'rest_api') {
        config = { 
            endpoint: configEndpoint,
            authType: restAuthType,
            jsonSample: jsonSample
        };
        if (restAuthType === 'pat' || restAuthType === 'jwt') {
            config.token = restToken;
        } else if (restAuthType === 'oauth2') {
            config.clientId = oauthClientId;
            config.clientSecret = oauthClientSecret ? '*****' : (editingConnector?.config.clientSecret || '');
            config.tokenUrl = oauthTokenUrl;
            config.scopes = oauthScopes;
        }
    } else if (type === 'linkedin') {
        config = {
            clientId: linkedinClientId,
            clientSecret: linkedinClientSecret ? '*****' : (editingConnector?.config.clientSecret || ''),
            organizationId: linkedinOrgId
        };
    } else if (type === 'twitter') {
        config = {
            apiKey: twitterApiKey,
            apiSecret: twitterApiSecret ? '*****' : (editingConnector?.config.apiSecret || ''),
            bearerToken: twitterBearerToken ? '*****' : (editingConnector?.config.bearerToken || '')
        };
    } else if (type === 'doximity') {
        config = {
            clientId: doximityClientId,
            clientSecret: doximityClientSecret ? '*****' : (editingConnector?.config.clientSecret || '')
        };
    } else if (type === 'veeva') {
        config = {
            url: veevaUrl,
            username: veevaUser
        };
        if (veevaPass) config.password = veevaPass;
    } else if (type === 'salesforce') {
        config = {
            instanceUrl: sfInstanceUrl,
            clientId: sfClientId,
            clientSecret: sfClientSecret ? '*****' : (editingConnector?.config.clientSecret || ''),
            username: sfUser
        };
        if (sfPass) config.password = sfPass;
    } else if (type === 'google_scholar') {
        config = {
            apiKey: scholarApiKey
        };
    } else if (type === 'rep_feedback') {
        config = {
            url: repFeedbackUrl,
            apiKey: repFeedbackKey ? '*****' : (editingConnector?.config.apiKey || '')
        };
    }

    // Preserve existing mapping if any (handled in Data Model UI)
    if (editingConnector && editingConnector.config.mapping) {
        config.mapping = editingConnector.config.mapping;
    }

    if (editingConnector && onUpdateConnector) {
        const updatedConnector: Connector = {
            ...editingConnector,
            name,
            type,
            config: { ...editingConnector.config, ...config },
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
            config,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleJarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOracleJar(e.target.files[0]);
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

                    {type === 'rest_api' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Endpoint</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input 
                                    required
                                    type="text" 
                                    value={configEndpoint}
                                    onChange={(e) => setConfigEndpoint(e.target.value)}
                                    placeholder="https://api.example.com/v1"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800"
                                />
                            </div>
                        </div>
                    </div>
                    )}
                    
                    {type === 'oracle' && (
                        /* Standard Oracle Fields */
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Connection Method</label>
                                <div className="flex bg-slate-100/50 p-1 rounded-xl">
                                    <button 
                                        type="button"
                                        onClick={() => setOracleMethod('tns')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${oracleMethod === 'tns' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        TNS (Host/Port/Service)
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setOracleMethod('jdbc')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${oracleMethod === 'jdbc' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        JDBC URL
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Host</label>
                                    <input required type="text" value={oracleHost} onChange={(e) => setOracleHost(e.target.value)} placeholder="oracle.example.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Port</label>
                                    <input required type="text" value={oraclePort} onChange={(e) => setOraclePort(e.target.value)} placeholder="1521" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service Name</label>
                                    <input required type="text" value={oracleSid} onChange={(e) => setOracleSid(e.target.value)} placeholder="ORCL" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {type === 'local_file' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                           {/* File Upload UI */}
                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Upload File</label>
                           <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer bg-white/30 hover:bg-white/50 relative group">
                                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept=".csv,.json,.parquet" />
                                <div className="space-y-1 text-center">
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center">
                                            <FileCode className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                                            <p className="text-sm text-slate-900 font-medium">{selectedFile.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="mx-auto h-12 w-12 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                            <div className="flex text-sm text-slate-600 justify-center"><span className="font-medium text-blue-600 hover:text-blue-500">Upload a file</span></div>
                                        </>
                                    )}
                                </div>
                           </div>
                        </div>
                    )}

                    {/* LinkedIn Config */}
                    {type === 'linkedin' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4 flex items-start">
                                 <Linkedin className="w-5 h-5 text-blue-700 mr-3 mt-0.5" />
                                 <div className="text-sm text-blue-900">
                                     <p className="font-bold">LinkedIn API Access</p>
                                     <p className="text-xs mt-1">Requires a developer application with the 'Marketing Developer Platform' product enabled.</p>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client ID</label>
                                 <input required type="text" value={linkedinClientId} onChange={(e) => setLinkedinClientId(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Secret</label>
                                 <input required type="password" value={linkedinClientSecret} onChange={(e) => setLinkedinClientSecret(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Organization ID (Optional)</label>
                                 <input type="text" value={linkedinOrgId} onChange={(e) => setLinkedinOrgId(e.target.value)} placeholder="e.g. 12345678" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                        </div>
                    )}

                    {/* Twitter Config */}
                    {type === 'twitter' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200 mb-4 flex items-start">
                                 <Twitter className="w-5 h-5 text-slate-700 mr-3 mt-0.5" />
                                 <div className="text-sm text-slate-900">
                                     <p className="font-bold">X (Twitter) API Access</p>
                                     <p className="text-xs mt-1 text-slate-500">Requires Essential or Elevated access to the Twitter API v2.</p>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Key</label>
                                 <input required type="text" value={twitterApiKey} onChange={(e) => setTwitterApiKey(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Secret</label>
                                 <input required type="password" value={twitterApiSecret} onChange={(e) => setTwitterApiSecret(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bearer Token (Optional)</label>
                                 <input type="password" value={twitterBearerToken} onChange={(e) => setTwitterBearerToken(e.target.value)} placeholder="AAAA..." className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                        </div>
                    )}

                    {/* Doximity Config */}
                    {type === 'doximity' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-4 flex items-start">
                                 <Stethoscope className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                                 <div className="text-sm text-orange-900">
                                     <p className="font-bold">Doximity Professional Network</p>
                                     <p className="text-xs mt-1">Connect to Doximity APIs for HCP verification and network data.</p>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client ID</label>
                                 <input required type="text" value={doximityClientId} onChange={(e) => setDoximityClientId(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Secret</label>
                                 <input required type="password" value={doximityClientSecret} onChange={(e) => setDoximityClientSecret(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                        </div>
                    )}

                    {/* Veeva Config */}
                    {type === 'veeva' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-4 flex items-start">
                                 <Briefcase className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                                 <div className="text-sm text-orange-900">
                                     <p className="font-bold">Veeva CRM / Vault</p>
                                     <p className="text-xs mt-1">Extract Call Notes, Rep Interactions, and Suggestions via Vault API.</p>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vault Domain URL</label>
                                 <input required type="text" value={veevaUrl} onChange={(e) => setVeevaUrl(e.target.value)} placeholder="https://myvault.veevavault.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                                 <input required type="text" value={veevaUser} onChange={(e) => setVeevaUser(e.target.value)} placeholder="user@company.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                 <input required type="password" value={veevaPass} onChange={(e) => setVeevaPass(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                        </div>
                    )}

                    {/* Salesforce Config */}
                    {type === 'salesforce' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4 flex items-start">
                                 <Cloud className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                                 <div className="text-sm text-blue-900">
                                     <p className="font-bold">Salesforce CRM</p>
                                     <p className="text-xs mt-1">Integration via Connected App (Username-Password Flow for backend sync).</p>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Instance URL</label>
                                 <input required type="text" value={sfInstanceUrl} onChange={(e) => setSfInstanceUrl(e.target.value)} placeholder="https://na1.salesforce.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client ID (Consumer Key)</label>
                                    <input required type="text" value={sfClientId} onChange={(e) => setSfClientId(e.target.value)} className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Secret</label>
                                    <input required type="password" value={sfClientSecret} onChange={(e) => setSfClientSecret(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                                </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Salesforce Username</label>
                                 <input required type="text" value={sfUser} onChange={(e) => setSfUser(e.target.value)} placeholder="user@domain.com" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password + Security Token</label>
                                 <input required type="password" value={sfPass} onChange={(e) => setSfPass(e.target.value)} placeholder="pass123TOKENxyz..." className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                        </div>
                    )}
                    
                    {/* Google Scholar Config */}
                    {type === 'google_scholar' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200 mb-4 flex items-start">
                                 <GraduationCap className="w-5 h-5 text-slate-700 mr-3 mt-0.5" />
                                 <div className="text-sm text-slate-900">
                                     <p className="font-bold">Google Scholar (via API Wrapper)</p>
                                     <p className="text-xs mt-1">Connects to services like SerpApi or custom scrapers to fetch publication metadata.</p>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">API Key</label>
                                 <input required type="text" value={scholarApiKey} onChange={(e) => setScholarApiKey(e.target.value)} placeholder="e.g. SerpApi Key" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                        </div>
                    )}

                    {/* Rep Feedback Config */}
                    {type === 'rep_feedback' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                             <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-4 flex items-start">
                                 <MessageSquare className="w-5 h-5 text-emerald-600 mr-3 mt-0.5" />
                                 <div className="text-sm text-emerald-900">
                                     <p className="font-bold">Rep Feedback Aggregator</p>
                                     <p className="text-xs mt-1">Ingest structured feedback from field surveys, voice-of-customer tools, or internal databases.</p>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Source Endpoint URL</label>
                                 <input required type="text" value={repFeedbackUrl} onChange={(e) => setRepFeedbackUrl(e.target.value)} placeholder="https://internal.pharma.com/api/feedback" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                             <div>
                                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Auth Token / API Key</label>
                                 <input required type="password" value={repFeedbackKey} onChange={(e) => setRepFeedbackKey(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-800" />
                             </div>
                        </div>
                    )}

                </div>

                {/* Source Definition Section */}
                <div className="space-y-5 pt-2">
                    <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm uppercase tracking-wide border-b border-slate-200/50 pb-1">
                        <ArrowRightLeft className="w-4 h-4 text-purple-500" />
                        <span>Source Definition</span>
                    </div>

                    {/* SQL Query Editor (Oracle) */}
                    {type === 'oracle' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
                                <span>SQL Extraction Query</span>
                                <span className="text-xs font-normal text-slate-500">Defines columns available for mapping</span>
                            </label>
                            <div className="relative">
                                <Code className="absolute top-3 left-3 w-4 h-4 text-slate-400" />
                                <textarea 
                                    rows={4}
                                    value={sqlQuery}
                                    onChange={(e) => setSqlQuery(e.target.value)}
                                    placeholder="SELECT npi_num, first_name, specialty FROM hcp_master"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900 text-slate-200 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-mono text-xs leading-relaxed"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* REST Response Sample */}
                    {type === 'rest_api' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
                                <span>Response JSON Sample</span>
                                <span className="text-xs font-normal text-slate-500">Paste a sample response to guide mapping</span>
                            </label>
                            <div className="relative">
                                <Braces className="absolute top-3 left-3 w-4 h-4 text-slate-400" />
                                <textarea 
                                    rows={6}
                                    value={jsonSample}
                                    onChange={(e) => setJsonSample(e.target.value)}
                                    placeholder='{ "results": [ { "id": "123", "name": "Dr. Smith" } ] }'
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900 text-slate-200 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-mono text-xs leading-relaxed"
                                ></textarea>
                            </div>
                        </div>
                    )}
                    
                    {type === 'local_file' && (
                         <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-start text-xs text-blue-800">
                             <p>Columns/Keys will be detected automatically from the file header upon upload. You can map them in the Data Model tab.</p>
                         </div>
                    )}

                    {['doximity', 'veeva', 'salesforce', 'linkedin', 'twitter', 'google_scholar'].includes(type) && (
                         <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-start text-xs text-blue-800">
                             <p>Standard data models for {type.replace('_', ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} will be auto-discovered. You can map custom fields in the Data Model tab after initial connection.</p>
                         </div>
                    )}
                    
                    {type === 'rep_feedback' && (
                         <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl flex items-start text-xs text-emerald-800">
                             <p>Expects JSON payload with fields: <code>npi</code>, <code>feedback_text</code>, <code>sentiment_score</code>, <code>date</code>.</p>
                         </div>
                    )}
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