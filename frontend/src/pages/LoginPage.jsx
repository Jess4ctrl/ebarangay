import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, User, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role,     setRole]     = useState('user');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userRole = await login(email, password, role);
      navigate(userRole === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <Building2 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-400 mt-1 text-center">
            Sign in to access Barangay Service Request System
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Login As</p>
          <div className="grid grid-cols-2 gap-3">

            {/* Resident */}
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                role === 'user'
                  ? 'border-secondary bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                role === 'user' ? 'bg-secondary' : 'bg-gray-100'
              }`}>
                <User className={`w-4 h-4 ${role === 'user' ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Resident User</p>
                <p className="text-xs text-gray-400 leading-tight">Submit and track service requests</p>
              </div>
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                role === 'admin'
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 hover:border-red-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                role === 'admin' ? 'bg-red-500' : 'bg-gray-100'
              }`}>
                <Shield className={`w-4 h-4 ${role === 'admin' ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Admin</p>
                <p className="text-xs text-gray-400 leading-tight">Manage requests and verify users</p>
              </div>
            </button>

          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              `Sign In as ${role === 'admin' ? 'Admin' : 'User'}`
            )}
          </button>

        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-400 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-secondary hover:underline">
            Register here
          </Link>
        </p>

        

      </div>
    </div>
  );
}