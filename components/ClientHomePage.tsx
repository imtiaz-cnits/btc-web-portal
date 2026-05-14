"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Assets
import HeroImage from '@/assets/img/home/hero-img1.png';
import AboutImage from '@/assets/img/home/about-image.png';
import ProjectImg1 from '@/assets/img/home/project-img1.png';
import ProjectImg2 from '@/assets/img/home/project-img2.png';
import ProjectImg3 from '@/assets/img/home/project-img3.png';
import ProjectImg4 from '@/assets/img/home/project-img4.png';
import ProjectImg5 from '@/assets/img/home/project-img5.png';
import ProjectImg6 from '@/assets/img/home/project-img6.png';
import ClientLogo1 from '@/assets/img/home/client-logo1.png';
import ClientLogo2 from '@/assets/img/home/client-logo2.png';
import ClientLogo3 from '@/assets/img/home/client-logo3.png';
import ClientLogo4 from '@/assets/img/home/client-logo4.png';
import ClientLogo5 from '@/assets/img/home/client-logo5.png';
import ClientLogo6 from '@/assets/img/home/client-logo6.png';
import ClientLogo7 from '@/assets/img/home/client-logo7.png';
import ClientLogo8 from '@/assets/img/home/client-logo8.png';
import ClientLogo9 from '@/assets/img/home/client-logo9.png';
import ClientLogo10 from '@/assets/img/home/client-logo10.png';
import ClientLogo11 from '@/assets/img/home/client-logo11.png';
import ClientLogo12 from '@/assets/img/home/client-logo12.png';

