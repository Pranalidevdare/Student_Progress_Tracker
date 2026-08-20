import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/public/Hero';
import About from '../components/public/About';
import Programs from '../components/public/Programs';
import SelectionProcess from '../components/public/SelectionProcess';
import Statistics from '../components/public/Statistics';
import Testimonials from '../components/public/Testimonials';
import Footer from '../components/public/Footer';
import InfoBeansChatbot from '../components/public/InfoBeansChatbot';
import LoginIcon from '@mui/icons-material/Login';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function LandingPage() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTrackOpen, setMobileTrackOpen] = useState(false);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTrackNavigate = (path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileTrackOpen(false);
    navigate(path);
  };

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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-gray-700">
          <button
            onClick={() => scrollTo('home')}
            className="hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold text-gray-700"
          >
            Home
          </button>
          <button
            onClick={() => scrollTo('about-program')}
            className="hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold text-gray-700"
          >
            About Program
          </button>
          <button
            onClick={() => scrollTo('programs')}
            className="hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold text-gray-700"
          >
            Programs
          </button>
          <button
            onClick={() => scrollTo('selection-process')}
            className="hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold text-gray-700"
          >
            Selection Process
          </button>

          {/* Track Application Dropdown */}
          <div
            className="relative py-1"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold text-gray-700"
            >
              <span>Track Application</span>
              <KeyboardArrowDownIcon
                fontSize="small"
                className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-red-600' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 pt-1.5 w-56 z-50">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden">
                  <button
                    type="button"
                    onClick={(e) => handleTrackNavigate('/aptitude-test', e)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <span className="text-base pointer-events-none select-none">📝</span>
                    <span className="font-semibold pointer-events-none select-none">Aptitude Test</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleTrackNavigate('/selection-status', e)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <span className="text-base pointer-events-none select-none">📊</span>
                    <span className="font-semibold pointer-events-none select-none">Selection Status</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="btn-primary text-xs font-bold px-4 py-2 hidden sm:flex items-center gap-2 shadow-md shadow-red-200"
          >
            <LoginIcon fontSize="small" />
            <span>Login</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-1.5 text-gray-700 hover:text-red-600 rounded-lg bg-gray-50 border border-gray-200 lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-3 shadow-md">
          <button
            onClick={() => { scrollTo('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-xs font-semibold text-gray-700 hover:text-red-600 bg-transparent border-none cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => { scrollTo('about-program'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-xs font-semibold text-gray-700 hover:text-red-600 bg-transparent border-none cursor-pointer"
          >
            About Program
          </button>
          <button
            onClick={() => { scrollTo('programs'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-xs font-semibold text-gray-700 hover:text-red-600 bg-transparent border-none cursor-pointer"
          >
            Programs
          </button>
          <button
            onClick={() => { scrollTo('selection-process'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1.5 text-xs font-semibold text-gray-700 hover:text-red-600 bg-transparent border-none cursor-pointer"
          >
            Selection Process
          </button>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => setMobileTrackOpen((prev) => !prev)}
              className="flex items-center justify-between w-full py-1.5 text-xs font-semibold text-gray-700 hover:text-red-600 bg-transparent border-none cursor-pointer"
            >
              <span>Track Application</span>
              <KeyboardArrowDownIcon
                fontSize="small"
                className={`transition-transform duration-200 ${mobileTrackOpen ? 'rotate-180 text-red-600' : ''}`}
              />
            </button>

            {mobileTrackOpen && (
              <div className="pl-4 py-1.5 space-y-1">
                <button
                  type="button"
                  onClick={(e) => handleTrackNavigate('/aptitude-test', e)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <span className="text-base pointer-events-none select-none">📝</span>
                  <span className="font-semibold pointer-events-none select-none">Aptitude Test</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleTrackNavigate('/selection-status', e)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <span className="text-base pointer-events-none select-none">📊</span>
                  <span className="font-semibold pointer-events-none select-none">Selection Status</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 sm:hidden">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 shadow-md shadow-red-200"
            >
              <LoginIcon fontSize="small" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <main className="flex-1">
        <section id="home">
          <Hero />
        </section>
        <Statistics />
        <section id="about-program">
          <About />
        </section>
        <section id="programs">
          <Programs />
        </section>
        <section id="selection-process">
          <SelectionProcess />
        </section>
        <Testimonials />
      </main>

      <Footer />
      <InfoBeansChatbot />
    </div>
  );
}
