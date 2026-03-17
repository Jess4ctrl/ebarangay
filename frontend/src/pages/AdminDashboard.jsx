import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import api from '../services/api';
import {
  FileText, Clock, CheckCircle, AlertCircle,
  Search, Eye, X, Check, XCircle, Loader
} from 'lucide-react';

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

export default function AdminDashboard() {
  const [activeTab,   setActiveTab]   = useState('all');
  const [requests,    setRequests]    = useState([]);
  const [users,       setUsers]       = useState([]);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);
  const [remarks,     setRemarks]     = useState('');
  const [updating,    setUpdating]    = useState(false);
  const [generating,  setGenerating]  = useState(false);
  const [actionMsg,   setActionMsg]   = useState('');
  const [userSearch,  setUserSearch]  = useState('');

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/admin/requests');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      await api.patch(`/admin/requests/${id}`, {
        status,
        admin_remarks: remarks,
      });
      setActionMsg(`Request ${status} successfully!`);
      fetchRequests();
      setTimeout(() => {
        setActionMsg('');
        setSelected(null);
        setRemarks('');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const generatePDF = async (id) => {
    setGenerating(true);
    try {
      await api.post(`/admin/requests/${id}/generate`);
      setActionMsg('Document generated successfully!');
      fetchRequests();
      setTimeout(() => {
        setActionMsg('');
        setSelected(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const filtered = requests.filter(r => {
    const dateStr = formatDate(r.createdAt || r.created_at).toLowerCase();
    const matchSearch =
      r.request_id?.toLowerCase().includes(search.toLowerCase())   ||
      r.full_name?.toLowerCase().includes(search.toLowerCase())    ||
      r.service_type?.toLowerCase().includes(search.toLowerCase()) ||
      r.status?.toLowerCase().includes(search.toLowerCase())       ||
      dateStr.includes(search.toLowerCase());
    if (activeTab === 'pending')     return matchSearch && r.status === 'pending';
    if (activeTab === 'in-progress') return matchSearch && r.status === 'in-progress';
    if (activeTab === 'completed')   return matchSearch && r.status === 'completed';
    return matchSearch;
  });

  const stats = {
    total:      requests.length,
    pending:    requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed:  requests.filter(r => r.status === 'completed').length,
  };

  const tabs = [
    { key: 'all',         label: 'All Requests' },
    { key: 'pending',     label: 'Pending'      },
    { key: 'in-progress', label: 'In Progress'  },
    { key: 'completed',   label: 'Completed'    },
    { key: 'users',       label: 'Users'        },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Requests" value={stats.total}      subtitle="All service requests"   icon={<FileText    className="w-6 h-6" />} color="text-gray-400"  />
          <StatCard title="Pending"        value={stats.pending}    subtitle="Awaiting review"        icon={<Clock       className="w-6 h-6" />} color="text-amber-400" />
          <StatCard title="In Progress"    value={stats.inProgress} subtitle="Being processed"       icon={<AlertCircle className="w-6 h-6" />} color="text-blue-400"  />
          <StatCard title="Completed"      value={stats.completed}  subtitle="Successfully processed" icon={<CheckCircle className="w-6 h-6" />} color="text-green-400" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit mb-6 shadow-sm flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {tab.key === 'pending' && stats.pending > 0 && (
                <span className="ml-1.5 bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm fade-in">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Registered Users</h2>
              <p className="text-sm text-gray-400 mt-0.5">All resident accounts in the system</p>
            </div>
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['ID', 'Full Name', 'Email', 'Phone', 'Address', 'Date Registered'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.filter(u => u.role === 'user' && (
                    !userSearch ||
                    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.email?.toLowerCase().includes(userSearch.toLowerCase())     ||
                    u.phone?.toLowerCase().includes(userSearch.toLowerCase())
                  )).map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-gray-400">{u.id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{u.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{u.address || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.createdAt || u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        ) : (

          /* Requests Table */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm fade-in">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Service Requests</h2>
              <p className="text-sm text-gray-400 mt-0.5">Review and manage all resident requests</p>
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by ID, name, service type, status, or date (e.g. Mar 2026)..."
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
                  <p className="font-medium">No requests found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Request ID', 'Name', 'Service Type', 'Status', 'Date Submitted', 'Actions'].map(h => (
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
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{r.full_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{r.service_type}</td>
                        <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(r.createdAt || r.created_at)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => { setSelected(r); setRemarks(r.admin_remarks || ''); }}
                            className="flex items-center gap-1 text-xs text-secondary hover:underline font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── REQUEST DETAIL MODAL ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 fade-in max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Request Details</h3>
              <button
                onClick={() => { setSelected(null); setRemarks(''); setActionMsg(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {actionMsg}
              </div>
            )}

            <div className="space-y-3 text-sm mb-5">
              {[
                { label: 'Request ID',    value: <span className="font-mono text-xs">{selected.request_id}</span> },
                { label: 'Resident Name', value: selected.full_name    },
                { label: 'Service Type',  value: selected.service_type },
                { label: 'Purpose',       value: <PurposeCell text={selected.purpose} /> },
                { label: 'Status',        value: <StatusBadge status={selected.status} /> },
                { label: 'Submitted',     value: formatDate(selected.createdAt || selected.created_at) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-gray-400 font-medium w-36 flex-shrink-0">{label}</span>
                  <span className="text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* Admin Remarks */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Remarks</label>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Add remarks or notes for the resident..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {selected.status === 'pending' && (
                <button
                  onClick={() => updateStatus(selected.id, 'in-progress')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition text-sm disabled:opacity-60"
                >
                  {updating ? <Loader className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  Set In Progress
                </button>
              )}

              {(selected.status === 'pending' || selected.status === 'in-progress') && (
                <button
                  onClick={() => generatePDF(selected.id)}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition text-sm disabled:opacity-60"
                >
                  {generating ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve and Generate Document
                </button>
              )}

              {selected.status !== 'completed' && selected.status !== 'rejected' && (
                <button
                  onClick={() => updateStatus(selected.id, 'rejected')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition text-sm disabled:opacity-60"
                >
                  {updating ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject Request
                </button>
              )}

              {selected.status === 'completed' && selected.file_path && (
                <a
                  href={`${import.meta.env.VITE_API_URL}/${selected.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-900 text-white font-bold py-2.5 rounded-xl transition text-sm"
                >
                  Download Generated Document
                </a>
              )}

              <button
                onClick={() => { setSelected(null); setRemarks(''); setActionMsg(''); }}
                className="w-full border border-gray-200 text-gray-500 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
