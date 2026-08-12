import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/public/Hero';
import About from '../components/public/About';
import Programs from '../components/public/Programs';
import SelectionProcess from '../components/public/SelectionProcess';
import Statistics from '../components/public/Statistics';
import Testimonials from '../components/public/Testimonials';
import Footer from '../components/public/Footer';
import InfoBeansChatbot from '../components/public/InfoBeansChatbot';
import LoginIcon from '@mui/icons-material/Login';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-200">
            IB
          </div>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 leading-tight">InfoBeans Foundation</h1>
            <p className="text-[11px] text-red-600 font-semibold uppercase tracking-wider">Student Progress Tracker (SPT)</p>
          </div>
        </div>

        {/* Action Navigation */}
        <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-gray-700">
          <Link to="/aptitude-test" className="hover:text-red-600 flex items-center gap-1">
            <AssignmentIcon fontSize="small" /> Aptitude Test
          </Link>
          <Link to="/selection-status" className="hover:text-red-600 flex items-center gap-1">
            <SearchIcon fontSize="small" /> Selection Status
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-md shadow-red-200"
          >
            <LoginIcon fontSize="small" />
            <span>Portal Login</span>
          </Link>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero />
        <Statistics />
        <About />
        <Programs />
        <SelectionProcess />
        <Testimonials />
      </main>

      <Footer />
      <InfoBeansChatbot />
    </div>
  );
}
