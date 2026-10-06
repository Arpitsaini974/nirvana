import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Globe, 
  ExternalLink, 
  ArrowLeft, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  Share2,
  FileText
} from 'lucide-react';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/events/${eventId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Event not found');
        }
        return res.json();
      })
      .then((data) => {
        setEvent(data);
      })
      .catch((err) => {
        console.error('Error fetching event details:', err);
        setError('The requested event could not be found or has been removed.');
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-lg border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
          <p className="text-xs text-slate-600 mt-2">{error || 'Event details are unavailable.'}</p>
          <div className="mt-6">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Events</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parse speakers string into list if separated by comma or semicolon
  const speakerList = event.speakers 
    ? event.speakers.split(/[,;]/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link to="/events" className="hover:text-slate-900">Events</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">{event.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium border border-slate-200 transition-colors"
            title="Copy link to event"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
          
          <Link
            to="/events"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Events</span>
          </Link>
        </div>
      </div>

      {/* Main Event Header Card */}
      <div className="bg-white rounded-lg border border-slate-300 p-6 sm:p-8 space-y-6">
        
        {/* Badges & Metadata */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Badge */}
          {event.status === 'live' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>LIVE NOW / ONGOING</span>
            </span>
          ) : event.status === 'upcoming' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>UPCOMING EVENT</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              <span>CONCLUDED / PAST</span>
            </span>
          )}

          {/* Category Pill */}
          {event.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
              <Tag className="w-3 h-3 text-indigo-600" />
              <span>{event.category}</span>
            </span>
          )}

          {/* Event Type Pill */}
          {event.event_type && (
            <span className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {event.event_type}
            </span>
          )}

          {/* Delivery Mode */}
          {event.delivery_mode && (
            <span className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-500" />
              <span>{event.delivery_mode} Mode</span>
            </span>
          )}
        </div>

        {/* Title & Short Abstract */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {event.title}
          </h1>
          {event.short_description && (
            <p className="text-sm text-slate-600 mt-2.5 leading-relaxed font-normal">
              {event.short_description}
            </p>
          )}
        </div>

        {/* Key Event Facts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-700" />
              <span>Date</span>
            </span>
            <p className="font-bold text-slate-900 text-sm">{event.date}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-700" />
              <span>Time</span>
            </span>
            <p className="font-semibold text-slate-900">{event.time || 'Schedule in details'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-700" />
              <span>Venue</span>
            </span>
            <p className="font-semibold text-slate-900">{event.location || 'Campus'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-700" />
              <span>Organizer</span>
            </span>
            <p className="font-semibold text-slate-900">{event.organizer || 'Club Committee'}</p>
          </div>

        </div>

        {/* Action Button Banner (Register or Status) */}
        {(event.registration_url || event.registration_link) && (event.status === 'upcoming' || event.status === 'live') && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Registration Open
              </h4>
              <p className="text-xs text-indigo-700 mt-0.5">
                Students and participants can register using the official university form.
              </p>
            </div>
            <a
              href={event.registration_url || event.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-700 text-white rounded text-xs font-bold hover:bg-indigo-800 transition-colors shadow-xs shrink-0"
            >
              <span>Register Online</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

      </div>

      {/* Event Banner / Poster */}
      {event.image_url && (
        <div className="bg-white rounded-lg border border-slate-300 p-2 sm:p-3 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full max-h-[460px] object-cover rounded-md"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Description, Agenda, Objectives */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Detailed Description */}
          <div className="bg-white rounded-lg border border-slate-300 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-700" />
              <span>Event Overview & Schedule</span>
            </h3>
            
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap pt-1 font-normal">
              {event.description || event.short_description || 'Detailed agenda will be distributed prior to session.'}
            </div>
          </div>

          {/* Speakers / Resource Persons */}
          {speakerList.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-300 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-700" />
                <span>Speakers & Resource Faculty</span>
              </h3>

              <div className="space-y-3 pt-1">
                {speakerList.map((speaker, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-800 text-xs shrink-0">
                      {speaker.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{speaker}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">Invited Speaker / Subject Matter Expert</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines / Attendance Information */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Important Participant Notes
            </h4>
            <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
              <li>Attendees are advised to report 15 minutes before scheduled start time.</li>
              <li>Valid student identity card is required for entry into campus venues.</li>
              <li>Certificates of participation will be issued digitally upon session completion.</li>
            </ul>
          </div>

        </div>

        {/* Right 1 Col: Quick Metadata Sidebar */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-lg border border-slate-300 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              Event Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Domain / Category:</span>
                <span className="font-semibold text-slate-900">{event.category || 'General Robotics'}</span>
              </div>

              <div>
                <span className="text-slate-500 block font-medium">Format:</span>
                <span className="font-semibold text-slate-900">{event.event_type || 'Academic Activity'}</span>
              </div>

              <div>
                <span className="text-slate-500 block font-medium">Delivery Mode:</span>
                <span className="font-semibold text-slate-900">{event.delivery_mode || 'In-Person / Offline'}</span>
              </div>

              <div>
                <span className="text-slate-500 block font-medium">Status:</span>
                <span className="font-semibold text-slate-900 capitalize">{event.status}</span>
              </div>

              <div>
                <span className="text-slate-500 block font-medium">Organizing Body:</span>
                <span className="font-semibold text-slate-900">{event.organizer || 'Club Council'}</span>
              </div>
            </div>

            {/* Registration button if active */}
            {(event.registration_url || event.registration_link) && (event.status === 'upcoming' || event.status === 'live') && (
              <div className="pt-2 border-t border-slate-100">
                <a
                  href={event.registration_url || event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-700 text-white rounded text-xs font-semibold hover:bg-indigo-800 transition-colors"
                >
                  <span>Register Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Quick Help / Inquiry Box */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider">
              Need Assistance?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Have queries regarding event schedule, team size, or prerequisites? Reach out via our campus contact desk.
            </p>
            <Link
              to="/contact"
              className="text-indigo-800 font-semibold hover:underline inline-block pt-1"
            >
              Contact Organizing Team &rarr;
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
