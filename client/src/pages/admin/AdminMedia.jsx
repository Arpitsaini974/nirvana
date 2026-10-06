import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  FileText, 
  ExternalLink,
  Plus
} from 'lucide-react';

export default function AdminMedia() {
  const { authFetch } = useAuth();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append('file', file);
    body.append('category', 'general');

    try {
      const res = await authFetch('/api/media/upload', {
        method: 'POST',
        body
      });
      const data = await res.json();
      if (res.ok) {
        fetchMedia();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Upload error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const copyUrl = (file) => {
    const fullUrl = `${window.location.origin}${file.file_path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deletingFile) return;
    setDeleteLoading(true);
    try {
      const res = await authFetch(`/api/media/${deletingFile.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeletingFile(null);
        fetchMedia();
      }
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Media & File Storage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store club banners, logos, member photos, and certificate files persistently.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading File...' : 'Upload Media Asset'}</span>
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Grid of uploaded files */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-base">No media files uploaded yet</h3>
          <p className="text-xs text-slate-400 mt-1">Upload images to quickly link them into members, alumni, or settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file) => {
            const isImage = file.mime_type?.startsWith('image/');
            const isPdf = file.mime_type === 'application/pdf';
            const fileUrl = `${window.location.origin}${file.file_path}`;

            return (
              <div
                key={file.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img
                      src={file.file_path}
                      alt={file.original_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                      <FileText className="w-12 h-12 mb-2 text-indigo-500" />
                      <span className="text-[11px] font-mono uppercase font-bold truncate max-w-[120px]">
                        {file.original_name}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
                      {formatFileSize(file.file_size)}
                    </span>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-3.5 space-y-2">
                  <div className="truncate text-xs font-bold text-slate-800" title={file.original_name}>
                    {file.original_name}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <button
                      onClick={() => copyUrl(file)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      {copiedId === file.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={file.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="View Asset"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setDeletingFile(file)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingFile}
        title={`Delete Media Asset?`}
        message={`Are you sure you want to permanently delete "${deletingFile?.original_name}"? Any component referencing this URL may stop displaying it.`}
        confirmText="Delete File"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingFile(null)}
        isLoading={deleteLoading}
      />

    </div>
  );
}
