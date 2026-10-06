import React, { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Copy,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QRModal({ member, isOpen, onClose, clubSettings }) {
  const qrRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !member) return null;

  // Stable verification URL
  const verificationUrl = `${window.location.origin}/member/${member.member_id}`;

  const downloadPNG = () => {
    const canvas = document.getElementById(`qr-canvas-${member.member_id}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${member.member_id}-${member.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-base">Verified Member QR</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Member Card Container */}
        <div className="p-6 text-center printable-area">
          
          {/* Club Branding */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {clubSettings?.logo_url && (
              <img
                src={clubSettings.logo_url}
                alt="Logo"
                className="w-7 h-7 rounded-md object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <span className="font-bold text-sm tracking-wide text-slate-800">
              {clubSettings?.club_name || 'Apex Robotics Club'}
            </span>
          </div>

          {/* Member Photo & Basic Details */}
          <div className="relative inline-block mx-auto mb-3">
            <img
              src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={member.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 shadow-md mx-auto"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
              }}
            />
            {member.status === 'active' ? (
              <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-full text-white ring-2 ring-white shadow-xs" title="Active Member">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="absolute bottom-0 right-0 p-1 bg-amber-500 rounded-full text-white ring-2 ring-white shadow-xs" title="Inactive Member">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <h4 className="text-lg font-bold text-slate-900">{member.name}</h4>
          <p className="text-sm font-medium text-indigo-600 mb-1">{member.role}</p>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-mono font-semibold text-slate-700 mb-4">
            <span>ID:</span>
            <span className="text-indigo-700">{member.member_id}</span>
          </div>

          {/* QR Code Graphic */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block mb-4 shadow-inner">
            <QRCodeCanvas
              id={`qr-canvas-${member.member_id}`}
              value={verificationUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              Scan to verify credentials
            </p>
          </div>

          {/* Verification Status Pill */}
          <div className="mb-2">
            {member.status === 'active' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>OFFICIALLY VERIFIED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>STATUS: CURRENTLY INACTIVE</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            This QR links permanently to the official online club profile.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPNG}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Badge</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyUrl}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              title="Copy verification link"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <Link
              to={`/member/${member.member_id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
