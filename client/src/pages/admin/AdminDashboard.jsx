import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  GraduationCap, 
  Award, 
  Plus, 
  ExternalLink, 
  ArrowRight 
} from 'lucide-react';

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [profsCount, setProfsCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [alumniCount, setAlumniCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/api/professors').then(r => r.json()).catch(() => []),
      authFetch('/api/members/all').then(r => r.json()).catch(() => []),
      authFetch('/api/alumni/all').then(r => r.json()).catch(() => [])
    ]).then(([profs, members, alumni]) => {
      setProfsCount(Array.isArray(profs) ? profs.length : 0);
      setMembersCount(Array.isArray(members) ? members.length : 0);
      setAlumniCount(Array.isArray(alumni) ? alumni.length : 0);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading NIRVANA console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            NIRVANA Officer Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage academic club records for Professors, Team Members, and Alumni.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Professors Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Faculty Mentors</span>
            <Award className="w-5 h-5 text-slate-800" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-serif">{profsCount}</div>
          <p className="text-xs text-slate-500">Advisors displayed on Home Page</p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/admin/professors"
              className="text-xs font-bold text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Professors</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Team Members Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Team Members</span>
            <Users className="w-5 h-5 text-slate-800" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-serif">{membersCount}</div>
          <p className="text-xs text-slate-500">Active student ID cards & QR codes</p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/admin/team"
              className="text-xs font-bold text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Team</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Alumni Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Alumni Members</span>
            <GraduationCap className="w-5 h-5 text-slate-800" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-serif">{alumniCount}</div>
          <p className="text-xs text-slate-500">Graduated alumni ID cards & QR codes</p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/admin/alumni"
              className="text-xs font-bold text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Alumni</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>

      {/* Quick Access Shortcuts */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
          Quick Management Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/professors"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900 text-xs">Add / Edit Professors</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Faculty section at bottom of Home Page</div>
            </div>
            <Plus className="w-4 h-4 text-slate-600" />
          </Link>

          <Link
            to="/admin/team"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900 text-xs">Add / Edit Team Members</div>
              <div className="text-[11px] text-slate-500 mt-0.5">ID cards & QR verification profiles</div>
            </div>
            <Plus className="w-4 h-4 text-slate-600" />
          </Link>

          <Link
            to="/admin/alumni"
            className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-400 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-slate-900 text-xs">Add / Edit Alumni</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Alumni cards & QR verification profiles</div>
            </div>
            <Plus className="w-4 h-4 text-slate-600" />
          </Link>
        </div>
      </div>

    </div>
  );
}
