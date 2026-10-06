import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Upload, 
  X, 
  AlertCircle, 
  ExternalLink,
  Clock,
  Globe,
  Tag
} from 'lucide-react';

export default function AdminEvents() {
  const { authFetch } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '10:00 AM - 01:00 PM',
    location: 'Technology Center Auditorium',
    category: 'Robotics & Hardware',
    event_type: 'Workshop',
    delivery_mode: 'Offline',
    speakers: '',
    organizer: 'Club Executive Council',
    status: 'upcoming',
    image_url: '',
    short_description: '',
    description: '',
    registration_link: '',
    registration_url: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM - 01:00 PM',
      location: 'Technology Center Auditorium',
      category: 'Robotics & Hardware',
      event_type: 'Workshop',
      delivery_mode: 'Offline',
      speakers: '',
      organizer: 'Club Executive Council',
      status: 'upcoming',
      image_url: '',
      short_description: '',
      description: '',
      registration_link: '',
      registration_url: ''
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      date: event.date || '',
      time: event.time || '10:00 AM - 01:00 PM',
      location: event.location || '',
      category: event.category || 'Robotics & Hardware',
      event_type: event.event_type || 'Workshop',
      delivery_mode: event.delivery_mode || 'Offline',
      speakers: event.speakers || '',
      organizer: event.organizer || '',
      status: event.status || 'upcoming',
      image_url: event.image_url || '',
      short_description: event.short_description || '',
      description: event.description || '',
      registration_link: event.registration_link || event.registration_url || '',
      registration_url: event.registration_url || event.registration_link || ''
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handlePosterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPoster(true);
    const body = new FormData();
    body.append('file', file);
    body.append('category', 'events');

    try {
      const res = await authFetch('/api/media/upload', {
        method: 'POST',
        body
      });
      const data = await res.json();
      if (res.ok && data.file) {
        setFormData((prev) => ({ ...prev, image_url: data.file.url }));
      } else {
        alert(data.error || 'Failed to upload event poster');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        registration_url: formData.registration_link
      };

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setIsFormOpen(false);
        fetchEvents();
      } else {
        setFormError(data.error || 'Failed to save event.');
      }
    } catch (err) {
      setFormError('Server connection failed.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingEvent) return;
    setDeleteLoading(true);
    try {
      const res = await authFetch(`/api/events/${deletingEvent.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDeletingEvent(null);
        fetchEvents();
      }
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchSearch = (
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase()) ||
      e.speakers?.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer?.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Events & Activities Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize symposiums, competitions, workshops, talks, and hands-on sprints with real-time statistics.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {/* Search & Status Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, category, speaker, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
          {['all', 'upcoming', 'live', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab === 'all' ? 'All' : tab}
            </button>
          ))}
        </div>

      </div>

      {/* Events Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700 text-base">No events found</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting search or click "Add New Event".</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Domain & Type</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Venue & Mode</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Event Title & Poster */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-12 h-9 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-12 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-sm line-clamp-1">{event.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {event.short_description || event.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Type */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{event.category || 'General'}</div>
                      <div className="text-[11px] text-slate-500">{event.event_type || 'Activity'}</div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{event.date}</div>
                      <div className="text-slate-500 text-[11px]">{event.time || 'Schedule in details'}</div>
                    </td>

                    {/* Venue & Mode */}
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800 line-clamp-1">{event.location || 'Campus'}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{event.delivery_mode || 'Offline'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {event.status === 'live' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          <span>Live Now</span>
                        </span>
                      ) : event.status === 'upcoming' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Upcoming
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                          Past
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/events/${event.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingEvent(event)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Systems Symposium & Poster Exhibition"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Time / Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 01:00 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Category, Event Type, Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Domain / Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Robotics & Hardware">Robotics & Hardware</option>
                    <option value="AI & Computer Vision">AI & Computer Vision</option>
                    <option value="Embedded & IoT">Embedded & IoT</option>
                    <option value="Aerospace Mechanisms">Aerospace Mechanisms</option>
                    <option value="Coding & Algorithms">Coding & Algorithms</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Symposium">Symposium</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Guest Lecture">Guest Lecture</option>
                    <option value="Competition">Competition</option>
                    <option value="Hands-on Sprint">Hands-on Sprint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Delivery Mode
                  </label>
                  <select
                    value={formData.delivery_mode}
                    onChange={(e) => setFormData({ ...formData, delivery_mode: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Offline">Offline (In-Person)</option>
                    <option value="Online">Online (Virtual)</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Location & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Seminar Hall 2, Tech Block"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Event Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="upcoming">Upcoming Event</option>
                    <option value="live">Ongoing / Live Now</option>
                    <option value="past">Past / Concluded</option>
                  </select>
                </div>
              </div>

              {/* Speakers & Organizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Key Speakers / Resource Persons
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. K. S. Rao, Elena Rostova"
                    value={formData.speakers}
                    onChange={(e) => setFormData({ ...formData, speakers: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Organizer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Academic Council"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Poster Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Event Poster URL or File Upload
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingPoster ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Short Abstract / Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="One or two sentences highlighting event purpose..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Full Description & Schedule */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Description, Agenda & Rules
                </label>
                <textarea
                  rows={4}
                  placeholder="Complete schedule, syllabus, requirements, speaker background..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Registration Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Registration / External Link
                </label>
                <input
                  type="url"
                  placeholder="https://forms.google.com/..."
                  value={formData.registration_link}
                  onChange={(e) => setFormData({ ...formData, registration_link: e.target.value, registration_url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  {formSubmitting ? 'Saving Event...' : 'Save Event'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingEvent}
        title={`Delete Event "${deletingEvent?.title}"?`}
        message="Are you sure you want to delete this event? It will be permanently removed from public view and discovery."
        confirmText="Delete Event"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingEvent(null)}
        isLoading={deleteLoading}
      />

    </div>
  );
}
