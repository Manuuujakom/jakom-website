import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router'; // For navigation

// --- Calculator Component ---
const Calculator = () => {
    const [input, setInput] = useState('0'); // Current number displayed/being entered
    const [currentOperand, setCurrentOperand] = useState(null); // Result of previous operation
    const [previousOperand, setPreviousOperand] = useState(null); // First operand for calculation
    const [operation, setOperation] = useState(null); // Current arithmetic operation
    const [overwrite, setOverwrite] = useState(true); // Flag to overwrite input on new number entry

    // Clears all calculator state
    const clear = () => {
        setInput('0');
        setCurrentOperand(null);
        setPreviousOperand(null);
        setOperation(null);
        setOverwrite(true);
    };

    // Deletes the last digit from the current input
    const deleteLastDigit = () => {
        setInput(prev => {
            // If input is "Error", clear it
            if (prev === 'Error') return '0';
            // If only one digit, set to '0'
            if (prev.length === 1) return '0';
            // Otherwise, remove the last character
            return prev.slice(0, -1);
        });
    };

    // Appends a number or decimal point to the current input
    const appendNumber = (number) => {
        // If overwrite flag is true (e.g., after an operation or initial state)
        if (overwrite) {
            // If the number is a decimal point and input is currently '0', set input to '0.'
            if (number === '.' && input === '0') {
                setInput('0.');
            } else {
                setInput(String(number)); // Start new input
            }
            setOverwrite(false); // Disable overwrite
        } else {
            // Prevent multiple decimal points
            if (number === '.' && input.includes('.')) return;
            // Handle leading zero: if input is '0' and new number is not '.', replace '0'
            setInput(prev => (prev === '0' && number !== '.') ? String(number) : prev + number);
        }
    };

    // Sets the chosen arithmetic operation
    const chooseOperation = (op) => {
        // If no number has been entered yet, do nothing
        if (input === '0' && previousOperand === null && currentOperand === null) return;

        // If there's a previous operand, and we have a new input, compute the previous operation
        if (previousOperand !== null && !overwrite) {
            compute(); // Perform calculation for the previous operation before setting a new one
        } else if (currentOperand !== null && previousOperand === null) {
            // If a result from a previous calculation exists, use that as the new previousOperand
            setPreviousOperand(currentOperand);
        } else if (previousOperand === null) {
            // If no previous operand, set the current input as the previous operand
            setPreviousOperand(parseFloat(input));
        }

        setOperation(op); // Set the new operation
        setOverwrite(true); // Prepare for new number input
        setCurrentOperand(null); // Clear current operand after setting previousOperand
    };

    // Performs the calculation
    const compute = () => {
        const prev = previousOperand;
        const current = parseFloat(input);

        // If no valid previous operand or current number, return
        if (isNaN(prev) && isNaN(current)) return;
        if (operation === null) return; // No operation selected

        let computation;
        // Handle cases where previousOperand might be null but currentOperand has a value
        const val1 = isNaN(prev) ? currentOperand : prev;

        if (isNaN(val1) || isNaN(current)) return; // Still check after resolving val1

        switch (operation) {
            case '+': computation = val1 + current; break;
            case '-': computation = val1 - current; break;
            case '*': computation = val1 * current; break;
            case '÷':
            case '/': computation = current === 0 ? 'Error' : val1 / current; break;
            default: return; // Should not happen
        }

        setInput(computation.toString()); // Display the result
        setCurrentOperand(computation); // Store the result as the new currentOperand
        setOperation(null); // Clear the operation
        setPreviousOperand(null); // Clear the previous operand
        setOverwrite(true); // Prepare for a new calculation
    };

    // Effect to clear calculator on initial mount (or dependency change, though none here)
    useEffect(() => {
        clear();
    }, []);

    return (
        <div className="bg-[#1A1F36] border border-[#C9B072] rounded-xl p-6 shadow-2xl flex flex-col items-center w-full max-w-sm mx-auto">
            <h2 className="text-3xl font-bold text-[#F8F8F8] mb-6">Financial Calculator</h2>
            <div className="w-full bg-[#0A1128] border border-[#4CAF50] rounded-lg p-4 text-right mb-4 shadow-inner">
                <div className="text-[#CCD2E3] text-lg break-words min-h-[1.5em]">
                    {previousOperand !== null ? previousOperand : ''} {operation}
                </div>
                <div className="text-[#F8F8F8] text-4xl font-bold break-words overflow-x-auto">
                    {input}
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2 w-full">
                <button onClick={clear} className="col-span-2 bg-[#C9B072] text-[#0A1128] font-semibold py-3 rounded-lg shadow hover:bg-[#B79A5F] transition text-xl">AC</button>
                <button onClick={deleteLastDigit} className="bg-[#C9B072] text-[#0A1128] font-semibold py-3 rounded-lg shadow hover:bg-[#B79A5F] transition text-xl">DEL</button>
                <button onClick={() => chooseOperation('÷')} className="bg-[#4CAF50] text-[#F8F8F8] font-semibold py-3 rounded-lg shadow hover:bg-[#3D8F40] transition text-xl">÷</button>

                {[7, 8, 9].map(num => (
                    <button key={num} onClick={() => appendNumber(num)} className="bg-[#2A314B] text-[#F8F8F8] font-semibold py-3 rounded-lg shadow hover:bg-[#3C4460] transition text-xl">{num}</button>
                ))}
                <button onClick={() => chooseOperation('*')} className="bg-[#4CAF50] text-[#F8F8F8] font-semibold py-3 rounded-lg shadow hover:bg-[#3D8F40] transition text-xl">*</button>

                {[4, 5, 6].map(num => (
                    <button key={num} onClick={() => appendNumber(num)} className="bg-[#2A314B] text-[#F8F8F8] font-semibold py-3 rounded-lg shadow hover:bg-[#3C4460] transition text-xl">{num}</button>
                ))}
                <button onClick={() => chooseOperation('-')} className="bg-[#4CAF50] text-[#F8F8F8] font-semibold py-3 rounded-lg shadow hover:bg-[#3D8F40] transition text-xl">-</button>

                {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => appendNumber(num)} className="bg-[#2A314B] text-[#F8F8F8] font-semibold py-3 rounded-lg shadow hover:bg-[#3C4460] transition text-xl">{num}</button>
                ))}
                <button onClick={() => chooseOperation('+')} className="bg-[#4CAF50] text-[#F8F8F8] font-semibold py-3 rounded-lg shadow hover:bg-[#3D8F40] transition text-xl">+</button>

                <button onClick={() => appendNumber(0)} className="col-span-2 bg-[#2A314B] text-[#F8F8F8] font-semibold py-3 rounded-lg shadow hover:bg-[#3C4460] transition text-xl">0</button>
                <button onClick={() => appendNumber('.')} className="bg-[#2A314B] text-[#F8F8F8] font-semibold py-3 rounded-lg shadow hover:bg-[#3C4460] transition text-xl">.</button>
                <button onClick={compute} className="bg-[#C9B072] text-[#0A1128] font-semibold py-3 rounded-lg shadow hover:bg-[#B79A5F] transition text-xl">=</button>
            </div>
        </div>
    );
};

