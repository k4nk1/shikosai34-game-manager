import React, { useState } from 'react';
import { ApiLogEntry } from '../types/game';
import './ApiLog.css';

interface ApiLogProps {
  logs: ApiLogEntry[];
}

export const ApiLog: React.FC<ApiLogProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ApiLogEntry | null>(null);

  const latestRequest = logs.find((l) => l.type === 'REQUEST');

  return (
    <div className={`api-log-container ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="api-log-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="log-summary">
          <span className="log-icon">📡</span>
          <span className="log-title">API通信データ</span>
          {latestRequest && (
            <span className="latest-badge">
              最新: {latestRequest.endpoint.split(' ')[0]}
            </span>
          )}
        </div>
        <span className="toggle-arrow">{isOpen ? '▼ 閉じる' : '▲ 送信データ確認'}</span>
      </button>

      {isOpen && (
        <div className="api-log-content">
          <div className="api-log-helper">
            ※ APIサーバー連携時に送信・受信されるJSONデータです
          </div>

          <div className="log-list">
            {logs.length === 0 ? (
              <div className="empty-log">通信ログはまだありません</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`log-item log-type-${log.type.toLowerCase()} ${
                    selectedEntry?.id === log.id ? 'is-selected' : ''
                  }`}
                  onClick={() =>
                    setSelectedEntry(selectedEntry?.id === log.id ? null : log)
                  }
                >
                  <div className="log-meta">
                    <span className="log-time">{log.timestamp}</span>
                    <span className={`log-badge badge-${log.type.toLowerCase()}`}>
                      {log.type}
                    </span>
                    <span className="log-endpoint">{log.endpoint}</span>
                  </div>
                  <pre className="log-payload">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
