import React from 'react';
import { Icon } from '../../../components/common/Icon';

interface CertificateStatusCardsProps {
  totalCount: number | string;
  pendingCount: number | string;
  generatedCount: number | string;
  omittedCount: number | string;
  populationLabel?: string;
}

export const CertificateStatusCards: React.FC<CertificateStatusCardsProps> = ({
  totalCount = 0,
  pendingCount = 0,
  generatedCount = 0,
  omittedCount = 0,
  populationLabel = 'organizadores',
}) => {
  const normLabel = populationLabel.toLowerCase();

  return (
    <div className="status-cards-row">
      <div className="status-step-card">
        <div className="status-step-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}>
          <Icon name="users" />
        </div>
        <div>
          <div className="status-step-title">Total {normLabel}</div>
          <div className="status-step-count">{totalCount}</div>
        </div>
      </div>

      <div className="status-step-card">
        <div className="status-step-icon pending">
          <Icon name="clock" />
        </div>
        <div>
          <div className="status-step-title">Pendientes de generar</div>
          <div className="status-step-count">{pendingCount}</div>
        </div>
      </div>

      <div className="status-step-card">
        <div className="status-step-icon signed">
          <Icon name="award" />
        </div>
        <div>
          <div className="status-step-title">Generados en Drive</div>
          <div className="status-step-count">{generatedCount}</div>
        </div>
      </div>

      <div className="status-step-card">
        <div className="status-step-icon" style={{ backgroundColor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>
          <Icon name="x" />
        </div>
        <div>
          <div className="status-step-title">Omitidos</div>
          <div className="status-step-count">{omittedCount}</div>
        </div>
      </div>
    </div>
  );
};
