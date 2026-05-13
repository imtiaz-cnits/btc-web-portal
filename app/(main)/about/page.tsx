"use client";

import React from 'react';
import { motion } from "framer-motion";
import Link from 'next/link';

// Component for Counter Animation
const CounterItem = ({ target, title, suffix = "+" }: { target: number, title: string, suffix?: string }) => {
  const [count, setCount] = React.useState(0);
  const nodeRef = React.useRef(null);

  React.useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 2000;
    const increment = end / (duration / 16);

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        observer.disconnect();
      }
    });

    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={nodeRef} className="bg-white py-8 px-4 rounded-3xl shadow-sm border text-center hover:shadow-lg transition group">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
        <span>{count}</span>
        <span className="text-[var(--primary-color)]">{suffix}</span>
      </h2>
      <p className="text-gray-500 font-medium uppercase text-xs tracking-wider">{title}</p>
    </div>
  );
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gray-50">
        <div className="custom-container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block bg-[var(--text-1)] text-white px-6 py-2 rounded-full"
              >
                <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase">
                  <Link href="/" className="hover:text-[var(--primary-color)] transition">Home</Link>
                  <span className="text-[var(--primary-color)]">/</span>
                  <span>About Us</span>
                </div>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight uppercase"
              >
                Building the Future <br/> 
                <span className="text-[var(--primary-color)]">With Precision</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-lg leading-relaxed max-w-xl italic"
              >
                Utilizing advanced construction tools, equipment, and techniques for efficiency and innovation in every project we undertake.
              </motion.p>
            </div>
            <div className="w-full lg:w-1/2">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="rounded-[40px] overflow-hidden shadow-2xl border-8 border-white"
               >
                 <img src="/assets/img/about/about-theame-img.png" alt="About BTC" className="w-full h-auto object-cover" />
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="custom-container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-6">
              <CounterItem target={1000} title="Total Tenders" />
              <CounterItem target={700} title="Design Clients" />
              <CounterItem target={98} title="Success Rate" suffix="%" />
              <CounterItem target={200} title="Projects" />
            </div>
            <div className="space-y-6">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase">Precision, Quality, and Excellence in Every Project</h2>
               <p className="text-gray-600 leading-relaxed">
                 We specialize in delivering top-tier construction services, including soil testing, architectural design, interior design, land surveys, and more. Our expert team is committed to ensuring the success of your projects with precision and creativity.
               </p>
               <div className="space-y-4">
                  <div className="border-l-4 border-[var(--primary-color)] pl-4">
                    <h4 className="font-bold text-gray-800 uppercase">Who We Are</h4>
                    <p className="text-sm text-gray-500">Founded on the principles of integrity, reliability, and excellence, BTC has grown into a trusted name in the construction field.</p>
                  </div>
                  <div className="border-l-4 border-[var(--primary-color)] pl-4">
                    <h4 className="font-bold text-gray-800 uppercase">What We Do</h4>
                    <p className="text-sm text-gray-500">From residential homes to commercial buildings, we specialize in comprehensive construction services tailored to your needs.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gray-50">
        <div className="custom-container mx-auto px-4 space-y-32">
          {/* Vision */}
          <div className="flex flex-col lg:flex-row gap-16 items-center">
             <div className="w-full lg:w-1/2 space-y-6">
                <span className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">Our Vision</span>
                <h3 className="text-4xl font-bold text-gray-900 uppercase">Shaping the Future, One Structure at a Time</h3>
                <p className="text-gray-600 italic">To be a leader in the construction industry, recognized for innovation, sustainability, and unparalleled quality.</p>
                <Link href="/" className="inline-block bg-[var(--primary-color)] text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition">VIEW OUR SERVICES</Link>
             </div>
             <div className="w-full lg:w-1/2 relative">
                <div className="rounded-3xl overflow-hidden shadow-xl">
                  <img src="/assets/img/about/vission1.png" alt="Vision" className="w-full h-auto" />
                </div>
                <div className="absolute -top-10 -left-10 w-48 rounded-2xl overflow-hidden border-4 border-white shadow-xl hidden md:block">
                  <img src="/assets/img/about/vission2.png" alt="Vision Detail" />
                </div>
             </div>
          </div>

          {/* Mission */}
          <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
             <div className="w-full lg:w-1/2 space-y-6">
                <span className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest">Our Mission</span>
                <h3 className="text-4xl font-bold text-gray-900 uppercase">Building a Legacy of Excellence</h3>
                <p className="text-gray-600 italic">Our mission is to build not just structures, but relationships. We aim to exceed expectations by delivering projects on time and within budget.</p>
             </div>
             <div className="w-full lg:w-1/2 relative">
                <div className="rounded-3xl overflow-hidden shadow-xl">
                  <img src="/assets/img/about/mission1.png" alt="Mission" className="w-full h-auto" />
                </div>
                <div className="absolute -top-10 -right-10 w-48 rounded-2xl overflow-hidden border-4 border-white shadow-xl hidden md:block">
                  <img src="/assets/img/about/mission2.png" alt="Mission Detail" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20">
        <div className="custom-container mx-auto px-4 text-center space-y-12">
          <div className="space-y-4">
             <span className="text-[var(--primary-color)] font-bold uppercase tracking-widest text-sm">Our Professionals</span>
             <h2 className="text-4xl font-bold text-gray-900 uppercase">Meet Our Leadership</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
             {[
               { name: "Engr. Md. Shah Alom (Abir)", role: "Managing Director", img: "/assets/img/about/team1.png" },
               { name: "MD. Imran Hossain", role: "Executive Director", img: "/assets/img/about/team2.png" }
             ].map((member, i) => (
               <div key={i} className="space-y-6 group">
                 <div className="relative aspect-square rounded-[40px] overflow-hidden border-8 border-gray-50 group-hover:border-[var(--primary-color)] transition-all duration-500">
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-[var(--primary-color)] font-bold uppercase text-sm mt-1">{member.role}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-gray-50">
         <div className="custom-container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12">
               <div className="lg:w-2/3 space-y-12">
                  <div className="space-y-4">
                    <span className="bg-[var(--primary-color)] text-white px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Our Gallery</span>
                    <h2 className="text-4xl font-bold text-gray-900 uppercase max-w-lg">Our Journey in Pictures</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="aspect-square rounded-3xl overflow-hidden">
                      <img src="/assets/img/about/gallery1.png" className="w-full h-full object-cover hover:scale-110 transition duration-500" alt="Gallery 1" />
                    </div>
                    <div className="aspect-square rounded-3xl overflow-hidden">
                      <img src="/assets/img/about/gallery2.png" className="w-full h-full object-cover hover:scale-110 transition duration-500" alt="Gallery 2" />
                    </div>
                  </div>
               </div>
               <div className="lg:w-1/3 grid grid-cols-1 gap-6">
                  <div className="aspect-[4/3] lg:aspect-auto rounded-3xl overflow-hidden">
                    <img src="/assets/img/about/gallery3.png" className="w-full h-full object-cover hover:scale-110 transition duration-500" alt="Gallery 3" />
                  </div>
                  <div className="aspect-[4/3] lg:aspect-auto rounded-3xl overflow-hidden">
                    <img src="/assets/img/about/gallery4.png" className="w-full h-full object-cover hover:scale-110 transition duration-500" alt="Gallery 4" />
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
