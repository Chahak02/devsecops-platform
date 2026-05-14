import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Logs.css';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/logs');
            setLogs(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
            setError('Failed to connect to log server. Make sure your Grafana Cloud credentials are correct in the backend.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Poll for new logs every 5 seconds
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="logs-container">
            <h2>Live Cluster Logs (Promtail & Grafana Loki)</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="terminal">
                {loading && logs.length === 0 ? (
                    <div className="loading-text">Connecting to Grafana Cloud...</div>
                ) : logs.length === 0 ? (
                    <div className="loading-text">Waiting for logs from devsecops-prod namespace...</div>
                ) : (
                    logs.map((log, index) => {
                        const date = new Date(parseInt(log.timestamp) / 1000000);
                        return (
                            <div key={index} className="log-line">
                                <span className="log-timestamp">[{date.toLocaleTimeString()}]</span>
                                <span className={`log-pod ${log.app === 'devsecops-backend' ? 'color-blue' : 'color-green'}`}>[{log.pod}]</span>
                                <span className="log-message">{log.message}</span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Logs;
