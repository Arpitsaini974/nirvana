import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CertificateModal from '../../components/CertificateModal';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Award, 
  Upload, 
  ShieldCheck, 
  Calendar, 
  Eye, 
  X, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function AdminCertificates() {
  const { authFetch } = useAuth();

  const [certs, setCerts] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);
  const [deletingCert, setDeletingCert] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    recipient_name: '',
    recipient_type: 'team_member',
    team_member_id: '',
    alumni_id: '',
    certificate_type: 'Achievement',
    issue_date: '',
    description: '',
    file_url: '',
    verification_id: '',
    is_public: true
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [certsRes, membersRes, alumniRes] = await Promise.all([
        authFetch('/api/certificates/all'),
        authFetch('/api/members/all'),
        authFetch('/api/alumni/all')
      ]);

      if (certsRes.ok) setCerts(await certsRes.json());
      if (membersRes.ok) setTeamMembers(await membersRes.json());
      if (alumniRes.ok) setAlumniList(await alumniRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openAddModal = () => {
    setEditingCert(null);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setFormData({
      title: '',
      recipient_name: '',
      recipient_type: 'team_member',
      team_member_id: '',
      alumni_id: '',
      certificate_type: 'Excellence',
      issue_date: new Date().toISOString().split('T')[0],
      description: '',
      file_url: '',
      verification_id: `CERT-ARC-${year}-${randomSuffix}`,
      is_public: true
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (cert) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title,
      recipient_name: cert.recipient_name,
      recipient_type: cert.recipient_type || 'team_member',
      team_member_id: cert.team_member_id || '',
      alumni_id: cert.alumni_id || '',
      certificate_type: cert.certificate_type || 'Achievement',
      issue_date: cert.issue_date || '',
      description: cert.description || '',
      file_url: cert.file_url || '',
      verification_id: cert.verification_id || '',
      is_public: cert.is_public === 1
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const body = new FormData();
    body.append('file', file);
    body.append('category', 'certificates');

    try {
      const res = await authFetch('/api/media/upload', {
        method: 'POST',
        body
      });
      const data = await res.json();
      if (res.ok && data.file) {
        setFormData((prev) => ({ ...prev, file_url: data.file.url }));
      } else {
        alert(data.error || 'Failed to upload certificate image');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleMemberSelect = (e) => {
    const selectedId = e.target.value;
    const member = teamMembers.find((m) => String(m.id) === String(selectedId));
    setFormData((prev) => ({
      ...prev,
      team_member_id: selectedId,
      recipient_name: member ? member.name : prev.recipient_name
    }));
  };

  const handleAlumniSelect = (e) => {
    const selectedId = e.target.value;
    const alum = alumniList.find((a) => String(a.id) === String(selectedId));
    setFormData((prev) => ({
      ...prev,
      alumni_id: selectedId,
      recipient_name: alum ? alum.name : prev.recipient_name
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const url = editingCert ? `/api/certificates/${editingCert.id}` : '/api/certificates';
      const method = editingCert ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setIsFormOpen(false);
        fetchAllData();
      } else {
        setFormError(data.error || 'Failed to save certificate.');
      }
    } catch (err) {
      setFormError('Server connection failed.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCert) return;
    setDeleteLoading(true);
    try {
      const res = await authFetch(`/api/certificates/${deletingCert.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeletingCert(null);
        fetchAllData();
      }
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCerts = certs.filter((c) => {
    return (
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.verification_id?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Certificate & Honors Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Issue authenticated certificate records to members, alumni, or competition teams.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Issue Certificate</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, recipient, or verification ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-base">No certificates found</h3>
          <p className="text-xs text-slate-400 mt-1">Click "Upload / Issue Certificate" to add new records.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Certificate Title</th>
                  <th className="px-5 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Type & Date</th>
                  <th className="px-5 py-3.5">Verification ID</th>
                  <th className="px-5 py-3.5">Visibility</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={cert.file_url}
                          alt={cert.title}
                          className="w-12 h-8 rounded-lg object-cover ring-1 ring-slate-200 cursor-pointer"
                          onClick={() => setPreviewCert(cert)}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                        <div>
                          <div 
                            onClick={() => setPreviewCert(cert)}
                            className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer line-clamp-1"
                          >
                            {cert.title}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{cert.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{cert.recipient_name}</div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {cert.recipient_type?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-amber-700">{cert.certificate_type}</div>
                      <div className="text-slate-400 text-[11px]">{cert.issue_date}</div>
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-slate-700">
                      {cert.verification_id}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        cert.is_public ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {cert.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewCert(cert)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Preview Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(cert)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Certificate"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCert(cert)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Certificate"
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

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingCert ? 'Edit Certificate' : 'Issue / Upload Certificate'}
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Robocon Gold Honor"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Recipient Category
                  </label>
                  <select
                    value={formData.recipient_type}
                    onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="team_member">Current Team Member</option>
                    <option value="alumni">Alumni</option>
                    <option value="club">Club Achievement</option>
                  </select>
                </div>

                {formData.recipient_type === 'team_member' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Link to Member
                    </label>
                    <select
                      value={formData.team_member_id}
                      onChange={handleMemberSelect}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="">-- Choose Member --</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.member_id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.recipient_type === 'alumni' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Link to Alumni
                    </label>
                    <select
                      value={formData.alumni_id}
                      onChange={handleAlumniSelect}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="">-- Choose Alumni --</option>
                      {alumniList.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.batch})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Certificate Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Excellence, Honor, Leadership, Workshop"
                    value={formData.certificate_type}
                    onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Verification ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.verification_id}
                    onChange={(e) => setFormData({ ...formData, verification_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Certificate Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Certificate File / Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingFile ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description / Award Citation
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="is_public" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Publicly visible in verification and certificates registry
                </label>
              </div>

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
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  {formSubmitting ? 'Saving...' : 'Save Certificate'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      <CertificateModal
        certificate={previewCert}
        isOpen={!!previewCert}
        onClose={() => setPreviewCert(null)}
      />

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deletingCert}
        title={`Delete Certificate?`}
        message={`Are you sure you want to delete "${deletingCert?.title}" (${deletingCert?.verification_id})?`}
        confirmText="Delete Certificate"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingCert(null)}
        isLoading={deleteLoading}
      />

    </div>
  );
}
