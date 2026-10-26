import React from 'react';
import { Icon } from '../../../components/common/Icon';

interface EmptyStatePendingProps {
  title: string;
  description: string;
  iconName?: string;
}

export const EmptyStatePending: React.FC<EmptyStatePendingProps> = ({
  title,
  description,
  iconName = 'clock',
}) => (
  <div className="content-box">
    <div className="empty-state">
      <div className="empty-icon-box">
        <Icon name={iconName as Parameters<typeof Icon>[0]['name']} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      <div className="integration-preview-badge">
        <Icon name="info" />
        <span>Estado: Pendiente de integración con Google Sheets</span>
      </div>
    </div>
  </div>
);
