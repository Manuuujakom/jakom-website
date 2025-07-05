import sharp from 'sharp';

// Helper function to decode Base64 image data
const decodeBase64Image = (dataString) => {
  try {
    // Remove "data:image/png;base64," or "data:image/jpeg;base64," etc. if present
    const base64Data = dataString.replace(/^data:image\/(png|jpeg|jpg|gif);base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    console.error('Error decoding Base64 image data:', error);
    return null;
  }
};

// Helper function to encode image buffer to Base64
const encodeImageToBase64 = async (imageBuffer) => {
  try {
    const outputBuffer = await sharp(imageBuffer).toFormat('png').toBuffer();
    return outputBuffer.toString('base64');
  } catch (error) {
    console.error('Error encoding image to Base64:', error);
    throw new Error('Failed to encode image to Base64.');
  }
};


// Handler for initial image upload
export const uploadImageHandler = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No image file uploaded.'
    });
  }

  try {
    const imageDataBuffer = req.file.buffer;
    const base64Image = await encodeImageToBase64(imageDataBuffer);

    return res.status(200).json({
      message: 'Image uploaded and processed successfully!',
      image_data: base64Image, // Send back Base64 string
    });
  } catch (error) {
    console.error('Error during image upload and initial processing:', error);
    return res.status(500).json({
      error: 'Failed to process uploaded image.'
    });
  }
};

// Handler for removing background
export const removeBackgroundHandler = async (req, res) => {
  const {
    image_data
  } = req.body;

  if (!image_data) {
    return res.status(400).json({
      error: 'No image data provided for background removal.'
    });
  }

  try {
    const inputBuffer = decodeBase64Image(image_data);
    if (!inputBuffer) {
      return res.status(400).json({
        error: 'Invalid image data provided.'
      });
    }

    // Sharp can remove backgrounds if the image has an alpha channel,
    // or by converting to a format that supports transparency (like PNG).
    // For true "background removal" (segmentation), you'd need a more advanced
    // library or API (like remove.bg, or an ML model).
    // Here, we convert to PNG with an alpha channel, assuming the original
    // might have a solid background that can be "made transparent" if it's white.
    // This is a basic approach.
    const outputBuffer = await sharp(inputBuffer)
      .flatten() // Remove alpha channel if present (makes it opaque)
      .toFormat('png') // Convert to PNG to ensure alpha channel support
      .toBuffer();

    const base64Image = await encodeImageToBase64(outputBuffer);

    return res.status(200).json({
      message: 'Background removed (converted to transparent PNG).',
      image_data: base64Image,
    });
  } catch (error) {
    console.error('Error during background removal:', error);
    return res.status(500).json({
      error: 'Failed to remove background.'
    });
  }
};

// Handler for editing background (solid color or image)
export const editBackgroundHandler = async (req, res) => {
  const {
    image_data,
    color
  } = req.body; // color for solid background
  const backgroundImageFile = req.file; // The uploaded background image file from multer

  if (!image_data) {
    return res.status(400).json({
      error: 'No image data provided to edit background.'
    });
  }

  try {
    const inputBuffer = decodeBase64Image(image_data);
    if (!inputBuffer) {
      return res.status(400).json({
        error: 'Invalid image data provided.'
      });
    }

    let processedImage = sharp(inputBuffer);

    if (backgroundImageFile) {
      // Apply image background
      const backgroundBuffer = backgroundImageFile.buffer;
      processedImage = await sharp(inputBuffer)
        .composite([{
          input: backgroundBuffer,
          blend: 'dest-over'
        }]) // Place original image over background
        .toBuffer();
    } else if (color) {
      // Apply solid color background
      const metadata = await sharp(inputBuffer).metadata();
      const {
        width,
        height
      } = metadata;

      if (!width || !height) {
        throw new Error("Could not determine image dimensions for solid background.");
      }

      // Create a solid color background image
      const solidColorBuffer = await sharp({
          create: {
            width: width,
            height: height,
            channels: 4, // RGBA for transparency
            background: color,
          },
        })
        .png() // Ensure it's a PNG for transparency
        .toBuffer();

      // Composite the original image over the solid color background
      processedImage = await sharp(inputBuffer)
        .composite([{
          input: solidColorBuffer,
          blend: 'dest-over'
        }]) // Place original image over solid background
        .toBuffer();

    } else {
      return res.status(400).json({
        error: 'No background color or image provided.'
      });
    }

    const base64Image = await encodeImageToBase64(processedImage);

    return res.status(200).json({
      message: 'Background edited successfully!',
      image_data: base64Image,
    });
  } catch (error) {
    console.error('Error during background editing:', error);
    return res.status(500).json({
      error: 'Failed to edit background.'
    });
  }
};

// Handler for resizing image
export const resizeImageHandler = async (req, res) => {
  const {
    image_data,
    width,
    height
  } = req.body;

  if (!image_data) {
    return res.status(400).json({
      error: 'No image data provided for resizing.'
    });
  }

  try {
    const inputBuffer = decodeBase64Image(image_data);
    if (!inputBuffer) {
      return res.status(400).json({
        error: 'Invalid image data provided.'
      });
    }

    let sharpImage = sharp(inputBuffer);

    // Only resize if width or height are provided and valid numbers
    if ((width && !isNaN(width) && width > 0) || (height && !isNaN(height) && height > 0)) {
      sharpImage = sharpImage.resize(width || null, height || null);
    } else {
      // If no valid width/height, we are essentially sending back the original
      // but still processing it through sharp to ensure format consistency
      // (e.g., to PNG if not already).
    }

    const outputBuffer = await sharpImage.toFormat('png').toBuffer();
    const base64Image = await encodeImageToBase64(outputBuffer);

    return res.status(200).json({
      message: 'Image resized successfully!',
      image_data: base64Image,
    });
  } catch (error) {
    console.error('Error during image resizing:', error);
    return res.status(500).json({
      error: 'Failed to resize image.'
    });
  }
};