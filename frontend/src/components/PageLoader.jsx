import { Zap } from 'lucide-react';

/**
 * Full-screen branded loading screen shown during page transitions.
 */
export default function PageLoader() {
  return (
    <div className="page-loader-overlay">
      {/* Animated background orbs */}
      <div className="page-loader-orb page-loader-orb-1" />
      <div className="page-loader-orb page-loader-orb-2" />

      <div className="page-loader-content">
        {/* Logo mark */}
        <div className="page-loader-logo">
          <div className="page-loader-logo-ring" />
          <div className="page-loader-logo-icon">
            <Zap size={22} strokeWidth={2.5} />
          </div>
        </div>

        {/* Brand name */}
        <h2 className="page-loader-title">
          Task<span className="gradient-text">Flow</span>
        </h2>

        {/* Progress bar */}
        <div className="page-loader-bar-track">
          <div className="page-loader-bar-fill" />
        </div>

        <p className="page-loader-subtitle">Preparing your workspace…</p>
      </div>
    </div>
  );
}
