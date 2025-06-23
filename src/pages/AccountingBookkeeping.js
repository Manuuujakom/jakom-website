import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Briefcase, ReceiptText, Calculator, DollarSign, BarChart2, TrendingUp, Handshake, Users } from 'lucide-react';

const AccountingBookkeeping = () => {
  const pageSectionsRef = useRef([]);

  const collectRefs = useCallback((el) => {
    if (el && !pageSectionsRef.current.includes(el)) {
      pageSectionsRef.current.push(el);
    }
  }, []);

  const handlePageSectionIntersect = useCallback((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up-active');
        entry.target.classList.remove('opacity-0', 'translate-y-10');
        observer.unobserve(entry.target);
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handlePageSectionIntersect, {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    });

    pageSectionsRef.current.forEach(section => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      pageSectionsRef.current.forEach(section => {
        if (section) {
          observer.unobserve(section);
        }
      });
      observer.disconnect();
    };
  }, [handlePageSectionIntersect]);

  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
      <h1
        className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 opacity-0 translate-y-10 fade-in-up"
        ref={collectRefs}
        style={{ '--animation-delay': '0s' }}
      >
        Comprehensive Accounting & Bookkeeping Solutions
      </h1>
      <p
        className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 opacity-0 translate-y-10 fade-in-up"
        ref={collectRefs}
        style={{ '--animation-delay': '0.2s' }}
      >
        At JAKOM, we offer meticulous accounting and bookkeeping services designed to keep your finances in perfect order...
      </p>

      <section className="py-12 w-full max-w-6xl">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-center text-[#F8F8F8] mb-12 opacity-0 translate-y-10 fade-in-up"
          ref={collectRefs}
          style={{ '--animation-delay': '0.4s' }}
        >
          Our Core Accounting Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { Icon: ReceiptText, title: "Daily Transaction Recording", delay: "0.6s", text: "Accurate and timely recording..." },
            { Icon: DollarSign, title: "Bank & Credit Card Reconciliation", delay: "0.8s", text: "Matching your bank and credit..." },
            { Icon: Handshake, title: "Accounts Management", delay: "1.0s", text: "Efficiently manage your invoices..." },
            { Icon: BarChart2, title: "Custom Financial Reporting", delay: "1.2s", text: "Generate insightful reports..." },
            { Icon: Users, title: "Payroll Processing", delay: "1.4s", text: "Accurate and compliant payroll..." },
            { Icon: TrendingUp, title: "Tax Preparation Support", delay: "1.6s", text: "Assistance with gathering..." },
          ].map(({ Icon, title, delay, text }, idx) => (
            <div
              key={idx}
              className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
              ref={collectRefs}
              style={{ '--animation-delay': delay }}
            >
              <div className="p-4 bg-[#4CAF50] text-[#0A1128] rounded-full mb-4">
                <Icon size={48} />
              </div>
              <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">{title}</h3>
              <p className="text-[#CCD2E3] text-lg leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 w-full max-w-6xl">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-center text-[#F8F8F8] mb-12 opacity-0 translate-y-10 fade-in-up"
          ref={collectRefs}
          style={{ '--animation-delay': '1.8s' }}
        >
          Essential Accounting Tools We Utilize
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { Icon: FileSpreadsheet, title: "Spreadsheet Software", delay: "2.0s", bg: "#4CAF50" },
            { Icon: Briefcase, title: "Cloud Accounting Platforms", delay: "2.2s", bg: "#C9B072" },
            { Icon: ReceiptText, title: "Expense & Payroll Management", delay: "2.4s", bg: "#4CAF50" },
            { Icon: Calculator, title: "Financial Planning Tools", delay: "2.6s", bg: "#C9B072" },
          ].map(({ Icon, title, delay, bg }, idx) => (
            <div
              key={idx}
              className="bg-[#0A1128] border border-[#C9B072] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
              ref={collectRefs}
              style={{ '--animation-delay': delay }}
            >
              <div className="p-4" style={{ backgroundColor: bg, color: '#0A1128', borderRadius: '9999px', marginBottom: '1rem' }}>
                <Icon size={48} />
              </div>
              <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">{title}</h3>
              <p className="text-[#CCD2E3] text-lg leading-relaxed">
                {/* Sample filler text for clarity */}
                Efficient and modern tools tailored for smarter financial workflows.
              </p>
            </div>
          ))}
        </div>
      </section>

      <Link
        to="/"
        className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 fade-in-up opacity-0 translate-y-10"
        ref={collectRefs}
        style={{ '--animation-delay': '2.8s' }}
      >
        Back to Home
      </Link>
    </div>
  );
};

export default AccountingBookkeeping;
