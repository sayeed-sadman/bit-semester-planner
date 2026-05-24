import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMe, updateMe, deleteMe } from "../services/authService";
import { setAuthCredentials, clearAuthCredentials } from "../services/api";
import PageHeader from "../components/layout/PageHeader";
import InputField from "../components/common/InputField";
import SuccessBanner from "../components/common/SuccessBanner";
import ConfirmModal from "../components/common/ConfirmModal";

export default function EditProfilePage() {
  const { user, isAdmin, updateUser, clearUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getMe().then((data) => {
      setForm((f) => ({ ...f, firstName: data.firstName || "", lastName: data.lastName || "", email: data.email || "" }));
    });
  }, []);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!isAdmin) {
      if (!form.email.trim()) e.email = "Email is required.";
      else if (!/^[^@]+@[^@]+\.[^@.]+$/.test(form.email)) e.email = "Please enter a valid email address.";
    }
    const changingPassword = form.newPassword || form.confirmPassword || form.currentPassword;
    if (changingPassword) {
      if (!form.currentPassword) e.currentPassword = "Current password is required to change password.";
      if (!form.newPassword) {
        e.newPassword = "New password is required.";
      } else if (form.newPassword.length < 6) {
        e.newPassword = "Password must be at least 6 characters.";
      }
      if (form.newPassword && form.newPassword !== form.confirmPassword) {
        e.confirmPassword = "Passwords do not match.";
      }
    }
    return e;
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteMe();
      clearAuthCredentials();
      clearUser();
      navigate("/");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setApiError("");
    setLoading(true);

    const payload = { firstName: form.firstName, lastName: form.lastName, ...(!isAdmin && { email: form.email }) };
    if (form.newPassword) {
      payload.password = form.newPassword;
      payload.currentPassword = form.currentPassword;
    }

    try {
      const updated = await updateMe(payload);
      updateUser(updated);
      if (form.newPassword) {
        setAuthCredentials(form.email, form.newPassword);
      }
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setShowSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg === "Current password is incorrect.") {
        setErrors((e) => ({ ...e, currentPassword: "Current password is incorrect." }));
      } else {
        setApiError(msg || "Failed to save changes. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-md mx-auto px-6 py-8">
      <PageHeader
        backTo={isAdmin ? "/admin/modules" : "/dashboard"}
        backLabel={isAdmin ? "Back to Module Catalog" : "Back to My Planner"}
        title="Edit Profile"
      />

      <SuccessBanner
        isVisible={showSuccess}
        message="Your profile has been updated successfully."
        onDismiss={() => setShowSuccess(false)}
      />

      <div className="bg-white rounded-card p-6 shadow-card flex flex-col gap-5">
        <h3 className="text-sm font-semibold text-dark-secondary uppercase tracking-wide">Personal Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id="firstName"
            label="First name"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            error={errors.firstName}
          />
          <InputField
            id="lastName"
            label="Last name"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>

        <InputField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          disabled={isAdmin}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />
        {isAdmin && (
          <p className="text-xs text-dark-muted -mt-3">To change your email address, please contact the system administrator.</p>
        )}

        <hr className="border-surface-divider" />

        <h3 className="text-sm font-semibold text-dark-secondary uppercase tracking-wide">Change Password</h3>
        <p className="text-xs text-dark-muted -mt-3">Leave blank to keep your current password.</p>

        <InputField
          id="currentPassword"
          label="Current password"
          type="password"
          value={form.currentPassword}
          onChange={(e) => handleChange("currentPassword", e.target.value)}
          error={errors.currentPassword}
          placeholder="••••••••"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id="newPassword"
            label="New password"
            type="password"
            value={form.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            error={errors.newPassword}
            placeholder="••••••••"
          />
          <InputField
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />
        </div>

        {apiError && (
          <p className="text-sm text-danger bg-danger-light border border-danger-border rounded-input px-3 py-2">
            {apiError}
          </p>
        )}

        <div className={`flex items-center mt-2 ${isAdmin ? "justify-end" : "justify-between"}`}>
          {!isAdmin && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2.5 text-danger text-sm font-semibold rounded-button border border-danger hover:bg-danger-light transition-colors"
            >
              Delete Account
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-button hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText={deleteLoading ? "Deleting…" : "Delete Account"}
        confirmVariant="danger"
      />
    </div>
  );
}
