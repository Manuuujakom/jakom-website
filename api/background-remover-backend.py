# api/background-remover-backend.py

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import base64
from PIL import Image
import requests # For making HTTP requests to external APIs
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv # For loading environment variables locally

# Load environment variables from .env file (for local development)
load_dotenv()

app = Flask(__name__)

# --- Production Configuration: Explicitly allow your frontend's domain(s) ---
# It's crucial to specify the exact origins that are allowed to access your API.
# 'https://jakom-one-stop-tech-solution-jrbtyjzmc.vercel.app' is typically a Vercel preview/branch domain.
# 'https://jakomonestoptechsolution.vercel.app' is your main production domain.
# Include both if you want to allow requests from both during development/testing on Vercel.
CORS(app, resources={r"/api/*": {"origins": [
    "https://jakom-one-stop-tech-solution-jrbtyjzmc.vercel.app",
    "https://jakomonestoptechsolution.vercel.app"
]}})

# --- Cloudinary Configuration ---
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

# --- External API Configuration ---
# Get your API key from remove.bg after signing up
REMOVE_BG_API_KEY = os.getenv('REMOVE_BG_API_KEY')
REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg'

# --- Helper Functions (Actual Image Processing) ---

def remove_background_api(image_bytes):
    """
    Sends image to remove.bg API for background removal.
    Returns bytes of the processed image.
    """
    if not REMOVE_BG_API_KEY:
        raise ValueError("REMOVE_BG_API_KEY is not set. Cannot perform background removal.")

    print("Sending image to remove.bg API for processing...")
    files = {'image_file': ('image.png', io.BytesIO(image_bytes), 'image/png')}
    headers = {'X-Api-Key': REMOVE_BG_API_KEY}
    data = {'size': 'auto'} # 'auto' for best quality, 'preview' for faster but lower quality

    try:
        response = requests.post(REMOVE_BG_API_URL, files=files, headers=headers, data=data)
        response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)

        # The API returns the image directly if successful
        return response.content
    except requests.exceptions.RequestException as e:
        print(f"Error calling remove.bg API: {e}")
        # Re-raise as a generic Exception to be caught by the route's try-except
        raise Exception(f"Background removal service error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during background removal: {e}")
        raise Exception(f"An unexpected error occurred: {e}")


def apply_solid_background(original_image_bytes, color_hex):
    """
    Applies a solid color background to an image.
    Expects original_image_bytes to potentially have transparency after background removal.
    """
    print(f"Applying solid color background: {color_hex}")
    try:
        img = Image.open(io.BytesIO(original_image_bytes)).convert("RGBA")
        r, g, b = int(color_hex[1:3], 16), int(color_hex[3:5], 16), int(color_hex[5:7], 16)
        background = Image.new('RGBA', img.size, (r, g, b, 255))
        # Composite the image over the background. If the image has an alpha channel,
        # areas where it's transparent will show the background.
        combined = Image.alpha_composite(background, img)
        output_buffer = io.BytesIO()
        combined.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error in apply_solid_background: {e}")
        raise Exception(f"Failed to apply solid background: {e}")

def apply_image_background(original_image_bytes, background_image_bytes):
    """
    Applies another image as a background.
    Expects original_image_bytes to potentially have transparency.
    """
    print("Applying image background...")
    try:
        original_img = Image.open(io.BytesIO(original_image_bytes)).convert("RGBA")
        background_img = Image.open(io.BytesIO(background_image_bytes)).convert("RGBA")

        # Resize background to match original image dimensions for simpler composition
        # In a more advanced scenario, you might offer options like 'cover', 'contain', etc.
        background_img_resized = background_img.resize(original_img.size, Image.LANCZOS)

        # Composite the original image over the new background
        combined = Image.alpha_composite(background_img_resized, original_img)
        output_buffer = io.BytesIO()
        combined.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error in apply_image_background: {e}")
        raise Exception(f"Failed to apply image background: {e}")

def resize_image(image_bytes, width, height):
    """
    Resizes an image using Pillow.
    Handles 'auto' for width/height to maintain aspect ratio.
    """
    print(f"Resizing image to {width}x{height}")
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        original_width, original_height = img.size

        if width == 'auto' and height == 'auto':
            resized_img = img # No resize needed for 'original' option
        elif width == 'auto' and isinstance(height, int):
            # Calculate width to maintain aspect ratio based on new height
            aspect_ratio = original_width / original_height
            new_width = int(height * aspect_ratio)
            resized_img = img.resize((new_width, height), Image.LANCZOS)
        elif height == 'auto' and isinstance(width, int):
            # Calculate height to maintain aspect ratio based on new width
            aspect_ratio = original_height / original_width
            new_height = int(width * aspect_ratio)
            resized_img = img.resize((width, new_height), Image.LANCZOS)
        elif isinstance(width, int) and isinstance(height, int):
            # Both dimensions provided, force resize
            resized_img = img.resize((width, height), Image.LANCZOS)
        else:
            raise ValueError("Invalid dimensions provided for resize.")

        output_buffer = io.BytesIO()
        resized_img.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error in resize_image: {e}")
        raise Exception(f"Failed to resize image: {e}")


