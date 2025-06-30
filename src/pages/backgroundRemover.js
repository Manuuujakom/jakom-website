import React, { useState, useEffect, useRef } from 'react';

// Define the backend URL using an environment variable
// In a production environment, set REACT_APP_BACKEND_URL to your deployed backend URL.
// For local development, it defaults to 'http://127.0.0.1:5000'.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:5000';

// Main App component
const App = () => {
    // State for the uploaded original image file
    const [originalImage, setOriginalImage] = useState(null);
    // State for the URL of the original image preview
    const [originalImagePreview, setOriginalImagePreview] = useState(null);
    // State for the processed image URL (after background removal/editing)
    const [processedImage, setProcessedImage] = useState(null);
    // State to store the URL of the image currently being processed on the backend (Cloudinary URL)
    const [currentImageUrl, setCurrentImageUrl] = useState(null); // Renamed from currentImageId for clarity
    // State for the selected background color
    const [backgroundColor, setBackgroundColor] = useState('#000000'); // Default to black
    // State for the uploaded background image file
    const [backgroundImage, setBackgroundImage] = useState(null);
    // State for the URL of the background image preview
    const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
    // State to manage loading indicators
    const [isLoading, setIsLoading] = useState(false);
    // State for selected resize option (e.g., 'passport', 'id_card', 'custom')
    const [resizeOption, setResizeOption] = useState('original');
    // State for custom width if resize option is 'custom'
    const [customWidth, setCustomWidth] = useState('');
    // State for custom height if resize option is 'custom'
    const [customHeight, setCustomHeight] = useState('');
    // State for messages to the user (e.g., errors, success)
    const [message, setMessage] = useState('');

    // Ref for the hidden file input for background image
    const backgroundInputRef = useRef(null);

    // Effect to create and revoke object URLs for image previews (for local file previews)
    useEffect(() => {
        if (originalImage) {
            const objectUrl = URL.createObjectURL(originalImage);
            setOriginalImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setOriginalImagePreview(null);
        }
    }, [originalImage]);

    useEffect(() => {
        if (backgroundImage) {
            const objectUrl = URL.createObjectURL(backgroundImage);
            setBackgroundImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setBackgroundImagePreview(null);
        }
    }, [backgroundImage]);

    // Handler for original image file input change - now uploads to backend immediately
    const handleOriginalImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setOriginalImage(file); // For local preview
            setProcessedImage(null); // Reset processed image
            setCurrentImageUrl(null); // Reset current image URL
            setMessage('');

            setIsLoading(true);
            setMessage('Uploading image to backend...');
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(`${BACKEND_URL}/api/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                if (response.ok) {
                    setMessage(result.message);
                    setCurrentImageUrl(result.image_url); // Store the Cloudinary URL
                    setProcessedImage(result.image_url); // Initial processed image is the uploaded one
                } else {
                    setMessage(`Upload Error: ${result.error || 'Failed to upload image.'}`);
                    setOriginalImage(null); // Clear the image if upload fails
                    setOriginalImagePreview(null);
                }
            } catch (error) {
                console.error('Network or server error during upload:', error);
                setMessage(`Network Error: Could not connect to backend or server issue. Please ensure the backend is running and accessible. ${error.message}`);
                setOriginalImage(null); // Clear the image if upload fails
                setOriginalImagePreview(null);
            } finally {
                setIsLoading(false);
            }

        } else {
            setMessage('Please upload a valid image file (e.g., PNG, JPG).');
        }
    };

    // Handler for background image file input change
    const handleBackgroundImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setBackgroundImage(file);
            setMessage('');
        } else {
            setMessage('Please upload a valid image file for the background.');
        }
    };

    // Helper function to make actual API calls to the Flask backend
    const makeRealApiCall = async (endpoint, data, isFile = false) => {
        if (!currentImageUrl && endpoint !== '/api/upload') { // Ensure image is uploaded for subsequent ops
            setMessage('Please upload an image first.');
            setIsLoading(false);
            return null;
        }

        setIsLoading(true);
        setMessage(`Processing via ${endpoint}...`);

        let bodyToSend = new FormData(); // Always use FormData for consistency with backend expecting form data
        if (currentImageUrl) {
            bodyToSend.append('image_url', currentImageUrl); // Pass the current Cloudinary URL
        }

        // Append additional data to the FormData object
        if (data instanceof FormData) {
            for (let pair of data.entries()) {
                bodyToSend.append(pair[0], pair[1]);
            }
        } else if (typeof data === 'object' && data !== null) {
            for (const key in data) {
                bodyToSend.append(key, data[key]);
            }
        }


        try {
            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: 'POST',
                body: bodyToSend, // FormData sets its own Content-Type header
            });

            const result = await response.json();
            if (response.ok) {
                setMessage(result.message || 'Operation successful!');
                if (result.image_url) {
                    setCurrentImageUrl(result.image_url); // Update to the new processed Cloudinary URL
                    setProcessedImage(result.image_url); // Display the new processed image
                }
                return result;
            } else {
                setMessage(`Error: ${result.error || 'Something went wrong.'}`);
                return null;
            }
        } catch (error) {
            console.error('API call failed:', error);
            setMessage(`Network Error: Could not connect to backend or server issue. ${error.message}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for "Remove Background" button click
    const handleRemoveBackground = async () => {
        if (!currentImageUrl) {
            setMessage('Please upload an image first.');
            return;
        }
        // No need to create new FormData with image_url as makeRealApiCall already does it
        await makeRealApiCall('/api/remove-background', {});
    };

    // Handler for "Apply Solid Color Background" button click
    const handleApplySolidColor = async () => {
        if (!currentImageUrl) {
            setMessage('Please upload an image first.');
            return;
        }
        const data = {
            color: backgroundColor,
        };
        await makeRealApiCall('/api/edit-background', data);
    };

    // Handler for "Apply Image Background" button click
    const handleApplyImageBackground = async () => {
        if (!currentImageUrl || !backgroundImage) {
            setMessage('Please upload an original image (first) and a background image.');
            return;
        }
        const formData = new FormData();
        formData.append('background_image', backgroundImage); // Append only the new background image
        await makeRealApiCall('/api/edit-background', formData, true); // true indicates it's a file upload
    };

    // Handler for "Download Image" button click
    const handleDownloadImage = () => {
        if (!processedImage) {
            setMessage('No image to download. Please process an image first.');
            return;
        }
        // Direct download using the URL provided by the backend (Cloudinary URL)
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `processed_image_${resizeOption}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setMessage('Image downloaded!');
    };

    // Handler for "Resize Image" button click
    const handleResizeImage = async () => {
        if (!currentImageUrl) {
            setMessage('Please upload an image first to resize.');
            return;
        }

        let targetWidth, targetHeight;
        const commonSizes = {
            'passport': { width: 413, height: 531 }, // ~2x2 inches at 200dpi
            'id_card': { width: 330, height: 210 }, // Example
            'web_thumbnail': { width: 150, height: 150 },
            'social_media': { width: 1080, height: 1080 }, // Instagram square
            'original': null // No specific resize, backend will return current image
        };

        if (resizeOption === 'custom') {
            targetWidth = parseInt(customWidth);
            targetHeight = parseInt(customHeight);
            if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
                setMessage('Please enter valid positive numbers for custom width and height.');
                return;
            }
        } else if (commonSizes[resizeOption]) {
            targetWidth = commonSizes[resizeOption].width;
            targetHeight = commonSizes[resizeOption].height;
        } else if (resizeOption === 'original') {
             targetWidth = 'auto'; // Explicitly send 'auto' for backend to interpret as no change
             targetHeight = 'auto';
        } else {
            setMessage('Please select a valid resize option.');
            return;
        }

        const data = {};
        if (targetWidth !== null) data.width = targetWidth;
        if (targetHeight !== null) data.height = targetHeight;

        await makeRealApiCall('/api/resize-image', data);
    };


    // Tailwind CSS classes based on the provided image's color scheme
    const colors = {
        background: 'bg-[#181D31]', // Dark blue/black
        card: 'bg-[#1D243D]', // Slightly lighter dark blue for cards
        button: 'bg-[#34A95A]', // Green button
        buttonHover: 'hover:bg-[#2C8F4B]', // Darker green on hover
        text: 'text-gray-100',
        accent: 'text-yellow-400', // Gold/yellow for icons
        border: 'border-yellow-400', // Gold border for cards
    };

    return (
        <div className={`min-h-screen ${colors.background} p-8 font-inter`}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <h1 className={`text-4xl font-bold text-center mb-12 ${colors.text}`}>Image Processing Toolkit</h1>

            {/* Message display area */}
            {message && (
                <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md mb-8 max-w-2xl mx-auto text-center">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                {/* Card 1: Upload Image */}
                <div className={`p-6 rounded-xl shadow-lg ${colors.card} ${colors.border} border-t-4`}>
                    <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>Upload Image</h2>
                    <p className={`mb-4 ${colors.text}`}>Select an image from your device to begin processing.</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleOriginalImageUpload}
                        className={`mb-4 block w-full text-sm ${colors.text}
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:${colors.button} file:text-white
                            file:hover:${colors.buttonHover} file:transition-colors file:duration-200`}
                        disabled={isLoading}
                    />
                    {originalImagePreview && (
                        <div className="mb-4 text-center">
                            <h3 className={`text-lg font-medium mb-2 ${colors.text}`}>Original Image Preview:</h3>
                            <img src={originalImagePreview} alt="Original Preview" className="max-w-full h-auto rounded-lg shadow-md mx-auto" />
                        </div>
                    )}
                </div>

                {/* Card 2: Remove Background */}
                <div className={`p-6 rounded-xl shadow-lg ${colors.card} ${colors.border} border-t-4`}>
                    <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>Remove Background</h2>
                    <p className={`mb-4 ${colors.text}`}>Click to remove the background from your uploaded image.</p>
                    <button
                        onClick={handleRemoveBackground}
                        disabled={!currentImageUrl || isLoading}
                        className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${colors.button} ${colors.text} shadow-md
                                ${(!currentImageUrl || isLoading) ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
                    >
                        {isLoading ? 'Processing...' : 'Remove Background'}
                    </button>
                    {processedImage && (
                        <div className="mt-6 text-center">
                            <h3 className={`text-lg font-medium mb-2 ${colors.text}`}>Processed Image Preview:</h3>
                            <img src={processedImage} alt="Processed Preview" className="max-w-full h-auto rounded-lg shadow-md mx-auto border border-gray-500" />
                        </div>
                    )}
                </div>

                {/* Card 3: Edit Background */}
                <div className={`p-6 rounded-xl shadow-lg ${colors.card} ${colors.border} border-t-4`}>
                    <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>Edit Background</h2>
                    <p className={`mb-4 ${colors.text}`}>Change the background to a solid color or another photo.</p>

                    <div className="mb-6">
                        <label htmlFor="bgColor" className={`block text-sm font-medium mb-2 ${colors.text}`}>
                            Solid Color Background:
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                id="bgColor"
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className="w-12 h-12 rounded-full border-2 border-gray-300 cursor-pointer"
                                disabled={isLoading}
                            />
                            <span className={`${colors.text}`}>{backgroundColor.toUpperCase()}</span>
                            <button
                                onClick={handleApplySolidColor}
                                disabled={!currentImageUrl || isLoading}
                                className={`flex-grow py-2 px-4 rounded-full font-semibold transition-all duration-300 ${colors.button} ${colors.text} shadow-md
                                    ${(!currentImageUrl || isLoading) ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
                            >
                                Apply Color
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${colors.text}`}>
                            Image Background:
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={backgroundInputRef} // Ref to hide this input
                            onChange={handleBackgroundImageUpload}
                            className="hidden" // Hide the actual input
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => backgroundInputRef.current.click()} // Trigger click on hidden input
                            className={`w-full py-2 px-4 rounded-full font-semibold transition-all duration-300 mb-2 ${colors.button} ${colors.text} shadow-md
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
                            disabled={isLoading}
                        >
                            Select Background Image
                        </button>
                        {backgroundImagePreview && (
                            <div className="mb-4 text-center">
                                <h3 className={`text-lg font-medium mb-2 ${colors.text}`}>Background Image Preview:</h3>
                                <img src={backgroundImagePreview} alt="Background Preview" className="max-w-full h-auto rounded-lg shadow-md mx-auto" />
                            </div>
                        )}
                        <button
                            onClick={handleApplyImageBackground}
                            disabled={!currentImageUrl || !backgroundImage || isLoading}
                            className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${colors.button} ${colors.text} shadow-md
                                ${(!currentImageUrl || !backgroundImage || isLoading) ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
                        >
                            Apply Image
                        </button>
                    </div>
                </div>

                {/* Card 4: Resize Image & Download */}
                <div className={`p-6 rounded-xl shadow-lg ${colors.card} ${colors.border} border-t-4`}>
                    <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>Resize & Download</h2>
                    <p className={`mb-4 ${colors.text}`}>Choose a size for your processed image.</p>

                    <div className="mb-4">
                        <label htmlFor="resize" className={`block text-sm font-medium mb-2 ${colors.text}`}>
                            Resize Option:
                        </label>
                        <select
                            id="resize"
                            value={resizeOption}
                            onChange={(e) => setResizeOption(e.target.value)}
                            className={`block w-full py-2 px-3 rounded-md shadow-sm border border-gray-600 ${colors.card} ${colors.text}`}
                            disabled={isLoading}
                        >
                            <option value="original">Original Size</option>
                            <option value="passport">Passport Size (2x2 inches)</option>
                            <option value="id_card">ID Card Size</option>
                            <option value="web_thumbnail">Web Thumbnail (150x150)</option>
                            <option value="social_media">Social Media (1080x1080)</option>
                            <option value="custom">Custom Size</option>
                        </select>
                    </div>

                    {resizeOption === 'custom' && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="customWidth" className={`block text-sm font-medium mb-1 ${colors.text}`}>
                                    Width (px):
                                </label>
                                <input
                                    type="number"
                                    id="customWidth"
                                    value={customWidth}
                                    onChange={(e) => setCustomWidth(e.target.value)}
                                    placeholder="e.g., 800"
                                    className={`block w-full py-2 px-3 rounded-md shadow-sm border border-gray-600 ${colors.card} ${colors.text}`}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label htmlFor="customHeight" className={`block text-sm font-medium mb-1 ${colors.text}`}>
                                    Height (px):
                                </label>
                                <input
                                    type="number"
                                    id="customHeight"
                                    value={customHeight}
                                    onChange={(e) => setCustomHeight(e.target.value)}
                                    placeholder="e.g., 600"
                                    className={`block w-full py-2 px-3 rounded-md shadow-sm border border-gray-600 ${colors.card} ${colors.text}`}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleResizeImage}
                        disabled={!currentImageUrl || isLoading}
                        className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 mb-6 ${colors.button} ${colors.text} shadow-md
                                ${(!currentImageUrl || isLoading) ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
                    >
                        {isLoading ? 'Resizing...' : 'Apply Resize'}
                    </button>

                    <button
                        onClick={handleDownloadImage}
                        disabled={!processedImage || isLoading}
                        className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${colors.button} ${colors.text} shadow-lg
                                ${(!processedImage || isLoading) ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
                    >
                        Download Image
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
