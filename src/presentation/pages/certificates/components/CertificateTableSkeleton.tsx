import React from 'react';

interface CertificateTableSkeletonProps {
  rows?: number;
  populationLabel?: string;
  population?: 'organizadores' | 'participantes';
}

export const CertificateTableSkeleton: React.FC<CertificateTableSkeletonProps> = ({
  rows = 6,
  populationLabel = 'Organizadores',
  population = 'organizadores',
}) => {
  const isParticipants = population === 'participantes';
  return (
    <div className="table-container cert-skeleton-wrapper" aria-busy="true" aria-label={`Cargando ${populationLabel.toLowerCase()}…`}>
      <div className="table-bulk-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton-line shimmer" style={{ width: '220px', height: '14px', borderRadius: '4px' }} />
        <div className="skeleton-line shimmer" style={{ width: '180px', height: '24px', borderRadius: '6px' }} />
      </div>

      <table className="table-mock">
        <thead>
          <tr>
            <th style={{ width: '170px' }}>{isParticipants ? 'Código' : 'Identificador'}</th>
            <th>Nombre completo</th>
            {isParticipants ? (
              <>
                <th style={{ width: '170px' }}>Reto / Eje</th>
                <th style={{ width: '260px' }}>Institución</th>
              </>
            ) : (
              <>
                <th>Rol</th>
                <th>Área de interés</th>
              </>
            )}
            <th style={{ width: '130px', textAlign: 'center' }}>Emitir cert.</th>
            {!isParticipants && <th style={{ width: '190px' }}>TIPO DE EMISIÓN</th>}
            <th style={{ width: '130px' }}>Estado Drive</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={`skeleton-row-${index}`}>
              <td>
                <div className="skeleton-line shimmer" style={{ width: '70px', height: '14px', borderRadius: '4px' }} />
              </td>
              <td>
                <div className="skeleton-line shimmer" style={{ width: index % 2 === 0 ? '160px' : '210px', height: '14px', borderRadius: '4px' }} />
              </td>
              <td>
                <div className="skeleton-line shimmer" style={{ width: '100px', height: '20px', borderRadius: '12px' }} />
              </td>
              <td>
                <div className="skeleton-line shimmer" style={{ width: '90px', height: '14px', borderRadius: '4px' }} />
              </td>
              <td style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className="skeleton-line shimmer" style={{ width: '38px', height: '20px', borderRadius: '10px' }} />
                </div>
              </td>
              {!isParticipants && <td>
                <div className="skeleton-line shimmer" style={{ width: '110px', height: '22px', borderRadius: '6px' }} />
              </td>}
              <td>
                <div className="skeleton-line shimmer" style={{ width: '85px', height: '20px', borderRadius: '12px' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
