import React from 'react';
import { Mail, MessageSquare } from 'lucide-react'; // Import icons for the form fields

const VirtualAssistance = () => {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 animate-fade-in-up">
        Virtual Assistance Services
      </h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Offload your administrative tasks to our skilled virtual assistants and reclaim your valuable time. We provide reliable and efficient support tailored to your business needs, enabling you to focus on core operations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl">
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Admin" alt="Admin Support" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Administrative Support</h3>
            <p className="text-[#CCD2E3]">Email management, scheduling, data entry, and more.</p>
        </div>
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Social" alt="Social Media" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Social Media Management</h3>
            <p className="text-[#CCD2E3]">Content scheduling and engagement for your online presence.</p>
        </div>
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Customer" alt="Customer Service" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Customer Service</h3>
            <p className="text-[#CCD2E3]">Professional and timely customer support.</p>
        </div>
      </div>

      {/* "How Can We Assist?" Section */}
      <section className="mt-20 w-full max-w-2xl bg-[#0A1128] border border-[#C9B072] rounded-xl p-8 shadow-2xl animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
        <h2 className="text-4xl font-extrabold text-[#F8F8F8] mb-8 text-center">
          How Can We Assist You?
        </h2>
        <p className="text-lg text-[#CCD2E3] mb-8 text-center">
          Have specific needs or questions about our virtual assistance services? Fill out the form below, and we'll get back to you promptly.
        </p>
        <form
          action="https://formspree.io/f/YOUR_FORMSPREE_ENDPOINT_HERE" // <--- REPLACE THIS WITH YOUR ACTUAL FORMSPREE ENDPOINT
          method="POST"
          className="space-y-6 text-left"
        >
          <div>
            <label htmlFor="email" className="block text-xl font-medium text-[#F8F8F8] mb-2">
              <Mail className="inline-block mr-2 text-[#4CAF50]" size={20} /> Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="your.email@example.com"
              className="w-full p-4 rounded-lg bg-[#1E2749] text-[#F8F8F8] border border-[#C9B072] focus:border-[#4CAF50] focus:ring focus:ring-[#4CAF50] focus:ring-opacity-50 transition duration-200"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-xl font-medium text-[#F8F8F8] mb-2">
              <MessageSquare className="inline-block mr-2 text-[#4CAF50]" size={20} /> How can we help?
            </label>
            <textarea
              id="message"
              name="message"
              rows="6"
              required
              placeholder="Describe your virtual assistance needs or questions here..."
              className="w-full p-4 rounded-lg bg-[#1E2749] text-[#F8F8F8] border border-[#C9B072] focus:border-[#4CAF50] focus:ring focus:ring-[#4CAF50] focus:ring-opacity-50 transition duration-200"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full px-8 py-4 bg-[#4CAF50] text-[#0A1128] font-bold text-xl rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 flex items-center justify-center space-x-2"
          >
            Send Inquiry
          </button>
        </form>
      </section>

      <button onClick={() => window.history.back()} className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
        Back to Home
      </button>
    </div>
  );
};

export default VirtualAssistance;
