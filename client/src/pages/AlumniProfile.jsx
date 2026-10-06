import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle, Mail, Calendar } from 'lucide-react';

export default function AlumniProfile() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/alumni/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || json.error || 'Alumni record not found');
        }
        return json;
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => {
        setError(err.message || 'No official NIRVANA club record exists for this alumni.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#2B231D] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-[#857467] font-medium">Verifying NIRVANA alumni credentials...</p>
      </div>
    );
  }

  if (error || !data || !data.alumni) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-[#FFFDF9] p-6 rounded-lg border border-[#E5DACB] space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#2B231D]">Alumni Record Not Found</h2>
          <p className="text-xs text-[#574A40]">{error || 'This alumni profile is unavailable or invalid.'}</p>
          <div className="pt-2">
            <Link
              to="/alumni"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2B231D] text-[#FAF7F2] rounded text-xs font-semibold hover:bg-[#3E322A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to NIRVANA Alumni</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { alumni } = data;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      
      {/* Top Navigation */}
      <div>
        <Link
          to="/alumni"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#857467] hover:text-[#2B231D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to NIRVANA Alumni</span>
        </Link>
      </div>

      {/* Verified Alumni Card (No Photo - Clean Credential Record) */}
      <div className="bg-[#FFFDF9] rounded-2xl border-2 border-[#E5DACB] shadow-sm overflow-hidden">
        
        {/* Header Strip */}
        <div className="bg-[#2B231D] text-[#FAF7F2] px-5 py-3.5 flex items-center justify-between border-b border-[#3D3128]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#F3EDE4] text-[#2B231D] font-serif font-bold text-xs flex items-center justify-center">
              N
            </span>
            <span className="font-serif font-bold text-xs tracking-wider">
              NIRVANA
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>VERIFIED NIRVANA ALUMNI</span>
          </div>
        </div>

        {/* Alumni Details */}
        <div className="p-6 sm:p-8 space-y-5 text-left">
          
          {/* Alumni Header Info */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2B231D] leading-tight font-serif">
              {alumni.name}
            </h1>
            {alumni.role && (
              <div className="inline-block px-2.5 py-1 rounded bg-[#F3EDE4] border border-[#E5DACB] text-xs font-semibold text-[#3D3128]">
                {alumni.role}
              </div>
            )}
          </div>

          {/* Academic & Contact Details (Name, Admission No, Email, Time Span) */}
          <div className="pt-3 border-t border-[#F0E6D8] space-y-2.5 text-xs text-[#574A40]">
            {alumni.admission_number && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[11px] text-[#857467] uppercase tracking-wider min-w-[85px]">
                  Admission No:
                </span>
                <span className="font-mono font-medium text-[#2B231D] bg-[#F3EDE4] px-2.5 py-0.5 rounded text-xs border border-[#E5DACB]">
                  {alumni.admission_number}
                </span>
              </div>
            )}

            {alumni.time_span && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[11px] text-[#857467] uppercase tracking-wider min-w-[85px]">
                  Time Span:
                </span>
                <span className="font-medium text-[#2B231D] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>{alumni.time_span}</span>
                </span>
              </div>
            )}

            {alumni.email && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-[11px] text-[#857467] uppercase tracking-wider min-w-[85px]">
                  Email:
                </span>
                <a
                  href={`mailto:${alumni.email}`}
                  className="truncate text-[#574A40] hover:text-[#B45309] transition-colors flex items-center gap-1.5 min-w-0 font-medium"
                >
                  <Mail className="w-3.5 h-3.5 text-[#857467] shrink-0" />
                  <span className="truncate">{alumni.email}</span>
                </a>
              </div>
            )}
          </div>

          {/* Short Biography */}
          {alumni.bio && (
            <div className="pt-3 border-t border-[#F0E6D8] space-y-1">
              <span className="font-semibold text-[11px] text-[#857467] uppercase tracking-wider block">
                Biography / Contributions:
              </span>
              <p className="text-xs sm:text-sm text-[#574A40] leading-relaxed">
                {alumni.bio}
              </p>
            </div>
          )}

          {/* Official Identification */}
          <div className="pt-3 text-[11px] text-[#857467] font-medium border-t border-[#F0E6D8]">
            Permanent collegiate alumni record of NIRVANA academic student chapter.
          </div>

        </div>

      </div>

    </div>
  );
}
