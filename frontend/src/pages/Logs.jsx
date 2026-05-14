import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Terminal, Download, Trash2, Play } from 'lucide-react';
import './Logs.css';

const Logs = () => {
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get('project') || 'Global';

  const logDatabase = {
    'Calculator App': [
      '[INFO] Starting build for Calculator App...',
      '[STAGE] Checkout: Success',
      '[STAGE] Unit Tests: Passed (14 tests)',
      '[SONAR] Coverage: 85.4%',
      '[STAGE] Docker Build: success/calc:v1.0.4',
      '[SUCCESS] Calculator deployed to devsecops-prod'
    ],
    'E-commerce API': [
      '[INFO] Starting build for E-commerce API...',
      '[STAGE] Checkout: Success',
      '[STAGE] Unit Tests: Passed (42 tests)',
      '[SONAR] Coverage: 78.1%',
      '[STAGE] Docker Build: ecommerce/api:v2.1.0',
      '[SUCCESS] E-commerce deployed to devsecops-prod'
    ],
    'Global': [
      '[INFO] Initializing system logs...',
      '[INFO] Fetching cluster events...',
      '[SUCCESS] All systems operational.'
    ]
  };

  const projectLogs = logDatabase[projectName] || [
    `[INFO] Initializing pipeline for ${projectName}...`,
    '[STAGE] Checkout: Success',
    '[STAGE] Build: Success',
    `[SUCCESS] ${projectName} is now LIVE.`
  ];


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
          <div className="console-title">bash — jenkins-worker-01 ({projectName})</div>
        </div>
        <div className="console-content">
          {projectLogs.map((log, index) => (
            <div key={index} className="log-line">
              <span className="line-number">{index + 1}</span>
              <span className={`line-text ${
                log.includes('[STAGE]') ? 'stage' : 
                log.includes('[SUCCESS]') ? 'success' : 
                log.includes('[INFO]') ? 'info' : ''
              }`}>
                {log}
              </span>
            </div>
          ))}
          <div className="cursor"></div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
