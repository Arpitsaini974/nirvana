import React from 'react';
import { BookOpen, HeartPulse, Users, TrendingUp } from 'lucide-react';

export default function About() {
  const centres = [
    {
      title: 'Centre 1: Education & Academic Support',
      icon: BookOpen,
      image: '/images/nirvana/centre_1_education.png',
      description: 'Dedicated to providing remedial classes, foundational mathematics, reading clubs, and homework support for underprivileged primary and secondary school students.'
    },
    {
      title: 'Centre 2: Primary Healthcare & Awareness',
      icon: HeartPulse,
      image: '/images/nirvana/centre_2_health.png',
      description: 'Focuses on basic hygiene camps, health checkups, nutritional counseling, and sanitation awareness drives in community settlements.'
    },
    {
      title: 'Centre 3: Life Skills & Cultural Values',
      icon: Users,
      image: '/images/nirvana/centre_3_culture.png',
      description: 'Nurtures moral values, artistic expression, teamwork, and positive behavioral habits through interactive group discussions and weekend workshops.'
    },
    {
      title: 'Centre 4: Mentorship & Opportunity',
      icon: TrendingUp,
      image: '/images/nirvana/centre_4_opportunity.png',
      description: 'Connects older students with higher education guidance, vocational workshops, digital literacy, and personal development mentorship.'
    }
  ];

  return (
    <div className="bg-[#FAF7F2] text-[#2B231D]">
      
      {/* Header Banner */}
      <section className="bg-[#F3ECE2] border-b border-[#E5DACB] py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <img
              src="/images/nirvana/nirvana_logo.png"
              alt="NIRVANA Logo"
              className="w-20 h-20 object-contain drop-shadow-md"
            />
          </div>
          <span className="text-xs font-semibold tracking-[0.25em] text-[#857467] uppercase">
            LEARN &bull; EXPLORE &bull; GROW
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#2B231D] tracking-tight">
            About NIRVANA
          </h1>
          <p className="text-xs sm:text-sm text-[#574A40] max-w-2xl mx-auto leading-relaxed">
            An official student initiative of SVNIT committed to social impact, education, community care, and youth empowerment.
          </p>
        </div>
      </section>

      {/* Main Philosophy & Quote */}
      <section className="py-12 sm:py-16 border-b border-[#E8DFD3]/80 bg-[#FAF7F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-7 space-y-4">
              <h2 className="font-serif font-bold text-2xl text-[#2B231D]">
                Our Purpose & Mission
              </h2>
              <p className="text-xs sm:text-sm text-[#574A40] leading-relaxed">
                NIRVANA is a student-led organization that brings together passionate collegiate volunteers, curious thinkers, and dedicated educators. Our primary mission is to build sustainable bridges between academic institutions and underserved grassroots communities.
              </p>
              <p className="text-xs sm:text-sm text-[#574A40] leading-relaxed">
                Through our continuous volunteer drives, we offer personalized teaching, primary healthcare consultations, life skills guidance, and mentorship to children and families across four dedicated community centres.
              </p>
            </div>

            <div className="md:col-span-5">
              <div className="bg-[#F3ECE2] rounded-xl p-6 border border-[#E5DACB] shadow-2xs">
                <div className="text-4xl font-serif text-[#D4A373] leading-none mb-2 select-none">&ldquo;</div>
                <blockquote className="font-serif italic text-base sm:text-lg text-[#2B231D] leading-snug">
                  Reason to smile
                </blockquote>
                <div className="mt-3 text-[11px] font-bold tracking-widest text-[#857467] uppercase">
                  &mdash; NIRVANA
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Our 4 Community Centres */}
      <section className="py-12 sm:py-16 bg-[#F4EEE5] border-b border-[#E5DACB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="border-b border-[#E5DACB] pb-4">
            <h2 className="font-serif font-bold text-2xl text-[#2B231D]">
              Where We Work: Four Centres, One Mission
            </h2>
            <p className="text-xs text-[#574A40] mt-1">
              Active student learning and healthcare initiatives running throughout the academic year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {centres.map((c) => {
              const IconComp = c.icon;
              return (
                <div
                  key={c.title}
                  className="bg-[#FFFDF9] rounded-xl overflow-hidden border border-[#E5DACB] shadow-2xs flex flex-col sm:flex-row"
                >
                  <div className="sm:w-44 h-40 sm:h-auto overflow-hidden bg-[#EAE0D3] shrink-0">
                    <img
                      src={c.image}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-5 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#F0E6D8] text-[#9A4C1E] flex items-center justify-center shrink-0 border border-[#E5D7C3]">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-sm text-[#2B231D]">
                        {c.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#574A40] leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
