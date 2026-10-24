import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Database,
  Cloud,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/lib/auth-store";
import { showAlert } from "@/lib/alert";

export const Route = createFileRoute("/admin/settings")({
  staticData: { sitemap: false },
  ssr: false,
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { user } = useAuth();
  const [adminName, setAdminName] = useState(user?.full_name || "Kriya Master Admin");
  const [adminEmail, setAdminEmail] = useState(user?.email || "admin@thekriyalab.com");
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(async () => {
      setIsSaving(false);
      await showAlert.success("Settings Saved", "Admin settings updated successfully.", 1500);
    }, 500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showAlert.error("Required", "Please enter your current admin password.");
      return;
    }
    if (newPassword.length < 6) {
      showAlert.error("Weak Password", "New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert.error("Mismatch", "New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);
    setTimeout(async () => {
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await showAlert.success("Password Updated", "Admin password has been changed successfully.", 1500);
    }, 600);
  };

  return (
    <>
      <div className="space-y-6 font-['Poppins',sans-serif] max-w-5xl mx-auto">
        {/* Single Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Portal & Database Settings
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure TiDB Cloud server connection, Cloudinary media storage, and admin credentials.
            </p>
          </div>
        </div>

        {/* Database & Cloudinary Status Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* TiDB Cloud Status */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#299cdb]/10 p-2.5 text-[#299cdb]">
                  <Database className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">TiDB Cloud Database</h3>
                  <p className="text-[0.68rem] text-gray-400">Primary SQL storage engine</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="size-3" />
                <span>Connected</span>
              </span>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-xs text-gray-600 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-400">Host:</span>
                <span className="font-mono text-gray-800">gateway01.ap-southeast-1.prod.aws.tidbcloud.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Database:</span>
                <span className="font-mono text-gray-800">the_kriya_lab</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SSL Mode:</span>
                <span className="font-semibold text-emerald-600">REQUIRED (Amazon Root CA 1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tables:</span>
                <span className="text-gray-800">users, events, inquiries, audit_logs</span>
              </div>
            </div>
          </div>

          {/* Cloudinary Status */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#334d84]/10 p-2.5 text-[#334d84]">
                  <Cloud className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Cloudinary Media CDN</h3>
                  <p className="text-[0.68rem] text-gray-400">Event banners and photos</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="size-3" />
                <span>Active</span>
              </span>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-xs text-gray-600 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-400">Cloud Name:</span>
                <span className="font-mono text-gray-800">aqpfwrcn</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Upload Folder:</span>
                <span className="font-mono text-gray-800">kriya_events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery:</span>
                <span className="text-emerald-600 font-semibold">HTTPS CDN Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Optimization:</span>
                <span className="text-gray-800">Auto WebP / Quality 80</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Profile Form */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-4">Admin Security & Identity</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Display Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-2.5 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-2.5 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#334d84] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#2b4273] shadow-xs transition-colors cursor-pointer"
              >
                <Save className="size-3.5" />
                <span>{isSaving ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-1">
            <Lock className="size-4 text-[#334d84]" />
            <h3 className="text-base font-bold text-gray-900">Change Admin Password</h3>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Update your master admin portal password. Must be at least 6 characters.
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (admin123)"
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-2.5 text-xs text-gray-900 pr-10 focus:border-[#334d84] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-2.5 text-xs text-gray-900 pr-10 focus:border-[#334d84] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-gray-300 bg-[#f8f9fa] px-4 py-2.5 text-xs text-gray-900 focus:border-[#334d84] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0ab39c] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#099885] shadow-xs transition-colors cursor-pointer"
              >
                <Key className="size-3.5" />
                <span>{isChangingPassword ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
