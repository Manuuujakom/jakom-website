import React, { useState, useEffect, useRef, useCallback } from 'react';
// Import routing components: BrowserRouter (aliased as Router), Routes, and Route, Link
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BarChart2, DollarSign, Headset, Paintbrush, Code, Info, Users, School, Home, Mail, Phone, MessageSquare, Smartphone } from 'lucide-react';

// --- Placeholder Page Components ---
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
    <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6">{title}</h1>
    <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10">
      Content for {title} will go here.
    </p>
    <Link to="/" className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90">
      Back to Home
    </Link>
  </div>
);

const GraphicsDesign = () => <PlaceholderPage title="Graphics & Design" />;
const DataAnalysis = () => <PlaceholderPage title="Data Analysis" />;
const AccountingBookkeeping = () => <PlaceholderPage title="Accounting & Bookkeeping" />;
const VirtualAssistance = () => <PlaceholderPage title="Virtual Assistance" />;
const KidsHub = () => <PlaceholderPage title="Kids Hub" />;
const AboutUs = () => <PlaceholderPage title="AboutUs" />;

// Custom functional component for a Service Card
// This component now manages its own visibility animation using IntersectionObserver
// Added 'path' prop to link to the respective service page
const ServiceCard = ({ icon: Icon, title, description, delay, path }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null); // Ref for this specific card

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If the card is intersecting (entering the viewport)
          if (entry.isIntersecting) {
            setIsVisible(true); // Set state to true to trigger animation
            observer.unobserve(entry.target); // Stop observing once it's visible
          }
        });
      },
      {
        root: null, // Observe against the viewport
        rootMargin: '0px',
        threshold: 0.2, // Trigger when 20% of the item is visible
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    // Cleanup function: disconnect the observer when the component unmounts
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <Link to={path} className="block"> {/* Changed to Link */}
      <div
        ref={cardRef} // Attach the local ref to this div
        // Conditional classes: initial hidden state, then transition to visible
        className={`
          bg-[#0A1128] border border-[#C9B072] rounded-xl p-8 flex flex-col items-center text-center shadow-lg
          transition-all duration-700 ease-out transform
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          hover:scale-105 hover:shadow-2xl
        `}
        // The delay is now applied to the transition itself, for cumulative effect per card
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="p-4 bg-[#C9B072] text-[#0A1128] rounded-full mb-4 inline-flex items-center justify-content-center">
          {/* Render the Lucide Icon component passed as a prop */}
          <Icon size={48} />
        </div>
        <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">{title}</h3>
        <p className="text-[#CCD2E3] text-lg leading-relaxed">{description}</p>
        {/* The 'Learn More' button is now part of the clickable card via the outer Link */}
        <div className="mt-6 px-6 py-3 bg-[#4CAF50] text-[#F8F8F8] font-semibold rounded-full hover:bg-opacity-90 transition duration-300 transform hover:scale-105 shadow-md">
          Learn More
        </div>
      </div>
    </Link>
  );
};

