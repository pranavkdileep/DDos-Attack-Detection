import React, { useEffect, useState } from 'react';
import { type TrafficData } from '../types';
import { fetchTrafficData, aiPredictThreat } from '../services/mockApi';
import clsx from 'clsx';

interface TrafficTableProps {
    incidentId: string | null;
}

const PAGE_SIZE = 50;

const COLUMN_MAPPING: { key: keyof TrafficData; label: string; width: string }[] = [
    { key: 'flow_id', label: 'Flow ID', width: 'min-w-[150px]' },
    { key: 'src_ip', label: 'Src IP', width: 'min-w-[140px]' },
    { key: 'src_port', label: 'Src Port', width: 'min-w-[100px]' },
    { key: 'dst_ip', label: 'Dst IP', width: 'min-w-[140px]' },
    { key: 'dst_port', label: 'Dst Port', width: 'min-w-[100px]' },
    { key: 'protocol', label: 'Protocol', width: 'min-w-[100px]' },
    { key: 'timestamp', label: 'Timestamp', width: 'min-w-[180px]' },
    { key: 'flow_duration', label: 'Flow Duration', width: 'min-w-[120px]' },
    { key: 'total_fwd_packet', label: 'Total Fwd Packet', width: 'min-w-[140px]' },
    { key: 'total_bwd_packets', label: 'Total Bwd packets', width: 'min-w-[140px]' },
    { key: 'total_length_of_fwd_packet', label: 'TotLen Fwd Pkt', width: 'min-w-[140px]' },
    { key: 'total_length_of_bwd_packet', label: 'TotLen Bwd Pkt', width: 'min-w-[140px]' },
    { key: 'fwd_packet_length_max', label: 'Fwd Pkt Len Max', width: 'min-w-[140px]' },
    { key: 'fwd_packet_length_min', label: 'Fwd Pkt Len Min', width: 'min-w-[140px]' },
    { key: 'fwd_packet_length_mean', label: 'Fwd Pkt Len Mean', width: 'min-w-[150px]' },
    { key: 'fwd_packet_length_std', label: 'Fwd Pkt Len Std', width: 'min-w-[140px]' },
    { key: 'bwd_packet_length_max', label: 'Bwd Pkt Len Max', width: 'min-w-[140px]' },
    { key: 'bwd_packet_length_min', label: 'Bwd Pkt Len Min', width: 'min-w-[140px]' },
    { key: 'bwd_packet_length_mean', label: 'Bwd Pkt Len Mean', width: 'min-w-[150px]' },
    { key: 'bwd_packet_length_std', label: 'Bwd Pkt Len Std', width: 'min-w-[140px]' },
    { key: 'flow_bytes_s', label: 'Flow Bytes/s', width: 'min-w-[120px]' },
    { key: 'flow_packets_s', label: 'Flow Packets/s', width: 'min-w-[130px]' },
    { key: 'flow_iat_mean', label: 'Flow IAT Mean', width: 'min-w-[120px]' },
    { key: 'flow_iat_std', label: 'Flow IAT Std', width: 'min-w-[120px]' },
    { key: 'flow_iat_max', label: 'Flow IAT Max', width: 'min-w-[120px]' },
    { key: 'flow_iat_min', label: 'Flow IAT Min', width: 'min-w-[120px]' },
    { key: 'fwd_iat_total', label: 'Fwd IAT Total', width: 'min-w-[120px]' },
    { key: 'fwd_iat_mean', label: 'Fwd IAT Mean', width: 'min-w-[120px]' },
    { key: 'fwd_iat_std', label: 'Fwd IAT Std', width: 'min-w-[120px]' },
    { key: 'fwd_iat_max', label: 'Fwd IAT Max', width: 'min-w-[120px]' },
    { key: 'fwd_iat_min', label: 'Fwd IAT Min', width: 'min-w-[120px]' },
    { key: 'bwd_iat_total', label: 'Bwd IAT Total', width: 'min-w-[120px]' },
    { key: 'bwd_iat_mean', label: 'Bwd IAT Mean', width: 'min-w-[120px]' },
    { key: 'bwd_iat_std', label: 'Bwd IAT Std', width: 'min-w-[120px]' },
    { key: 'bwd_iat_max', label: 'Bwd IAT Max', width: 'min-w-[120px]' },
    { key: 'bwd_iat_min', label: 'Bwd IAT Min', width: 'min-w-[120px]' },
    { key: 'fwd_psh_flags', label: 'Fwd PSH Flags', width: 'min-w-[120px]' },
    { key: 'bwd_psh_flags', label: 'Bwd PSH Flags', width: 'min-w-[120px]' },
    { key: 'fwd_urg_flags', label: 'Fwd URG Flags', width: 'min-w-[120px]' },
    { key: 'bwd_urg_flags', label: 'Bwd URG Flags', width: 'min-w-[120px]' },
    { key: 'fwd_header_length', label: 'Fwd Header Len', width: 'min-w-[130px]' },
    { key: 'bwd_header_length', label: 'Bwd Header Len', width: 'min-w-[130px]' },
    { key: 'fwd_packets_s', label: 'Fwd Packets/s', width: 'min-w-[120px]' },
    { key: 'bwd_packets_s', label: 'Bwd Packets/s', width: 'min-w-[120px]' },
    { key: 'packet_length_min', label: 'Pkt Len Min', width: 'min-w-[110px]' },
    { key: 'packet_length_max', label: 'Pkt Len Max', width: 'min-w-[110px]' },
    { key: 'packet_length_mean', label: 'Pkt Len Mean', width: 'min-w-[120px]' },
    { key: 'packet_length_std', label: 'Pkt Len Std', width: 'min-w-[110px]' },
    { key: 'packet_length_variance', label: 'Pkt Len Var', width: 'min-w-[110px]' },
    { key: 'fin_flag_count', label: 'FIN Count', width: 'min-w-[100px]' },
    { key: 'syn_flag_count', label: 'SYN Count', width: 'min-w-[100px]' },
    { key: 'rst_flag_count', label: 'RST Count', width: 'min-w-[100px]' },
    { key: 'psh_flag_count', label: 'PSH Count', width: 'min-w-[100px]' },
    { key: 'ack_flag_count', label: 'ACK Count', width: 'min-w-[100px]' },
    { key: 'urg_flag_count', label: 'URG Count', width: 'min-w-[100px]' },
    { key: 'cwr_flag_count', label: 'CWR Count', width: 'min-w-[100px]' },
    { key: 'ece_flag_count', label: 'ECE Count', width: 'min-w-[100px]' },
    { key: 'down_up_ratio', label: 'Down/Up Ratio', width: 'min-w-[120px]' },
    { key: 'average_packet_size', label: 'Avg Pkt Size', width: 'min-w-[120px]' },
    { key: 'fwd_segment_size_avg', label: 'Fwd Seg Size Avg', width: 'min-w-[140px]' },
    { key: 'bwd_segment_size_avg', label: 'Bwd Seg Size Avg', width: 'min-w-[140px]' },
    { key: 'fwd_bytes_bulk_avg', label: 'Fwd Bytes/Bulk', width: 'min-w-[130px]' },
    { key: 'fwd_packet_bulk_avg', label: 'Fwd Pkt/Bulk', width: 'min-w-[130px]' },
    { key: 'fwd_bulk_rate_avg', label: 'Fwd Bulk Rate', width: 'min-w-[130px]' },
    { key: 'bwd_bytes_bulk_avg', label: 'Bwd Bytes/Bulk', width: 'min-w-[130px]' },
    { key: 'bwd_packet_bulk_avg', label: 'Bwd Pkt/Bulk', width: 'min-w-[130px]' },
    { key: 'bwd_bulk_rate_avg', label: 'Bwd Bulk Rate', width: 'min-w-[130px]' },
    { key: 'subflow_fwd_packets', label: 'Subflow Fwd Pkts', width: 'min-w-[140px]' },
    { key: 'subflow_fwd_bytes', label: 'Subflow Fwd Bytes', width: 'min-w-[140px]' },
    { key: 'subflow_bwd_packets', label: 'Subflow Bwd Pkts', width: 'min-w-[140px]' },
    { key: 'subflow_bwd_bytes', label: 'Subflow Bwd Bytes', width: 'min-w-[140px]' },
    { key: 'fwd_init_win_bytes', label: 'Fwd Init Win', width: 'min-w-[120px]' },
    { key: 'bwd_init_win_bytes', label: 'Bwd Init Win', width: 'min-w-[120px]' },
    { key: 'fwd_act_data_pkts', label: 'Fwd Act Data', width: 'min-w-[120px]' },
    { key: 'fwd_seg_size_min', label: 'Fwd Seg Min', width: 'min-w-[120px]' },
    { key: 'active_mean', label: 'Active Mean', width: 'min-w-[110px]' },
    { key: 'active_std', label: 'Active Std', width: 'min-w-[110px]' },
    { key: 'active_max', label: 'Active Max', width: 'min-w-[110px]' },
    { key: 'active_min', label: 'Active Min', width: 'min-w-[110px]' },
    { key: 'idle_mean', label: 'Idle Mean', width: 'min-w-[110px]' },
    { key: 'idle_std', label: 'Idle Std', width: 'min-w-[110px]' },
    { key: 'idle_max', label: 'Idle Max', width: 'min-w-[110px]' },
    { key: 'idle_min', label: 'Idle Min', width: 'min-w-[110px]' },
    { key: 'label', label: 'Label', width: 'min-w-[120px]' },
];

