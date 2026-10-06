import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Mail, 
  User, 
  Calendar 
} from 'lucide-react';

export default function AdminMessages() {
  const { authFetch } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingMsg, setDeletingMsg] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      const res = await authFetch(`/api/messages/${id}/read`, {
        method: 'PATCH'
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deletingMsg) return;
    setDeleteLoading(true);
    try {
      const res = await authFetch(`/api/messages/${deletingMsg.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeletingMsg(null);
        fetchMessages();
      }
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Public Inquiries & Messages
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review messages transmitted by visitors, prospective applicants, and sponsors.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-base">Your inquiry inbox is clear</h3>
          <p className="text-xs text-slate-400 mt-1">Any messages submitted from the public contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-3xl border transition-all ${
                msg.is_read
                  ? 'bg-white border-slate-200/90 shadow-2xs'
                  : 'bg-indigo-50/40 border-indigo-200 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {msg.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{msg.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  {!msg.is_read && (
                    <button
                      onClick={() => markAsRead(msg.id)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => setDeletingMsg(msg)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject: {msg.subject || 'General Inquiry'}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingMsg}
        title={`Delete Message?`}
        message={`Are you sure you want to delete the message from ${deletingMsg?.name}?`}
        confirmText="Delete Message"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingMsg(null)}
        isLoading={deleteLoading}
      />

    </div>
  );
}
