import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function Contact() {
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({
          type: 'success',
          text: data.message || 'Your inquiry has been submitted. A team coordinator will get back to you shortly!'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', text: data.error || 'Failed to submit inquiry.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Unable to connect to server. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-24 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>GET IN TOUCH WITH US</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Contact Club Leadership
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Have an inquiry, sponsorship proposition, or recruitment question? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Contact Info Cards (Left) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-8 shadow-xl">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Official Headquarters
              </span>
              <h3 className="text-2xl font-bold mt-1 text-white">
                {settings.club_name || 'Apex Robotics Club'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Student Technical Society Office
              </p>
            </div>

            <div className="space-y-6 text-sm">
              {settings.address && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase block">Campus Location</span>
                    <span className="text-slate-200 mt-0.5 leading-relaxed block">{settings.address}</span>
                  </div>
                </div>
              )}

              {settings.email && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase block">Inquiry Email</span>
                    <a href={`mailto:${settings.email}`} className="text-slate-200 hover:text-indigo-400 transition-colors mt-0.5 block font-medium">
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}

              {settings.phone && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase block">Telephone</span>
                    <a href={`tel:${settings.phone}`} className="text-slate-200 hover:text-indigo-400 transition-colors mt-0.5 block font-medium">
                      {settings.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block">Lab & Office Hours</span>
                  <span className="text-slate-200 mt-0.5 block">Monday – Friday: 10:00 AM – 7:00 PM</span>
                  <span className="text-xs text-slate-400">Competition Sprints: Weekend Open Hours</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400 block mb-2">Member Verification Help</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                For urgent digital identity verification requests or alumni certification queries, please mention your reference ID in the message subject.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form (Right) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Send an Official Message</h3>
          <p className="text-xs text-slate-500 mb-6">
            All submitted inquiries are routed directly to the club executive secretariat.
          </p>

          {status && (
            <div
              className={`p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm ${
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{status.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Robotics Sponsorship Proposal / Member Inquiry"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Message *
              </label>
              <textarea
                required
                rows={5}
                placeholder="How can we help or collaborate with you?..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Sending Message...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
