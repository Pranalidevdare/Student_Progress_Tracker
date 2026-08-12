import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentById } from '../api/api';
import { MdPerson, MdEmail, MdPhone, MdSchool, MdCheckCircle } from 'react-icons/md';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }
    getStudentById(user.studentId)
      .then((r) => setProfile(r.data))
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.data || '';
        setError(msg || 'Failed to load profile from backend.');
      })
      .finally(() => setLoading(false));
  }, [user?.studentId]);

  if (loading) {
    return (
      <div className="state-container" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p className="state-title">Loading profile…</p>
      </div>
    );
  }

  const student = profile || {
    firstName: user?.fullName?.split(' ')[0] || 'Student',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    email: user?.email,
    mobile: null,
    collegeName: null,
    degree: null,
    branch: null,
    passingYear: null,
    cgpa: null,
    selectionStatus: null,
    active: true,
  };

  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || user?.fullName || 'Student';
  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() || 'S';

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View your profile details, contact info, and academic registration</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid-3" style={{ gap: 18, marginBottom: 20 }}>
        {/* Profile Card */}
        <div className="card" style={{ gridColumn: 'span 1', textAlign: 'center', padding: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--color-primary)', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, margin: '0 auto 12px',
            boxShadow: '0 4px 12px rgba(185,28,43,0.2)',
          }}>
            {initials}
          </div>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {fullName}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{student.email}</p>
          <span className="badge badge-success" style={{ marginTop: 10 }}>
            {student.active ? 'Active Student' : 'Inactive'}
          </span>
        </div>

        {/* Personal Info */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header"><span className="card-title">Personal &amp; Contact Details</span></div>
          <div className="grid-2" style={{ gap: 14 }}>
            <div>
              <span className="form-label">First Name</span>
              <p className="font-medium">{student.firstName || '—'}</p>
            </div>
            <div>
              <span className="form-label">Last Name</span>
              <p className="font-medium">{student.lastName || '—'}</p>
            </div>
            <div>
              <span className="form-label">Email Address</span>
              <p className="font-medium">{student.email || '—'}</p>
            </div>
            <div>
              <span className="form-label">Mobile Number</span>
              <p className="font-medium">{student.mobile || '—'}</p>
            </div>
            <div>
              <span className="form-label">Gender</span>
              <p className="font-medium">{student.gender || '—'}</p>
            </div>
            <div>
              <span className="form-label">Date of Birth</span>
              <p className="font-medium">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Background */}
      <div className="card">
        <div className="card-header"><span className="card-title">Academic Details &amp; Selection</span></div>
        <div className="grid-3" style={{ gap: 16 }}>
          <div>
            <span className="form-label">College Name</span>
            <p className="font-medium">{student.collegeName || '—'}</p>
          </div>
          <div>
            <span className="form-label">Degree</span>
            <p className="font-medium">{student.degree || '—'}</p>
          </div>
          <div>
            <span className="form-label">Branch</span>
            <p className="font-medium">{student.branch || '—'}</p>
          </div>
          <div>
            <span className="form-label">Passing Year</span>
            <p className="font-medium">{student.passingYear || '—'}</p>
          </div>
          <div>
            <span className="form-label">CGPA</span>
            <p className="font-medium">{student.cgpa != null ? student.cgpa : '—'}</p>
          </div>
          <div>
            <span className="form-label">Selection Status</span>
            <span className="badge badge-info">{student.selectionStatus || 'ENROLLED'}</span>
          </div>
        </div>
      </div>
    </>
  );
}
