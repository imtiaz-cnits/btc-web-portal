"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { updateProfile, updatePassword } from "@/app/actions/auth";
import { User, Lock, Save, ShieldAlert, KeyRound, Camera } from "lucide-react";

export default function AdminProfilePage() {
  const { data: session, update } = useSession();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  const [profileData, setProfileData] = useState({ name: "", email: "" });
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
      if (session.user.image) {
        setAvatar(session.user.image);
      } else {
        const savedAvatar = localStorage.getItem("btc_admin_avatar");
        if (savedAvatar) {
          setAvatar(savedAvatar);
        }
      }
    }
  }, [session]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String); // Show immediate client-side preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;
    
    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });

    const userId = (session.user as any).id;
    const formData = new FormData(e.currentTarget);

    const result = await updateProfile(userId, formData);
    if (result.success) {
      setProfileMessage({ type: "success", text: result.message });
      
      const newImage = result.image || session.user.image;
      if (newImage) {
        localStorage.setItem("btc_admin_avatar", newImage);
        window.dispatchEvent(new Event("avatarChanged"));
      }

      // Update NextAuth session data client-side
      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          image: newImage,
        }
      });
    } else {
      setProfileMessage({ type: "error", text: result.message });
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const newPassword = e.currentTarget.newPassword.value;
    const confirmPassword = e.currentTarget.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: "", text: "" });

    const userId = (session.user as any).id;
    const formData = new FormData(e.currentTarget);

    const result = await updatePassword(userId, formData);
    if (result.success) {
      setPasswordMessage({ type: "success", text: result.message });
      e.currentTarget.reset();
    } else {
      setPasswordMessage({ type: "error", text: result.message });
    }
    setPasswordLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-6 h-6 text-[var(--primary-color)]" />
          Profile Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your administrator account information and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
            <User className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="text-lg font-bold text-slate-800">Basic Information</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            
            {/* Circular Avatar Uploader Widget */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-50 flex items-center justify-center">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-slate-400">
                    {profileData.name.substring(0, 1).toUpperCase() || "A"}
                  </span>
                )}
                {/* Hover Edit Overlay */}
                <label className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer select-none">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Upload</span>
                  <input 
                    type="file" 
                    name="avatar"
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Change Photo
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input 
                name="name" 
                required 
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white outline-none transition text-sm"
                placeholder="Admin Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white outline-none transition text-sm"
                placeholder="admin@example.com"
              />
            </div>

            {profileMessage.text && (
              <div className={`p-4 rounded-xl text-sm ${
                profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {profileMessage.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={profileLoading}
              className="w-full bg-[var(--primary-color)] hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-600/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b pb-4 border-slate-100">
            <Lock className="w-5 h-5 text-[var(--primary-color)]" />
            <h2 className="text-lg font-bold text-slate-800">Security Credentials</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
              <input 
                type="password" 
                name="currentPassword" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white outline-none transition text-sm"
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
              <input 
                type="password" 
                name="newPassword" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white outline-none transition text-sm"
                placeholder="Enter new password (min. 6 chars)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white outline-none transition text-sm"
                placeholder="Confirm new password"
              />
            </div>

            {passwordMessage.text && (
              <div className={`p-4 rounded-xl text-sm ${
                passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={passwordLoading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <KeyRound className="w-4 h-4" />
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
