import React, { useState, useEffect } from 'react';
import { Mail, Calendar } from 'lucide-react';

export default function Alumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alumni')
      .then((res) => res.json())
      .then((data) => {
        setAlumni(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Failed to load alumni:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title & Academic Description */}
      <div className="border-b border-[#E5DACB] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2B231D] tracking-tight font-serif">
          NIRVANA Alumni Directory
        </h1>
        <p className="text-xs sm:text-sm text-[#574A40] mt-1 leading-relaxed">
          Official collegiate roster of graduated student leaders and distinguished alumni of the society.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-[#2B231D] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#857467] mt-3 font-medium">Loading NIRVANA alumni roster...</p>
        </div>
      ) : alumni.length === 0 ? (
        <div className="text-center py-12 bg-[#FFFDF9] rounded-2xl border border-[#E5DACB] p-8">
          <p className="text-sm text-[#857467] font-medium">No alumni members registered yet.</p>
        </div>
      ) : (
        /* Linear Alumni Roster (Line-by-Line list: Name, Admission No, Time Span, Email) */
        <div className="space-y-3">
          
          {/* Table Header Row (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#F3ECE2] rounded-xl border border-[#E5DACB] text-[11px] font-bold text-[#857467] uppercase tracking-wider">
            <div className="col-span-4">Alumni Name & Role</div>
            <div className="col-span-3">Admission Number</div>
            <div className="col-span-2">Time Span</div>
            <div className="col-span-3">Email Address</div>
          </div>

          {/* Alumni Rows (Line by Line) */}
          {alumni.map((alum) => (
            <div
              key={alum.id}
              className="bg-[#FFFDF9] rounded-2xl border border-[#E5DACB] px-6 py-4 shadow-2xs hover:shadow-md transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* 1. Name & Role */}
                <div className="md:col-span-4 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B45309] shrink-0"></span>
                    <h2 className="font-bold text-base text-[#2B231D] leading-tight font-serif">
                      {alum.name}
                    </h2>
                  </div>
                  {alum.role && (
                    <span className="text-[11px] font-semibold text-[#857467] block pl-4">
                      {alum.role}
                    </span>
                  )}
                </div>

                {/* 2. Admission Number */}
                <div className="md:col-span-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#857467] md:hidden block mb-1">
                    Admission No:
                  </span>
                  <span className="font-mono font-medium text-[#2B231D] bg-[#F3EDE4] px-2.5 py-1 rounded-md text-xs border border-[#E5DACB] inline-block">
                    {alum.admission_number || '—'}
                  </span>
                </div>

                {/* 3. Time Span */}
                <div className="md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#857467] md:hidden block mb-1">
                    Time Span:
                  </span>
                  <span className="font-medium text-xs text-[#2B231D] inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                    <span>{alum.time_span || '—'}</span>
                  </span>
                </div>

                {/* 4. Email */}
                <div className="md:col-span-3 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#857467] md:hidden block mb-1">
                    Email:
                  </span>
                  {alum.email ? (
                    <a
                      href={`mailto:${alum.email}`}
                      className="text-xs text-[#574A40] hover:text-[#B45309] transition-colors inline-flex items-center gap-1.5 truncate max-w-full font-medium"
                      title={alum.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#857467] shrink-0" />
                      <span className="truncate">{alum.email}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-[#857467]">—</span>
                  )}
                </div>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}
