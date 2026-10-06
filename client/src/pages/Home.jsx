import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  HeartPulse,
  Users,
  TrendingUp,
  Camera,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export default function Home() {
  const [professors, setProfessors] = useState([]);
  const [loadingProfs, setLoadingProfs] = useState(true);

  // Fallback faculty data matching the exact uploaded design
  const defaultProfessors = [
    {
      id: 1,
      name: 'Prof. R. Sharma',
      role: 'Faculty Coordinator',
      bio: 'Guides the club with her vision, support and valuable insights.',
      photo_url: '/images/nirvana/prof_r_sharma.png'
    },
    {
      id: 2,
      name: 'Prof. Neha Sharma',
      role: 'Faculty Advisor',
      bio: 'Provides academic guidance and continuous support.',
      photo_url: '/images/nirvana/prof_neha_sharma.png'
    },
    {
      id: 3,
      name: 'Prof. Amit Verma',
      role: 'Mentor',
      bio: 'Supports the team with experience and encourages new ideas.',
      photo_url: '/images/nirvana/prof_amit_verma.png'
    },
    {
      id: 4,
      name: 'Prof. Sandeep Rao',
      role: 'Faculty Advisor',
      bio: 'Helps in planning events and building meaningful opportunities.',
      photo_url: '/images/nirvana/prof_sandeep_rao.png'
    }
  ];

  useEffect(() => {
    fetch('/api/professors')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProfessors(data);
        } else {
          setProfessors(defaultProfessors);
        }
      })
      .catch(() => {
        setProfessors(defaultProfessors);
      })
      .finally(() => setLoadingProfs(false));
  }, []);

  const centres = [
    {
      id: 'centre-1',
      title: 'Centre 1',
      icon: BookOpen,
      image: '/images/nirvana/centre_1_education.png',
      description: 'Focused on education and academic support for children from underprivileged communities.'
    },
    {
      id: 'centre-2',
      title: 'Centre 2',
      icon: HeartPulse,
      image: '/images/nirvana/centre_2_health.png',
      description: 'Provides primary healthcare, health awareness and basic medical support.'
    },
    {
      id: 'centre-3',
      title: 'Centre 3',
      icon: Users,
      image: '/images/nirvana/centre_3_culture.png',
      description: 'Builds cultural values, life skills and positive habits for a brighter future.'
    },
    {
      id: 'centre-4',
      title: 'Centre 4',
      icon: TrendingUp,
      image: '/images/nirvana/centre_4_opportunity.png',
      description: 'Creates opportunities through exposure, mentorship and skill development.'
    }
  ];

  const moments = [
    {
      title: 'Education in Action',
      image: '/images/nirvana/moment_education.png'
    },
    {
      title: 'Health & Care',
      image: '/images/nirvana/moment_health.png'
    },
    {
      title: 'Together We Grow',
      image: '/images/nirvana/moment_together.png'
    }
  ];

  return (
    <div className="bg-[#FAF7F2] text-[#2B231D]">
      
      {/* ========================================================
          1. HERO SECTION (Full-Screen Initial Viewport Focus)
         ======================================================== */}
      <section className="relative overflow-hidden bg-[#FAF7F2] border-b border-[#E8DFD3]/80 min-h-[calc(100vh-5rem)] flex flex-col justify-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Official NIRVANA Logo in Warm Card */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative group max-w-[340px] sm:max-w-[400px] w-full p-5 sm:p-7 bg-[#FFFDF9] rounded-3xl border border-[#E8DFD3] shadow-sm hover:shadow-md transition-all">
                <img
                  src="/images/nirvana/nirvana_logo.png"
                  alt="NIRVANA Club Official Logo"
                  className="w-full h-auto aspect-square object-contain drop-shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            </div>

            {/* Right Column: Hero Name & Content */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <span className="text-xs font-semibold tracking-[0.25em] text-[#857467] uppercase block">
                WELCOME TO
              </span>
              
              <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-[#2B231D] tracking-tight leading-none">
                NIRVANA
              </h1>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-serif italic text-[#574A40] font-medium">
                  Uplifting Lives, Inspiring Futures.
                </span>
                <span className="text-[#C4B5A5] hidden sm:inline">&bull;</span>
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#857467] uppercase">
                  LEARN &bull; EXPLORE &bull; GROW
                </span>
              </div>

              <p className="text-sm sm:text-base text-[#574A40] leading-relaxed max-w-xl">
                A student club dedicated to uplifting underprivileged communities through education, lifestyle lessons, primary care, cultural values and opportunities.
              </p>

              <div className="pt-2">
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#2B231D] hover:bg-[#3E322A] text-[#FAF7F2] text-xs sm:text-sm font-semibold transition-all shadow-xs"
                >
                  <span>Explore More</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Subtle Scroll Indicator at bottom */}
        <div className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-[#857467] pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 text-[#857467] animate-bounce" />
        </div>
      </section>

      {/* ========================================================
          2. ABOUT NIRVANA SECTION (Loads on Scroll)
         ======================================================== */}
      <section id="about" className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#E8DFD3]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left: About Text */}
              <div className="lg:col-span-7 space-y-4">
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2B231D] tracking-tight">
                  About NIRVANA
                </h2>
                <p className="text-xs sm:text-sm text-[#574A40] leading-relaxed">
                  NIRVANA is a student club that brings together curious minds, creative thinkers and passionate learners. We provide a platform for students to explore new ideas, work on meaningful projects, participate in events and build a strong community.
                </p>
                <p className="text-xs sm:text-sm text-[#574A40] leading-relaxed">
                  Our goal is to help every member learn, collaborate, explore opportunities and grow &mdash; both personally and professionally.
                </p>
              </div>

              {/* Right: Signature Warm Quote Box */}
              <div className="lg:col-span-5">
                <div className="bg-[#F3ECE2] rounded-xl p-6 sm:p-8 border border-[#E5DACB] relative shadow-2xs">
                  <div className="text-4xl sm:text-5xl font-serif text-[#D4A373] leading-none mb-2 select-none">
                    &ldquo;
                  </div>
                  <blockquote className="font-serif italic text-base sm:text-lg text-[#2B231D] leading-snug">
                    Reason to smile
                  </blockquote>
                  <div className="mt-4 text-[11px] font-bold tracking-widest text-[#857467] uppercase">
                    &mdash; NIRVANA
                  </div>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          3. WHERE WE WORK (OUR CENTRES) SECTION (Loads on Scroll)
         ======================================================== */}
      <section className="py-16 sm:py-20 bg-[#F4EEE5] border-b border-[#E5DACB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Row */}
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5DACB] pb-4">
              <div>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2B231D] tracking-tight">
                  Where We Work
                </h2>
                <span className="text-xs sm:text-sm font-semibold text-[#574A40] block mt-0.5">
                  Our Centres
                </span>
              </div>
              <div className="text-xs text-[#857467] font-medium">
                Four centres <span className="mx-1.5 text-[#C4B5A5]">|</span> One mission
              </div>
            </div>
          </ScrollReveal>

          {/* 4 Centres Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {centres.map((c, idx) => {
              const IconComponent = c.icon;
              return (
                <ScrollReveal key={c.id} delay={idx * 100}>
                  <div className="bg-[#FFFDF9] rounded-xl overflow-hidden border border-[#E5DACB] shadow-2xs hover:shadow-md transition-shadow flex flex-col h-full">
                    {/* Centre Photo */}
                    <div className="h-40 w-full overflow-hidden bg-[#EAE0D3] shrink-0">
                      <img
                        src={c.image}
                        alt={c.title}
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Centre Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#F0E6D8] text-[#9A4C1E] flex items-center justify-center shrink-0 border border-[#E5D7C3]">
                            <IconComponent className="w-3.5 h-3.5" />
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
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          4. MOMENTS AT NIRVANA SECTION (Loads on Scroll)
         ======================================================== */}
      <section className="py-16 sm:py-20 bg-[#FAF7F2] border-b border-[#E8DFD3]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Row */}
          <ScrollReveal>
            <div className="flex items-center justify-between border-b border-[#E8DFD3] pb-4">
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2B231D] tracking-tight">
                Moments at NIRVANA
              </h2>
              <Link
                to="/team"
                className="text-xs font-semibold text-[#B45309] hover:text-[#2B231D] inline-flex items-center gap-1 transition-colors"
              >
                <span>View More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>

          {/* 3 Moments Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {moments.map((m, idx) => (
              <ScrollReveal key={m.title} delay={idx * 150}>
                <div className="group relative rounded-xl overflow-hidden shadow-2xs border border-[#E5DACB] h-56 sm:h-64 bg-[#EAE0D3]">
                  <img
                    src={m.image}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Bottom-left Pill Badge in Warm Espresso */}
                  <div className="absolute bottom-3 left-3 bg-[#1F1914]/85 backdrop-blur-xs text-[#FAF7F2] px-3 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-md border border-[#382C24]">
                    <Camera className="w-3.5 h-3.5 text-[#D8CCC0]" />
                    <span>{m.title}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================
          5. OUR FACULTY COORDINATOR SECTION (Loads on Scroll)
         ======================================================== */}
      <section className="py-16 sm:py-20 bg-[#F3ECE2] border-b border-[#E5DACB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Row */}
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#E5DACB] pb-4">
              <div>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2B231D] tracking-tight">
                  Our Faculty Coordinator
                </h2>
              </div>
              <p className="text-xs text-[#857467] max-w-md md:text-right">
                Guidance, support and mentorship from our faculty coordinator help us stay focused and keep moving forward.
              </p>
            </div>
          </ScrollReveal>

          {/* 4 Faculty Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {professors.map((prof, idx) => (
              <ScrollReveal key={prof.id} delay={idx * 100}>
                <div className="bg-[#FFFDF9] rounded-xl border border-[#E5DACB] p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                  {/* Top: Avatar & Title */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={prof.photo_url || '/images/nirvana/prof_r_sharma.png'}
                      alt={prof.name}
                      className="w-13 h-13 rounded-full object-cover border border-[#E5DACB] bg-[#EAE0D3] shrink-0 shadow-2xs"
                      onError={(e) => {
                        e.target.src = '/images/nirvana/prof_r_sharma.png';
                      }}
                    />
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="font-bold text-sm text-[#2B231D] leading-tight">
                        {prof.name}
                      </h3>
                      <div className="text-[11px] font-semibold text-[#857467]">
                        {prof.role}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Bio / Description */}
                  {prof.bio && (
                    <p className="text-xs text-[#574A40] mt-3 pt-3 border-t border-[#F0E6D8] leading-relaxed">
                      {prof.bio}
                    </p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
