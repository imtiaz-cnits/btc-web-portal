"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import ContactForm from "@/components/ContactForm";

const ContactInfoItem = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="flex items-start gap-6 group">
    <div className="w-14 h-14 bg-[var(--shade-1)] rounded-2xl flex items-center justify-center text-[var(--primary-color)] group-hover:bg-[var(--primary-color)] group-hover:text-white transition duration-500 shadow-sm">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</h4>
      <div className="text-gray-800 font-medium leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

export default function ContactPage() {
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
                  <span>Contact Us</span>
                </div>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight uppercase"
              >
                Let's Build <br/> 
                <span className="text-[var(--primary-color)]">Something Great</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-lg leading-relaxed max-w-xl italic"
              >
                We pride ourselves on quality craftsmanship and timely delivery. Let's build your dream project—get in touch with us today!
              </motion.p>
            </div>
            <div className="w-full lg:w-1/2">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="rounded-[40px] overflow-hidden shadow-2xl border-8 border-white"
               >
                 <img src="/assets/img/contact/contact-theame-image.png" alt="Contact BTC" className="w-full h-auto object-cover" />
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="custom-container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Left: Contact Info */}
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-bold text-gray-900 uppercase">Get in Touch</h2>
                  <p className="text-gray-600">Our dedicated team is ready to assist you with any inquiries regarding our construction and consultancy services.</p>
               </div>

               <div className="space-y-8">
                  <ContactInfoItem 
                    title="Phone Number"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
                  >
                    <div className="flex flex-col gap-2">
                       <a href="tel:+8801711805086" className="hover:text-[var(--primary-color)] transition">
                         <span className="font-bold">Abir:</span> +88 01711 805 086
                       </a>
                       <a href="tel:+8801711010929" className="hover:text-[var(--primary-color)] transition">
                         <span className="font-bold">Imran:</span> +88 01711 010 929
                       </a>
                    </div>
                  </ContactInfoItem>

                  <ContactInfoItem 
                    title="E-mail Address"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                  >
                    <div className="flex flex-col gap-2">
                       <a href="mailto:salom@egpbtc.com" className="hover:text-[var(--primary-color)] transition underline">salom@egpbtc.com</a>
                       <a href="mailto:imran@egpbtc.com" className="hover:text-[var(--primary-color)] transition underline">imran@egpbtc.com</a>
                    </div>
                  </ContactInfoItem>

                  <ContactInfoItem 
                    title="Office Location"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
                  >
                    <p>L.M.B Market (1st Floor) Abdul Hamid Road, Pabna, Bangladesh</p>
                  </ContactInfoItem>
               </div>
            </div>

            {/* Right: Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[500px] w-full bg-gray-200">
         <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d276.16306301292224!2d89.23473346889256!3d24.0050804316098!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fe9b5f6483c075%3A0x1393742004b5e76f!2sBUILDING%20TECNOLOGY%20%26%20CONSULTANT!5e0!3m2!1sen!2sbd!4v1750881488098!5m2!1sen!2sbd"
            className="w-full h-full border-0 grayscale hover:grayscale-0 transition duration-1000"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
      </section>
    </div>
  );
}
