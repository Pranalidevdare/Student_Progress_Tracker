import React from 'react';
import './StatCard.css';

export default function StatCard({ title, value, sub, icon: Icon, color = 'primary' }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className={`stat-card-icon-wrap ${color}`}>
            <Icon className="stat-card-icon" />
          </div>
        )}
      </div>
      <p className="stat-card-value">{value ?? '—'}</p>
      {sub && <p className="stat-card-sub">{sub}</p>}
    </div>
  );
}
