import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Plus, 
  Trash2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  Sparkles
} from 'lucide-react';

export default function AdminClubSettings() {
  const { authFetch } = useAuth();
  const { settings: globalSettings, refreshSettings } = useSettings();

  const [formData, setFormData] = useState({
    club_name: '',
    tagline: '',
    logo_url: '',
    favicon_url: '',
    banner_url: '',
    about: '',
    history: '',
    mission: '',
    vision: '',
    objectives: [],
    email: '',
    phone: '',
    address: '',
    social_links: {
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      youtube: ''
    }
  });

  const [newObjective, setNewObjective] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (globalSettings) {
      setFormData({
        club_name: globalSettings.club_name || '',
        tagline: globalSettings.tagline || '',
        logo_url: globalSettings.logo_url || '',
        favicon_url: globalSettings.favicon_url || '',
        banner_url: globalSettings.banner_url || '',
        about: globalSettings.about || '',
        history: globalSettings.history || '',
        mission: globalSettings.mission || '',
        vision: globalSettings.vision || '',
        objectives: Array.isArray(globalSettings.objectives) ? [...globalSettings.objectives] : [],
        email: globalSettings.email || '',
        phone: globalSettings.phone || '',
        address: globalSettings.address || '',
        social_links: {
          linkedin: globalSettings.social_links?.linkedin || '',
          github: globalSettings.social_links?.github || '',
          twitter: globalSettings.social_links?.twitter || '',
          instagram: globalSettings.social_links?.instagram || '',
          youtube: globalSettings.social_links?.youtube || ''
        }
      });
    }
  }, [globalSettings]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const body = new FormData();
    body.append('file', file);
    body.append('category', 'logo');

    try {
      const res = await authFetch('/api/media/upload', {
        method: 'POST',
        body
      });
      const data = await res.json();
      if (res.ok && data.file) {
        setFormData((prev) => ({ ...prev, logo_url: data.file.url }));
        setStatus({ type: 'success', text: 'Logo uploaded. Remember to click "Save Settings".' });
      } else {
        setStatus({ type: 'error', text: data.error || 'Failed to upload logo' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Upload failed.' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const addObjective = () => {
    if (!newObjective.trim()) return;
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, newObjective.trim()]
    }));
    setNewObjective('');
  };

  const removeObjective = (index) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', text: 'Club settings updated successfully! Changes are live.' });
        await refreshSettings();
      } else {
        setStatus({ type: 'error', text: data.error || 'Failed to update settings' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Server connection failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Club Information & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure branding, identity, vision, and contact details reflected across the public website.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
        >
          {saving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {status && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Brand & Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Brand Identity & Assets</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Club Name *
              </label>
              <input
                type="text"
                required
                value={formData.club_name}
                onChange={(e) => setFormData({ ...formData, club_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tagline / Motto
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Logo URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://... or upload below"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
                <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingLogo ? '...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Lab Banner / Showcase Media URL
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.banner_url}
                onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: About, Mission & Vision */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">About, Mission & Vision</h2>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Club Story / Introduction
            </label>
            <textarea
              rows={4}
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mission Statement
              </label>
              <textarea
                rows={3}
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Vision Statement
              </label>
              <textarea
                rows={3}
                value={formData.vision}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              History & Milestones
            </label>
            <textarea
              rows={3}
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Objectives List Manager */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Core Objectives
            </label>
            <div className="space-y-2 mb-3">
              {formData.objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-700 flex-1">{obj}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(i)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new objective..."
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addObjective(); } }}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
              <button
                type="button"
                onClick={addObjective}
                className="px-3.5 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Headquarters */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Contact & Location Info</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Inquiry Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Headquarters Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Social Media Links */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Social Media & Online Presence</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.social_links.linkedin}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                GitHub Organization URL
              </label>
              <input
                type="url"
                value={formData.social_links.github}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, github: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Twitter / X Profile URL
              </label>
              <input
                type="url"
                value={formData.social_links.twitter}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.social_links.instagram}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, instagram: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                YouTube Channel URL
              </label>
              <input
                type="url"
                value={formData.social_links.youtube}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, youtube: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Settings...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