const TrafficTable: React.FC<TrafficTableProps> = ({ incidentId }) => {
    const [traffic, setTraffic] = useState<TrafficData[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<{ score: number, label: string } | null>(null);
    const [predicting, setPredicting] = useState(false);



    useEffect(() => {
        if (!incidentId) return;
        setPage(1);
        setPrediction(null);
    }, [incidentId]);

    useEffect(() => {
        if (!incidentId) return;

        const loadTraffic = async () => {
            setLoading(true);
            try {
                const response = await fetchTrafficData(incidentId, page, PAGE_SIZE);
                setTraffic(response.data);
                setTotalPages(response.totalPages);
                setTotal(response.total);
            } catch (err) {
                console.error("Failed to load traffic", err);
            } finally {
                setLoading(false);
            }
        };
        loadTraffic();
    }, [incidentId, page]);

    const handlePredict = async () => {
        if (!incidentId) return;
        setPredicting(true);
        try {
            const result = await aiPredictThreat(incidentId);
            console.log("AI Prediction Result:", result);
            setLoading(true);
            try {
                const response = await fetchTrafficData(incidentId, page, PAGE_SIZE);
                setTraffic(response.data);
                setTotalPages(response.totalPages);
                setTotal(response.total);
            } catch (err) {
                console.error("Failed to load traffic", err);
            } finally {
                setLoading(false);
            }
            //setPrediction(result);
        } finally {
            setPredicting(false);
        }
    };

    if (!incidentId) {
        return <div className="h-1/2 p-6 flex items-center justify-center text-slate-400">Select an incident to view traffic analysis</div>;
    }

    return (
        <section className="h-1/2 flex flex-col p-6 overflow-hidden min-h-[400px]">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white">Incident Traffic Analysis</h1>
                    <p className="text-xs text-slate-500">Real-time packet capture for <span className="font-mono text-primary">{incidentId}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    {prediction && (
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-500 uppercase">AI Confidence</span>
                            <span className={clsx("text-sm font-bold", prediction.score > 0.8 ? "text-red-500" : "text-yellow-500")}>{prediction.label} ({(prediction.score * 100).toFixed(1)}%)</span>
                        </div>
                    )}
                    <button
                        onClick={handlePredict}
                        disabled={predicting}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        <span className={clsx("material-symbols-outlined text-lg", predicting && "animate-spin")}>
                            {predicting ? "donut_large" : "psychology"}
                        </span>
                        <span>{predicting ? "Analyzing..." : "AI Predict Threat"}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shadow-sm flex flex-col relative w-full">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                    </div>
                )}

                <div className="flex-1 overflow-auto custom-scrollbar w-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md z-10">
                            <tr className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                {COLUMN_MAPPING.map((col) => (
                                    <th key={col.key} className={`px-4 py-3 border-b border-slate-200 dark:border-slate-700 ${col.width}`}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-xs font-mono text-slate-600 dark:text-slate-300">
                            {traffic.map((packet, idx) => (
                                <tr key={`${packet.flow_id}-${idx}`} className="hover:bg-primary/5 border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">
                                    {COLUMN_MAPPING.map((col) => {
                                        const value = packet[col.key];
                                        let content: React.ReactNode = value;

                                        // Conditional Rendering for specific styles
                                        if (col.key === 'label') {
                                            const isBenign = String(value) === 'BENIGN';
                                            content = (
                                                <span className={clsx("font-bold", isBenign ? "text-green-500" : "text-red-500")}>
                                                    {String(value)}
                                                </span>
                                            );
                                        } else if (typeof value === 'number' && !Number.isInteger(value)) {
                                            content = value.toFixed(2);
                                        }

                                        return (
                                            <td key={col.key} className="px-4 py-3 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0">
                                                {content}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 shrink-0">
                    <span className="text-[10px] text-slate-500">Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, total)} of {total} packets</span>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-500">Page {page} of {totalPages}</span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(1)} disabled={page === 1} className="p-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-50"><span className="material-symbols-outlined text-xs">first_page</span></button>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-50"><span className="material-symbols-outlined text-xs">chevron_left</span></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-50"><span className="material-symbols-outlined text-xs">chevron_right</span></button>
                            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-50"><span className="material-symbols-outlined text-xs">last_page</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrafficTable;
