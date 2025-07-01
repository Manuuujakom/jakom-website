# python_processor/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS # Import Flask-CORS for cross-origin requests
import io
import base64
from PIL import Image
from rembg import remove # Import the remove function from rembg

app = Flask(__name__)
CORS(app) # Enable CORS for all routes in Flask app

# --- Helper function to process image ---
def process_image(image_bytes, operation, **kwargs):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA") # Ensure RGBA for transparency
    processed_img = None
    message = "Operation successful!"

    if operation == 'remove-background':
        processed_img = remove(image_bytes) # rembg.remove expects bytes
        message = "Background removed successfully!"

    elif operation == 'edit-background':
        if 'color' in kwargs:
            color_hex = kwargs['color']
            color_rgb = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)) + (255,)
            bg_img = Image.new('RGBA', img.size, color_rgb)
            processed_img = Image.alpha_composite(bg_img, img)
            message = f"Background changed to {color_hex}!"
        elif 'background_image_bytes' in kwargs:
            bg_image_bytes = kwargs['background_image_bytes']
            bg_img = Image.open(io.BytesIO(bg_image_bytes)).convert("RGBA")
            bg_img = bg_img.resize(img.size, Image.LANCZOS)
            processed_img = Image.alpha_composite(bg_img, img)
            message = "Image background applied successfully!"
        else:
            raise ValueError("Invalid background edit parameters.")

    elif operation == 'resize-image':
        target_width = kwargs.get('width')
        target_height = kwargs.get('height')

        if target_width is None and target_height is None:
            # No resize requested, return original image
            processed_img = img
            message = "Image size is original."
        else:
            original_width, original_height = img.size
            if target_width and target_width != 'auto' and not target_height:
                target_width = int(target_width)
                target_height = int(original_height * (target_width / original_width))
            elif target_height and target_height != 'auto' and not target_width:
                target_height = int(target_height)
                target_width = int(original_width * (target_height / original_height))
            elif target_width and target_width != 'auto' and target_height and target_height != 'auto':
                target_width = int(target_width)
                target_height = int(target_height)
            else: # If both are 'auto' or invalid, keep original
                processed_img = img
                message = "Image size is original."
                
            if processed_img is None: # Only resize if new dimensions were determined
                processed_img = img.resize((target_width, target_height), Image.LANCZOS)
                message = f"Image resized to {target_width}x{target_height}."

    else:
        raise ValueError("Invalid image operation.")

    # Convert processed image back to bytes
    byte_arr = io.BytesIO()
    if isinstance(processed_img, bytes): # If rembg.remove already returned bytes
        byte_arr.write(processed_img)
    else:
        processed_img.save(byte_arr, format='PNG')
    
    return byte_arr.getvalue(), message

# --- API Endpoints ---

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided."}), 400
        
        image_file = request.files['image']
        input_image_bytes = image_file.read()
        
        # We don't process it here, just return the Base64 for the frontend to store
        base64_image = base64.b64encode(input_image_bytes).decode('utf-8')
        
        return jsonify({
            "message": "Image uploaded successfully!",
            "image_data": base64_image
        }), 200
    except Exception as e:
        return jsonify({"error": f"Internal Server Error during upload: {str(e)}"}), 500

@app.route('/remove-background', methods=['POST'])
def remove_background_api():
    try:
        image_data_b64 = request.form.get('image_data')
        if not image_data_b64:
            return jsonify({"error": "No image data provided."}), 400
        
        input_image_bytes = base64.b64decode(image_data_b64)
        
        processed_bytes, msg = process_image(input_image_bytes, 'remove-background')
        base64_output_image = base64.b64encode(processed_bytes).decode('utf-8')
        
        return jsonify({
            "message": msg,
            "image_data": base64_output_image
        }), 200
    except Exception as e:
        return jsonify({"error": f"Internal Server Error during background removal: {str(e)}"}), 500

@app.route('/edit-background', methods=['POST'])
def edit_background_api():
    try:
        image_data_b64 = request.form.get('image_data')
        if not image_data_b64:
            return jsonify({"error": "No image data provided."}), 400
        
        input_image_bytes = base64.b64decode(image_data_b64)
        
        if 'color' in request.form:
            color = request.form.get('color')
            processed_bytes, msg = process_image(input_image_bytes, 'edit-background', color=color)
        elif 'background_image' in request.files:
            bg_image_file = request.files['background_image']
            bg_image_bytes = bg_image_file.read()
            processed_bytes, msg = process_image(input_image_bytes, 'edit-background', background_image_bytes=bg_image_bytes)
        else:
            return jsonify({"error": "No color or background image provided for editing."}), 400
        
        base64_output_image = base64.b64encode(processed_bytes).decode('utf-8')
        
        return jsonify({
            "message": msg,
            "image_data": base64_output_image
        }), 200
    except Exception as e:
        return jsonify({"error": f"Internal Server Error during background editing: {str(e)}"}), 500

@app.route('/resize-image', methods=['POST'])
def resize_image_api():
    try:
        image_data_b64 = request.form.get('image_data')
        if not image_data_b64:
            return jsonify({"error": "No image data provided."}), 400
        
        input_image_bytes = base64.b64decode(image_data_b64)
        
        width = request.form.get('width')
        height = request.form.get('height')

        processed_bytes, msg = process_image(input_image_bytes, 'resize-image', width=width, height=height)
        base64_output_image = base64.b64encode(processed_bytes).decode('utf-8')
        
        return jsonify({
            "message": msg,
            "image_data": base64_output_image
        }), 200
    except Exception as e:
        return jsonify({"error": f"Internal Server Error during image resizing: {str(e)}"}), 500

if __name__ == '__main__':
    # You can change the port here if 5001 is already in use
    app.run(debug=True, port=5001)