// Main App Component
const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to toggle mobile navigation menu state
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Use a Set to store references for general app sections.
  // A Set automatically handles unique elements, simplifying addition and removal.
  const observedSections = useRef(new Set());

  // Callback ref function to add/remove elements from the Set
  const setSectionRef = useCallback((node) => {
    if (node) {
      observedSections.current.add(node);
    } else {
      // This 'else' part is for cleanup when a component unmounts.
      // It helps prevent observing stale nodes, though less critical
      // for static content on a single-page app's main route.
      // For this particular setup, with a single observer managing multiple refs,
      // the `useEffect` cleanup (disconnecting the observer) is primary.
    }
  }, []); // No dependencies, so this function is stable across renders

  const handleAppSectionIntersect = useCallback((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up-active');
        // Unobserve the element once it has animated to prevent re-triggering
        // We stored the observer instance on the element when observing.
        if (entry.target.currentObserver) {
          entry.target.currentObserver.unobserve(entry.target);
        }
      }
    });
  }, []); // No dependencies, so this callback is stable

  useEffect(() => {
    const observer = new IntersectionObserver(handleAppSectionIntersect, {
      root: null, // Observe against the viewport
      rootMargin: '0px',
      threshold: 0.1 // Lowered threshold slightly to ensure earlier detection
    });

    // Observe all elements currently in the Set
    observedSections.current.forEach(section => {
      if (section) {
        observer.observe(section);
        // Store the observer instance on the DOM element itself.
        // This allows us to specifically unobserve *that* element later if needed.
        section.currentObserver = observer;
      }
    });

    // Cleanup function for the useEffect hook:
    return () => {
      // Before unmounting, unobserve all elements that were being observed by THIS observer instance.
      observedSections.current.forEach(section => {
        if (section && section.currentObserver) { // Check if the element was indeed observed by this specific observer
          section.currentObserver.unobserve(section);
        }
      });
      observer.disconnect(); // Disconnect the observer completely
      observedSections.current.clear(); // Clear the Set to prevent stale references
    };
  }, [handleAppSectionIntersect]); // Re-run effect if handleAppSectionIntersect changes (though it's useCallback, so it won't)


  return (
    <Router> {/* Wrap the entire application in BrowserRouter */}
      <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] font-sans overflow-x-hidden">

        <style>
          {`
          html, body { height: 100%; }
          body { font-family: 'Inter', sans-serif; margin: 0; background-color: #0A1128; color: #F8F8F8; overflow-x: hidden; }
          .jo-logo-container { position: relative; width: 500px; max-width: 90%; height: auto; aspect-ratio: 500 / 300; overflow: hidden; margin-left: auto; margin-right: auto; }
          .jo-logo { animation: logoReveal 3s ease-out forwards; transform-origin: center; opacity: 0; width: 100%; height: 100%; object-fit: contain; }
          @keyframes logoReveal { 0% { opacity: 0; transform: scale(0.7) translateY(20px); } 50% { opacity: 1; transform: scale(1.05) translateY(-5px); } 100% { opacity: 1; transform: scale(1); } }
          .hero-text-animate { animation: textFadeIn 2s ease-out forwards; opacity: 0; transform: translateY(20px); }
          @keyframes textFadeIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          /* Optimized fade-in-up for generic sections */
          /* Ensures initial hidden state for elements that will be observed */
          .fade-in-up {
            opacity: 0;
            transform: translateY(20px); /* Initial hidden state */
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
          }
          .fade-in-up-active { /* State when element is visible */
            opacity: 1;
            transform: translateY(0);
          }
          .shimmer-text { position: relative; display: inline-block; overflow: hidden; }
          .shimmer-text::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shimmer 3s infinite; }
          @keyframes shimmer { 0% { left: -100%; } 50% { left: 100%; } 100% { left: -100%; } }
          .bg-particles::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at top left, rgba(201, 176, 114, 0.1) 0%, transparent 50%), radial-gradient(circle at bottom right, rgba(76, 175, 80, 0.1) 0%, transparent 50%); animation: bgPulse 15s infinite alternate ease-in-out; z-index: -1; }
          @keyframes bgPulse { 0% { opacity: 0.7; transform: scale(1); } 100% { opacity: 1; transform: scale(1.02); } }
          button, a { min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; }
          nav a { min-width: unset; min-height: unset; }
          `}
        </style>

        {/* Header Section (remains outside of Routes as it's common to all pages) */}
        <header className="relative z-50 bg-[#0A1128] py-4 shadow-xl">
          <nav className="container mx-auto px-6 flex items-center justify-between">
            {/* Logo - Use Link to navigate to the home page */}
            <Link to="/" className="text-[#C9B072] text-4xl font-extrabold tracking-tight">
              <img src="https://i.imgur.com/zWVSml6.png" alt="JAKOM Logo" className="h-12 w-auto object-contain" />
            </Link>

            {/* Desktop Navigation - Use Link components */}
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center"><Home className="mr-2" size={20} />Home</Link>
              <Link to="/graphics-design" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center"><Paintbrush className="mr-2" size={20} />Graphics & Design</Link>
              <Link to="/data-analysis" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center"><BarChart2 className="mr-2" size={20} />Data Analysis</Link>
              <Link to="/accounting-bookkeeping" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center"><DollarSign className="mr-2" size={20} />Accounting & Bookkeeping</Link>
              <Link to="/virtual-assistance" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center"><Headset className="mr-2" size={20} />Virtual Assistance</Link>
              <Link to="/kids-hub" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center"><School className="mr-2" size={20} />Kids Hub</Link>
              <Link to="/about-us" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center"><Info className="mr-2" size={20} />About Us</Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={toggleMobileMenu} className="text-[#F8F8F8] focus:outline-none">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile Navigation - Use Link components and close menu on click */}
          <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-[#0A1128] py-4`}>
            <div className="flex flex-col items-center space-y-4">
              <Link to="/" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center" onClick={toggleMobileMenu}><Home className="mr-2" size={20} />Home</Link>
              <Link to="/graphics-design" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center" onClick={toggleMobileMenu}><Paintbrush className="mr-2" size={20} />Graphics & Design</Link>
              <Link to="/data-analysis" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center" onClick={toggleMobileMenu}><BarChart2 className="mr-2" size={20} />Data Analysis</Link>
              <Link to="/accounting-bookkeeping" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center" onClick={toggleMobileMenu}><DollarSign className="mr-2" size={20} />Accounting & Bookkeeping</Link>
              <Link to="/virtual-assistance" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center" onClick={toggleMobileMenu}><Headset className="mr-2" size={20} />Virtual Assistance</Link>
              <Link to="/kids-hub" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center" onClick={toggleMobileMenu}><School className="mr-2" size={20} />Kids Hub</Link>
              <Link to="/about-us" className="text-[#F8F8F8] hover:text-[#C9B072] transition duration-300 text-lg flex items-center" onClick={toggleMobileMenu}><Info className="mr-2" size={20} />About Us</Link>
            </div>
          </div>
        </header>

        {/* Define Routes for different pages. The content within <Routes> will change based on the URL. */}
        <Routes>
          {/* Home Page Route - Renders all original sections of the home page */}
          <Route path="/" element={
            <> {/* Use a React Fragment to group multiple elements for the home page route */}
              <section className="relative h-screen flex flex-col justify-center items-center text-center px-6 bg-[#0A1128] overflow-hidden bg-particles">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-rgba(201, 176, 114, 0.05) to-transparent pointer-events-none"></div>
                  <div className="relative z-10 max-w-4xl mx-auto pb-16">
                      <div className="jo-logo-container mx-auto">
                          <img
                              src="https://i.imgur.com/zWVSml6.png"
                              alt="JAKOM Logo"
                              className="jo-logo"
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/500x300/0A1128/C9B072?text=Logo+Missing'; }}
                          />
                      </div>
                      <h1 className="text-6xl md:text-7xl font-extrabold text-[#F8F8F8] leading-tight mt-8 mb-4 hero-text-animate">
                          JAKOM: Your <span className="shimmer-text text-[#C9B072]">One-Stop</span> Tech Solution
                      </h1>
                      <p className="text-xl md:text-2xl text-[#CCD2E3] mb-8 hero-text-animate" style={{ animationDelay: '2.5s' }}>
                          Empowering Your Business with Seamless Integration and Expert Support.
                      </p>
                      <button className="px-10 py-4 bg-[#4CAF50] text-[#F8F8F8] font-semibold text-xl rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 hero-text-animate" style={{ animationDelay: '3s' }}>
                          Get Started Today
                      </button>
                  </div>
              </section>

              <section className="py-20 bg-[#0A1128] container mx-auto px-6">
                  {/* Apply fade-in-up class and the callback ref */}
                  <h2 className="text-5xl font-extrabold text-center text-[#F8F8F8] mb-16 fade-in-up" ref={setSectionRef}>
                      Our Integrated Services
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                      {/* ServiceCards have their own internal Intersection Observers */}
                      <ServiceCard icon={Paintbrush} title="Graphics & Design" description="Stunning visuals that capture attention and communicate your brand's unique story effectively." delay={0} path="/graphics-design" />
                      <ServiceCard icon={BarChart2} title="Data Analysis" description="Unlock actionable insights from your data to drive informed decisions and strategic growth." delay={100} path="/data-analysis" />
                      <ServiceCard icon={DollarSign} title="Accounting & Bookkeeping" description="Expert financial management to ensure accuracy, compliance, and peace of mind." delay={200} path="/accounting-bookkeeping" />
                      <ServiceCard icon={Headset} title="Virtual Assistance" description="Efficient administrative support, freeing your time to focus on core business activities." delay={300} path="/virtual-assistance" />
                  </div>
              </section>

              <section className="py-20 bg-[#0A1128] border-t border-[#C9B072] container mx-auto px-6">
                  <div className="flex flex-col md:flex-row items-center gap-12">
                      {/* Apply fade-in-up class and the callback ref */}
                      <div className="md:w-1/2 flex justify-center fade-in-up" ref={setSectionRef}>
                          <img src="https://placehold.co/500x350/0A1128/4CAF50?text=Kids+Hub+Fun" alt="Kids Hub" className="rounded-xl shadow-2xl object-cover" />
                      </div>
                      {/* Apply fade-in-up class and the callback ref */}
                      <div className="md:w-1/2 text-center md:text-left fade-in-up" ref={setSectionRef}>
                          <h2 className="text-5xl font-extrabold text-[#F8F8F8] mb-6">
                              Empowering the Next Generation: <span className="text-[#4CAF50]">Kids Hub</span>
                          </h2>
                          <p className="text-xl text-[#CCD2E3] leading-relaxed mb-8">
                              At JAKOM, we believe in nurturing talent from a young age. Our Kids Hub offers engaging and interactive programs designed to introduce children to the exciting world of technology, creativity, and problem-solving. Spark curiosity and build foundational skills for a brighter future!
                          </p>
                          {/* This button on the home page specifically links to the Kids Hub page */}
                          <Link to="/kids-hub" className="px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 inline-flex items-center justify-content-center">
                              Explore Kids Hub
                          </Link>
                      </div>
                  </div>
              </section>

              <section className="py-20 bg-[#0A1128] border-t border-[#C9B072] container mx-auto px-6">
                  <div className="max-w-3xl mx-auto text-center">
                      {/* Apply fade-in-up class and the callback ref */}
                      <h2 className="text-5xl font-extrabold text-[#F8F8F8] mb-6 fade-in-up" ref={setSectionRef}>
                          About JAKOM
                      </h2>
                      {/* Apply fade-in-up class and the callback ref */}
                      <p className="text-xl text-[#CCD2E3] leading-relaxed mb-8 fade-in-up" ref={setSectionRef}>
                          JAKOM is more than just a service provider; we are your dedicated partner in navigating the complexities of modern business. Our mission is to simplify operations, enhance efficiency, and foster growth for enterprises of all sizes through innovative tech solutions and unparalleled expertise. We pride ourselves on delivering integrated services that truly make a difference.
                      </p>
                      {/* This button on the home page specifically links to the About Us page */}
                      <Link to="/about-us" className="px-8 py-3 bg-[#4CAF50] text-[#F8F8F8] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 inline-flex items-center justify-content-center">
                          Read Our Full Story
                      </Link>
                  </div>
              </section>

              <section className="py-20 bg-[#0A1128] border-t border-[#C9B072] text-center px-6">
                  {/* Apply fade-in-up class and the callback ref */}
                  <h2 className="text-5xl font-extrabold text-[#F8F8F8] mb-6 fade-in-up" ref={setSectionRef}>
                      Ready to Elevate Your Business?
                  </h2>
                  {/* Apply fade-in-up class and the callback ref */}
                  <p className="text-xl text-[#CCD2E3] mb-10 fade-in-up" ref={setSectionRef}>
                      Let's discuss how JAKOM's comprehensive solutions can empower your success.
                  </p>
                  {/* Apply fade-in-up class and the callback ref */}
                  <Link to="/contact-us" className="px-12 py-4 bg-[#C9B072] text-[#0A1128] font-bold text-xl rounded-full shadow-2xl transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-pulse fade-in-up inline-flex items-center justify-content-center" ref={setSectionRef}>
                      Contact Us Now
                  </Link>
              </section>
            </>
          } />

          {/* Routes for other pages */}
          <Route path="/graphics-design" element={<GraphicsDesign />} />
          <Route path="/data-analysis" element={<DataAnalysis />} />
          <Route path="/accounting-bookkeeping" element={<AccountingBookkeeping />} />
          <Route path="/virtual-assistance" element={<VirtualAssistance />} />
          <Route path="/kids-hub" element={<KidsHub />} />
          <Route path="/about-us" element={<AboutUs />} />
          {/* Updated Contact Us page with direct contact options */}
          <Route path="/contact-us" element={
            <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6">Get in Touch with JAKOM</h1>
              <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10">
                We're here to help you elevate your business. Choose your preferred method to connect:
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 mt-8">
                {/* Email Link */}
                <a
                  href="mailto:emmanuelomondiobare@gmail.com?subject=Inquiry from JAKOM Website"
                  className="px-6 py-3 bg-[#4CAF50] text-[#F8F8F8] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 flex items-center space-x-2 w-full sm:w-auto"
                >
                  <Mail size={24} />
                  <span>Email Us</span>
                </a>

                {/* Phone Call Link */}
                <a
                  href="tel:+254794255000"
                  className="px-6 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 flex items-center space-x-2 w-full sm:w-auto"
                >
                  <Phone size={24} />
                  <span>Call Us</span>
                </a>

                {/* SMS Link */}
                <a
                  href="sms:+254794255000?body=Hello JAKOM, I have an inquiry from your website."
                  className="px-6 py-3 bg-[#0A1128] border border-[#C9B072] text-[#F8F8F8] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 w-full sm:w-auto"
                >
                  <MessageSquare size={24} />
                  <span>Send SMS</span>
                </a>

                {/* WhatsApp Link */}
                <a
                  href="https://wa.me/254794255000?text=Hello%20JAKOM,%20I%20have%20an%20inquiry%20from%20your%20website."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#25D366] text-white font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 flex items-center space-x-2 w-full sm:w-auto"
                >
                  <Smartphone size={24} />
                  <span>WhatsApp Us</span>
                </a>
              </div>
              <Link to="/" className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90">
                Back to Home
              </Link>
            </div>
          } />
        </Routes>

        {/* Footer (remains outside of Routes as it's common to all pages) */}
        <footer className="bg-[#0A1128] border-t border-[#C9B072] py-8 text-center text-[#CCD2E3] text-lg">
          <div className="container mx-auto px-6">
            <p>&copy; {new Date().getFullYear()} JAKOM. All rights reserved.</p>
            <div className="flex justify-center space-x-6 mt-4">
              {/* Added Email Icon */}
              <a href="mailto:emmanuelomondiobare@gmail.com" className="hover:text-[#C9B072] transition duration-300" aria-label="Email Us">
                <Mail size={24} />
              </a>
              {/* Added WhatsApp Icon */}
              <a href="https://wa.me/254794255000" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9B072] transition duration-300" aria-label="WhatsApp Us">
                <Smartphone size={24} />
              </a>
              {/* Original placeholders, kept for context unless explicitly removed */}
              <a href="https://example.com/users" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9B072] transition duration-300"><Users size={24} /></a>
              <a href="https://example.com/code" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9B072] transition duration-300"><Code size={24} /></a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
