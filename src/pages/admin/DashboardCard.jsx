import React from 'react';

const DashboardCard = ({ title, value, icon, trend, className = '' }) => {
  const isNegative = trend && trend.startsWith('-');
  
  return (
    <div className={`dashboard-card ${className}`.trim()}>
      <div className="card-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
        {trend && (
          <span className={`card-trend ${isNegative ? 'negative' : ''}`.trim()}>
            {isNegative ? '↓' : '↑'} {trend.replace(/[+-]/, '')}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;