import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  QrCode, 
  Upload, 
  ExternalLink, 
  X, 
  AlertCircle,
  Mail,
  Calendar,
  Hash
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAlumni() {
  const { authFetch } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlum, setEditingAlum] = useState(null);
  const [selectedQRAlum, setSelectedQRAlum] = useState(null);
  const [deletingAlum, setDeletingAlum] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State: Name, Admission Number, Email, Time Span, Role, Bio, Photo
  const [formData, setFormData] = useState({
    name: '',
    admission_number: '',
    email: '',
    time_span: '',
    role: '',
    bio: '',
    photo_url: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/alumni/all');
      if (res.ok) {
        const data = await res.json();
        setAlumni(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load alumni:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const openAddModal = () => {
    setEditingAlum(null);
    setFormData({
      name: '',
      admission_number: '',
      email: '',
      time_span: '',
      role: 'Alumni Member',
      bio: '',
      photo_url: ''
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (alum) => {
    setEditingAlum(alum);
    setFormData({
      name: alum.name || '',
      admission_number: alum.admission_number || '',
      email: alum.email || '',
      time_span: alum.time_span || '',
      role: alum.role || '',
      bio: alum.bio || '',
      photo_url: alum.photo_url || ''
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const body = new FormData();
    body.append('file', file);
    body.append('category', 'alumni');

    try {
      const res = await authFetch('/api/media/upload', {
        method: 'POST',
        body
      });
      const data = await res.json();
      if (res.ok && data.file) {
        setFormData((prev) => ({ ...prev, photo_url: data.file.url }));
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch (err) {
      alert('Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const url = editingAlum ? `/api/alumni/${editingAlum.id}` : '/api/alumni';
      const method = editingAlum ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setIsFormOpen(false);
        fetchAlumni();
      } else {
        setFormError(data.error || 'Failed to save alumni profile.');
      }
    } catch (err) {
      setFormError('Server connection failed.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingAlum) return;
    setDeleteLoading(true);
    try {
      const res = await authFetch(`/api/alumni/${deletingAlum.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeletingAlum(null);
        fetchAlumni();
      }
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredAlumni = alumni.filter((a) => {
    return (
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.admission_number?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.time_span?.toLowerCase().includes(search.toLowerCase()) ||
      a.role?.toLowerCase().includes(search.toLowerCase()) ||
      a.bio?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
            NIRVANA Alumni Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage alumni profiles: Name, Admission Number, Email, Time Span, and permanent QR verification codes.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Alumni</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, admission no, email, or time span..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
          />
        </div>
      </div>

      {/* Alumni Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAlumni.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <h3 className="font-bold text-slate-700 text-base">No alumni found</h3>
          <p className="text-xs text-slate-400 mt-1">Click "Add Alumni" to add a graduate profile.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Alumni</th>
                  <th className="px-5 py-3.5">Admission No</th>
                  <th className="px-5 py-3.5">Time Span</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5 text-center">QR Code</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlumni.map((alum) => (
                  <tr key={alum.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Name & Role (No photo) */}
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{alum.name}</div>
                        <div className="text-[11px] text-slate-500">{alum.role || 'Alumni Member'}</div>
                      </div>
                    </td>

                    {/* Admission Number */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        {alum.admission_number || '—'}
                      </span>
                    </td>

                    {/* Time Span */}
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span>{alum.time_span || '—'}</span>
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5">
                      {alum.email ? (
                        <a
                          href={`mailto:${alum.email}`}
                          className="text-slate-600 hover:text-slate-900 flex items-center gap-1 truncate max-w-[200px]"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{alum.email}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* QR Code */}
                    <td className="px-5 py-3.5 text-center">
                      {alum.qr_data ? (
                        <button
                          onClick={() => setSelectedQRAlum(alum)}
                          className="inline-block p-1 bg-white border border-slate-200 rounded hover:border-slate-400 transition-colors"
                          title="Click to view QR"
                        >
                          <img
                            src={alum.qr_data}
                            alt="QR"
                            className="w-8 h-8 object-contain"
                          />
                        </button>
                      ) : (
                        <span className="text-slate-400">Generating...</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/alumni/${alum.id}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Public Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(alum)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Alumni"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingAlum(alum)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove Alumni"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingAlum ? 'Edit Alumni' : 'Add Alumni'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Photo Upload / URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Alumni Photo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                  <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPhoto ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Nambiar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Admission Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Admission Number (e.g. U20EC014) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. U20EC014"
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. priya.nambiar@alumni.svnit.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Time Span (Tenure / Batch) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Time Span (Tenure / Batch) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2020 – 2024"
                  value={formData.time_span}
                  onChange={(e) => setFormData({ ...formData, time_span: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Role / Position */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Role / Position
                </label>
                <input
                  type="text"
                  placeholder="e.g. Former President / Senior Mentor"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Short Biography */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Short Biography
                </label>
                <textarea
                  rows={3}
                  placeholder="Key contributions and achievements during tenure..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  {formSubmitting ? 'Saving...' : 'Save Alumni'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QR PREVIEW MODAL */}
      {selectedQRAlum && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-900">Alumni QR Code</span>
              <button 
                onClick={() => setSelectedQRAlum(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
              <img
                src={selectedQRAlum.qr_data}
                alt={selectedQRAlum.name}
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>

            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-900">{selectedQRAlum.name}</div>
              <div className="text-xs text-slate-500 font-mono">{selectedQRAlum.admission_number || 'NIRVANA ALUMNI'}</div>
            </div>

            <div className="pt-2">
              <a
                href={selectedQRAlum.qr_data}
                download={`QR_${selectedQRAlum.name.replace(/\s+/g, '_')}.png`}
                className="inline-block w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Download QR Code
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingAlum}
        title="Remove Alumni Record"
        message={`Are you sure you want to remove ${deletingAlum?.name} from official NIRVANA alumni records? This action cannot be undone.`}
        confirmText={deleteLoading ? "Removing..." : "Remove Alumni"}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingAlum(null)}
      />

    </div>
  );
}
