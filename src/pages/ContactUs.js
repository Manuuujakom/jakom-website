// src/pages/ContactUs.js
import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';

const ContactUsPage = () => {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] flex flex-col items-center justify-center py-16 px-6">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-8 text-center">
        Contact Us
      </h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl text-center leading-relaxed mb-12">
        This is the Contact Us page. We'd love to hear from you! Reach out through the following channels:
      </p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl">
        {/* Email Card */}
        <div className="bg-[#1A2542] p-8 rounded-xl shadow-lg border border-[#C9B072] flex flex-col items-center text-center w-full md:w-1/3 min-w-[250px] break-words">
          <Mail size={48} className="text-[#4CAF50] mb-4" />
          <h2 className="text-2xl font-bold text-[#F8F8F8] mb-2">Email</h2>
          <a href="mailto:emmanuelomondiobare@gmail.com" className="text-[#CCD2E3] hover:text-[#C9B072] transition duration-300 break-all">
            emmanuelomondiobare@gmail.com
          </a>
        </div>

        {/* Phone Card */}
        <div className="bg-[#1A2542] p-8 rounded-xl shadow-lg border border-[#C9B072] flex flex-col items-center text-center w-full md:w-1/3 min-w-[250px] break-words">
          <Phone size={48} className="text-[#4CAF50] mb-4" />
          <h2 className="text-2xl font-bold text-[#F8F8F8] mb-2">Phone</h2>
          <a href="tel:+254794255000" className="text-[#CCD2E3] hover:text-[#C9B072] transition duration-300 break-all">
            +254 794 255000
          </a>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-[#1A2542] p-8 rounded-xl shadow-lg border border-[#C9B072] flex flex-col items-center text-center w-full md:w-1/3 min-w-[250px] break-words">
          <MessageSquare size={48} className="text-[#4CAF50] mb-4" />
          <h2 className="text-2xl font-bold text-[#F8F8F8] mb-2">WhatsApp</h2>
          <a href="https://wa.me/254794255000" target="_blank" rel="noopener noreferrer" className="text-[#CCD2E3] hover:text-[#C9B072] transition duration-300">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
