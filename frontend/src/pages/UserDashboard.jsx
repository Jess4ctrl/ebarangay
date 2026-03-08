import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { FileText, Clock, CheckCircle, AlertCircle, Search, Eye, Download, X, XCircle } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab,    setActiveTab]    = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState('all'); // State for status sub-tabs
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
      await api.post('/requests', {
        ...form,
        request_id: requestId,
        full_name:  user.name,
      });
      setSuccess('Request submitted successfully!');
      setForm({ service_type: '', purpose: '' });
      fetchRequests();
      setTimeout(() => {
        setSuccess('');
        setActiveTab('track');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Logic to filter requests by Search AND the Status Sub-Tabs
  const filtered = requests.filter(r => {
    const matchesSearch = 
      r.request_id?.toLowerCase().includes(search.toLowerCase())   ||
      r.service_type?.toLowerCase().includes(search.toLowerCase()) ||
      r.status?.toLowerCase().includes(search.toLowerCase());
    
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Primary Navigation Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit mb-6 shadow-sm">
          {[
            { key: 'dashboard', label: 'Dashboard'      },
            { key: 'submit',    label: 'Submit Request'  },
            { key: 'track',     label: 'Track Requests'  },
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

        {activeTab === 'dashboard' && (
          <div className="fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Total Requests" value={stats.total}      subtitle="All service requests"   icon={<FileText    className="w-6 h-6" />} color="text-gray-400"   />
              <StatCard title="Pending"        value={stats.pending}    subtitle="Awaiting review"        icon={<Clock       className="w-6 h-6" />} color="text-amber-400"  />
              <StatCard title="In Progress"    value={stats.inProgress} subtitle="Being processed"       icon={<AlertCircle className="w-6 h-6" />} color="text-blue-400"   />
              <StatCard title="Completed"      value={stats.completed}  subtitle="Successfully processed" icon={<CheckCircle className="w-6 h-6" />} color="text-green-400"  />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Service Requests</h2>
                <p className="text-sm text-gray-400 mt-0.5">View and track your submitted requests</p>
              </div>

              {/* STATUS SUB-TABS (Similar to Admin Dashboard) */}
              <div className="px-6 py-4 flex gap-1 bg-gray-50/50 border-b border-gray-100 overflow-x-auto">
                {[
                  { key: 'all',       label: 'All Requests', icon: <FileText className="w-3.5 h-3.5"/> },
                  { key: 'pending',   label: 'Pending',      icon: <Clock className="w-3.5 h-3.5"/> },
                  { key: 'completed', label: 'Completed',    icon: <CheckCircle className="w-3.5 h-3.5"/> },
                  { key: 'rejected',  label: 'Rejected',     icon: <XCircle className="w-3.5 h-3.5"/> },
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
                    <span className="opacity-50">({stats[tab.key === 'all' ? 'total' : tab.key]})</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by ID, type, or status..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                  />
                </div>
              </div>

              {/* Table Layout (Similar to Admin) */}
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
                        {['Request ID','Service Type','Priority','Status','Date Submitted','Actions'].map(h => (
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
                          <td className="px-6 py-4"><PriorityBadge priority={r.priority} /></td>
                          <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(r.createdAt || r.created_at)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setViewRequest(r)} className="flex items-center gap-1 text-xs text-secondary hover:underline font-medium">
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              {r.status === 'completed' && r.file_path && (
                                <a href={`http://localhost:5000/${r.file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-600 hover:underline font-medium">
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

        {/* ... Rest of your tabs (Submit Request, Track Requests) ... */}
        {activeTab === 'submit' && (
           <div className="fade-in max-w-2xl">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Submit a Service Request</h2>
                <p className="text-sm text-gray-400 mb-6">Fill out the form below to request a barangay document</p>
                {/* Your Form Logic Here */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* ... Same form fields as before but ensure priority select is removed ... */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Type</label>
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
                      <option value="Complaint">Complaint</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Purpose</label>
                    <textarea
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition resize-none"
                      required
                    />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60">
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </div>
           </div>
        )}
      </div>

      {/* VIEW REQUEST MODAL (Same as your Admin one) */}
      {viewRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 fade-in">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Request Details</h3>
              <button onClick={() => setViewRequest(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Content mapping same as before */}
            <div className="space-y-3 text-sm">
              {[
                { label: 'Request ID', value: viewRequest.request_id },
                { label: 'Type', value: viewRequest.service_type },
                { label: 'Status', value: <StatusBadge status={viewRequest.status} /> },
                { label: 'Priority', value: <PriorityBadge priority={viewRequest.priority} /> },
                { label: 'Purpose', value: viewRequest.purpose },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-gray-400 font-medium w-32">{label}</span>
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
            <button onClick={() => setViewRequest(null)} className="mt-6 w-full border border-gray-200 text-gray-500 font-semibold py-2.5 rounded-xl hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}