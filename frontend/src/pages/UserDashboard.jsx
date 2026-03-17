import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { FileText, Clock, CheckCircle, AlertCircle, Search, Eye, Download, X, XCircle, AlertTriangle } from 'lucide-react';

const PurposeCell = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span className="text-gray-800">—</span>;
  const isLong = text.length > 40;
  return (
    <span className="text-gray-800 text-right break-all max-w-xs block">
      {isLong && !expanded ? text.slice(0, 40) + '...' : text}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-1 text-xs text-blue-500 hover:underline"
        >
          {expanded ? 'Hide' : 'View'}
        </button>
      )}
    </span>
  );
};

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab,    setActiveTab]    = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('all');
  const [requests,     setRequests]     = useState([]);
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState('');
  const [viewRequest,  setViewRequest]  = useState(null);

  const [form, setForm] = useState({
    service_type: '',
    purpose:      '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests/my');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const requestId = `REQ-${Date.now()}`;
      const finalPurpose = form.purpose === 'Others' ? form.customPurpose : form.purpose;
      await api.post('/requests', {
        ...form,
        purpose: finalPurpose,
        request_id: requestId,
        full_name:  user.name,
      });
      setSuccess('Request submitted successfully!');
      setForm({ service_type: '', purpose: '', customPurpose: '' });
      fetchRequests();
      setTimeout(() => {
        setSuccess('');
        setActiveTab('dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Filter by search (ID, type, status, date) AND status tab
  const filtered = requests.filter(r => {
    const dateStr = formatDate(r.createdAt || r.created_at).toLowerCase();
    const matchesSearch =
      r.request_id?.toLowerCase().includes(search.toLowerCase())   ||
      r.service_type?.toLowerCase().includes(search.toLowerCase()) ||
      r.status?.toLowerCase().includes(search.toLowerCase())       ||
      dateStr.includes(search.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && r.status === statusFilter;
  });

  const stats = {
    total:      requests.length,
    pending:    requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed:  requests.filter(r => r.status === 'completed').length,
    rejected:   requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Primary Tabs — Dashboard + Submit Request only */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit mb-6 shadow-sm">
          {[
            { key: 'dashboard', label: 'Dashboard'     },
            { key: 'submit',    label: 'Submit Request' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Total Requests" value={stats.total}      subtitle="All service requests"   icon={<FileText    className="w-6 h-6" />} color="text-gray-400"  />
              <StatCard title="Pending"        value={stats.pending}    subtitle="Awaiting review"        icon={<Clock       className="w-6 h-6" />} color="text-amber-400" />
              <StatCard title="In Progress"    value={stats.inProgress} subtitle="Being processed"       icon={<AlertCircle className="w-6 h-6" />} color="text-blue-400"  />
              <StatCard title="Completed"      value={stats.completed}  subtitle="Successfully processed" icon={<CheckCircle className="w-6 h-6" />} color="text-green-400" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Service Requests</h2>
                <p className="text-sm text-gray-400 mt-0.5">View and track your submitted requests</p>
              </div>

              {/* Status Sub-Tabs */}
              <div className="px-6 py-4 flex gap-1 bg-gray-50/50 border-b border-gray-100 overflow-x-auto">
                {[
                  { key: 'all',       label: 'All Requests', icon: <FileText    className="w-3.5 h-3.5" />, count: stats.total     },
                  { key: 'pending',   label: 'Pending',      icon: <Clock       className="w-3.5 h-3.5" />, count: stats.pending   },
                  { key: 'completed', label: 'Completed',    icon: <CheckCircle className="w-3.5 h-3.5" />, count: stats.completed },
                  { key: 'rejected',  label: 'Rejected',     icon: <XCircle     className="w-3.5 h-3.5" />, count: stats.rejected  },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === tab.key
                        ? 'bg-white text-primary shadow-sm border border-gray-200'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    <span className="opacity-50">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Search — supports date e.g. "Mar 2026" */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by ID, type, status, or date (e.g. Mar 2026)..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No {statusFilter !== 'all' ? statusFilter : ''} requests found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Request ID', 'Service Type', 'Status', 'Date Submitted', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-gray-500">{r.request_id}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">{r.service_type}</td>
                          <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(r.createdAt || r.created_at)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setViewRequest(r)}
                                className="flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              {r.status === 'completed' && r.file_path && (
                                <a
                                  href={`${import.meta.env.VITE_API_URL}/${r.file_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-green-600 hover:underline font-medium"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SUBMIT REQUEST TAB ── */}
        {activeTab === 'submit' && (
          <div className="fade-in max-w-2xl">

            {/* Warning Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800 mb-2">Please read before submitting</p>
                  <ul className="text-sm text-amber-700 space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>State your purpose clearly and completely</strong> — it will be printed word-for-word on your official document.
                    </li>
                    <li>
                      <strong>Make sure your registered name is your real, correct name</strong> — it will appear on the document exactly as registered. If it does not match barangay records, your request will be rejected.
                    </li>
                    <li>
                      Need to update your name?{' '}
                      <button
                        onClick={() => navigate('/profile')}
                        className="underline font-bold text-amber-800 hover:text-amber-900"
                      >
                        Go to Profile
                      </button>
                      {' '}before submitting.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">Submit a Service Request</h2>
              <p className="text-sm text-gray-400 mb-6">Fill out the form below to request a barangay document</p>

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 font-medium">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Registered Name (read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Registered Name <span className="text-xs text-gray-400 font-normal">(from your profile — cannot be edited here)</span>
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Service Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="service_type"
                    value={form.service_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                    required
                  >
                    <option value="">Select a document type...</option>
                    <option value="Barangay Clearance">Barangay Clearance</option>
                    <option value="Certificate of Indigency">Certificate of Indigency</option>
                    <option value="Certificate of Residency">Certificate of Residency</option>
                    <option value="Barangay Business Permit">Barangay Business Permit</option>
                  </select>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Purpose <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                    required={form.purpose !== 'Others'}
                  >
                    <option value="">Select a purpose...</option>
                    {form.service_type === 'Barangay Clearance' && <>
                      <option>For Employment</option>
                      <option>For Travel Abroad</option>
                      <option>For Bank Requirement</option>
                      <option>For Scholarship Application</option>
                      <option>For Loan Application</option>
                      <option>For Government Requirement</option>
                      <option value="Others">Others (please specify)</option>
                    </>}
                    {form.service_type === 'Certificate of Residency' && <>
                      <option>For School Enrollment</option>
                      <option>For Voter Registration</option>
                      <option>For Bank Requirement</option>
                      <option>For Government Requirement</option>
                      <option>For Scholarship Application</option>
                      <option value="Others">Others (please specify)</option>
                    </>}
                    {form.service_type === 'Certificate of Indigency' && <>
                      <option>For Medical Assistance</option>
                      <option>For Scholarship Application</option>
                      <option>For Government Assistance</option>
                      <option>For School Enrollment</option>
                      <option value="Others">Others (please specify)</option>
                    </>}
                    {form.service_type === 'Barangay Business Permit' && <>
                      <option>For New Business Registration</option>
                      <option>For Business Permit Renewal</option>
                      <option>For Business Inspection Requirement</option>
                      <option value="Others">Others (please specify)</option>
                    </>}
                    {!form.service_type && <option disabled>Please select a service type first</option>}
                  </select>
                  {form.purpose === 'Others' && (
                    <textarea
                      name="purpose"
                      value={form.customPurpose || ''}
                      onChange={e => setForm({...form, customPurpose: e.target.value})}
                      rows={2}
                      placeholder="Please specify your purpose..."
                      className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition resize-none"
                      required
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-1">This will appear word-for-word on your document.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting...
                    </span>
                  ) : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* VIEW REQUEST MODAL */}
      {viewRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Request Details</h3>
              <button onClick={() => setViewRequest(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Request ID',     value: viewRequest.request_id   },
                { label: 'Type',           value: viewRequest.service_type },
                { label: 'Status',         value: <StatusBadge   status={viewRequest.status}     /> },
                { label: 'Purpose',        value: <PurposeCell text={viewRequest.purpose} /> },
                { label: 'Date Submitted', value: formatDate(viewRequest.createdAt || viewRequest.created_at) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-gray-400 font-medium w-36">{label}</span>
                  <span className="text-gray-800 text-right">{value}</span>
                </div>
              ))}
              {viewRequest.admin_remarks && (
                <div className="py-2">
                  <span className="text-gray-400 font-medium block mb-1">Admin Remarks</span>
                  <span className="text-blue-600 italic bg-blue-50 p-2 rounded block">{viewRequest.admin_remarks}</span>
                </div>
              )}
            </div>
            {viewRequest.status === 'completed' && viewRequest.file_path && (
              <a
                href={`${import.meta.env.VITE_API_URL}/${viewRequest.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition"
              >
                <Download className="w-4 h-4" /> Download Document
              </a>
            )}
            <button
              onClick={() => setViewRequest(null)}
              className="mt-3 w-full border border-gray-200 text-gray-500 font-semibold py-2.5 rounded-xl hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
