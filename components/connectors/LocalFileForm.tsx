import React from 'react';
import { FileCode, Upload } from 'lucide-react';

interface LocalFileFormProps {
    config: any;
    onChange: (config: any) => void;
}

export const LocalFileForm: React.FC<LocalFileFormProps> = ({ config, onChange }) => {
    const update = (field: string, value: any) => onChange({ ...config, [field]: value });
    const selectedFile = config.selectedFile as File | undefined;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          update('selectedFile', e.target.files[0]);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
            <div>
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
            
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-start text-xs text-blue-800">
                <p>Columns/Keys will be detected automatically from the file header upon upload. You can map them in the Data Model tab.</p>
            </div>
        </div>
    );
};