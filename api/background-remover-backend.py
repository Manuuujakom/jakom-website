# app.py (Python Flask Backend - Conceptual)

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import base64
from PIL import Image

app = Flask(__name__)
CORS(app) # Enable CORS for all routes, allowing frontend to make requests

# --- Configuration (For a real app, use environment variables) ---
UPLOAD_FOLDER = 'uploads' # Directory to temporarily store uploaded images
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Placeholder for processed images (in a real app, these would be stored persistently
# or generated on-the-fly and returned as bytes)
PROCESSED_IMAGE_DATA = {}

# --- Helper Functions (Simulated Image Processing) ---

def simulate_background_removal(image_bytes):
    """
    Simulates background removal.
    In a real application, you would send image_bytes to a service like remove.bg
    or use a library like 'rembg' here.
    For this simulation, we'll just return the original image data,
    or a placeholder if we had one.
    """
    print("Simulating background removal...")
    # Example: In a real scenario with a library like 'rembg':
    # from rembg import remove
    # output_bytes = remove(image_bytes)
    # return output_bytes
    return image_bytes # Returning original bytes as a placeholder

def simulate_apply_solid_background(image_bytes, color_hex):
    """
    Simulates applying a solid color background.
    In a real app, you'd use Pillow (PIL) to composite the image onto a colored canvas.
    """
    print(f"Simulating applying solid color background: {color_hex}")
    # Example using PIL (requires actual image loading and manipulation):
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        # Convert hex to RGB tuple
        r, g, b = int(color_hex[1:3], 16), int(color_hex[3:5], 16), int(color_hex[5:7], 16)
        background = Image.new('RGBA', img.size, (r, g, b, 255))
        # Composite the image over the background. If the image has an alpha channel,
        # areas where it's transparent will show the background.
        combined = Image.alpha_composite(background, img)
        output_buffer = io.BytesIO()
        combined.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error in simulate_apply_solid_background: {e}")
        return image_bytes # Fallback to original

def simulate_apply_image_background(original_image_bytes, background_image_bytes):
    """
    Simulates applying another image as a background.
    In a real app, you'd use Pillow (PIL) to composite.
    """
    print("Simulating applying image background...")
    try:
        original_img = Image.open(io.BytesIO(original_image_bytes)).convert("RGBA")
        background_img = Image.open(io.BytesIO(background_image_bytes)).convert("RGBA")

        # Resize background to match original image dimensions for simpler composition
        background_img_resized = background_img.resize(original_img.size, Image.LANCZOS)

        # Composite the original image (assuming its background is transparent) over the new background
        combined = Image.alpha_composite(background_img_resized, original_img)
        output_buffer = io.BytesIO()
        combined.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error in simulate_apply_image_background: {e}")
        return original_image_bytes # Fallback to original

def simulate_resize_image(image_bytes, width, height):
    """
    Simulates resizing an image.
    Uses Pillow (PIL) for actual resizing.
    """
    print(f"Simulating resizing image to {width}x{height}")
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        if width == 'auto' and height == 'auto': # For 'original' option, no resize needed
            resized_img = img
        else:
            # Maintain aspect ratio if one dimension is 'auto' (though our frontend sends both)
            # For simplicity, we'll force the dimensions here.
            resized_img = img.resize((width, height), Image.LANCZOS)

        output_buffer = io.BytesIO()
        resized_img.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error in simulate_resize_image: {e}")
        return image_bytes # Fallback to original

# --- API Endpoints ---

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        image_id = "uploaded_" + os.urandom(8).hex() # Unique ID for the image
        file_bytes = file.read() # Read file content once
        PROCESCESSED_IMAGE_DATA[image_id] = file_bytes # Store original bytes
        # Return a temporary URL or ID for the frontend to reference
        return jsonify({
            'message': 'Image uploaded successfully!',
            'image_id': image_id,
            # In a real app, this would be a URL to the uploaded image:
            'image_url': f'/api/image/{image_id}'
        }), 200
    return jsonify({'error': 'Something went wrong during upload'}), 500

@app.route('/api/remove-background', methods=['POST'])
def remove_background():
    image_id = request.form.get('image_id')
    if not image_id or image_id not in PROCESCESSED_IMAGE_DATA:
        # If no image_id, assume a direct file upload for simpler testing
        if 'image' not in request.files:
            return jsonify({'error': 'No image_id or image file provided'}), 400
        original_bytes = request.files['image'].read()
    else:
        original_bytes = PROCESCESSED_IMAGE_DATA[image_id]

    processed_bytes = simulate_background_removal(original_bytes)
    processed_id = "processed_" + os.urandom(8).hex()
    PROCESCESSED_IMAGE_DATA[processed_id] = processed_bytes

    return jsonify({
        'message': 'Background removal simulated successfully!',
        'image_id': processed_id,
        'image_url': f'/api/image/{processed_id}'
    }), 200

@app.route('/api/edit-background', methods=['POST'])
def edit_background():
    original_image_id = request.form.get('image_id')
    if not original_image_id or original_image_id not in PROCESCESSED_IMAGE_DATA:
        # For simplicity, if image_id isn't provided, use 'image' file directly
        if 'image' not in request.files:
            return jsonify({'error': 'No image_id or image file provided for editing'}), 400
        original_bytes = request.files['image'].read()
    else:
        original_bytes = PROCESCESSED_IMAGE_DATA[original_image_id]

    color = request.form.get('color')
    background_file = request.files.get('background_image')

    processed_bytes = None
    if color:
        processed_bytes = simulate_apply_solid_background(original_bytes, color)
    elif background_file:
        background_bytes = background_file.read()
        processed_bytes = simulate_apply_image_background(original_bytes, background_bytes)
    else:
        return jsonify({'error': 'No color or background image provided'}), 400

    if processed_bytes:
        processed_id = "edited_" + os.urandom(8).hex()
        PROCESCESSED_IMAGE_DATA[processed_id] = processed_bytes
        return jsonify({
            'message': 'Background edited successfully!',
            'image_id': processed_id,
            'image_url': f'/api/image/{processed_id}'
        }), 200
    return jsonify({'error': 'Background editing failed'}), 500

@app.route('/api/resize-image', methods=['POST'])
def resize_image():
    image_id = request.form.get('image_id')
    width = request.form.get('width', type=int)
    height = request.form.get('height', type=int)

    if not image_id or image_id not in PROCESCESSED_IMAGE_DATA:
        # If image_id isn't provided, use 'image' file directly
        if 'image' not in request.files:
            return jsonify({'error': 'No image_id or image file provided for resizing'}), 400
        original_bytes = request.files['image'].read()
    else:
        original_bytes = PROCESCESSED_IMAGE_DATA[image_id]

    if not width or not height:
        return jsonify({'error': 'Width and height are required for resizing'}), 400

    processed_bytes = simulate_resize_image(original_bytes, width, height)
    if processed_bytes:
        processed_id = "resized_" + os.urandom(8).hex()
        PROCESCESSED_IMAGE_DATA[processed_id] = processed_bytes
        return jsonify({
            'message': 'Image resized successfully!',
            'image_id': processed_id,
            'image_url': f'/api/image/{processed_id}'
        }), 200
    return jsonify({'error': 'Image resizing failed'}), 500

@app.route('/api/image/<image_id>', methods=['GET'])
def get_image(image_id):
    """
    Endpoint to serve processed images based on their ID.
    This simulates serving images from a storage solution.
    """
    image_bytes = PROCESCESSED_IMAGE_DATA.get(image_id)
    if image_bytes:
        # Determine content type (assuming PNG for simplicity after processing)
        return send_file(io.BytesIO(image_bytes), mimetype='image/png')
    return jsonify({'error': 'Image not found'}), 404

@app.route('/')
def index():
    return "Image Processing Backend is running!"

if __name__ == '__main__':
    # To run this Flask app:
    # 1. Save it as app.py
    # 2. Make sure you have Flask and Pillow installed: pip install Flask Pillow
    # 3. Run: python app.py
    # This will run on http://127.0.0.1:5000/ by default
    app.run(debug=True) # debug=True is good for development, disable in production
