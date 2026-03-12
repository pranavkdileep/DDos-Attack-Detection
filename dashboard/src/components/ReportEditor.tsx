import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { fetchIncidentReport, saveIncidentReport, generateAutoReport } from '../services/mockApi';
import clsx from 'clsx';

interface ReportEditorProps {
    incidentId: string | null;
}

const ReportEditor: React.FC<ReportEditorProps> = ({ incidentId }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const formatText = (prefix: string, suffix: string = prefix) => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
        setContent(newText);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    useEffect(() => {
        if (!incidentId) {
            setContent('');
            return;
        }

        const loadReport = async () => {
            setLoading(true);
            try {
                const report = await fetchIncidentReport(incidentId);
                setContent(report.content);
            } catch (err) {
                console.error("Failed to load report", err);
            } finally {
                setLoading(false);
            }
        };
        loadReport();
    }, [incidentId]);

    const handleSave = async () => {
        if (!incidentId) return;
        setSaving(true);
        try {
            await saveIncidentReport(incidentId, content);
        } finally {
            setSaving(false);
        }
    };

    const handleAutoGenerate = async () => {
        if (!incidentId) return;
        setGenerating(true);
        try {
            const autoReport = await generateAutoReport(incidentId);
            setContent(autoReport);
        } finally {
            setGenerating(false);
        }
    };

    if (!incidentId) {
        return <div className="h-1/2 p-6 flex items-center justify-center text-slate-400">Select an incident to view report</div>;
    }

    return (
        <section className="h-1/2 flex flex-col p-6 pt-0 overflow-hidden min-h-[400px]">
            <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shadow-sm overflow-hidden">
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 shrink-0">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xs font-bold uppercase tracking-tight text-slate-500">Incident Report Editor</h3>
                        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
                        <div className="flex gap-2">
                            <button onClick={() => formatText('**')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Bold"><span className="material-symbols-outlined text-base">format_bold</span></button>
                            <button onClick={() => formatText('*')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Italic"><span className="material-symbols-outlined text-base">format_italic</span></button>
                            <button onClick={() => formatText('- ')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="List"><span className="material-symbols-outlined text-base">format_list_bulleted</span></button>
                            <button onClick={() => formatText('`')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Code"><span className="material-symbols-outlined text-base">code</span></button>
                        </div>
                    </div>
                    {/* <button
                        onClick={handleAutoGenerate}
                        disabled={generating}
                        className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20 text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                        <span className={clsx("material-symbols-outlined text-sm", generating && "animate-spin")}>
                            {generating ? "autorenew" : "auto_awesome"}
                        </span>
                        {generating ? "Generating..." : "AI Auto Report"}
                    </button> */}
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 flex overflow-hidden relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10 backdrop-blur-sm">
                            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                        </div>
                    )}

                    <div className="w-1/2 border-r border-slate-200 dark:border-slate-800 p-0 flex flex-col">
                        <textarea
                            ref={textareaRef}
                            className="flex-1 w-full p-4 text-sm font-mono bg-transparent border-none focus:ring-0 resize-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none"
                            placeholder="Write your markdown report here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <div className="w-1/2 p-4 bg-slate-50/50 dark:bg-slate-900/20 overflow-y-auto custom-scrollbar prose prose-sm dark:prose-invert max-w-none">
                        {content ? <Markdown>{content}</Markdown> : <span className="text-slate-400 italic">Preview will appear here...</span>}
                    </div>
                </div>

                {/* Editor Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-background-dark shrink-0">
                    <button
                        onClick={() => setContent('')} // Or revert logic
                        className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-slate-900 dark:bg-primary text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md disabled:opacity-70 flex items-center gap-2"
                    >
                        {saving && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
                        {saving ? "Saving..." : "Save Report"}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ReportEditor;
