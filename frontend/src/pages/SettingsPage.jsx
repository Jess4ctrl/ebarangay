import { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Save, Trash2, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const sigPad = useRef(null);

  const [form, setForm] = useState({
    barangay_name:    '',
    municipality:     '',
    province:         '',
    captain_name:     '',
    captain_position: '',
  });

  const [currentSignature, setCurrentSignature] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success,   setSuccess]   = useState('');
  const [error,     setError]     = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setForm({
        barangay_name:    data.barangay_name    || '',
        municipality:     data.municipality     || '',
        province:         data.province         || '',
        captain_name:     data.captain_name     || '',
        captain_position: data.captain_position || '',
      });
      setCurrentSignature(data.signature_path || null);
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.put('/settings', form);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSignature = async () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      setError('Please draw a signature first.');
      return;
    }
    setUploading(true);
    setSuccess('');
    setError('');
    try {
      const dataURL = sigPad.current.toDataURL('image/png');
      const res     = await fetch(dataURL);
      const blob    = await res.blob();
      const formData = new FormData();
      formData.append('signature', blob, 'signature.png');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/settings/signature', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      setCurrentSignature(dataURL);
      setSuccess('Signature saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Signature error:', err);
      setError(`Failed to save signature: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClearSignature = () => {
    if (sigPad.current) sigPad.current.clear();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Barangay Settings</h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure barangay details and captain signature used in generated documents
          </p>
        </div>

        {/* Success / Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Barangay Details Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Barangay Information</h2>
            <p className="text-sm text-gray-400 mb-5">
              These details will appear on all generated PDF documents
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Barangay Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="barangay_name"
                  value={form.barangay_name}
                  onChange={handleChange}
                  placeholder="e.g. San Jose"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Municipality / City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="municipality"
                  value={form.municipality}
                  onChange={handleChange}
                  placeholder="e.g. City of Manila"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Province <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  placeholder="e.g. Metro Manila"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Barangay Captain Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="captain_name"
                  value={form.captain_name}
                  onChange={handleChange}
                  placeholder="e.g. Hon. Juan Dela Cruz"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Captain Position Title
                </label>
                <input
                  type="text"
                  name="captain_position"
                  value={form.captain_position}
                  onChange={handleChange}
                  placeholder="e.g. Barangay Captain"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  <><Save className="w-4 h-4" /> Save Settings</>
                )}
              </button>
            </div>
          </div>

          {/* Signature Pad */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Captain Signature</h2>
            <p className="text-sm text-gray-400 mb-5">
              Draw the barangay captain's signature below. It will appear on all generated documents.
            </p>

            {/* Current Saved Signature Preview */}
            {currentSignature && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">Current Saved Signature:</p>
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 flex items-center justify-center">
                  <img
                    src={
                      currentSignature.startsWith('data:')
                        ? currentSignature
                        : `http://localhost:5000/uploads/${currentSignature.replace('uploads/', '')}`
                    }
                    alt="Saved signature"
                    className="max-h-20 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Signature Canvas */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">Draw New Signature:</p>
              <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
                <SignatureCanvas
                  ref={sigPad}
                  penColor="#1e3a5f"
                  canvasProps={{
                    width:     460,
                    height:    160,
                    className: 'w-full',
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Use your mouse or touchpad to draw the signature
              </p>
            </div>

            {/* Signature Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClearSignature}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
              >
                <Trash2 className="w-4 h-4" /> Clear
              </button>
              <button
                onClick={handleSaveSignature}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-60 text-sm"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  'Save Signature'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-semibold mb-2">
            Preview — How this appears in generated documents:
          </p>
          <div className="bg-white rounded-lg p-4 border border-blue-100 font-mono text-xs text-gray-600 leading-relaxed">
            <p className="text-center font-bold">Republic of the Philippines</p>
            <p className="text-center">Province of {form.province || '[Province]'}</p>
            <p className="text-center">Municipality of {form.municipality || '[Municipality]'}</p>
            <p className="text-center font-bold">Barangay {form.barangay_name || '[Barangay Name]'}</p>
            <p className="text-center mt-2 font-bold underline">BARANGAY CLEARANCE</p>
            <p className="mt-4 text-right">______________________________</p>
            <p className="text-right font-bold">{form.captain_name || '[Captain Name]'}</p>
            <p className="text-right">{form.captain_position || 'Barangay Captain'}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
