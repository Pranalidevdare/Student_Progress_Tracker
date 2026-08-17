import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMaterialsByBatch } from '../api/api';
import { MdMenuBook, MdDownload, MdPictureAsPdf, MdVideoLibrary, MdCode, MdInsertDriveFile } from 'react-icons/md';

const typeIcon = (type = '') => {
  const t = type.toUpperCase();
  if (t === 'PDF')   return <MdPictureAsPdf style={{ color: '#E53E3E' }} />;
  if (t === 'VIDEO') return <MdVideoLibrary style={{ color: '#3182CE' }} />;
  if (t === 'CODE')  return <MdCode style={{ color: '#38A169' }} />;
  return <MdInsertDriveFile style={{ color: '#F47920' }} />;
};

export default function MaterialsPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [tab, setTab]             = useState('ALL');

  useEffect(() => {
    if (!user?.batchId) {
      setLoading(false);
      return;
    }
    getMaterialsByBatch(user.batchId)
      .then((r) => setMaterials(r.data || []))
      .catch(() => setError('Failed to load study materials.'))
      .finally(() => setLoading(false));
  }, [user?.batchId]);

  if (loading) return <div className="state-container"><div className="spinner" /><p className="state-title">Loading study materials…</p></div>;

  const filtered = tab === 'ALL'
    ? materials
    : materials.filter(m => (m.type || m.materialType || '').toUpperCase() === tab);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Study Materials</h1>
          <p className="page-subtitle">Access learning resources, code samples, presentations, and guides</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabs">
        {['ALL', 'PDF', 'VIDEO', 'DOCUMENT', 'CODE'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {!user?.batchId ? (
        <div className="state-container card">
          <MdMenuBook className="state-icon" />
          <p className="state-title">Batch info missing</p>
          <p className="state-desc">Your profile is not assigned to a batch yet.</p>
        </div>
      ) : filtered.length ? (
        <div className="grid-3" style={{ gap: 20 }}>
          {filtered.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: '1.5rem', display: 'flex' }}>{typeIcon(item.type || item.materialType)}</div>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.title}</h3>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem', marginTop: 2 }}>{item.type || 'RESOURCE'}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 14 }}>
                  {item.description}
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={item.fileUrl || item.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <MdDownload /> Download / Open
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="state-container card">
          <MdMenuBook className="state-icon" />
          <p className="state-title">No resources found</p>
          <p className="state-desc">No study materials available for this filter.</p>
        </div>
      )}
    </>
  );
}
