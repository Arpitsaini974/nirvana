import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ExternalLink } from 'lucide-react';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        setMembers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Failed to load team members:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title & Academic Description */}
      <div className="border-b border-[#E5DACB] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2B231D] tracking-tight font-serif">
          NIRVANA Team
        </h1>
        <p className="text-xs sm:text-sm text-[#574A40] mt-1 leading-relaxed">
          Official roster of active student members leading research, workshops, community outreach, and project development.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-[#2B231D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#857467] mt-3 font-medium">Loading NIRVANA team cards...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 bg-[#FFFDF9] rounded-lg border border-[#E5DACB] p-8">
          <p className="text-sm text-[#857467] font-medium">No team members registered yet.</p>
        </div>
      ) : (
        /* Team ID-Card Grid (Warm Cream Aesthetic) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <article
              key={member.id}
              className="bg-[#FFFDF9] rounded-xl border-2 border-[#E5DACB] shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              {/* ID Card Top Header Strip in Warm Dark Roast */}
              <div className="bg-[#2B231D] text-[#FAF7F2] px-4 py-2.5 flex items-center justify-between border-b border-[#3D3128]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#F3EDE4] text-[#2B231D] font-serif font-bold text-xs flex items-center justify-center">
                    N
                  </span>
                  <span className="font-serif font-bold text-xs tracking-wider">
                    NIRVANA
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CCC0]">
                  MEMBER ID
                </span>
              </div>

              {/* ID Card Body */}
              <div className="p-5 space-y-4 flex-1">
                
                {/* Photo and Primary Info */}
                <div className="flex items-start gap-4">
                  {/* Member Photo */}
                  <img
                    src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={member.name}
                    className="w-20 h-24 rounded-md object-cover border border-[#E5DACB] bg-[#EAE0D3] shrink-0 shadow-2xs"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Name and Role */}
                  <div className="space-y-1 min-w-0">
                    <h2 className="font-bold text-base text-[#2B231D] leading-tight">
                      {member.name}
                    </h2>
                    <div className="text-xs font-semibold text-[#3D3128] bg-[#F3EDE4] px-2 py-0.5 rounded inline-block border border-[#E5DACB]">
                      {member.role}
                    </div>
                  </div>
                </div>

                {/* Short Biography */}
                {member.bio && (
                  <p className="text-xs text-[#574A40] leading-relaxed pt-1">
                    {member.bio}
                  </p>
                )}

              </div>

              {/* ID Card Bottom Section with Dedicated QR Code */}
              <div className="bg-[#F7F2EA] border-t border-[#E5DACB] p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#857467] block">
                    Verification
                  </span>
                  <Link
                    to={`/team/${member.id}`}
                    className="text-xs font-bold text-[#2B231D] hover:text-[#B45309] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Unique QR Code */}
                {member.qr_data ? (
                  <Link
                    to={`/team/${member.id}`}
                    title="Scan or click to view verified profile"
                    className="bg-[#FFFDF9] p-1 rounded border border-[#E5DACB] shadow-2xs block shrink-0 hover:scale-105 transition-transform"
                  >
                    <img
                      src={member.qr_data}
                      alt={`QR Code for ${member.name}`}
                      className="w-16 h-16 object-contain"
                    />
                  </Link>
                ) : (
                  <div className="w-16 h-16 bg-[#EAE0D3] rounded flex items-center justify-center text-[#857467]">
                    <QrCode className="w-6 h-6" />
                  </div>
                )}
              </div>

            </article>
          ))}
        </div>
      )}

    </div>
  );
}
