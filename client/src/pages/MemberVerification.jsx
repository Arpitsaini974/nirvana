import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export default function MemberVerification() {
  const { memberId, id } = useParams();
  const targetId = memberId || id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/members/${encodeURIComponent(targetId)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || json.error || 'Team member record not found');
        }
        return json;
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => {
        setError(err.message || 'No official NIRVANA club record exists for this profile.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [targetId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Verifying NIRVANA member credentials...</p>
      </div>
    );
  }

  if (error || !data || !data.member) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="bg-white p-6 rounded-lg border border-slate-300 space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Record Not Found</h2>
          <p className="text-xs text-slate-600">{error || 'This member profile is unavailable or invalid.'}</p>
          <div className="pt-2">
            <Link
              to="/team"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to NIRVANA Team</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { member } = data;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      
      {/* Top Navigation */}
      <div>
        <Link
          to="/team"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#857467] hover:text-[#2B231D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to NIRVANA Team</span>
        </Link>
      </div>

      {/* Verified Member Card (Strictly contains requested fields) */}
      <div className="bg-[#FFFDF9] rounded-xl border-2 border-[#E5DACB] shadow-sm overflow-hidden">
        
        {/* Header Strip */}
        <div className="bg-[#2B231D] text-[#FAF7F2] px-5 py-3 flex items-center justify-between border-b border-[#3D3128]">
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
            <span>VERIFIED CLUB MEMBER</span>
          </div>
        </div>

        {/* Member Details */}
        <div className="p-6 sm:p-8 space-y-5 text-center sm:text-left sm:flex sm:items-start sm:gap-6">
          
          {/* Member Photo */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <img
              src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={member.name}
              className="w-28 h-36 rounded-md object-cover border border-[#E5DACB] bg-[#EAE0D3] mx-auto sm:mx-0 shadow-2xs"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>

          {/* Member Information */}
          <div className="space-y-2 flex-1 pt-1">
            {/* Member Name */}
            <h1 className="text-xl sm:text-2xl font-bold text-[#2B231D] leading-tight font-serif">
              {member.name}
            </h1>

            {/* Role / Position */}
            <div className="inline-block px-2.5 py-1 rounded bg-[#F3EDE4] border border-[#E5DACB] text-xs font-semibold text-[#3D3128]">
              {member.role}
            </div>

            {/* Short Biography */}
            {member.bio && (
              <p className="text-xs sm:text-sm text-[#574A40] leading-relaxed pt-2">
                {member.bio}
              </p>
            )}

            {/* Official Identification */}
            <div className="pt-3 text-[11px] text-[#857467] font-medium border-t border-[#F0E6D8] mt-4">
              Official active member of NIRVANA academic student chapter.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
