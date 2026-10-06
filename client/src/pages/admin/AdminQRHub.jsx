import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import QRModal from '../../components/QRModal';
import { 
  QrCode, 
  Search, 
  Download, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminQRHub() {
  const { authFetch } = useAuth();
  const { settings } = useSettings();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQRMember, setSelectedQRMember] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/members/all');
      if (res.ok) {
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const downloadPNG = (member) => {
    const canvas = document.getElementById(`batch-canvas-${member.member_id}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${member.member_id}-${member.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrintAll = () => {
    window.print();
  };

  const filteredMembers = members.filter((m) => {
    return (
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.member_id?.toLowerCase().includes(search.toLowerCase()) ||
      m.role?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            QR & Member Verification Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized verification engine for all member QR credentials, badge printing, and registry sync.
          </p>
        </div>

        <button
          onClick={handlePrintAll}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Batch Print Member Cards</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between no-print">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member QR codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredMembers.length} of {members.length} credentials
        </span>
      </div>

      {/* Grid of Member QR Cards */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 printable-area">
          {filteredMembers.map((member) => {
            const verificationUrl = `${window.location.origin}/member/${member.member_id}`;
            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between items-center text-center page-break-inside-avoid relative overflow-hidden"
              >
                {/* Status Indicator Ribbon */}
                <div className="absolute top-4 right-4">
                  {member.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </div>

                {/* Club Branding */}
                <div className="flex items-center gap-1.5 mb-3">
                  {settings.logo_url && (
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="w-5 h-5 rounded-md object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {settings.club_name || 'Apex Robotics'}
                  </span>
                </div>

                {/* Photo & Name */}
                <div className="mb-3">
                  <img
                    src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 mx-auto mb-2 shadow-xs"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                    }}
                  />
                  <h3 className="font-bold text-base text-slate-900 leading-tight">{member.name}</h3>
                  <p className="text-xs font-medium text-indigo-600">{member.role}</p>
                  <p className="text-[11px] font-mono text-slate-500 font-bold mt-0.5">
                    {member.member_id}
                  </p>
                </div>

                {/* Generated High Resolution QR Code */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4 inline-block shadow-inner">
                  <QRCodeCanvas
                    id={`batch-canvas-${member.member_id}`}
                    value={verificationUrl}
                    size={140}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Scan to verify identity
                  </p>
                </div>

                {/* Actions (Hidden on print) */}
                <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between gap-2 no-print">
                  <button
                    onClick={() => downloadPNG(member)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>

                  <button
                    onClick={() => setSelectedQRMember(member)}
                    className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Card</span>
                  </button>

                  <Link
                    to={`/member/${member.member_id}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                    title="Open Verification Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* QR MODAL */}
      <QRModal
        member={selectedQRMember}
        isOpen={!!selectedQRMember}
        onClose={() => setSelectedQRMember(null)}
        clubSettings={settings}
      />

    </div>
  );
}
