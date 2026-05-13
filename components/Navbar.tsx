"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Logo from '@/assets/icon/Logo.svg';

export default function Navbar({ initialNotices }: { initialNotices?: any[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="header_section w-full z-[100] relative bg-[var(--secondary-color)]">
      {/* Top Notice Board Start */}
      <div className="top_notice_board bg-[var(--text-1)] py-[6px] overflow-hidden">
        <div className="custom-container">
          <div className="text_marquee flex items-center">
            <div className="animate-marquee whitespace-nowrap flex">
              {[1, 2, 3].map((set) => (
                <div key={set} className="flex">
                  {[
                    "BTC Website is now live!",
                    "New Tender Notices published.",
                    "Innovative construction solutions.",
                    "Trusted by leaders worldwide.",
                    "Excellence in every build."
                  ].map((text, i) => (
                    <span key={i} className="text-[var(--secondary-color)] text-[15px] font-medium inline-block mr-[30px] pr-[30px] relative border-r border-[var(--secondary-color)] last:border-0">
                      {text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top bar Start */}
      <div className="topbar hidden lg:block border-b border-b-[var(--ac-1)]">
        <div className="custom-container">
          <div className="flex justify-between items-center py-2.5">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27.75 19.8L21.8875 17.3C21.585 17.1644 21.253 17.1082 20.9227 17.1366C20.5924 17.1651 20.2749 17.2772 20 17.4625L16.8625 19.55C14.9503 18.6213 13.4021 17.0819 12.4625 15.175L14.5375 12C14.7216 11.7249 14.834 11.4081 14.8645 11.0785C14.8951 10.7488 14.8428 10.4168 14.7125 10.1125L12.2 4.25001C12.0247 3.85415 11.7278 3.52443 11.3525 3.30866C10.9771 3.0929 10.5428 3.0023 10.1125 3.05001C8.42449 3.27114 6.87421 4.09773 5.7499 5.37608C4.62559 6.65444 4.00375 8.29758 4 10C4 19.925 12.075 28 22 28C23.7024 27.9963 25.3456 27.3744 26.6239 26.2501C27.9023 25.1258 28.7289 23.5755 28.95 21.8875C28.9977 21.4572 28.9071 21.0229 28.6913 20.6475C28.4756 20.2722 28.1459 19.9753 27.75 19.8Z" fill="#171717"/></svg>
                <a href="tel:01711010929" className="text-[var(--text-1)] text-[15px] font-normal font-secondary hover:text-[var(--primary-color)] transition">01711010929-(Imran)</a>
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.4227 18.1333L31.6693 26.916C31.8873 26.4168 31.9999 25.878 32 25.3333V11.3987L21.4227 18.1333Z" fill="#171717"/><path d="M16.7173 17.964L31.856 8.32934C31.6343 7.47427 31.1358 6.71664 30.4382 6.17467C29.7407 5.6327 28.8834 5.33687 28 5.33334H4.00001C3.11667 5.33687 2.25934 5.6327 1.56179 6.17467C0.864249 6.71664 0.365726 7.47427 0.144012 8.32934L15.284 17.964C15.4985 18.0996 15.747 18.1715 16.0007 18.1715C16.2544 18.1715 16.5029 18.0996 16.7173 17.964Z" fill="#171717"/><path d="M0 11.3987V25.3333C0.000494642 25.8771 0.113058 26.415 0.330667 26.9133L10.5773 18.1333L0 11.3987Z" fill="#171717"/></svg>
                <a href="mailto:info@egpbtc.com" className="text-[var(--text-1)] text-[15px] font-normal font-secondary hover:text-[var(--primary-color)] transition">info@egpbtc.com</a>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[var(--text-1)] hover:text-[var(--primary-color)] transition duration-400"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="text-[var(--text-1)] hover:text-[var(--primary-color)] transition duration-400"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="text-[var(--text-1)] hover:text-[var(--primary-color)] transition duration-400"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#" className="text-[var(--text-1)] hover:text-[var(--primary-color)] transition duration-400"><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar Start */}
      <nav className="main_navbar w-full bg-[var(--secondary-color)] border-b border-b-[var(--ac-1)]">
        <div className="custom-container">
          <div className="flex justify-between items-center h-[90px]">
            <Link href="/" className="logo flex-shrink-0">
              <Image src={Logo} alt="BTC Logo" className="w-[160px] object-contain" priority />
            </Link>

            <div className="hidden lg:flex items-center gap-10">
              {[
                { name: 'HOME', href: '/' },
                { name: 'SERVICES', href: '#' },
                { name: 'TENDER', href: '#' },
                { name: 'PROJECTS', href: '#' },
                { name: 'ABOUT US', href: '/about' }
              ].map((link) => (
                <Link key={link.name} href={link.href} className={`text-[15px] font-bold tracking-widest transition duration-300 ${pathname === link.href ? 'text-[var(--primary-color)]' : 'text-[var(--text-1)] hover:text-[var(--primary-color)]'}`}>
                  {link.name}
                </Link>
              ))}
              
              <Link href="/contact" className="contact_btn cursor-pointer relative inline-flex items-center justify-center px-8 py-3 overflow-hidden tracking-tighter text-[var(--secondary-color)] bg-[var(--primary-color)] rounded-tl-lg rounded-tr-lg rounded-bl-0 rounded-br-lg group transition duration-300">
                <span className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-[var(--text-1)] group-hover:h-full"></span>
                <span className="relative text-base font-bold">CONTACT US</span>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={toggleMobileMenu} className="lg:hidden text-[var(--text-1)]">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 22H38.5M5.5 11H38.5M5.5 33H27.5" stroke="#5AA469" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1000] lg:hidden" onClick={toggleMobileMenu} />
      )}

      {/* Mobile Menu Slider */}
      <div className={`fixed top-0 left-0 h-full w-[280px] bg-[var(--secondary-color)] z-[1001] transition-transform duration-300 lg:hidden shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-6 border-b border-[var(--ac-1)]">
          <Image src={Logo} alt="Logo" className="w-[120px]" />
          <button onClick={toggleMobileMenu} className="text-[var(--text-1)] text-2xl">&times;</button>
        </div>
        <div className="p-6 flex flex-col gap-6">
          {['HOME', 'SERVICES', 'TENDER', 'PROJECTS', 'ABOUT US', 'CONTACT US'].map((name) => (
            <Link key={name} href="#" onClick={toggleMobileMenu} className="text-base font-bold text-[var(--text-1)] hover:text-[var(--primary-color)] transition">
              {name}
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </header>
  );
}
