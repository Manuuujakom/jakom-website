import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Briefcase, ReceiptText, Calculator, DollarSign, BarChart2, TrendingUp, Handshake } from 'lucide-react'; // Added more icons for detailed services

const AccountingBookkeeping = () => {
  const pageSectionsRef = useRef([]);
  const handlePageSectionIntersect = useCallback((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up-active');
        entry.target.classList.remove('opacity-0', 'translate-y-10');
        if (entry.target.intersectionObserver) {
          entry.target.intersectionObserver.unobserve(entry.target);
        }
      }
    });
  }, []);

  useEffect(() => {
    const currentPageSections = pageSectionsRef.current;
    const observer = new IntersectionObserver(handlePageSectionIntersect, {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    });

    currentPageSections.forEach(section => {
      if (section) {
        observer.observe(section);
        section.intersectionObserver = observer;
      }
    });

    return () => {
      currentPageSections.forEach(section => {
        if (section && section.intersectionObserver) {
          section.intersectionObserver.unobserve(section);
        }
      });
      observer.disconnect();
    };
  }, [handlePageSectionIntersect]);

  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
      <h1
        className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 opacity-0 translate-y-10 fade-in-up"
        ref={el => pageSectionsRef.current.push(el)}
      >
        Comprehensive Accounting & Bookkeeping Solutions
      </h1>
      <p
        className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 opacity-0 translate-y-10 fade-in-up"
        ref={el => pageSectionsRef.current.push(el)}
        style={{ animationDelay: '0.2s' }}
      >
        At JAKOM, we offer meticulous accounting and bookkeeping services designed to keep your finances in perfect order. From small businesses to growing enterprises, our tailored solutions provide the clarity, compliance, and strategic insights you need to thrive.
      </p>

      {/* Core Services Section */}
      <section className="py-12 w-full max-w-6xl">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-center text-[#F8F8F8] mb-12 opacity-0 translate-y-10 fade-in-up"
          ref={el => pageSectionsRef.current.push(el)}
          style={{ animationDelay: '0.4s' }}
        >
          Our Core Accounting Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service 1: Daily Transaction Recording */}
          <div
            className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '0.6s' }}
          >
            <div className="p-4 bg-[#4CAF50] text-[#0A1128] rounded-full mb-4">
              <ReceiptText size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Daily Transaction Recording</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Accurate and timely recording of all financial transactions to maintain up-to-date ledgers and journals.
            </p>
          </div>

          {/* Service 2: Bank Reconciliation */}
          <div
            className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '0.8s' }}
          >
            <div className="p-4 bg-[#4CAF50] text-[#0A1128] rounded-full mb-4">
              <DollarSign size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Bank & Credit Card Reconciliation</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Matching your bank and credit card statements to your internal records, ensuring accuracy and detecting discrepancies.
            </p>
          </div>

          {/* Service 3: Accounts Payable & Receivable Management */}
          <div
            className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '1.0s' }}
          >
            <div className="p-4 bg-[#4CAF50] text-[#0A1128] rounded-full mb-4">
              <Handshake size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Accounts Management</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Efficiently manage your invoices, payments, and receivables to optimize cash flow and maintain healthy vendor/client relationships.
            </p>
          </div>

          {/* Service 4: Financial Reporting */}
          <div
            className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '1.2s' }}
          >
            <div className="p-4 bg-[#4CAF50] text-[#0A1128] rounded-full mb-4">
              <BarChart2 size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Custom Financial Reporting</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Generate insightful reports (Income Statements, Balance Sheets, Cash Flow) for clear financial performance visibility.
            </p>
          </div>

          {/* Service 5: Payroll Processing */}
          <div
            className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '1.4s' }}
          >
            <div className="p-4 bg-[#4CAF50] text-[#0A1128] rounded-full mb-4">
              <Users size={48} /> {/* Using Users icon for Payroll */}
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Payroll Processing</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Accurate and compliant payroll services, including salary calculations, tax withholdings, and pay stub generation.
            </p>
          </div>

          {/* Service 6: Tax Preparation Support */}
          <div
            className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '1.6s' }}
          >
            <div className="p-4 bg-[#4CAF50] text-[#0A1128] rounded-full mb-4">
              <TrendingUp size={48} /> {/* Using TrendingUp for Tax */}
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Tax Preparation Support</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Assistance with gathering and organizing financial data, ensuring readiness for tax filings.
            </p>
          </div>
        </div>
      </section>

      {/* Essential Accounting Tools Section (from your original code) */}
      <section className="py-12 w-full max-w-6xl">
        <h2
          className="text-4xl md:text-5xl font-extrabold text-center text-[#F8F8F8] mb-12 opacity-0 translate-y-10 fade-in-up"
          ref={el => pageSectionsRef.current.push(el)}
          style={{ animationDelay: '1.8s' }}
        >
          Essential Accounting Tools We Utilize
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Tool 1: Spreadsheet Software */}
          <div
            className="bg-[#0A1128] border border-[#C9B072] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '2.0s' }}
          >
            <div className="p-4 bg-[#4CAF50] text-[#0A1128] rounded-full mb-4">
              <FileSpreadsheet size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Spreadsheet Software</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Leveraging powerful tools like Excel and Google Sheets for detailed financial analysis, budgeting, and custom reporting.
            </p>
          </div>

          {/* Tool 2: Cloud Accounting Platforms */}
          <div
            className="bg-[#0A1128] border border-[#C9B072] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '2.2s' }}
          >
            <div className="p-4 bg-[#C9B072] text-[#0A1128] rounded-full mb-4">
              <Briefcase size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Cloud Accounting Platforms</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Proficient in industry-leading software like QuickBooks Online and Xero for seamless financial management and collaboration.
            </p>
          </div>

          {/* Tool 3: Expense Tracking & Payroll Systems */}
          <div
            className="bg-[#0A1128] border border-[#C9B072] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '2.4s' }}
          >
            <div className="p-4 bg-[#4CAF50] text-[#0A1128] rounded-full mb-4">
              <ReceiptText size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Expense & Payroll Management</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Streamlining your expense reports and payroll processing with integrated and efficient systems.
            </p>
          </div>

            {/* Tool 4: Financial Calculators / Analysis Tools (Optional, demonstrating more tools) */}
            <div
            className="bg-[#0A1128] border border-[#C9B072] rounded-xl p-8 flex flex-col items-center text-center shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl opacity-0 translate-y-10 fade-in-up"
            ref={el => pageSectionsRef.current.push(el)}
            style={{ animationDelay: '2.6s' }}
          >
            <div className="p-4 bg-[#C9B072] text-[#0A1128] rounded-full mb-4">
              <Calculator size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-3">Financial Planning Tools</h3>
            <p className="text-[#CCD2E3] text-lg leading-relaxed">
              Utilizing specialized calculators and analysis tools for forecasting, tax planning, and investment insights.
            </p>
          </div>
        </div>
      </section>

      {/* Back button */}
      <Link to="/" className="mt-12 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up" style={{ animationDelay: '2.8s' }}>
        Back to Home
      </Link>
    </div>
  );
};

export default AccountingBookkeeping;
