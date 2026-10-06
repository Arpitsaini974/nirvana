import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Award, 
  Calendar, 
  ShieldCheck, 
  Download, 
  Maximize2, 
  User, 
  Building2,
  ExternalLink 
} from 'lucide-react';
import CertificateModal from '../components/CertificateModal';

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [recipientType, setRecipientType] = useState('all');
  const [activeCert, setActiveCert] = useState(null);

  useEffect(() => {
    // Fetch certificate types
    fetch('/api/certificates/types')
      .then((res) => res.json())
      .then((data) => setTypes(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (selectedType !== 'all') params.append('type', selectedType);
    if (recipientType !== 'all') params.append('recipient_type', recipientType);

    fetch(`/api/certificates?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCerts(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, selectedType, recipientType]);

  return (
    <div className="space-y-12 pb-24 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>VERIFIED AWARDS & CREDENTIALS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Club Honors & Certificates
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Authenticated credentials conferred to competition teams, leadership executives, and distinguished members.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, recipient, or verification ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-slate-50/50"
            />
          </div>

          {/* Recipient Category Selector */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            <span className="text-xs font-semibold uppercase text-slate-400 shrink-0">Recipient:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'team_member', label: 'Team Members' },
              { id: 'alumni', label: 'Alumni' },
              { id: 'club', label: 'Club Honors' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRecipientType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  recipientType === tab.id
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Certificate Type Filters */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold uppercase text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Type:</span>
          </span>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
              selectedType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Types
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                selectedType === t
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

      </div>

      {/* Certificate Cards Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 mt-3 font-medium">Loading credentials registry...</p>
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No certificates found</h3>
          <p className="text-sm text-slate-500 mt-1">Try changing your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              {/* Image Preview with Zoom overlay */}
              <div 
                className="relative aspect-16/10 bg-slate-900 overflow-hidden cursor-pointer"
                onClick={() => setActiveCert(cert)}
              >
                <img
                  src={cert.file_url}
                  alt={cert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-95 group-hover:opacity-100"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-900/90 text-amber-400 border border-amber-400/40">
                    {cert.certificate_type}
                  </span>
                </div>

                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold shadow-md">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Zoom & Details</span>
                  </span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{cert.verification_id}</span>
                  </div>

                  <h3 
                    onClick={() => setActiveCert(cert)}
                    className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2"
                  >
                    {cert.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                    <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Recipient: <strong className="text-slate-800">{cert.recipient_name}</strong></span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Conferred: {cert.issue_date}</span>
                  </div>
                </div>

                {cert.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 pt-1 border-t border-slate-100">
                    {cert.description}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveCert(cert)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <a
                  href={cert.file_url}
                  download={`Certificate-${cert.verification_id}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Certificate Viewer Modal */}
      <CertificateModal
        certificate={activeCert}
        isOpen={!!activeCert}
        onClose={() => setActiveCert(null)}
      />

    </div>
  );
}
