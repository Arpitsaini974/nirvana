import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  User, 
  Search, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  RotateCcw,
  Radio,
  Tag,
  Layers,
  ArrowRight,
  Globe
} from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    live: 0,
    past: 0,
    categories: [],
    eventTypes: [],
    deliveryModes: [],
    years: []
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  // Fetch Stats once on mount
  useEffect(() => {
    fetch('/api/events/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setStats(data);
        }
      })
      .catch((err) => console.error('Failed to load event stats:', err));
  }, []);

  // Fetch filtered events whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (categoryFilter !== 'all') params.append('category', categoryFilter);
    if (typeFilter !== 'all') params.append('event_type', typeFilter);
    if (modeFilter !== 'all') params.append('delivery_mode', modeFilter);
    if (yearFilter !== 'all') params.append('year', yearFilter);

    fetch(`/api/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => setLoading(false));
  }, [search, statusFilter, categoryFilter, typeFilter, modeFilter, yearFilter]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTypeFilter('all');
    setModeFilter('all');
    setYearFilter('all');
  };

  const isFiltered = search || statusFilter !== 'all' || categoryFilter !== 'all' || typeFilter !== 'all' || modeFilter !== 'all' || yearFilter !== 'all';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. Academic Header & Overview */}
      <div className="border-b border-slate-300 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Club Events & Academic Activities
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed max-w-3xl">
          Discover symposiums, technical workshops, hands-on hardware sprints, research lectures, and national design challenges organized by our student chapter.
        </p>
      </div>

      {/* 2. Think-India Inspired Live Statistics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Events */}
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
            Total Events
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1">
            {stats.total || 0}
          </div>
          <div className="text-[11px] mt-1 opacity-70">
            All organized activities
          </div>
        </div>

        {/* Upcoming Events */}
        <div 
          onClick={() => setStatusFilter('upcoming')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            statusFilter === 'upcoming'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Upcoming
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">
            {stats.upcoming || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Open for registration
          </div>
        </div>

        {/* Ongoing / Live Events */}
        <div 
          onClick={() => setStatusFilter('live')}
          className={`p-4 rounded-lg border cursor-pointer transition-all relative overflow-hidden ${
            statusFilter === 'live'
              ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Ongoing / Live
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1">
            {stats.live || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Currently in session
          </div>
        </div>

        {/* Past Events */}
        <div 
          onClick={() => setStatusFilter('past')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            statusFilter === 'past'
              ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Past Events
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 mt-1">
            {stats.past || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Concluded archives
          </div>
        </div>

      </div>

      {/* 3. Event Filters & Search Section */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-lg border border-slate-300 space-y-4">
        
        {/* Top Filter Row: Search & Status Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event title, speaker, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-md border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'live', label: 'Ongoing / Live' },
              { id: 'past', label: 'Past Events' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Dropdowns Row: Category, Type, Mode, Year */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200">
          
          {/* Domain / Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Domain / Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white rounded border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">All Domains</option>
              {stats.categories?.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Event Type Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Event Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white rounded border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">All Types</option>
              {stats.eventTypes?.map((typ) => (
                <option key={typ} value={typ}>{typ}</option>
              ))}
            </select>
          </div>

          {/* Delivery Mode Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Mode
            </label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white rounded border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">All Modes</option>
              {stats.deliveryModes?.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white rounded border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">All Years</option>
              {stats.years?.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Clear Filters Indicator */}
        {isFiltered && (
          <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
            <span>
              Showing filtered results ({events.length} {events.length === 1 ? 'event' : 'events'})
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-900 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

      </div>

      {/* 4. Events Catalogue Listing */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3 font-medium">Filtering club events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-lg border border-slate-300 p-8 space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No matching events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No events matched your current search and filter criteria. Try choosing a different tab or resetting filters.
          </p>
          <div className="pt-2">
            <button
              onClick={resetFilters}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <article
              key={event.id}
              className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-2xs hover:border-slate-400 transition-colors flex flex-col md:flex-row gap-6 items-start"
            >
              
              {/* Event Poster / Thumbnail */}
              {event.image_url ? (
                <Link
                  to={`/events/${event.id}`}
                  className="w-full md:w-56 shrink-0 rounded-md overflow-hidden border border-slate-200 bg-slate-100 block group"
                >
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-44 md:h-38 object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </Link>
              ) : (
                <div className="w-full md:w-56 h-38 shrink-0 rounded-md border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                  <Calendar className="w-10 h-10" />
                </div>
              )}

              {/* Event Information & Details */}
              <div className="flex-1 space-y-2.5 w-full">
                
                {/* Status & Category Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Status Pill */}
                    {event.status === 'live' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                        <span>Live Now</span>
                      </span>
                    ) : event.status === 'upcoming' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Upcoming
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        Concluded
                      </span>
                    )}

                    {/* Category Pill */}
                    {event.category && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {event.category}
                      </span>
                    )}

                    {/* Event Type Pill */}
                    {event.event_type && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {event.event_type}
                      </span>
                    )}
                  </div>

                  {/* Mode Badge */}
                  {event.delivery_mode && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                      <Globe className="w-3 h-3 text-slate-500" />
                      <span>{event.delivery_mode}</span>
                    </div>
                  )}
                </div>

                {/* Event Title */}
                <h2 className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-800 transition-colors">
                  <Link to={`/events/${event.id}`}>
                    {event.title}
                  </Link>
                </h2>

                {/* Date, Time, Venue Info Bar */}
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-700 pt-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                    <span>{event.date}</span>
                  </div>

                  {event.time && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                  {event.short_description || event.description}
                </p>

                {/* Speakers if available */}
                {event.speakers && (
                  <div className="text-[11px] text-slate-600 pt-0.5">
                    <span className="font-semibold text-slate-800">Speakers / Leads: </span>
                    <span>{event.speakers}</span>
                  </div>
                )}

                {/* Organizer */}
                {event.organizer && (
                  <div className="text-[11px] text-slate-500">
                    Organized by: <strong className="text-slate-700 font-medium">{event.organizer}</strong>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/events/${event.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-800 hover:text-indigo-900 hover:underline"
                  >
                    <span>View Event Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {(event.registration_url || event.registration_link) && (event.status === 'upcoming' || event.status === 'live') && (
                    <a
                      href={event.registration_url || event.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-700 text-white rounded text-xs font-semibold hover:bg-indigo-800 transition-colors ml-auto sm:ml-0"
                    >
                      <span>Register Online</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

              </div>

            </article>
          ))}
        </div>
      )}

    </div>
  );
}
