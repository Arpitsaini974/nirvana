import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Award, 
  Calendar, 
  ShieldCheck, 
  User, 
  Maximize2 
} from 'lucide-react';

export default function CertificateModal({ certificate, isOpen, onClose }) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = certificate.file_url;
    link.download = `Certificate-${certificate.verification_id || certificate.title.replace(/\s+/g, '_')}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-base truncate max-w-sm sm:max-w-md">
              {certificate.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Image Canvas */}
        <div className="relative bg-slate-950 flex items-center justify-center min-h-[280px] max-h-[500px] overflow-auto p-4 select-none">
          <img
            src={certificate.file_url}
            alt={certificate.title}
            className={`rounded-lg object-contain transition-transform duration-300 shadow-xl ${
              isZoomed ? 'scale-150 cursor-zoom-out max-h-none' : 'max-h-[460px] cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80';
            }}
          />

          {/* Quick Zoom Toggle Overlay */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-lg text-white border border-slate-700">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-1.5 hover:bg-slate-700 rounded-md transition-colors"
              title={isZoomed ? 'Zoom Out' : 'Zoom In'}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 hover:bg-slate-700 rounded-md transition-colors"
              title="Download Certificate"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="p-6 bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Recipient</span>
              <div className="flex items-center gap-2 mt-0.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="text-base font-bold text-slate-900">{certificate.recipient_name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                  {certificate.recipient_type?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Verification ID</span>
              <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{certificate.verification_id || 'CERT-RECORDED'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Certificate Type</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-medium text-xs bg-amber-50 text-amber-800 border border-amber-200">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                {certificate.certificate_type || 'Honor / Excellence'}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Issue Date</span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{certificate.issue_date}</span>
              </div>
            </div>
          </div>

          {certificate.description && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Description & Citation</span>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {certificate.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Authenticated official certificate record
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
