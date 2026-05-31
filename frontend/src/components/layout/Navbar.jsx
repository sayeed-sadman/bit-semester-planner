import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Logo({ to }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-dark font-semibold text-lg no-underline">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" />
          <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.7" />
          <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.7" />
          <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" />
        </svg>
      </div>
      <span className="text-dark font-semibold text-base">BIT Semester Planner</span>
    </Link>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const homeLink = isAdmin ? "/admin/modules" : "/dashboard";

  const handleLogout = () => {
    sessionStorage.removeItem("chatMessages");
    logout();
  };

  return (
    <nav
      className="bg-white border-b border-[#E0E4EB] px-8"
      style={{ height: 68, boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}
    >
      <div className="h-full max-w-screen-xl mx-auto flex items-center justify-between">
        <Logo to={isAuthenticated ? homeLink : "/"} />

        <div className="flex items-center gap-4">
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-button border border-surface-border text-dark-secondary text-sm font-medium hover:bg-surface-section transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-button bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Create account
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <span className="text-dark-muted text-sm hidden sm:inline">
                Logged in as: <span className="font-medium text-dark-secondary">{user.firstName} {user.lastName}</span>
              </span>
              <Link
                to="/profile"
                className="text-primary text-sm font-medium hover:text-primary-dark transition-colors"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-button border border-surface-border text-dark-secondary text-sm font-medium hover:bg-surface-section transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
