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
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminTeam() {
  const { authFetch } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedQRMember, setSelectedQRMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State: Strictly Photo, Name, Role, Biography
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    photo_url: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/members/all');
      if (res.ok) {
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: 'Member',
      bio: '',
      photo_url: ''
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      role: member.role || '',
      bio: member.bio || '',
      photo_url: member.photo_url || ''
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
    body.append('category', 'team');

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
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members';
      const method = editingMember ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setIsFormOpen(false);
        fetchMembers();
      } else {
        setFormError(data.error || 'Failed to save team member.');
      }
    } catch (err) {
      setFormError('Server connection failed.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingMember) return;
    setDeleteLoading(true);
    try {
      const res = await authFetch(`/api/members/${deletingMember.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeletingMember(null);
        fetchMembers();
      }
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    return (
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.role?.toLowerCase().includes(search.toLowerCase()) ||
      m.bio?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            NIRVANA Team Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add, edit, or remove student team members with automatic QR codes.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, or biography..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
      </div>

      {/* Team Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <h3 className="font-bold text-slate-700 text-base">No team members found</h3>
          <p className="text-xs text-slate-400 mt-1">Click "Add Team Member" to register a member.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Role / Position</th>
                  <th className="px-5 py-3.5">Short Biography</th>
                  <th className="px-5 py-3.5 text-center">QR Code</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Photo & Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={member.name}
                          className="w-10 h-12 rounded-md object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800">{member.role}</span>
                    </td>

                    {/* Bio */}
                    <td className="px-5 py-3.5">
                      <p className="text-slate-600 line-clamp-2 max-w-sm">{member.bio || '—'}</p>
                    </td>

                    {/* QR Code */}
                    <td className="px-5 py-3.5 text-center">
                      {member.qr_data ? (
                        <button
                          onClick={() => setSelectedQRMember(member)}
                          className="inline-block p-1 bg-white border border-slate-200 rounded hover:border-slate-400 transition-colors"
                          title="Click to view QR"
                        >
                          <img
                            src={member.qr_data}
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
                          to={`/team/${member.id}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Public Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingMember(member)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove Member"
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
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
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
                  Member Photo
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
                  Member Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Role / Position */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Role / Position *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Club President, Technical Lead, Coordinator"
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
                  rows={4}
                  placeholder="Brief summary of member's responsibilities and scholastic interests..."
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
                  {formSubmitting ? 'Saving...' : 'Save Member'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QR PREVIEW MODAL */}
      {selectedQRMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-900">Member QR Code</span>
              <button 
                onClick={() => setSelectedQRMember(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto">
              <img
                src={selectedQRMember.qr_data}
                alt={selectedQRMember.name}
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">{selectedQRMember.name}</h4>
              <p className="text-xs text-slate-500">{selectedQRMember.role}</p>
              <p className="text-[11px] text-slate-400 font-mono">/team/{selectedQRMember.id}</p>
            </div>

            <div className="pt-2">
              <a
                href={selectedQRMember.qr_data}
                download={`NIRVANA-QR-${selectedQRMember.name.replace(/\s+/g, '_')}.png`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors w-full"
              >
                Download QR Code (PNG)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingMember}
        title={`Remove Member "${deletingMember?.name}"?`}
        message="Are you sure you want to remove this member from the NIRVANA Team roster?"
        confirmText="Remove Member"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingMember(null)}
        isLoading={deleteLoading}
      />

    </div>
  );
}
