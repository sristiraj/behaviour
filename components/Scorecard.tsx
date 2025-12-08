import React from 'react';
import { HCP } from '../types';
import { MapPin, Building, GraduationCap, FileText, Send, Calendar, Mail, Video, User } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ScorecardProps {
  hcp: HCP;
  onBack: () => void;
}

const ScoreBadge = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="glass-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">{label}</div>
        <div className={`text-xl font-extrabold ${color}`}>{value}</div>
    </div>
);

export const Scorecard: React.FC<ScorecardProps> = ({ hcp, onBack }) => {
  const result = hcp.segmentation_result;

  // Mock radar data based on the qualitative result
  const radarData = [
    { subject: 'Influence', A: result?.influence === 'High' ? 90 : 50, fullMark: 100 },
    { subject: 'RWE Affinity', A: result?.persona.includes('RWE') ? 95 : 30, fullMark: 100 },
    { subject: 'Digital', A: result?.channel_preference !== 'In-person' ? 80 : 40, fullMark: 100 },
    { subject: 'Volume', A: 65, fullMark: 100 },
    { subject: 'Academic', A: hcp.metadata.publications_count > 10 ? 85 : 20, fullMark: 100 },
  ];

  if (!result) return <div>No segmentation data available.</div>;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      <button onClick={onBack} className="text-sm font-medium text-slate-500 hover:text-blue-600 mb-2 flex items-center transition-colors">
        <span className="mr-1">←</span> Back to list
      </button>

      {/* Header Profile */}
      <div className="glass-panel rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-bl-full opacity-50 -z-10"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg flex-shrink-0">
                <img src={`https://picsum.photos/seed/${hcp.npi}/200/200`} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900">Dr. {hcp.first_name} {hcp.last_name}</h1>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600 font-medium">
                    <div className="flex items-center bg-white/50 px-3 py-1 rounded-full"><GraduationCap className="w-4 h-4 mr-2 text-indigo-500"/> {hcp.specialty}</div>
                    <div className="flex items-center bg-white/50 px-3 py-1 rounded-full"><Building className="w-4 h-4 mr-2 text-indigo-500"/> {hcp.practice_name}</div>
                    <div className="flex items-center bg-white/50 px-3 py-1 rounded-full"><MapPin className="w-4 h-4 mr-2 text-indigo-500"/> {hcp.primary_address.city}, {hcp.primary_address.state}</div>
                </div>
            </div>
            <div className="flex space-x-3">
                 <button className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105">
                    <Send className="w-4 h-4 mr-2" />
                    Create Task
                </button>
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Scores & Radar */}
        <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <ScoreBadge label="Influence" value={result.influence} color={result.influence === 'High' ? 'text-purple-600' : 'text-slate-600'} />
                <ScoreBadge label="Readiness" value={result.engagement_readiness} color={result.engagement_readiness === 'Hot' ? 'text-red-500' : 'text-orange-500'} />
             </div>
             
             <div className="glass-panel rounded-2xl shadow-lg p-6">
                 <h3 className="font-bold text-slate-800 mb-4">Qualitative Profile</h3>
                 <div className="h-64 w-full -ml-4">
                     <ResponsiveContainer width="110%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="HCP" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-2 text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Primary Persona</span>
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold shadow-md">
                        {result.persona}
                    </div>
                 </div>
             </div>
        </div>

        {/* Middle Col: Key Drivers & Rationale */}
        <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-2xl shadow-lg p-8">
                <h3 className="font-bold text-slate-800 mb-6">Segmentation Rationale</h3>
                <div className="relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-full"></div>
                    <p className="text-slate-700 text-base leading-relaxed italic pl-6 py-1">
                        "{result.rationale}"
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Key Drivers</h4>
                        <ul className="space-y-3">
                            {result.key_drivers.map((driver, idx) => (
                                <li key={idx} className="flex items-start text-sm text-slate-700 font-medium">
                                    <span className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0 shadow-sm">✓</span>
                                    {driver}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-3">Recommended Action</h4>
                        <div className="flex items-start">
                             <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm mr-3">
                                <Calendar className="w-5 h-5" />
                             </div>
                             <p className="text-blue-800 text-sm font-medium leading-relaxed mt-1">
                                {result.recommended_next_action}
                             </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents / Evidence */}
            <div className="glass-panel rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-800">Recent Evidence</h3>
                     <button className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</button>
                </div>
                <div className="space-y-3">
                     <div className="flex items-center p-3 hover:bg-white/60 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/50 hover:shadow-sm">
                        <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 mr-4 shadow-sm">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-slate-800">Publication: Registry Outcomes in AFib</div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">Journal of Cardiology • 2 months ago</div>
                        </div>
                     </div>
                     <div className="flex items-center p-3 hover:bg-white/60 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/50 hover:shadow-sm">
                        <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 mr-4 shadow-sm">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-slate-800">Call Note: MSL Visit</div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5">Recorded by J. Doe • Nov 01, 2023</div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};