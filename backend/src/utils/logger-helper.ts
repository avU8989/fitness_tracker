import fs from 'fs';
import path from 'path';

const LOG_PATH = path.resolve(__dirname, "../../logs/backend_ingset.csv");

//ensure the log directory exist
fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });

//ensure the header exist
if (!fs.existsSync(LOG_PATH) || fs.statSync(LOG_PATH).size === 0) {
    fs.appendFileSync(
        LOG_PATH,
        "store_ts_ms,user_id,device_id,seq,hr,spo2,accepted,reason,raw_body\n"
    );
}

// Simple CSV escaping
function escapeCsv(value: any): string {
    if (value === null || value === undefined) return "";
    const s = typeof value === "object" ? JSON.stringify(value) : String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}


export function logIngest(entry: {
    user_id?: string;
    device_id?: string;
    seq?: string | number;
    hr?: string | number;
    accepted?: boolean;
    reason?: string;
    raw_body?: any;
}) {
    const line = [
        Date.now(),
        escapeCsv(entry.user_id),
        escapeCsv(entry.device_id),
        escapeCsv(entry.seq),
        escapeCsv(entry.hr),
        escapeCsv(entry.accepted ?? true),
        escapeCsv(entry.reason ?? ""),
        escapeCsv(entry.raw_body ?? "")
    ].join(",") + "\n";

    fs.appendFile(LOG_PATH, line, (err) => {
        if (err) console.error("Log write failed:", err);
    });
}