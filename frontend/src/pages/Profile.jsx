import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTrainerProfile, updateTrainerProfile, getTrainerById, updateTrainer } from '../api/trainerApi';
import { User, Mail, Phone, Calendar, Award, Briefcase, Save, Camera, Trash2, GraduationCap, ShieldCheck, Edit3, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUserData } = useAuth();
  const role = String(user?.role || 'STUDENT').toUpperCase();
  const isStudent = role.includes('STUDENT');
  const isAdmin = role.includes('ADMIN');
  const isTrainer = role.includes('TRAINER');

  const trainerId = user?.id || localStorage.getItem('trainerId');
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: 'MALE',
    employeeId: '',
    specialization: '',
    qualification: '',
    experience: 0,
    collegeName: '',
    branch: '',
    yearOfStudy: '',
    batchId: '',
    profileImage: user?.profileImage || ''
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (isTrainer) {
        let res;
        try {
          res = await getTrainerProfile();
        } catch (e) {
          if (trainerId) {
            res = await getTrainerById(trainerId);
          } else {
            throw e;
          }
        }
        const data = res.data;
        const loadedData = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || user?.email || '',
          mobile: data.mobile || user?.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || 'MALE',
          employeeId: data.employeeId || 'EMP1024',
          specialization: data.specialization || user?.trainerType || 'Technical',
          qualification: data.qualification || 'B.E. Computer Science',
          experience: data.experience || 5,
          batchId: data.batchId || 'BATCH001',
          profileImage: data.profileImage || user?.profileImage || ''
        };
        setFormData(loadedData);
        setOriginalData(loadedData);
      } else {
        const parts = (user?.fullName || '').split(' ');
        const loadedData = {
          firstName: parts[0] || (isStudent ? 'Jyoti' : 'Admin'),
          lastName: parts.slice(1).join(' ') || (isStudent ? 'Satkar' : 'User'),
          email: user?.email || (isStudent ? 'jyoti.student@spt.com' : 'admin@spt.com'),
          mobile: user?.mobile || user?.phone || '9876543210',
          dateOfBirth: '2002-05-15',
          gender: 'FEMALE',
          collegeName: user?.collegeName || 'ISBM College of Engineering',
          branch: user?.branch || 'Computer Engineering (COMP)',
          yearOfStudy: '4th Year',
          batchId: user?.batchId || 'BATCH001',
          employeeId: isAdmin ? 'ADM001' : 'N/A',
          specialization: isAdmin ? 'System Administration' : 'Software Engineering',
          qualification: 'B.E. Computer Science',
          experience: 0,
          profileImage: user?.profileImage || ''
        };
        setFormData(loadedData);
        setOriginalData(loadedData);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      const parts = (user?.fullName || '').split(' ');
      const fallbackData = {
        firstName: parts[0] || 'User',
        lastName: parts.slice(1).join(' ') || '',
        email: user?.email || '',
        profileImage: user?.profileImage || ''
      };
      setFormData(prev => ({ ...prev, ...fallbackData }));
      setOriginalData(prev => ({ ...prev, ...fallbackData }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
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
        if (!isEditing) {
          updateUserData({ profileImage: base64Image });
          toast.success('Profile photo updated!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profileImage: '' }));
    if (!isEditing) {
      updateUserData({ profileImage: '' });
      toast.success('Profile photo removed');
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData({ ...originalData });
    }
    setIsEditing(false);
    toast.success('Changes discarded');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null
    };
    try {
      if (isTrainer) {
        try {
          await updateTrainerProfile(payload);
        } catch (e) {
          if (trainerId) {
            await updateTrainer(trainerId, payload);
          } else {
            throw e;
          }
        }
      }
      toast.success('Profile updated successfully!');
      const updatedUser = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        profileImage: formData.profileImage
      };
      updateUserData(updatedUser);
      setOriginalData({ ...formData });
      setIsEditing(false); // Return to View Mode
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err.response?.data?.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner w-10 h-10 border-red-600" />
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
      {/* Header with Mode Toggle Buttons */}
      <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal, contact, and account details</p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn-primary px-5 py-2.5 shadow-md shadow-red-200 flex items-center gap-2 font-bold"
          >
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-gray-200"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={saving}
              className="btn-primary px-5 py-2.5 shadow-md shadow-red-200 flex items-center gap-2 font-bold"
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
          </div>
        )}
      </div>

      <form id="profile-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
          disabled={!isEditing}
        />

        {/* Profile Card Header */}
        <div className="card p-6 flex flex-col sm:flex-row items-center gap-6 border-red-100">
          <div className="relative group flex-shrink-0">
            <div
              onClick={() => isEditing && fileInputRef.current?.click()}
              className={`w-24 h-24 rounded-full bg-red-100 border-4 border-white shadow-md flex items-center justify-center text-red-700 font-extrabold text-3xl overflow-hidden relative ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
              title={isEditing ? "Click to edit profile photo" : "Profile photo"}
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
                {formData.mobile || 'Not provided'}
              </span>
              {!isStudent && (
                <span className="flex items-center gap-1">
                  <Briefcase size={14} className="text-red-500" />
                  Emp ID: {formData.employeeId || 'Not assigned'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-bold text-gray-800">Personal Information</h3>
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
                  className="form-input disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
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
                  className="form-input disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
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
                  className="form-input disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  disabled={!isEditing}
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact & Dynamic Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-bold text-gray-800">
                {isStudent ? 'Academic & Admission Details' : isAdmin ? 'Administrative Control Details' : 'Professional & Faculty Details'}
              </h3>
            </div>
            <div className="card-body flex flex-col gap-4">
              {/* Email Address - System Controlled (Always Disabled) */}
              <div className="form-group">
                <label className="form-label">Email Address (System Account)</label>
                <input
                  type="email"
                  name="email"
                  disabled
                  value={formData.email}
                  className="form-input bg-gray-100 text-gray-600 font-mono cursor-not-allowed border-gray-200"
                  title="System controlled email cannot be edited"
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
                  className="form-input disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
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
                      className="form-input disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Branch / Specialization</label>
                    <input
                      type="text"
                      name="branch"
                      disabled={!isEditing}
                      value={formData.branch}
                      onChange={handleChange}
                      className="form-input disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Batch ID - System Controlled */}
                  <div className="form-group">
                    <label className="form-label">Assigned Batch ID (System Managed)</label>
                    <input
                      type="text"
                      name="batchId"
                      disabled
                      value={formData.batchId}
                      className="form-input bg-gray-100 font-mono font-bold text-red-600 cursor-not-allowed border-gray-200"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Employee ID - System Controlled */}
                  <div className="form-group">
                    <label className="form-label">Employee ID (System Assigned)</label>
                    <input
                      type="text"
                      name="employeeId"
                      disabled
                      value={formData.employeeId}
                      className="form-input bg-gray-100 font-mono font-bold text-gray-700 cursor-not-allowed border-gray-200"
                      title="Employee ID is system-assigned and cannot be modified"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      disabled={!isEditing}
                      value={formData.specialization}
                      onChange={handleChange}
                      className="form-input disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                    />
                  </div>

                  {isTrainer && (
                    <div className="form-group">
                      <label className="form-label">Experience (Years)</label>
                      <input
                        type="number"
                        name="experience"
                        min="0"
                        disabled={!isEditing}
                        value={formData.experience}
                        onChange={handleChange}
                        className="form-input disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-not-allowed"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar (Only visible when editing) */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 text-sm font-bold rounded-xl border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 shadow-md shadow-red-200 font-bold flex items-center gap-2"
            >
              {saving ? (
                <div className="spinner border-white border-t-transparent w-5 h-5" />
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
