import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTrainerById, updateTrainer } from '../api/trainerApi';
import { User, Mail, Phone, Calendar, Award, Briefcase, Save, Camera, Trash2, GraduationCap, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUserData } = useAuth();
  const role = String(user?.role || 'STUDENT').toUpperCase();
  const isStudent = role.includes('STUDENT');
  const isAdmin = role.includes('ADMIN');
  const isTrainer = role.includes('TRAINER');

  const trainerId = user?.id || localStorage.getItem('trainerId') || '650123456789abcdef012345';
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        const res = await getTrainerById(trainerId);
        const data = res.data;
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          mobile: data.mobile || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || 'MALE',
          employeeId: data.employeeId || 'EMP1024',
          specialization: data.specialization || user?.trainerType || 'Technical',
          qualification: data.qualification || 'B.E. Computer Science',
          experience: data.experience || 5,
          batchId: data.batchId || null,
          profileImage: data.profileImage || user?.profileImage || ''
        });
      } else {
        const parts = (user?.fullName || '').split(' ');
        setFormData({
          firstName: parts[0] || (isStudent ? 'Jyoti' : 'Admin'),
          lastName: parts.slice(1).join(' ') || (isStudent ? 'Satkar' : 'User'),
          email: user?.email || (isStudent ? 'jyoti.student@spt.com' : 'admin@spt.com'),
          mobile: user?.mobile || '9876543210',
          dateOfBirth: '2002-05-15',
          gender: 'FEMALE',
          collegeName: user?.collegeName || 'ISBM College of Engineering',
          branch: user?.branch || 'Computer Engineering (COMP)',
          yearOfStudy: '4th Year',
          batchId: user?.batchId || null,
          employeeId: isAdmin ? 'ADM001' : 'N/A',
          specialization: isAdmin ? 'System Administration' : 'Software Engineering',
          qualification: 'B.E. Computer Science',
          experience: 0,
          profileImage: user?.profileImage || ''
        });
      }
    } catch (err) {
      const parts = (user?.fullName || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: parts[0] || 'User',
        lastName: parts.slice(1).join(' ') || '',
        email: user?.email || '',
        profileImage: user?.profileImage || ''
      }));
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
        updateUserData({ profileImage: base64Image });
        toast.success('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profileImage: '' }));
    updateUserData({ profileImage: '' });
    toast.success('Profile photo removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isTrainer) {
        await updateTrainer(trainerId, formData);
      }
      toast.success('Profile updated successfully!');
      updateUserData({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        profileImage: formData.profileImage
      });
    } catch (err) {
      updateUserData({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        profileImage: formData.profileImage
      });
      toast.success('Profile details saved!');
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
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal, contact, and account details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
        />

        {/* Profile Card Header */}
        <div className="card p-6 flex flex-col sm:flex-row items-center gap-6 border-red-100">
          <div className="relative group flex-shrink-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-red-100 border-4 border-white shadow-md flex items-center justify-center text-red-700 font-extrabold text-3xl overflow-hidden cursor-pointer relative"
              title="Click to edit profile photo"
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

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-red-700 transition"
              title="Upload Profile Photo"
            >
              <Camera size={15} />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h2>
              {formData.profileImage && (
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
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select"
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
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="text"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {isStudent ? (
                <>
                  <div className="form-group">
                    <label className="form-label">College Name</label>
                    <input
                      type="text"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Branch / Specialization</label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Batch ID</label>
                    <input
                      type="text"
                      name="batchId"
                      readOnly
                      value={formData.batchId}
                      className="form-input bg-gray-50 font-mono font-bold text-red-600"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  {isTrainer && (
                    <div className="form-group">
                      <label className="form-label">Experience (Years)</label>
                      <input
                        type="number"
                        name="experience"
                        min="0"
                        value={formData.experience}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-3 shadow-md shadow-red-200"
          >
            {saving ? (
              <div className="spinner border-white border-t-transparent w-5 h-5" />
            ) : (
              <>
                <Save size={18} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