export default function ClientHomePage() {
  const [tenderNotices, setTenderNotices] = useState<any[]>([]);
  const [winnerNotices, setWinnerNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tenderNoticeBoardRef = useRef(null);
  const winnerNoticeBoardRef = useRef(null);
  const counterStatsRef = useRef<HTMLDivElement>(null);
  const aboutStatsRef = useRef<HTMLDivElement>(null);

  // Vertical Notice Scrolling Hook - Vanilla JS for smoothest loop
  const useVerticalNotice = (notices: any[]) => {
    const noticeRef = useRef<HTMLUListElement>(null);
    const requestRef = useRef<number | null>(null);
    const posRef = useRef(0);
    const isPaused = useRef(false);
    const speed = 40; // Pixels per second

    useEffect(() => {
      const container = noticeRef.current;
      if (!container || !notices || notices.length === 0) return;

      const items = Array.from(container.querySelectorAll('li.js_notice_item')) as HTMLElement[];
      if (items.length === 0) return;

      // Cleanup
      const clones = container.querySelectorAll('.js_notice_clone');
      clones.forEach(clone => clone.remove());

      const itemHeight = items[0].offsetHeight;
      const totalHeight = itemHeight * notices.length;

      // Clone items for seamless loop
      items.forEach((item: any) => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.classList.add('js_notice_clone');
        clone.classList.remove('js_notice_item');
        container.appendChild(clone);
      });

      let lastTime = performance.now();

      const animate = (time: number) => {
        if (!isPaused.current) {
          const deltaTime = (time - lastTime) / 1000;
          posRef.current -= speed * deltaTime;

          if (Math.abs(posRef.current) >= totalHeight) {
            posRef.current += totalHeight;
          }

          container.style.transform = `translate3d(0, ${posRef.current}px, 0)`;
        }
        lastTime = time;
        requestRef.current = requestAnimationFrame(animate);
      };

      requestRef.current = requestAnimationFrame(animate);

      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    }, [notices]);

    const handleMouseEnter = () => { isPaused.current = true; };
    const handleMouseLeave = () => { isPaused.current = false; };

    return { noticeRef, handleMouseEnter, handleMouseLeave };
  };

  // Mock data for now
  useEffect(() => {
    const mockNotices = [
      { id: 1, date: '১২ মে', title: 'পাবনায় নতুন অফিস ভবন নির্মাণ কাজ ও দরপত্র বিজ্ঞপ্তি' },
      { id: 2, date: '১০ মে', title: 'বিটিসি সদর দপ্তরের অভ্যন্তরীণ সাজসজ্জার জন্য দরপত্র' },
      { id: 3, date: '০৮ মে', title: 'প্রকল্প এ-১২৪ এর বিজয়ী তালিকা ঘোষণা করা হয়েছে' },
      { id: 4, date: '০৫ মে', title: 'ভূমি জরিপ চুক্তির সুযোগ - দ্রুত আবেদন করুন' },
      { id: 5, date: '০১ মে', title: 'বার্ষিক রক্ষণাবেক্ষণ টেন্ডার ২০২৪ প্রকাশিত' },
    ];
    setTenderNotices(mockNotices);
    setWinnerNotices(mockNotices);
    setLoading(false);
  }, []);

  const { noticeRef: tenderNoticeRef, handleMouseEnter: tenderMouseEnter, handleMouseLeave: tenderMouseLeave } = useVerticalNotice(tenderNotices);
  const { noticeRef: winnerNoticeRef, handleMouseEnter: winnerMouseEnter, handleMouseLeave: winnerMouseLeave } = useVerticalNotice(winnerNotices);

  // Register GSAP Counter Animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let triggers: any[] = [];

    const setupCounter = (ref: React.RefObject<HTMLDivElement>, selector: string) => {
      const counters = ref.current?.querySelectorAll(selector);
      if (counters) {
        counters.forEach((counter: any) => {
          const trigger = ScrollTrigger.create({
            trigger: ref.current,
            start: 'top 80%',
            onEnter: () => {
              const target = parseInt(counter.getAttribute('data-target') || '0');
              gsap.fromTo(counter, { innerText: 0 }, {
                innerText: target,
                duration: 2,
                ease: 'power1.out',
                snap: { innerText: 1 },
                onUpdate: function () {
                  counter.textContent = Math.floor(this.targets()[0].innerText) + (selector.includes('percent') ? '%' : '');
                },
              });
            },
          });
          triggers.push(trigger);
        });
      }
    };

    setupCounter(counterStatsRef, '.numbers');
    setupCounter(aboutStatsRef, '.counters');

    return () => triggers.forEach(t => t.kill());
  }, []);

  return (
    <div className="bg-secondary">
      {/* Hero Section */}
      <div className="hero pt-[60px] pb-[80px]">
        <div className="custom-container">
          <div className="flex flex-wrap lg:flex-nowrap gap-10">
            <div className="w-full lg:w-1/2">
              <div className="flex justify-center lg:justify-start mb-6">
                <span className="bg-shade-1 text-text-1 px-5 py-1.5 rounded-full text-sm font-medium">Your Safe Innovation</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-text-1 mb-8 uppercase leading-tight text-center lg:text-left">
                Welcome to the <span className="text-primary">Building Technology</span> & Consultant <span className="text-primary">!!!</span>
              </h1>
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <Image src={HeroImage} alt="Hero" className="w-full object-cover" />
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div className="bg-white border border-ac-1 rounded-3xl overflow-hidden h-[350px] flex flex-col shadow-sm" onMouseEnter={tenderMouseEnter} onMouseLeave={tenderMouseLeave}>
                <h3 className="bg-primary text-white text-center py-3 font-bold text-xl uppercase">ইজিপি দরপত্র বিজ্ঞপ্তি</h3>
                <div className="flex-1 overflow-hidden relative">
                  <ul className="notice-list" ref={tenderNoticeRef}>
                    {tenderNotices.map((notice) => (
                      <li key={notice.id} className="js_notice_item flex items-center gap-5 p-4 border-b border-ac-1 hover:bg-shade-1 transition cursor-pointer">
                        <div className="notice-date flex-shrink-0 w-14 h-14 bg-primary text-white rounded-xl flex flex-col items-center justify-center font-bold">
                           <span className="text-xl leading-none">{notice.date.split(' ')[0]}</span>
                           <span className="text-[10px] uppercase opacity-80">{notice.date.split(' ')[1]}</span>
                        </div>
                        <span className="text-text-2 font-medium text-sm line-clamp-2">{notice.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 text-center">
                  <Link href="/egp-notice" className="bg-primary text-white !text-white px-8 py-2 rounded-tr-xl rounded-br-xl rounded-bl-xl font-bold text-sm uppercase hover:bg-text-1 transition inline-block">সব দেখুন</Link>
                </div>
              </div>

              {/* Winner Notice Board */}
              <div className="bg-white border border-ac-1 rounded-3xl overflow-hidden h-[350px] flex flex-col shadow-sm" onMouseEnter={winnerMouseEnter} onMouseLeave={winnerMouseLeave}>
                <h3 className="bg-primary text-white text-center py-3 font-bold text-xl uppercase">বিজয়ী তালিকা</h3>
                <div className="flex-1 overflow-hidden relative">
                  <ul className="notice-list" ref={winnerNoticeRef}>
                    {winnerNotices.map((winner) => (
                      <li key={winner.id} className="js_notice_item flex items-center gap-5 p-4 border-b border-ac-1 hover:bg-shade-1 transition cursor-pointer">
                        <div className="notice-date flex-shrink-0 w-14 h-14 bg-primary text-white rounded-xl flex flex-col items-center justify-center font-bold">
                           <span className="text-xl leading-none">{winner.date.split(' ')[0]}</span>
                           <span className="text-[10px] uppercase opacity-80">{winner.date.split(' ')[1]}</span>
                        </div>
                        <span className="text-text-2 font-medium text-sm line-clamp-2">{winner.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 text-center">
                  <Link href="/winner-list" className="bg-primary text-white !text-white px-8 py-2 rounded-tr-xl rounded-br-xl rounded-bl-xl font-bold text-sm uppercase hover:bg-text-1 transition inline-block">সব দেখুন</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="py-20">
        <div className="custom-container">
          <div className="bg-shade-1 rounded-[60px] p-10 lg:p-20 relative overflow-hidden">
            <div className="text-center mb-16 relative z-10">
              <span className="bg-primary text-white px-6 py-1.5 rounded-full font-bold text-sm uppercase">What We Offer</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-1 mt-6 uppercase leading-tight max-w-2xl mx-auto">We Provide Excellent Service To Our Customers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {[
                 { title: 'EGP Registration', desc: 'Register today to streamline your projects, access exclusive resources, and build with confidence.' },
                 { title: 'E-Tender Submission', desc: 'Submit your e-tenders seamlessly and securely with our streamlined platform.' },
                 { title: 'Building Construction', desc: 'Transforming visions into reality with expert craftsmanship and innovative solutions.' },
                 { title: 'Soil Test', desc: 'Offering precise soil testing services to ensure strong, reliable foundations.' },
                 { title: 'Rate Analysis', desc: 'Delivering detailed and accurate rate analysis to optimize costs and transparency.' },
                 { title: 'Architectural Design', desc: 'Creating innovative and functional architectural designs tailored to your vision.' }
               ].map((service, i) => (
                 <div key={i} className="text-center group">
                   <div className="mb-6 flex justify-center">
                     <div className="w-16 h-16 bg-primary rounded-xl animate-dash flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                   </div>
                   <h3 className="text-xl font-bold text-text-1 uppercase mb-4">{service.title}</h3>
                   <p className="text-text-2 font-secondary leading-relaxed">{service.desc}</p>
                   <button className="mt-6 bg-text-1 text-white px-8 py-2 rounded-tr-xl rounded-br-xl rounded-bl-xl font-bold text-sm uppercase group-hover:bg-primary transition">Read More</button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Counter Section */}
      <div className="py-20" ref={counterStatsRef}>
        <div className="custom-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {[
              { label: 'Total Tenders', val: 1000, suffix: '+' },
              { label: 'Design Clients', val: 700, suffix: '+' },
              { label: 'Projects', val: 200, suffix: '+' },
              { label: 'Success Rate', val: 86, suffix: '%' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-5xl lg:text-6xl font-bold text-text-1 mb-2 flex justify-center items-baseline">
                  <span className="numbers" data-target={stat.val}>0</span>
                  <span className="text-primary">{stat.suffix}</span>
                </div>
                <div className="text-sm font-bold text-text-2 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-20">
        <div className="custom-container">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-20">
            <div className="w-full lg:w-1/2 relative" ref={aboutStatsRef}>
              <div className="rounded-[40px] overflow-hidden shadow-2xl">
                 <Image src={AboutImage} alt="About" className="w-full" />
              </div>
              <div className="absolute top-10 -left-10 bg-white p-6 rounded-2xl shadow-xl text-center hidden md:block">
                 <div className="text-3xl font-bold text-text-1"><span className="counters" data-target="1000">0</span>+</div>
                 <div className="text-xs font-bold text-text-2 uppercase">Tenderer</div>
              </div>
              <div className="absolute bottom-20 -right-10 bg-white p-6 rounded-2xl shadow-xl text-center hidden md:block">
                 <div className="text-3xl font-bold text-text-1"><span className="counters" data-target="700">0</span>+</div>
                 <div className="text-xs font-bold text-text-2 uppercase">Design Clients</div>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <span className="bg-primary text-white px-6 py-1.5 rounded-full font-bold text-sm uppercase">About Us</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-1 mt-6 uppercase leading-tight mb-8">Precision, Quality, and Excellence in Every Project</h2>
              <p className="text-lg text-text-2 font-secondary leading-relaxed mb-10">We specialize in delivering top-tier construction services, including soil testing, architectural design, interior design, land surveys, and more. Our expert team is committed to ensuring the success of your projects with precision and creativity.</p>
              <button className="bg-primary text-white px-10 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl font-bold text-sm uppercase hover:bg-text-1 transition">Read More</button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div id="projects" className="py-20 bg-shade-1 rounded-[80px_80px_0_0]">
        <div className="custom-container">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="bg-primary text-white px-6 py-1.5 rounded-full font-bold text-sm uppercase">Our Best Projects</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-1 mt-6 uppercase leading-tight">Showcasing excellence in every build.</h2>
            </div>
            <button className="hidden md:block bg-primary text-white px-10 py-3 rounded-tr-xl rounded-br-xl rounded-bl-xl font-bold text-sm uppercase hover:bg-text-1 transition">Browse All Projects</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {[
               { img: ProjectImg1, tag: 'Shopping Mall', title: 'West End Business Center, Dhaka' },
               { img: ProjectImg2, tag: 'Educational', title: 'University of Connecticul, Sylhet' },
               { img: ProjectImg3, tag: 'Home', title: 'Vivala Mension, Sylhet' },
               { img: ProjectImg4, tag: 'Office', title: 'Center of Royal, Dhaka' },
               { img: ProjectImg5, tag: 'Shopping Mall', title: 'Abdali Mall, Rajshahi' },
               { img: ProjectImg6, tag: 'Hospital', title: 'Finha Hospital, Dhaka' }
             ].map((project, i) => (
               <div key={i} className="group">
                 <div className="rounded-[32px] overflow-hidden relative aspect-[16/11] mb-6 shadow-lg">
                    <Image src={project.img} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <span className="absolute bottom-5 left-5 bg-white text-text-1 px-5 py-1 rounded-full font-bold text-xs uppercase">{project.tag}</span>
                 </div>
                 <h3 className="text-xl font-bold text-text-1 uppercase mb-4 hover:text-primary transition cursor-pointer">{project.title}</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                       <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                       <div className="text-primary font-bold text-xs">Project Duration</div>
                       <div className="text-text-1 font-bold text-sm opacity-60">2023-2024</div>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Client Logo Slider */}
      <div className="py-20 bg-ac-2">
        <div className="text-center mb-16">
          <span className="bg-primary text-white px-6 py-1.5 rounded-full font-bold text-sm uppercase">Our Top Clients</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-text-1 mt-6 uppercase leading-tight max-w-2xl mx-auto">Trusted by innovators and leaders worldwide.</h2>
        </div>

        <div className="overflow-hidden mb-6">
           <div className="flex animate-scroll hover:[animation-play-state:paused] gap-10 items-center w-max">
             {[ClientLogo1, ClientLogo2, ClientLogo3, ClientLogo4, ClientLogo5, ClientLogo6, ClientLogo1, ClientLogo2, ClientLogo3, ClientLogo4, ClientLogo5, ClientLogo6].map((logo, i) => (
               <Image key={i} src={logo} alt="Client" className="w-[247px] h-[110px] rounded-2xl object-contain bg-white p-4 shadow-sm" />
             ))}
           </div>
        </div>

        <div className="overflow-hidden">
           <div className="flex animate-scroll-reverse hover:[animation-play-state:paused] gap-10 items-center w-max">
             {[ClientLogo7, ClientLogo8, ClientLogo9, ClientLogo10, ClientLogo11, ClientLogo12, ClientLogo7, ClientLogo8, ClientLogo9, ClientLogo10, ClientLogo11, ClientLogo12].map((logo, i) => (
               <Image key={i} src={logo} alt="Client" className="w-[247px] h-[110px] rounded-2xl object-contain bg-white p-4 shadow-sm" />
             ))}
           </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-white text-center">
        <div className="custom-container">
           <div className="bg-primary rounded-[40px] p-12 lg:p-20 shadow-2xl relative z-10 -mb-40">
             <h2 className="text-3xl lg:text-5xl font-bold text-white uppercase leading-tight mb-10">Looking for someone who can transform ideas?</h2>
             <Link href="/contact" className="bg-white text-text-1 px-12 py-4 rounded-tr-xl rounded-br-xl rounded-bl-xl font-bold text-lg uppercase hover:bg-text-1 hover:text-white transition inline-block">Let's Discuss</Link>
           </div>
        </div>
      </section>

      <style jsx global>{`
        .notice-list {
          position: relative;
          width: 100%;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1.25rem)); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll-reverse {
          animation: scroll 30s linear infinite reverse;
        }
        .animate-dash {
          background: linear-gradient(90deg, #fff 50%, transparent 50%),
                      linear-gradient(90deg, #fff 50%, transparent 50%),
                      linear-gradient(0deg, #fff 50%, transparent 50%),
                      linear-gradient(0deg, #fff 50%, transparent 50%);
          background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
          background-size: 9px 2px, 9px 2px, 2px 9px, 2px 9px;
          background-position: 0% 0%, 100% 100%, 0% 100%, 100% 0px;
          animation: dash 5s linear infinite;
        }
        @keyframes dash {
          to { background-position: 100% 0%, 0% 100%, 0% 0%, 100% 100%; }
        }
      `}</style>
    </div>
  );
}
