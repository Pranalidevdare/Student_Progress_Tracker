import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTrainerById, updateTrainer } from '../api/trainerApi';
import { getMyStudentProfile, updateMyStudentProfile } from '../api/api';
import { User, Mail, Phone, Camera, Trash2, GraduationCap, ShieldCheck, Briefcase, Save, Edit3, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUserData } = useAuth();
  const role = String(user?.role || 'STUDENT').toUpperCase();
  const isStudent = role.includes('STUDENT');
  const isAdmin = role.includes('ADMIN');
  const isTrainer = role.includes('TRAINER');

  const trainerId = user?.id || localStorage.getItem('trainerId') || '650123456789abcdef012345';
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorState, setErrorState] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'MALE',
    studentId: '',
    employeeId: '',
    specialization: '',
    qualification: '',
    experience: 0,
    collegeName: '',
    degree: 'B.Tech',
    branch: '',
    passingYear: '',
    cgpa: '',
    batchId: '',
    batchName: '',
    profileImage: user?.profileImage || ''
  });

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    try {
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    console.log("AUTH USER:", user);
    console.log("AUTH USER ID:", user?.id);
    console.log("AUTH USER EMAIL:", user?.email);
    console.log("AUTH STUDENT ID:", user?.studentId);
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorState(null);

    try {
      if (isTrainer) {
        const res = await getTrainerById(trainerId);
        const data = res.data;

        const loaded = {
          firstName: data?.firstName || '',
          lastName: data?.lastName || '',
          email: data?.email || user?.email || '',
          mobile: data?.mobile || '',
          dateOfBirth: formatDateForInput(data?.dateOfBirth),
          gender: data?.gender || 'MALE',
          employeeId: data?.employeeId || '',
          specialization: data?.specialization || user?.trainerType || 'Technical',
          qualification: data?.qualification || '',
          experience: data?.experience ?? 0,
          collegeName: '',
          degree: '',
          branch: '',
          passingYear: '',
          cgpa: '',
          batchId: data?.batchId || '',
          batchName: '',
          profileImage: data?.profileImage || user?.profileImage || ''
        };

        setFormData(loaded);
        setInitialData(loaded);
      } else if (isStudent) {
        console.log("Fetching student profile via GET /api/students/me");
        const res = await getMyStudentProfile();
        console.log("GET /api/students/me response:", res);

        const data = res.data;
        if (!data) {
          throw new Error('Student record could not be found in MongoDB.');
        }

        const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
        const nameParts = fullName ? fullName.split(' ') : [];

        const loaded = {
          firstName: data.firstName || nameParts[0] || 'Student',
          lastName: data.lastName || nameParts.slice(1).join(' ') || '',
          studentId: data.studentId || user?.studentId || '',
          email: data.email || user?.email || '',
          mobile: data.mobile || '',
          dateOfBirth: formatDateForInput(data.dateOfBirth),
          gender: data.gender || 'MALE',
          collegeName: data.collegeName || '',
          degree: data.degree || '',
          branch: data.branch || '',
          passingYear: data.passingYear ?? '',
          cgpa: data.cgpa ?? '',
          batchId: data.batchId || user?.batchId || '',
          batchName: data.batchName || '',
          employeeId: '',
          specialization: '',
          qualification: '',
          experience: 0,
          profileImage: data.profileImage || user?.profileImage || ''
        };

        setFormData(loaded);
        setInitialData(loaded);
      } else {
        const parts = (user?.fullName || '').trim().split(' ').filter(Boolean);
        const loaded = {
          firstName: parts[0] || 'Admin',
          lastName: parts.slice(1).join(' ') || 'User',
          email: user?.email || 'admin@spt.com',
          mobile: user?.mobile || '',
          dateOfBirth: '',
          gender: 'MALE',
          collegeName: '',
          branch: 'Administration',
          degree: '',
          passingYear: '',
          cgpa: '',
          batchId: '',
          batchName: '',
          employeeId: 'ADM001',
          specialization: 'System Administration',
          qualification: 'System Administrator',
          experience: 0,
          profileImage: user?.profileImage || ''
        };

        setFormData(loaded);
        setInitialData(loaded);
      }
    } catch (error) {
      console.error("PROFILE ERROR:", error);
      console.error("STATUS:", error?.response?.status);
      console.error("RESPONSE DATA:", error?.response?.data);
      console.error("REQUEST URL:", error?.config?.url);

      const status = error.response?.status;
      if (status === 404) {
        setErrorState('Student record could not be found in MongoDB. Please check logged-in user email.');
      } else if (status === 403) {
        setErrorState('Access forbidden. Please sign in again.');
      } else if (status === 500) {
        setErrorState('Unable to load profile from server. Please try again.');
      } else {
        setErrorState(error.message || 'Unable to load profile details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    if (!isEditing) return;
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setFormData(prev => ({ ...prev, profileImage: base64Image }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    if (!isEditing) return;
    setFormData(prev => ({ ...prev, profileImage: '' }));
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      toast.error('First Name and Last Name are required.');
      return;
    }

    setSaving(true);
    try {
      if (isStudent) {
        const payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          mobile: formData.mobile,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender,
          collegeName: formData.collegeName,
          degree: formData.degree,
          branch: formData.branch,
          passingYear: formData.passingYear ? parseInt(formData.passingYear, 10) : null,
          cgpa: formData.cgpa !== '' ? parseFloat(formData.cgpa) : null,
          profileImage: formData.profileImage
        };

        console.log("Updating student profile via PUT /api/students/me with payload:", payload);
        const res = await updateMyStudentProfile(payload);
        const updated = res.data;

        const updatedForm = {
          ...formData,
          studentId: updated.studentId || formData.studentId,
          firstName: updated.firstName || formData.firstName,
          lastName: updated.lastName || formData.lastName,
          mobile: updated.mobile || formData.mobile,
          dateOfBirth: formatDateForInput(updated.dateOfBirth || formData.dateOfBirth),
          gender: updated.gender || formData.gender,
          collegeName: updated.collegeName || formData.collegeName,
          degree: updated.degree || formData.degree,
          branch: updated.branch || formData.branch,
          passingYear: updated.passingYear ?? formData.passingYear,
          cgpa: updated.cgpa ?? formData.cgpa,
          profileImage: updated.profileImage || formData.profileImage
        };

        setFormData(updatedForm);
        setInitialData(updatedForm);

        updateUserData({
          fullName: `${updatedForm.firstName} ${updatedForm.lastName}`.trim(),
          profileImage: updatedForm.profileImage,
          mobile: updatedForm.mobile,
          collegeName: updatedForm.collegeName,
          branch: updatedForm.branch,
          studentId: updatedForm.studentId,
          batchId: updatedForm.batchId,
          id: updated.id || user?.id
        });

        toast.success('Profile updated and saved to MongoDB!');
        setIsEditing(false);
      } else if (isTrainer) {
        const res = await updateTrainer(trainerId, formData);
        const updated = res.data || formData;

        setFormData(updated);
        setInitialData(updated);

        updateUserData({
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          profileImage: formData.profileImage
        });

        toast.success('Trainer profile updated successfully!');
        setIsEditing(false);
      } else {
        updateUserData({
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          profileImage: formData.profileImage
        });
        setInitialData({ ...formData });
        toast.success('Profile saved!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to save profile changes to database. Please check backend server.';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="spinner w-10 h-10 border-red-600" />
        <p className="text-xs text-gray-500 font-semibold">Loading profile...</p>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6 bg-red-50/50 rounded-2xl border border-red-200 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-extrabold text-red-900">{errorState}</h3>
        <button onClick={fetchProfile} className="btn-primary text-xs px-4 py-2 font-bold rounded-xl">
          Retry Loading Profile
        </button>
      </div>
    );
  }

  const getRoleLabel = () => {
    if (isAdmin) return 'System Administrator';
    if (isStudent) return 'Enrolled Student Candidate';
    return user?.trainerType ? `${user.trainerType} Faculty Trainer` : 'Faculty Trainer';
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEditing ? 'Editing your profile information' : 'View your personal, contact, and academic details'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-red-200"
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="btn-primary flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl shadow-md shadow-red-200"
              >
                {saving ? (
                  <div className="spinner border-white border-t-transparent w-4 h-4" />
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
          disabled={!isEditing}
        />

        <div className="card p-6 flex flex-col sm:flex-row items-center gap-6 border-red-100">
          <div className="relative group flex-shrink-0">
            <div
              onClick={() => isEditing && fileInputRef.current?.click()}
              className={`w-24 h-24 rounded-full bg-red-100 border-4 border-white shadow-md flex items-center justify-center text-red-700 font-extrabold text-3xl overflow-hidden relative ${
                isEditing ? 'cursor-pointer' : 'cursor-default'
              }`}
              title={isEditing ? 'Click to change profile photo' : 'Profile photo'}
            >
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{formData.firstName ? formData.firstName.charAt(0).toUpperCase() : <User size={40} />}</span>
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} />
                </div>
              )}
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-red-700 transition"
                title="Upload Profile Photo"
              >
                <Camera size={15} />
              </button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h2>
              {isEditing && formData.profileImage && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100"
                  title="Remove Profile Photo"
                >
                  <Trash2 size={12} /> Remove Photo
                </button>
              )}
            </div>

            <p className="text-xs text-red-600 font-bold mt-1 flex items-center justify-center sm:justify-start gap-1">
              {isAdmin ? <ShieldCheck size={14} /> : isStudent ? <GraduationCap size={14} /> : <Briefcase size={14} />}
              <span>{getRoleLabel()}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Mail size={14} className="text-red-500" />
                {formData.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={14} className="text-red-500" />
                {formData.mobile || 'Not added'}
              </span>
              {!isStudent && (
                <span className="flex items-center gap-1">
                  <Briefcase size={14} className="text-red-500" />
                  Emp ID: {formData.employeeId || 'N/A'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Personal Information</h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isEditing ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                {isEditing ? 'Editable' : 'View Mode'}
              </span>
            </div>
            <div className="card-body flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  disabled={!isEditing}
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  disabled={!isEditing}
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  disabled={!isEditing}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`form-input ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  disabled={!isEditing}
                  value={formData.gender}
                  onChange={handleChange}
                  className={`form-select ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">
                {isStudent ? 'Academic & Contact Details' : isAdmin ? 'Administrative Details' : 'Professional Faculty Details'}
              </h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isEditing ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                {isEditing ? 'Editable' : 'View Mode'}
              </span>
            </div>
            <div className="card-body flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Email Address (System Login Identity)</label>
                <input
                  type="email"
                  name="email"
                  readOnly
                  disabled
                  value={formData.email}
                  className="form-input bg-gray-100 text-gray-600 font-mono cursor-not-allowed border-gray-200"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="text"
                  name="mobile"
                  required
                  disabled={!isEditing}
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`form-input ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                />
              </div>

              {isStudent ? (
                <>
                  <div className="form-group">
                    <label className="form-label">College Name</label>
                    <input
                      type="text"
                      name="collegeName"
                      disabled={!isEditing}
                      value={formData.collegeName}
                      onChange={handleChange}
                      className={`form-input ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label">Degree</label>
                      <input
                        type="text"
                        name="degree"
                        disabled={!isEditing}
                        value={formData.degree}
                        onChange={handleChange}
                        className={`form-input ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Branch</label>
                      <input
                        type="text"
                        name="branch"
                        disabled={!isEditing}
                        value={formData.branch}
                        onChange={handleChange}
                        className={`form-input ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label">Passing Year</label>
                      <input
                        type="number"
                        name="passingYear"
                        disabled={!isEditing}
                        value={formData.passingYear}
                        onChange={handleChange}
                        className={`form-input ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        name="cgpa"
                        disabled={!isEditing}
                        value={formData.cgpa}
                        onChange={handleChange}
                        className={`form-input ${!isEditing ? 'bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="form-label">Student ID (System Managed)</label>
                      <input
                        type="text"
                        name="studentId"
                        readOnly
                        disabled
                        value={formData.studentId || ''}
                        className="form-input bg-gray-100 text-gray-800 font-mono font-bold cursor-not-allowed border-gray-200"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assigned Batch ID (System Managed)</label>
                      <input
                        type="text"
                        name="batchId"
                        readOnly
                        disabled
                        value={formData.batchId}
                        className="form-input bg-gray-100 text-red-600 font-mono font-bold cursor-not-allowed border-gray-200"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      readOnly
                      disabled
                      value={formData.employeeId}
                      className="form-input bg-gray-100 text-gray-800 font-mono font-bold cursor-not-allowed border-gray-200"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}