// --- Currency Converter Component ---
const CurrencyConverter = () => {
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('KES'); // Default to Kenya Shilling
    const [exchangeRate, setExchangeRate] = useState(null);
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // List of common currencies, including KES (Kenya Shilling)
    const currencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD',
        'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KES'
    ].sort(); // Sort alphabetically for better UX

    // Placeholder for your ExchangeRate-API key.
    // YOU MUST REPLACE THIS WITH YOUR ACTUAL API KEY from https://www.exchangerate-api.com/
    // The free tier offers 1,500 requests/month.
    const EXCHANGE_RATE_API_KEY = ""; // <--- IMPORTANT: Replace with your API Key

    const fetchExchangeRate = useCallback(async () => {
        if (!EXCHANGE_RATE_API_KEY) {
            setError("API Key for currency converter is missing. Please obtain one from exchangerate-api.com.");
            setIsLoading(false);
            setConvertedAmount(null); // Clear previous conversion
            return;
        }
        if (fromCurrency === toCurrency) {
            setConvertedAmount(amount);
            setExchangeRate(1);
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setConvertedAmount(null); // Clear previous conversion result while loading
        setExchangeRate(null); // Clear previous rate

        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${fromCurrency}`);
            if (!response.ok) {
                // More specific error handling for common HTTP issues
                if (response.status === 403) {
                    throw new Error('Forbidden: API key might be invalid, expired, or rate limit exceeded.');
                } else if (response.status === 404) {
                    throw new Error('Not Found: Currency or API endpoint invalid.');
                }
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            const data = await response.json();

            if (data.result === 'success' && data.conversion_rates) {
                const rate = data.conversion_rates[toCurrency];
                if (rate) {
                    setExchangeRate(rate);
                    setConvertedAmount((parseFloat(amount) * rate).toFixed(2));
                } else {
                    setError(`Conversion rate for ${toCurrency} not found in data.`);
                }
            } else {
                setError(data.result === 'error' ? data['error-type'] : 'Unknown error fetching exchange rates.');
            }
        } catch (e) {
            console.error("Error fetching exchange rate:", e);
            setError(`Failed to fetch exchange rates: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [amount, fromCurrency, toCurrency, EXCHANGE_RATE_API_KEY]); // Re-fetch when these change

    useEffect(() => {
        fetchExchangeRate();
    }, [fetchExchangeRate]); // Call fetchExchangeRate when the memoized function changes

    const handleAmountChange = (e) => {
        const value = e.target.value;
        // Allow empty string for user to clear input, otherwise parse as float
        setAmount(value === '' ? '' : parseFloat(value));
    };

    const swapCurrencies = () => {
        setToCurrency(fromCurrency); // Set 'To' to current 'From'
        setFromCurrency(toCurrency); // Set 'From' to current 'To'
        // fetchExchangeRate will be called automatically due to useEffect dependency
    };

    return (
        <div className="bg-[#1A1F36] border border-[#C9B072] rounded-xl p-6 shadow-2xl flex flex-col items-center w-full max-w-sm mx-auto">
            <h2 className="text-3xl font-bold text-[#F8F8F8] mb-6">Real-time Currency Converter</h2>
            <div className="w-full space-y-4">
                {/* Amount Input */}
                <div className="flex flex-col">
                    <label htmlFor="amount" className="text-[#CCD2E3] text-left mb-1">Amount:</label>
                    <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        className="p-3 rounded-lg bg-[#0A1128] text-[#F8F8F8] border border-[#4CAF50] focus:ring-2 focus:ring-[#C9B072] focus:outline-none transition-all"
                        placeholder="Enter amount"
                        min="0" // Prevent negative input
                    />
                </div>

                {/* Currency Selection Dropdowns and Swap Button */}
                <div className="flex items-center space-x-2">
                    <div className="flex-1">
                        <label htmlFor="fromCurrency" className="text-[#CCD2E3] text-left mb-1 block">From:</label>
                        <select
                            id="fromCurrency"
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#0A1128] text-[#F8F8F8] border border-[#4CAF50] focus:ring-2 focus:ring-[#C9B072] focus:outline-none transition-all appearance-none cursor-pointer"
                        >
                            {currencies.map(currency => (
                                <option key={currency} value={currency}>{currency}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={swapCurrencies}
                        className="mt-6 p-2 bg-[#4CAF50] text-[#F8F8F8] rounded-full shadow hover:bg-[#3D8F40] transition transform hover:rotate-180 text-lg flex items-center justify-center"
                        aria-label="Swap Currencies"
                    >
                        ⇄
                    </button>
                    <div className="flex-1">
                        <label htmlFor="toCurrency" className="text-[#CCD2E3] text-left mb-1 block">To:</label>
                        <select
                            id="toCurrency"
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#0A1128] text-[#F8F8F8] border border-[#4CAF50] focus:ring-2 focus:ring-[#C9B072] focus:outline-none transition-all appearance-none cursor-pointer"
                        >
                            {currencies.map(currency => (
                                <option key={currency} value={currency}>{currency}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Convert Button */}
                <button
                    onClick={fetchExchangeRate}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-[#C9B072] text-[#0A1128] font-semibold rounded-lg shadow hover:bg-[#B79A5F] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Converting...' : 'Convert'}
                </button>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-800 text-[#F8F8F8] p-3 rounded-lg text-sm text-center">
                        Error: {error}
                    </div>
                )}

                {/* Converted Amount Display */}
                {convertedAmount !== null && !error && (
                    <div className="mt-4 p-4 bg-[#0A1128] border border-[#C9B072] rounded-lg text-center">
                        <p className="text-xl text-[#CCD2E3]">Converted Amount:</p>
                        <p className="text-4xl font-bold text-[#4CAF50]">{convertedAmount} {toCurrency}</p>
                        {exchangeRate && (
                            <p className="text-sm text-[#CCD2E3] mt-2">
                                1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- AccountingBookkeeping Page Component (Updated) ---
const AccountingBookkeeping = () => {
  const router = useRouter(); // Initialize router for navigation

  return (
    <div className="min-h-screen bg-[#0A1128] text-[#F8F8F8] p-8 md:p-16 flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#C9B072] mb-6 animate-fade-in-up">
        Accounting & Bookkeeping Services
      </h1>
      <p className="text-xl md:text-2xl text-[#CCD2E3] max-w-3xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Ensure financial accuracy and compliance with our professional accounting and bookkeeping services. We manage your finances efficiently, giving you peace of mind and more time to focus on your business. Explore our accessible tools below.
      </p>

      {/* Existing Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl mb-16">
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Ledger" alt="Ledger Management" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Ledger Management</h3>
            <p className="text-[#CCD2E3]">Maintain accurate and up-to-date financial records.</p>
        </div>
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Payroll" alt="Payroll Processing" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Payroll Processing</h3>
            <p className="text-[#CCD2E3]">Efficient and compliant payroll services.</p>
        </div>
        <div className="bg-[#0A1128] border border-[#4CAF50] rounded-xl p-6 flex flex-col items-center text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <img src="https://placehold.co/100x100/0A1128/4CAF50?text=Tax" alt="Tax Preparation" className="mb-4 rounded-full p-2" />
            <h3 className="text-2xl font-bold text-[#F8F8F8] mb-2">Tax Preparation</h3>
            <p className="text-[#CCD2E3]">Streamlined tax preparation and filing.</p>
        </div>
      </div>

      {/* New Tools Section */}
      <h2 className="text-5xl font-extrabold text-center text-[#F8F8F8] mb-16 mt-16 animate-fade-in-up" style={{ animationDelay: '1s' }}>
        Accessible Accounting Tools
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
        {/* Calculator */}
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
            <Calculator />
        </div>
        {/* Currency Converter */}
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
            <CurrencyConverter />
        </div>
      </div>

      {/* Back button */}
      <button onClick={() => router.back()} className="mt-20 px-8 py-3 bg-[#C9B072] text-[#0A1128] font-semibold text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105 hover:bg-opacity-90 animate-fade-in-up" style={{ animationDelay: '1.6s' }}>
        Back to Home
      </button>
    </div>
  );
};

export default AccountingBookkeeping;
