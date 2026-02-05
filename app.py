from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import json
import os
import uuid
import db
import math

app = Flask(__name__)

# ======================
# Load artifacts
# ======================
model = tf.keras.models.load_model("my_model.h5")
scaler = joblib.load("scaler.pkl")
label_encoder = joblib.load("label_encoder.pkl")

with open("feature_columns.json") as f:
    FEATURE_COLUMNS = json.load(f)

# ======================
# Helpers
# ======================
def to_9x9(x):
    if x.shape[1] < 81:
        pad = np.zeros((x.shape[0], 81 - x.shape[1]))
        x = np.hstack([x, pad])
    else:
        x = x[:, :81]
    return x.reshape(-1, 9, 9, 1)
def process_network_traffic_data(input_file_path):
    # 1. Define columns to DROP
    DROP_COLS = [
        'Unnamed: 0',
        'Flow ID',
        ' Source IP',
        ' Source Port',
        ' Destination IP',
        ' Destination Port',
        ' Protocol',
        ' Timestamp',
        'SimillarHTTP',
        ' Inbound',
        'Src IP','Src Port','Dst IP','Dst Port','Protocol','Timestamp',

    ]

    # 2. Define the Old Names (Existing columns after drop)
    old_names = [
        'Flow Duration', 'Total Fwd Packet', 'Total Bwd packets',
        'Total Length of Fwd Packet', 'Total Length of Bwd Packet',
        'Fwd Packet Length Max', 'Fwd Packet Length Min',
        'Fwd Packet Length Mean', 'Fwd Packet Length Std',
        'Bwd Packet Length Max', 'Bwd Packet Length Min',
        'Bwd Packet Length Mean', 'Bwd Packet Length Std',
        'Flow Bytes/s', 'Flow Packets/s', 'Flow IAT Mean',
        'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min',
        'Fwd IAT Total', 'Fwd IAT Mean', 'Fwd IAT Std',
        'Fwd IAT Max', 'Fwd IAT Min', 'Bwd IAT Total',
        'Bwd IAT Mean', 'Bwd IAT Std', 'Bwd IAT Max',
        'Bwd IAT Min', 'Fwd PSH Flags', 'Bwd PSH Flags',
        'Fwd URG Flags', 'Bwd URG Flags', 'Fwd Header Length',
        'Bwd Header Length', 'Fwd Packets/s', 'Bwd Packets/s',
        'Packet Length Min', 'Packet Length Max', 'Packet Length Mean',
        'Packet Length Std', 'Packet Length Variance', 'FIN Flag Count',
        'SYN Flag Count', 'RST Flag Count', 'PSH Flag Count',
        'ACK Flag Count', 'URG Flag Count', 'CWR Flag Count',
        'ECE Flag Count', 'Down/Up Ratio', 'Average Packet Size',
        'Fwd Segment Size Avg', 'Bwd Segment Size Avg',
        'Fwd Bytes/Bulk Avg', 'Fwd Packet/Bulk Avg', 'Fwd Bulk Rate Avg',
        'Bwd Bytes/Bulk Avg', 'Bwd Packet/Bulk Avg', 'Bwd Bulk Rate Avg',
        'Subflow Fwd Packets', 'Subflow Fwd Bytes', 'Subflow Bwd Packets',
        'Subflow Bwd Bytes', 'FWD Init Win Bytes', 'Bwd Init Win Bytes',
        'Fwd Act Data Pkts', 'Fwd Seg Size Min', 'Active Mean',
        'Active Std', 'Active Max', 'Active Min', 'Idle Mean',
        'Idle Std', 'Idle Max', 'Idle Min', 'Label'
    ]

    # 3. Define the New Names (Target names)
    new_names = [
        ' Flow Duration', ' Total Fwd Packets', ' Total Backward Packets',
        'Total Length of Fwd Packets', ' Total Length of Bwd Packets',
        ' Fwd Packet Length Max', ' Fwd Packet Length Min',
        ' Fwd Packet Length Mean', ' Fwd Packet Length Std',
        'Bwd Packet Length Max', ' Bwd Packet Length Min',
        ' Bwd Packet Length Mean', ' Bwd Packet Length Std',
        'Flow Bytes/s', ' Flow Packets/s', ' Flow IAT Mean',
        ' Flow IAT Std', ' Flow IAT Max', ' Flow IAT Min',
        'Fwd IAT Total', ' Fwd IAT Mean', ' Fwd IAT Std',
        ' Fwd IAT Max', ' Fwd IAT Min', 'Bwd IAT Total',
        ' Bwd IAT Mean', ' Bwd IAT Std', ' Bwd IAT Max',
        ' Bwd IAT Min', 'Fwd PSH Flags', ' Bwd PSH Flags',
        ' Fwd URG Flags', ' Bwd URG Flags', ' Fwd Header Length',
        ' Bwd Header Length', 'Fwd Packets/s', ' Bwd Packets/s',
        ' Min Packet Length', ' Max Packet Length', ' Packet Length Mean',
        ' Packet Length Std', ' Packet Length Variance', 'FIN Flag Count',
        ' SYN Flag Count', ' RST Flag Count', ' PSH Flag Count',
        ' ACK Flag Count', ' URG Flag Count', ' CWE Flag Count',
        ' ECE Flag Count', ' Down/Up Ratio', ' Average Packet Size',
        ' Avg Fwd Segment Size', ' Avg Bwd Segment Size',
        ' Fwd Header Length.1', 'Fwd Avg Bytes/Bulk', ' Fwd Avg Packets/Bulk',
        ' Fwd Avg Bulk Rate', ' Bwd Avg Bytes/Bulk', ' Bwd Avg Packets/Bulk',
        'Bwd Avg Bulk Rate', 'Subflow Fwd Packets', ' Subflow Fwd Bytes',
        ' Subflow Bwd Packets', ' Subflow Bwd Bytes', 'Init_Win_bytes_forward',
        ' Init_Win_bytes_backward', ' act_data_pkt_fwd', ' min_seg_size_forward',
        'Active Mean', ' Active Std', ' Active Max', ' Active Min',
        'Idle Mean', ' Idle Std', ' Idle Max', ' Idle Min', ' Label'
    ]

    try:
        print("Reading CSV file...")
        df = pd.read_csv(input_file_path)

        # 1. Drop columns
        print("Dropping specified columns...")
        df.drop(columns=DROP_COLS, inplace=True, errors='ignore')

        # 2. Insert dummy column BEFORE 'Fwd Bytes/Bulk Avg'
        # We find the location of 'Fwd Bytes/Bulk Avg' to insert exactly before it.
        target_col = 'Fwd Bytes/Bulk Avg'

        if target_col in df.columns:
            print(f"Inserting ' Fwd Header Length.1' before '{target_col}'...")
            col_index = df.columns.get_loc(target_col)
            # Insert the new column with 0s at that index
            df.insert(loc=col_index, column=' Fwd Header Length.1', value=0)

            # CRITICAL STEP:
            # Because we inserted a column into the dataframe, we must also insert
            # that name into our 'old_names' list so the renaming mapping aligns correctly.
            # Without this, the zip() function would map the dummy column to the wrong new name.
            if target_col in old_names:
                old_names_idx = old_names.index(target_col)
                old_names.insert(old_names_idx, ' Fwd Header Length.1')
        else:
            print(f"Warning: '{target_col}' not found. Appending dummy column instead.")
            df[' Fwd Header Length.1'] = 0
            old_names.append(' Fwd Header Length.1')

        # 3. Create Rename Mapping
        # Now that 'old_names' matches the actual DataFrame structure (including the inserted column),
        # we can zip it with 'new_names'.
        rename_mapping = dict(zip(old_names, new_names))

        print("Renaming columns...")
        df.rename(columns=rename_mapping, inplace=True)

        return df

    except FileNotFoundError:
        print(f"Error: The file '{input_file_path}' was not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        # Debug helper: print column length mismatch if that's the issue
        if 'df' in locals():
            print(f"Debug Info - Current DF columns: {len(df.columns)}")
            print(f"Debug Info - Expected New names: {len(new_names)}")


# ======================
# Routes
# ======================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Empty request body"}), 400

    # Convert JSON → DataFrame
    try:
        df = pd.DataFrame([data])
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Check missing columns
    missing = set(FEATURE_COLUMNS) - set(df.columns)
    if missing:
        return jsonify({
            "error": "Missing features",
            "missing": list(missing)
        }), 400

    # Reorder columns
    df = df[FEATURE_COLUMNS]

    # Clean
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.fillna(0, inplace=True)

    # Scale
    X_scaled = scaler.transform(df)

    # Reshape
    X_img = to_9x9(X_scaled)

    # Predict
    preds = model.predict(X_img)
    class_index = int(np.argmax(preds, axis=1)[0])
    label = label_encoder.inverse_transform([class_index])[0]

    return jsonify({
        "predicted_label": label,
        "class_index": class_index,
        "probabilities": preds[0].tolist()
    })

@app.route("/reportIncident", methods=["POST"])
def report_incident():
    uploaded = request.files.get("file") or request.files.get("csv")
    incident_id = request.form.get("incident_id") or request.form.get("incidentId")
    serverip = request.form.get("serverip")
    networkinterface = request.form.get("networkinterface")
    name = request.form.get("name")
    risklevel = request.form.get("risklevel")

    if not uploaded or not incident_id or not serverip or not networkinterface or not name or not risklevel:
        return jsonify({"error": "Missing required fields. Required: file, incident_id, serverip, networkinterface, name, risklevel"}), 400

    # ensure directory exists
    flows_dir = os.path.join(os.getcwd(), "Incident-Flows")
    os.makedirs(flows_dir, exist_ok=True)

    # save with random name, preserve extension if present
    _, ext = os.path.splitext(uploaded.filename or "")
    if not ext:
        ext = ".csv"
    fname = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(flows_dir, fname)
    try:
        uploaded.save(save_path)
    except Exception as e:
        return jsonify({"error": "Failed to save uploaded file", "details": str(e)}), 500

    try:
        db.insert_or_update_incident(incident_id, serverip, networkinterface, fname, name, risklevel)
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500

    return jsonify({"status": "ok", "file": save_path, "incident_id": incident_id}), 201


@app.route("/batchProcess", methods=["POST"])
def batch_process():
    # Accept JSON body: {"incident_id": "...", "username": "...", "password": "..."}
    body = request.get_json()
    if not body:
        return jsonify({"error": "Expected JSON body"}), 400

    incident_id = body.get("incident_id") or body.get("incidentId")
    username = body.get("username")
    password = body.get("password")

    if not incident_id or not username or not password:
        return jsonify({"error": "Missing required fields: incident_id, username, password"}), 400

    # authenticate
    try:
        if not db.validate_user(username, password):
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": "Auth error", "details": str(e)}), 500

    # fetch incident
    try:
        incident = db.get_incident(incident_id)
    except Exception as e:
        return jsonify({"error": "DB error fetching incident", "details": str(e)}), 500

    if not incident:
        return jsonify({"error": "Incident not found"}), 404

    fname = incident.get("trafficflowfilebobid")
    if not fname:
        return jsonify({"error": "Incident has no associated flow file"}), 400

    flows_dir = os.path.join(os.getcwd(), "Incident-Flows")
    file_path = os.path.join(flows_dir, fname)
    if not os.path.exists(file_path):
        return jsonify({"error": "Flow file not found", "file": file_path}), 404

    # load CSV
    try:
        new_df = process_network_traffic_data(file_path)
        if new_df is None:
            return jsonify({"error": "Failed to process CSV file"}), 500
        og = pd.read_csv(file_path)
    except Exception as e:
        return jsonify({"error": "Failed to read CSV", "details": str(e)}), 500

    # Prepare features: ensure FEATURE_COLUMNS present
    LABEL_COL = ' Label'
    new_X = new_df.drop(LABEL_COL, axis=1)
    new_X.replace([np.inf, -np.inf], np.nan, inplace=True)
    new_X.fillna(0, inplace=True)

    rows_to_keep = ~new_X.isna().any(axis=1)
    new_X = new_X[rows_to_keep]
    new_X_scaled = scaler.transform(new_X)
    new_X_img = to_9x9(new_X_scaled)

    try:
        preds = model.predict(new_X_img)
    except Exception as e:
        return jsonify({"error": "Model prediction error", "details": str(e)}), 500

    class_indices = np.argmax(preds, axis=1)
    top_probs = np.max(preds, axis=1)
    try:
        labels = label_encoder.inverse_transform(class_indices)
    except Exception:
        # fallback: convert indices to strings
        labels = [str(int(x)) for x in class_indices]
    og["Label"] = labels

    # overwrite same file with new labels
    try:
        og.to_csv(file_path, index=False)
        print(f"Saving annotated CSV to {file_path}")
    except Exception as e:
        return jsonify({"error": "Failed to save annotated CSV", "details": str(e)}), 500

    # mark analyzed
    try:
        report = f"Batch processed: {len(df)} rows"
        db.mark_analyzed(incident_id, report=report)
    except Exception as e:
        return jsonify({"error": "Failed to update incident status", "details": str(e)}), 500

    return jsonify({"status": "ok", "file": file_path, "rows": len(df)}), 200

# ======================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
