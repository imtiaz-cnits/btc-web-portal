"use client";

import { useState } from "react";
import { sendContactMessage } from "@/app/actions/contact";
import { motion } from "framer-motion";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const result = await sendContactMessage(formData);

    if (result.success) {
      setStatus({ type: "success", text: result.message });
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus({ type: "error", text: result.message });
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 uppercase mb-8 text-center">Send Us a Message</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Full Name</label>
          <input 
            type="text" 
            name="name" 
            required 
            placeholder="Your name"
            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 outline-none focus:border-[var(--primary-color)] transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Email Address</label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="Your email"
            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 outline-none focus:border-[var(--primary-color)] transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Message</label>
          <textarea 
            name="message" 
            required 
            rows={4}
            placeholder="How can we help you?"
            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 outline-none focus:border-[var(--primary-color)] transition resize-none"
          ></textarea>
        </div>

        {status.text && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-sm font-medium text-center ${
              status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {status.text}
          </motion.div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[var(--text-1)] text-white font-bold py-4 rounded-2xl hover:bg-[var(--primary-color)] transition duration-300 shadow-lg shadow-gray-200 disabled:opacity-50"
        >
          {loading ? "SENDING..." : "SEND MESSAGE"}
        </button>
      </form>
    </div>
  );
}
