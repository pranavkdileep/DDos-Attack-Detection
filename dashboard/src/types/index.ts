export interface Incident {
    incident_id: string;
    time: string;
    title: string;
    serverip: string;
    networkinterface: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    isAnalysed: boolean;
}

export interface TrafficData {
    // Basic Flow Info
    flow_id: string;
    src_ip: string;
    src_port: number;
    dst_ip: string;
    dst_port: number;
    protocol: string;
    timestamp: string;

    // Flow Features
    flow_duration: number;
    total_fwd_packet: number;
    total_bwd_packets: number;
    total_length_of_fwd_packet: number;
    total_length_of_bwd_packet: number;
    fwd_packet_length_max: number;
    fwd_packet_length_min: number;
    fwd_packet_length_mean: number;
    fwd_packet_length_std: number;
    bwd_packet_length_max: number;
    bwd_packet_length_min: number;
    bwd_packet_length_mean: number;
    bwd_packet_length_std: number;
    flow_bytes_s: number;
    flow_packets_s: number;
    flow_iat_mean: number;
    flow_iat_std: number;
    flow_iat_max: number;
    flow_iat_min: number;
    fwd_iat_total: number;
    fwd_iat_mean: number;
    fwd_iat_std: number;
    fwd_iat_max: number;
    fwd_iat_min: number;
    bwd_iat_total: number;
    bwd_iat_mean: number;
    bwd_iat_std: number;
    bwd_iat_max: number;
    bwd_iat_min: number;
    fwd_psh_flags: number;
    bwd_psh_flags: number;
    fwd_urg_flags: number;
    bwd_urg_flags: number;
    fwd_header_length: number;
    bwd_header_length: number;
    fwd_packets_s: number;
    bwd_packets_s: number;
    packet_length_min: number;
    packet_length_max: number;
    packet_length_mean: number;
    packet_length_std: number;
    packet_length_variance: number;
    fin_flag_count: number;
    syn_flag_count: number;
    rst_flag_count: number;
    psh_flag_count: number;
    ack_flag_count: number;
    urg_flag_count: number;
    cwr_flag_count: number;
    ece_flag_count: number;
    down_up_ratio: number;
    average_packet_size: number;
    fwd_segment_size_avg: number;
    bwd_segment_size_avg: number;
    fwd_bytes_bulk_avg: number;
    fwd_packet_bulk_avg: number;
    fwd_bulk_rate_avg: number;
    bwd_bytes_bulk_avg: number;
    bwd_packet_bulk_avg: number;
    bwd_bulk_rate_avg: number;
    subflow_fwd_packets: number;
    subflow_fwd_bytes: number;
    subflow_bwd_packets: number;
    subflow_bwd_bytes: number;
    fwd_init_win_bytes: number;
    bwd_init_win_bytes: number;
    fwd_act_data_pkts: number;
    fwd_seg_size_min: number;
    active_mean: number;
    active_std: number;
    active_max: number;
    active_min: number;
    idle_mean: number;
    idle_std: number;
    idle_max: number;
    idle_min: number;

    // Target
    label: string;
}

export interface IncidentReport {
    incident_id: string;
    content: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
