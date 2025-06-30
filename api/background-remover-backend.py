# api/background-remover-backend.py

from flask import Flask, request, jsonify # Removed send_file as we're returning base64
from flask_cors import CORS # Keep CORS for manual header injection
import os
import io
import base64
from PIL import Image
import requests
# Removed cloudinary imports
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# --- CORS Configuration ---
# Allowing all origins for debugging CORS issues
# WARNING: Setting origins to "*" allows ANY domain to make requests to your API.
# This is a significant security risk for production applications.
# It is strongly recommended to restrict this to specific frontend domains.
CORS_ALLOW_ORIGIN = "*"

@app.after_request
def add_cors_headers(response):
    """
    Manually adds CORS headers to every response.
    This is a more aggressive approach to ensure CORS is enabled.
    """
    response.headers['Access-Control-Allow-Origin'] = CORS_ALLOW_ORIGIN
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# --- External API Configuration ---
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

@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload_image():
    if request.method == 'OPTIONS':
        return '', 204
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        image_bytes = file.read()
        # Encode the image bytes to base64
        encoded_image = base64.b64encode(image_bytes).decode('utf-8')
        
        return jsonify({
            'message': 'Image uploaded successfully!',
            'image_data': encoded_image # Return base64 encoded image data
        }), 200
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': f'Failed to upload image: {e}'}), 500

@app.route('/api/remove-background', methods=['POST', 'OPTIONS'])
def remove_background():
    if request.method == 'OPTIONS':
        return '', 204

    # Expect base64 image data instead of URL
    image_data = request.form.get('image_data')
    if not image_data:
        return jsonify({'error': 'No image_data provided for background removal'}), 400

    try:
        # Decode base64 image data to bytes
        original_bytes = base64.b64decode(image_data)

        processed_bytes = remove_background_api(original_bytes)
        
        # Encode processed bytes back to base64
        encoded_processed_image = base64.b64encode(processed_bytes).decode('utf-8')
        
        return jsonify({
            'message': 'Background removed successfully!',
            'image_data': encoded_processed_image # Return base64 encoded image data
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to call background removal API: {e}'}), 500
    except Exception as e:
        print(f"Background removal error: {e}")
        return jsonify({'error': f'Failed to remove background: {e}'}), 500

@app.route('/api/edit-background', methods=['POST', 'OPTIONS'])
def edit_background():
    if request.method == 'OPTIONS':
        return '', 204

    # Expect base64 image data
    image_data = request.form.get('image_data')
    color = request.form.get('color')
    background_file = request.files.get('background_image')

    if not image_data:
        return jsonify({'error': 'No image_data provided for background editing'}), 400

    try:
        # Decode base64 image data to bytes
        original_bytes = base64.b64decode(image_data)

        processed_bytes = None
        if color:
            processed_bytes = apply_solid_background(original_bytes, color)
        elif background_file:
            background_bytes = background_file.read()
            processed_bytes = apply_image_background(original_bytes, background_bytes)
        else:
            return jsonify({'error': 'No color or background image file provided'}), 400

        if processed_bytes:
            # Encode processed bytes back to base64
            encoded_processed_image = base64.b64encode(processed_bytes).decode('utf-8')
            return jsonify({
                'message': 'Background edited successfully!',
                'image_data': encoded_processed_image # Return base64 encoded image data
            }), 200
        return jsonify({'error': 'Background editing failed due to unknown reason'}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch original image: {e}'}), 500
    except Exception as e:
        print(f"Edit background error: {e}")
        return jsonify({'error': f'Failed to edit background: {e}'}), 500


@app.route('/api/resize-image', methods=['POST', 'OPTIONS'])
def resize_image_endpoint():
    if request.method == 'OPTIONS':
        return '', 204

    # Expect base64 image data
    image_data = request.form.get('image_data')
    width_str = request.form.get('width')
    height_str = request.form.get('height')

    if not image_data:
        return jsonify({'error': 'No image_data provided for resizing'}), 400
    
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
        # Decode base64 image data to bytes
        original_bytes = base64.b64decode(image_data)

        processed_bytes = resize_image(original_bytes, width, height)
        if processed_bytes:
            # Encode processed bytes back to base64
            encoded_processed_image = base64.b64encode(processed_bytes).decode('utf-8')
            return jsonify({
                'message': 'Image resized successfully!',
                'image_data': encoded_processed_image # Return base64 encoded image data
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
