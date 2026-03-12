import React, { useEffect, useState } from 'react';
import { type Incident } from '../types';
import { fetchIncidents } from '../services/mockApi';
import clsx from 'clsx';

interface SidebarProps {
    selectedIncidentId: string | null;
    onSelectIncident: (incident: Incident) => void;
}

const PAGE_SIZE = 7; // Fit roughly within the screen height

const Sidebar: React.FC<SidebarProps> = ({ selectedIncidentId, onSelectIncident }) => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadIncidents = async () => {
            setLoading(true);
            try {
                const response = await fetchIncidents(page, PAGE_SIZE);
                setIncidents(response.data);
                setTotalPages(response.totalPages);

                // Select first incident initially if none selected
                if (!selectedIncidentId && response.data.length > 0 && page === 1) {
                    // Optional: Auto select first, or let parent handle. 
                    // Requirement says "Clicking... Marks it as selected". 
                    // Usually good UX to have one selected.
                }
            } catch (error) {
                console.error("Failed to fetch incidents", error);
            } finally {
                setLoading(false);
            }
        };
        loadIncidents();
    }, [page]);

    return (
        <aside className="w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shrink-0 h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg dark:text-white">Active Incidents</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10">
                        <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                    </div>
                )}

                {incidents.map((incident) => (
                    <div
                        key={incident.incident_id}
                        onClick={() => onSelectIncident(incident)}
                        className={clsx(
                            "p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors border-l-4",
                            selectedIncidentId === incident.incident_id
                                ? "bg-primary/5 dark:bg-primary/10 border-l-primary"
                                : "border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                    >
                        <div className="flex justify-between mb-1">
                            <span className={clsx("text-xs font-mono font-bold", selectedIncidentId === incident.incident_id ? "text-primary" : "text-slate-400")}>
                                {incident.incident_id}
                            </span>
                            <span className="text-[10px] text-slate-500">{incident.time}</span>
                        </div>
                        <div className="text-sm font-bold mb-1 dark:text-slate-200">{incident.title}</div>
                        <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-500">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">dns</span> {incident.serverip}
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">settings_input_component</span> {incident.networkinterface}
                            </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                            <span className={clsx(
                                "text-[10px] px-2 py-0.5 rounded font-bold border",
                                incident.severity === 'CRITICAL' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                    incident.severity === 'HIGH' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                        "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent"
                            )}>
                                {incident.severity}
                            </span>
                            {incident.isAnalysed ? (
                                <span className="material-symbols-outlined text-green-500 text-base" title="Analyzed">check_circle</span>
                            ) : (
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-500 text-base" title="Pending">pending</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
