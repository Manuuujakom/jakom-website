// src/pages/backgoundRemover.js
import React, { useState, useEffect, useRef } from 'react';
import { removeImageBackground } from '@tremor/react-remove-image-background'; // Import the function

// Main App component
const App = () => {
    // State for the uploaded original image file (for local preview)
    const [originalImage, setOriginalImage] = useState(null);
    // State for the URL of the original image preview (will be data URL now)
    const [originalImagePreview, setOriginalImagePreview] = useState(null);
    // State for the URL of the processed image (data URL)
    const [processedImage, setProcessedImage] = useState(null);
    // State to store the Base64 image data currently being processed
    // This is crucial as it's passed back and forth for chained operations, and sent to backend.
    const [currentImageData, setCurrentImageData] = useState(null);
    // State for the selected background color
    const [backgroundColor, setBackgroundColor] = useState('#000000'); // Default to black
    // State for the uploaded background image file (for local preview)
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
            // Cleanup function to revoke the object URL when the component unmounts
            // or originalImage changes.
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setOriginalImagePreview(null);
        }
    }, [originalImage]);

    useEffect(() => {
        if (backgroundImage) {
            const objectUrl = URL.createObjectURL(backgroundImage);
            setBackgroundImagePreview(objectUrl);
            // Cleanup function to revoke the object URL
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setBackgroundImagePreview(null);
        }
    }, [backgroundImage]);

    // Handler for original image file input change
    // Now reads the file directly into a Base64 string for frontend processing
    const handleOriginalImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setOriginalImage(file); // For local preview
            setProcessedImage(null); // Reset processed image
            setCurrentImageData(null); // Reset current image data
            setMessage('');

            setIsLoading(true);
            setMessage('Loading image for frontend processing...');

            try {
                // Read the file into a data URL (Base64)
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64String = e.target.result.split(',')[1]; // Get only the Base64 part
                    setCurrentImageData(base64String); // This is the image data for processing
                    setProcessedImage(e.target.result); // Initially, processed is same as original
                    setMessage('Image loaded successfully. Ready for background removal.');
                    setIsLoading(false);
                };
                reader.onerror = (error) => {
                    setMessage(`Error reading file: ${error.message}`);
                    setIsLoading(false);
                };
                reader.readAsDataURL(file);

            } catch (error) {
                console.error('Error handling image upload:', error);
                setMessage(`Error preparing image: ${error.message}`);
                setIsLoading(false);
                setOriginalImage(null);
                setOriginalImagePreview(null);
            }

        } else {
            setMessage('Please upload a valid image file (e.g., PNG, JPG).');
        }
    };

    // Handler for background image file input change (remains the same)
    const handleBackgroundImageUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setBackgroundImage(file);
            setMessage('');
        } else {
            setMessage('Please upload a valid image file for the background.');
        }
    };

    // Helper function to make actual API calls to the Python backend
    // This function will still be used for Edit Background and Resize
    const makeRealApiCall = async (endpoint, data) => {
        if (!currentImageData) {
            setMessage('Please upload an image first.');
            setIsLoading(false);
            return null;
        }

        setIsLoading(true);
        setMessage(`Processing via backend (${endpoint})...`);

        let bodyToSend = new FormData();
        // Always send the current image data (Base64 string) for subsequent operations
        bodyToSend.append('image_data', currentImageData);


        // Append other data specific to the operation
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
            // Use relative path for API call
            const response = await fetch(`${endpoint}`, {
                method: 'POST',
                body: bodyToSend,
            });

            const result = await response.json();
            if (response.ok) {
                setMessage(result.message || 'Operation successful!');
                if (result.image_data) {
                    setCurrentImageData(result.image_data); // Update with new Base64 string from backend
                    setProcessedImage(`data:image/png;base64,${result.image_data}`);
                }
                return result;
            } else {
                setMessage(`Error: ${result.error || 'Something went wrong.'}`);
                return null;
            }
        } catch (error) {
            console.error('API call failed:', error);
            setMessage(`Network Error: Could not connect to backend or server issue. Please ensure the backend is running and accessible. ${error.message}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for "Remove Background" button click
    // NOW USING @tremor/react-remove-image-background (Frontend processing)
    const handleRemoveBackground = async () => {
        if (!originalImagePreview) { // We need a direct image source (Data URL) for tremor
            setMessage('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setMessage('Removing background (this may take a moment on your device)...');

        try {
            // The removeImageBackground function expects an HTMLImageElement or an image URL
            // originalImagePreview is already a data URL.
            const imageUrl = originalImagePreview; // Use the Data URL of the original image
            const outputImageBlob = await removeImageBackground(imageUrl);

            // Convert Blob to Data URL (Base64) for display and further operations
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1]; // Get only the Base64 part
                setCurrentImageData(base64String); // Update current image data with the processed one
                setProcessedImage(reader.result); // Set the processed image preview
                setMessage('Background removed successfully!');
            };
            reader.readAsDataURL(outputImageBlob);

        } catch (error) {
            console.error('Error removing background with @tremor/react-remove-image-background:', error);
            setMessage(`Background removal failed: ${error.message}. Make sure the image is suitable and try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for "Apply Solid Color Background" button click (Uses backend)
    const handleApplySolidColor = async () => {
        if (!currentImageData) {
            setMessage('Please upload or process an image (e.g., remove background) first.');
            return;
        }
        const data = {
            color: backgroundColor,
        };
        await makeRealApiCall('/api/edit-background', data);
    };

    // Handler for "Apply Image Background" button click (Uses backend)
    const handleApplyImageBackground = async () => {
        if (!currentImageData || !backgroundImage) {
            setMessage('Please upload or process an image, and select a background image.');
            return;
        }
        const formData = new FormData();
        // Append the actual background image file to FormData
        formData.append('background_image', backgroundImage);
        // The makeRealApiCall already appends currentImageData, so we just need the background_image
        await makeRealApiCall('/api/edit-background', formData);
    };

    // Handler for "Download Image" button click
    const handleDownloadImage = () => {
        if (!processedImage) {
            setMessage('No image to download. Please process an image first.');
            return;
        }
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `processed_image_${resizeOption}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setMessage('Image downloaded!');
    };

    // Handler for "Resize Image" button click (Uses backend)
    const handleResizeImage = async () => {
        if (!currentImageData) {
            setMessage('Please upload or process an image first to resize.');
            return;
        }

        let targetWidth, targetHeight;
        const commonSizes = {
            'passport': { width: 413, height: 531 }, // Approx 2x2 inches at 200 DPI
            'id_card': { width: 330, height: 210 }, // Common ID card photo size
            'web_thumbnail': { width: 150, height: 150 },
            'social_media': { width: 1080, height: 1080 },
            'original': null
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
            targetWidth = 'auto'; // Indicate no specific width/height for original
            targetHeight = 'auto';
        } else {
            setMessage('Please select a valid resize option.');
            return;
        }

        const data = {};
        if (targetWidth !== 'auto') data.width = targetWidth;
        if (targetHeight !== 'auto') data.height = targetHeight;

        await makeRealApiCall('/api/resize-image', data);
    };


    // Tailwind CSS classes based on the provided image's color scheme
    const colors = {
        background: 'bg-[#181D31]',
        card: 'bg-[#1D243D]',
        button: 'bg-[#34A95A]',
        buttonHover: 'hover:bg-[#2C8F4B]',
        text: 'text-gray-100',
        accent: 'text-yellow-400',
        border: 'border-yellow-400',
    };

    return (
        <div className={`min-h-screen ${colors.background} p-4 sm:p-8 font-inter`}>
            {/* These script and link tags are usually in public/index.html or handled by a build process,
                 but for a quick single-file example, they are sometimes placed here.
                 For production React apps, consider standard practices for including CSS/JS.
            */}
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <h1 className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 ${colors.text}`}>Image Processing Toolkit</h1>

            {/* Message display area */}
            {message && (
                <div className="bg-blue-500 text-white p-3 sm:p-4 rounded-lg shadow-md mb-6 sm:mb-8 max-w-xl mx-auto text-center text-sm sm:text-base">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">

                {/* Card 1: Upload Image */}
                <div className={`p-5 sm:p-6 rounded-xl shadow-lg ${colors.card} ${colors.border} border-t-4`}>
                    <h2 className={`text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 ${colors.text}`}>Upload Image</h2>
                    <p className={`mb-3 sm:mb-4 text-sm sm:text-base ${colors.text}`}>Select an image from your device to begin processing.</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleOriginalImageUpload}
                        className={`mb-4 block w-full text-sm ${colors.text}
                            file:mr-3 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:${colors.button} file:text-white
                            file:hover:${colors.buttonHover} file:transition-colors file:duration-200`}
                        disabled={isLoading}
                    />
                    {originalImagePreview && (
                        <div className="mb-4 text-center">
                            <h3 className={`text-base sm:text-lg font-medium mb-2 ${colors.text}`}>Original Image Preview:</h3>
                            <img src={originalImagePreview} alt="Original Preview" className="max-w-full h-auto rounded-lg shadow-md mx-auto border border-gray-500" />
                        </div>
                    )}
                </div>

                {/* Card 2: Remove Background */}
                <div className={`p-5 sm:p-6 rounded-xl shadow-lg ${colors.card} ${colors.border} border-t-4`}>
                    <h2 className={`text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 ${colors.text}`}>Remove Background</h2>
                    <p className={`mb-3 sm:mb-4 text-sm sm:text-base ${colors.text}`}>Click to remove the background from your uploaded image.</p>
                    <button
                        onClick={handleRemoveBackground}
                        disabled={!originalImagePreview || isLoading} 
                        className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 ${colors.button} ${colors.text} shadow-md
                                ${(!originalImagePreview || isLoading) ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
                    >
                        {isLoading ? 'Processing...' : 'Remove Background'}
                    </button>
                    {processedImage && (
                        <div className="mt-6 text-center">
                            <h3 className={`text-base sm:text-lg font-medium mb-2 ${colors.text}`}>Processed Image Preview:</h3>
                            <img src={processedImage} alt="Processed Preview" className="max-w-full h-auto rounded-lg shadow-md mx-auto border border-gray-500" />
                        </div>
                    )}
                </div>

                {/* Card 3: Edit Background */}
                <div className={`p-5 sm:p-6 rounded-xl shadow-lg ${colors.card} ${colors.border} border-t-4`}>
                    <h2 className={`text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 ${colors.text}`}>Edit Background</h2>
                    <p className={`mb-3 sm:mb-4 text-sm sm:text-base ${colors.text}`}>Change the background to a solid color or another photo.</p>

                    <div className="mb-5 sm:mb-6">
                        <label htmlFor="bgColor" className={`block text-sm font-medium mb-2 ${colors.text}`}>
                            Solid Color Background:
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                id="bgColor"
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-300 cursor-pointer"
                                disabled={isLoading}
                            />
                            <span className={`${colors.text} text-sm sm:text-base`}>{backgroundColor.toUpperCase()}</span>
                            <button
                                onClick={handleApplySolidColor}
                                disabled={!currentImageData || isLoading}
                                className={`flex-grow py-2 px-4 rounded-full font-semibold transition-all duration-300 ${colors.button} ${colors.text} shadow-md
                                        ${(!currentImageData || isLoading) ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
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
                                <h3 className={`text-base sm:text-lg font-medium mb-2 ${colors.text}`}>Background Image Preview:</h3>
                                <img src={backgroundImagePreview} alt="Background Preview" className="max-w-full h-auto rounded-lg shadow-md mx-auto border border-gray-500" />
                            </div>
                        )}
                        <button
                            onClick={handleApplyImageBackground}
                            disabled={!currentImageData || !backgroundImage || isLoading}
                            className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 ${colors.button} ${colors.text} shadow-md
                                ${(!currentImageData || !backgroundImage || isLoading) ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
                        >
                            Apply Image
                        </button>
                    </div>
                </div>

                {/* Card 4: Resize Image & Download */}
                <div className={`p-5 sm:p-6 rounded-xl shadow-lg ${colors.card} ${colors.border} border-t-4`}>
                    <h2 className={`text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 ${colors.text}`}>Resize & Download</h2>
                    <p className={`mb-3 sm:mb-4 text-sm sm:text-base ${colors.text}`}>Choose a size for your processed image.</p>

                    <div className="mb-4">
                        <label htmlFor="resize" className={`block text-sm font-medium mb-2 ${colors.text}`}>
                            Resize Option:
                        </label>
                        <select
                            id="resize"
                            value={resizeOption}
                            onChange={(e) => setResizeOption(e.target.value)}
                            className={`block w-full py-2 px-3 rounded-md shadow-sm border border-gray-600 ${colors.card} ${colors.text} text-sm sm:text-base`}
                            disabled={isLoading}
                        >
                            <option value="original">Original Size</option>
                            <option value="passport">Passport Size (413x531 px)</option>
                            <option value="id_card">ID Card Size (330x210 px)</option>
                            <option value="web_thumbnail">Web Thumbnail (150x150 px)</option>
                            <option value="social_media">Social Media (1080x1080 px)</option>
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
                                    className={`block w-full py-2 px-3 rounded-md shadow-sm border border-gray-600 ${colors.card} ${colors.text} text-sm sm:text-base`}
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
                                    className={`block w-full py-2 px-3 rounded-md shadow-sm border border-gray-600 ${colors.card} ${colors.text} text-sm sm:text-base`}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleResizeImage}
                        disabled={!currentImageData || isLoading}
                        className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 mb-4 sm:mb-6 ${colors.button} ${colors.text} shadow-md
                                ${(!currentImageData || isLoading) ? 'opacity-50 cursor-not-allowed' : colors.buttonHover}`}
                    >
                        {isLoading ? 'Resizing...' : 'Apply Resize'}
                    </button>

                    <button
                        onClick={handleDownloadImage}
                        disabled={!processedImage || isLoading}
                        className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-full font-semibold transition-all duration-300 ${colors.button} ${colors.text} shadow-lg
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
