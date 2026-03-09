import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, UserCircle, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Building2 className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Barangay Service Request System
            </h1>
            <p className="text-xs text-gray-400">
              Efficient service request management for our community
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>

          {/* Admin: Settings + Logout buttons */}
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-500 hover:border-red-300 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          )}

          {/* Resident: Profile button (logout is inside profile) */}
          {user?.role === 'user' && (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            >
              <UserCircle className="w-4 h-4" />
              Profile
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
