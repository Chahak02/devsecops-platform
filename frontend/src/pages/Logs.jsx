import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Terminal, Download, Trash2, Play } from 'lucide-react';
import './Logs.css';
import axios from 'axios';

const Logs = () => {
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get('project') || 'Global';

  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchLogs = async () => {
  
      try {
  
        const response = await axios.get(
          `http://localhost:5000/api/logs/${projectName}`
        );
  
        setLogs(response.data.logs);
  
      } catch (error) {
  
        console.error('Failed to fetch logs:', error);
  
      } finally {
  
        setLoading(false);
      }
    };
  
    fetchLogs();
  
    const interval = setInterval(fetchLogs, 3000);
  
    return () => clearInterval(interval);
  
  }, [projectName]);



  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Terminal size={24} /> Live Pipeline Logs
        </h1>
        <div className="log-actions">
          <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
          <button className="btn btn-secondary btn-sm"><Trash2 size={14} /> Clear</button>
          <button className="btn btn-primary btn-sm"><Play size={14} /> Re-run Pipeline</button>
        </div>
      </div>

      <div className="console-wrapper">
        <div className="console-header">
          <div className="dots">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <div className="console-title">
  {`bash — kubernetes-pod (${projectName})`}
</div>
        </div>
        <div className="console-content">
        {loading ? (

          <p className="line-text info">Loading logs...</p>

        ) : (

          <pre className="terminal-output">
            {logs}
          </pre>

)}

<div className="cursor"></div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
