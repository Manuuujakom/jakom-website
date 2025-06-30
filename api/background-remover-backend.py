# api/background-remover-backend.py

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin # Import cross_origin decorator
import os
import io
import base64
from PIL import Image
import requests
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# --- Production Configuration: Allowing all origins for CORS ---
# It's crucial to specify the exact origins that are allowed to access your API.
# 'https://jakom-one-stop-tech-solution-hilu5cvyw.vercel.app' is typically a Vercel preview/branch domain.
# 'https://jakomonestoptechsolution.vercel.app' is your main production domain.
# Include both if you want to allow requests from both during development/testing on Vercel.
CORS(app, resources={r"/api/*": {"origins": [
    "https://jakom-one-stop-tech-solution-hilu5cvyw.vercel.app",
    "https://jakomonestoptechsolution.vercel.app",
    "http://localhost:3000" # Add your local development URL if you test locally
]}})

# --- Cloudinary Configuration ---
# WARNING: Hardcoding API keys directly in the code is a security risk and
# is NOT recommended for production environments.
# It is best practice to use environment variables (e.g., os.getenv())
# and configure them securely in your deployment platform (like Vercel).
cloudinary.config(
    cloud_name='desvdirg3',
    api_key='385951568625369',
    api_secret='9juTKNOvK-deQTpc4NLLsr3Drew',
    secure=True
)

# --- External API Configuration ---
# Get your API key from remove.bg after signing up
REMOVE_BG_API_KEY = os.getenv('REMOVE_BG_API_KEY') # Still using environment variable for remove.bg
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
    data = {'size': 'auto'}

    try:
        response = requests.post(REMOVE_BG_API_URL, files=files, headers=headers, data=data)
        response.raise_for_status()
        return response.content
    except requests.exceptions.RequestException as e:
        print(f"Error calling remove.bg API: {e}")
        raise Exception(f"Background removal service error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during background removal: {e}")
        raise Exception(f"An unexpected error occurred: {e}")


def apply_solid_background(original_image_bytes, color_hex):
    """
    Applies a solid color background to an image.
    """
    print(f"Applying solid color background: {color_hex}")
    try:
        img = Image.open(io.BytesIO(original_image_bytes)).convert("RGBA")
        r, g, b = int(color_hex[1:3], 16), int(color_hex[3:5], 16), int(color_hex[5:7], 16)
        background = Image.new('RGBA', img.size, (r, g, b, 255))
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
    """
    print("Applying image background...")
    try:
        original_img = Image.open(io.BytesIO(original_image_bytes)).convert("RGBA")
        background_img = Image.open(io.BytesIO(background_image_bytes)).convert("RGBA")

        background_img_resized = background_img.resize(original_img.size, Image.LANCZOS)
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
    """
    print(f"Resizing image to {width}x{height}")
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        original_width, original_height = img.size

        if width == 'auto' and height == 'auto':
            resized_img = img
        elif width == 'auto' and isinstance(height, int):
            aspect_ratio = original_width / original_height
            new_width = int(height * aspect_ratio)
            resized_img = img.resize((new_width, height), Image.LANCZOS)
        elif height == 'auto' and isinstance(width, int):
            aspect_ratio = original_height / original_width
            new_height = int(width * aspect_ratio)
            resized_img = img.resize((width, new_height), Image.LANCZOS)
        elif isinstance(width, int) and isinstance(height, int):
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

@app.route('/api/upload', methods=['POST', 'OPTIONS']) # Add OPTIONS to methods
@cross_origin(origins=ALLOWED_ORIGINS, methods=['POST'], headers=['Content-Type']) # Explicit CORS
def upload_image():
    if request.method == 'OPTIONS': # Handle preflight request
        return '', 204
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        image_bytes = file.read()
        upload_result = cloudinary.uploader.upload(
            file=io.BytesIO(image_bytes),
            folder="jakom-website-images",
            resource_type="image"
        )
        
        return jsonify({
            'message': 'Image uploaded successfully!',
            'image_id': upload_result['public_id'],
            'image_url': upload_result['secure_url']
        }), 200
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': f'Failed to upload image: {e}'}), 500

@app.route('/api/remove-background', methods=['POST', 'OPTIONS'])
@cross_origin(origins=ALLOWED_ORIGINS, methods=['POST'], headers=['Content-Type'])
def remove_background():
    if request.method == 'OPTIONS':
        return '', 204

    image_url = request.form.get('image_url')
    if not image_url:
        return jsonify({'error': 'No image_url provided for background removal'}), 400

    try:
        original_image_response = requests.get(image_url)
        original_image_response.raise_for_status()
        original_bytes = original_image_response.content

        processed_bytes = remove_background_api(original_bytes)
        
        upload_result = cloudinary.uploader.upload(
            file=io.BytesIO(processed_bytes),
            folder="jakom-website-processed",
            resource_type="image"
        )
        
        return jsonify({
            'message': 'Background removed successfully!',
            'image_url': upload_result['secure_url']
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch image or call background removal API: {e}'}), 500
    except Exception as e:
        print(f"Background removal error: {e}")
        return jsonify({'error': f'Failed to remove background: {e}'}), 500

@app.route('/api/edit-background', methods=['POST', 'OPTIONS'])
@cross_origin(origins=ALLOWED_ORIGINS, methods=['POST'], headers=['Content-Type'])
def edit_background():
    if request.method == 'OPTIONS':
        return '', 204

    image_url = request.form.get('image_url')
    color = request.form.get('color')
    background_file = request.files.get('background_image')

    if not image_url:
        return jsonify({'error': 'No image_url provided for background editing'}), 400

    try:
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


@app.route('/api/resize-image', methods=['POST', 'OPTIONS'])
@cross_origin(origins=ALLOWED_ORIGINS, methods=['POST'], headers=['Content-Type'])
def resize_image_endpoint():
    if request.method == 'OPTIONS':
        return '', 204

    image_url = request.form.get('image_url')
    width_str = request.form.get('width')
    height_str = request.form.get('height')

    if not image_url:
        return jsonify({'error': 'No image_url provided for resizing'}), 400
    
    try:
        width = int(width_str) if width_str and width_str.lower() != 'auto' else 'auto'
        height = int(height_str) if height_str and height_str.lower() != 'auto' else 'auto'
    except ValueError:
        return jsonify({'error': 'Invalid width or height format. Must be a number or "auto".'}), 400

    if (width == 'auto' and height == 'auto') or (isinstance(width, int) or isinstance(height, int)):
        pass
    else:
        return jsonify({'error': 'At least one valid numerical dimension or both "auto" are required for resizing'}), 400

    try:
        original_image_response = requests.get(image_url)
        original_image_response.raise_for_status()
        original_bytes = original_image_response.content

        processed_bytes = resize_image(original_bytes, width, height)
        if processed_bytes:
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
    app.run(debug=True, host='0.0.0.0', port=os.environ.get('PORT', 5000))