# --- API Endpoints ---

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Read the image data
        image_bytes = file.read()
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file=io.BytesIO(image_bytes),
            folder="jakom-website-images", # Optional: organize uploads in a folder
            resource_type="image"
        )
        
        return jsonify({
            'message': 'Image uploaded successfully!',
            'image_id': upload_result['public_id'], # Use Cloudinary public_id as image_id
            'image_url': upload_result['secure_url'] # Secure URL from Cloudinary
        }), 200
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': f'Failed to upload image: {e}'}), 500

@app.route('/api/remove-background', methods=['POST'])
def remove_background():
    image_url = request.form.get('image_url')
    if not image_url:
        return jsonify({'error': 'No image_url provided for background removal'}), 400

    try:
        # Fetch the image from the provided URL (e.g., from Cloudinary)
        original_image_response = requests.get(image_url)
        original_image_response.raise_for_status()
        original_bytes = original_image_response.content

        # Perform background removal using the external API
        processed_bytes = remove_background_api(original_bytes)
        
        # Upload processed image to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file=io.BytesIO(processed_bytes),
            folder="jakom-website-processed", # Store processed images in a different folder
            resource_type="image"
        )
        
        return jsonify({
            'message': 'Background removed successfully!',
            'image_url': upload_result['secure_url']
        }), 200
    except ValueError as e: # Catch specific ValueError from remove_background_api
        return jsonify({'error': str(e)}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch image or call background removal API: {e}'}), 500
    except Exception as e:
        print(f"Background removal error: {e}")
        return jsonify({'error': f'Failed to remove background: {e}'}), 500

@app.route('/api/edit-background', methods=['POST'])
def edit_background():
    image_url = request.form.get('image_url')
    color = request.form.get('color')
    background_file = request.files.get('background_image')

    if not image_url:
        return jsonify({'error': 'No image_url provided for background editing'}), 400

    try:
        # Fetch the original image from the provided URL
        original_image_response = requests.get(image_url)
        original_image_response.raise_for_status()
        original_bytes = original_image_response.content

        processed_bytes = None
        if color:
            processed_bytes = apply_solid_background(original_bytes, color)
        elif background_file:
            background_bytes = background_file.read()
            processed_bytes = apply_image_background(original_bytes, background_bytes)
        else:
            return jsonify({'error': 'No color or background image file provided'}), 400

        if processed_bytes:
            # Upload processed image to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file=io.BytesIO(processed_bytes),
                folder="jakom-website-edited",
                resource_type="image"
            )
            return jsonify({
                'message': 'Background edited successfully!',
                'image_url': upload_result['secure_url']
            }), 200
        return jsonify({'error': 'Background editing failed due to unknown reason'}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch original image: {e}'}), 500
    except Exception as e:
        print(f"Edit background error: {e}")
        return jsonify({'error': f'Failed to edit background: {e}'}), 500


@app.route('/api/resize-image', methods=['POST'])
def resize_image_endpoint(): # Renamed to avoid conflict with helper function
    image_url = request.form.get('image_url')
    width_str = request.form.get('width')
    height_str = request.form.get('height')

    if not image_url:
        return jsonify({'error': 'No image_url provided for resizing'}), 400
    
    # Parse width and height, allowing for 'auto' as a string
    try:
        # If frontend sends 'auto', we pass the string 'auto' to the helper function.
        # Otherwise, parse as int.
        width = int(width_str) if width_str and width_str.lower() != 'auto' else 'auto'
        height = int(height_str) if height_str and height_str.lower() != 'auto' else 'auto'
    except ValueError:
        return jsonify({'error': 'Invalid width or height format. Must be a number or "auto".'}), 400

    # Ensure at least one dimension is a number or both are 'auto'
    if (width == 'auto' and height == 'auto') or (isinstance(width, int) or isinstance(height, int)):
        pass # Valid case
    else:
        return jsonify({'error': 'At least one valid numerical dimension or both "auto" are required for resizing'}), 400

    try:
        # Fetch the original image from the provided URL
        original_image_response = requests.get(image_url)
        original_image_response.raise_for_status()
        original_bytes = original_image_response.content

        processed_bytes = resize_image(original_bytes, width, height) # Call helper function
        if processed_bytes:
            # Upload processed image to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file=io.BytesIO(processed_bytes),
                folder="jakom-website-resized",
                resource_type="image"
            )
            return jsonify({
                'message': 'Image resized successfully!',
                'image_url': upload_result['secure_url']
            }), 200
        return jsonify({'error': 'Image resizing failed due to unknown reason'}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch original image: {e}'}), 500
    except Exception as e:
        print(f"Resize image error: {e}")
        return jsonify({'error': f'Failed to resize image: {e}'}), 500


@app.route('/')
def index():
    return "Image Processing Backend is running!"

if __name__ == '__main__':
    # For local development:
    # 1. Create a .env file in the same directory as this script (api/ directory).
    # 2. Add your Cloudinary and remove.bg API keys to the .env file:
    #    CLOUDINARY_CLOUD_NAME=your_cloud_name
    #    CLOUDINARY_API_KEY=your_api_key
    #    CLOUDINARY_API_SECRET=your_api_secret
    #    REMOVE_BG_API_KEY=your_remove_bg_api_key
    # 3. Run from the directory containing this file:
    #    python background-remover-backend.py
    # This will run on http://127.0.0.1:5000/ by default
    app.run(debug=True, host='0.0.0.0', port=os.environ.get('PORT', 5000))
