import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    club_name: 'NIRVANA',
    tagline: 'LEARN • EXPLORE • GROW',
    logo_url: '/images/nirvana/nirvana_logo.png',
    favicon_url: '/favicon.svg',
    banner_url: '',
    about: 'NIRVANA is an official student initiative of SVNIT committed to social impact, education, community care, and youth empowerment.',
    history: '',
    mission: 'To build sustainable bridges between academic institutions and underserved grassroots communities.',
    vision: 'A society where every child and community member has access to quality education, healthcare, and growth opportunities.',
    objectives: [],
    email: 'nirvana@svnit.ac.in',
    phone: '+91 85708 97727 / +91 63774 13540',
    address: 'SVNIT Campus, Ichchhanath, Surat, Gujarat - 395007',
    social_links: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.club_name) {
          document.title = data.club_name;
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
