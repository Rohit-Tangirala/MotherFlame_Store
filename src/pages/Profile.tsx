import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Calendar, Loader2, Save, User as UserIcon, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, token, updateProfile, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize fields once user is loaded
  useEffect(() => {
    if (!token && !loading) {
      navigate('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, token, loading, navigate]);

  if (loading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm text-slate-500 font-bold">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    if (!email.trim()) {
      toast.error('Email cannot be empty.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateProfile(name, email, password || undefined);
      toast.success('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Format creation date
  const creationDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not available';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Header section */}
        <div className="border-b border-slate-200/80 pb-6 space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Profile
          </h1>
          <p className="text-sm text-slate-500">
            Manage your personal settings, security, and credentials.
          </p>
        </div>

        {/* Profile Card & Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar Metadata Card */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center space-y-4 shadow-3xs">
              <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-200/60 shadow-inner">
                <UserIcon size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">{user.name}</h3>
                <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-100 text-left space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Joined on</p>
                    <p className="text-slate-700 font-semibold mt-0.5">{creationDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <Shield size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Access level</p>
                    <p className="text-slate-700 font-semibold mt-0.5">{user.role === 'admin' ? 'Administrator' : 'Standard Account'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="md:col-span-8">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-3xs">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <UserIcon size={16} className="text-blue-600" />
                    <span>Personal Details</span>
                  </h2>

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="profile-name">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-slate-400 pointer-events-none">
                        <UserIcon size={16} />
                      </div>
                      <input
                        id="profile-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden text-slate-900"
                        placeholder="Your Full Name"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="profile-email">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-slate-400 pointer-events-none">
                        <Mail size={16} />
                      </div>
                      <input
                        id="profile-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden text-slate-900"
                        placeholder="yourname@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Lock size={16} className="text-blue-600" />
                    <span>Change Password</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Only fill these out if you want to update your current account password.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="profile-password">
                        New Password
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                          <Lock size={16} />
                        </div>
                        <input
                          id="profile-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden text-slate-900"
                          placeholder="••••••••"
                          minLength={6}
                        />
                      </div>
                    </div>

                    {/* Confirm Password field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="profile-confirm-password">
                        Confirm New Password
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                          <Lock size={16} />
                        </div>
                        <input
                          id="profile-confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden text-slate-900"
                          placeholder="••••••••"
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    id="profile-save-button"
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-2.5 px-6 rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-blue-100/50 transition-all cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
