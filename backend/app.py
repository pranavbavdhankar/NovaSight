from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
import os
import cv2
import numpy as np
from PIL import Image
import io
import base64
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'best.pt') # Path to YOLOv8 model
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Load YOLO model
try:
    model = YOLO(MODEL_PATH)
    logger.info(f"Model loaded successfully from {MODEL_PATH}")
    logger.info(f"Model classes: {model.names}")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    model = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'model_path': MODEL_PATH,
        'classes': model.names,
        'num_classes': len(model.names),
        'model_type': 'YOLOv8'
    })

@app.route('/detect', methods=['POST'])
def detect_objects():
    """Object detection endpoint"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        # Check if image file is provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Get confidence threshold (default: 0.5)
        confidence = float(request.form.get('confidence', 0.5))
        
        # Validate file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large'}), 400

        # Read image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert PIL image to numpy array for YOLO
        image_np = np.array(image)
        if len(image_np.shape) == 3 and image_np.shape[2] == 4:  # RGBA
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGBA2RGB)
        elif len(image_np.shape) == 3 and image_np.shape[2] == 3:  # RGB
            pass  # Already in correct format
        else:
            return jsonify({'error': 'Unsupported image format'}), 400

        # Run inference
        results = model(image_np, conf=confidence)
        
        # Process results
        detections = []
        annotated_image = image_np.copy()
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence_score = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = model.names[class_id]
                    
                    # Add detection to results
                    detections.append({
                        'class': class_name,
                        'confidence': float(confidence_score),
                        'bbox': {
                            'x1': float(x1),
                            'y1': float(y1),
                            'x2': float(x2),
                            'y2': float(y2)
                        }
                    })
                    
                    # Draw bounding box on image
                    cv2.rectangle(annotated_image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                    
                    # Add label
                    label = f'{class_name}: {confidence_score:.2f}'
                    cv2.putText(annotated_image, label, (int(x1), int(y1)-10), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Convert annotated image to base64 for frontend display
        annotated_pil = Image.fromarray(annotated_image)
        buffered = io.BytesIO()
        annotated_pil.save(buffered, format="JPEG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'detections': detections,
            'num_detections': len(detections),
            'annotated_image': f'data:image/jpeg;base64,{img_base64}',
            'model_info': {
                'confidence_threshold': confidence,
                'classes': model.names
            }
        })

    except Exception as e:
        logger.error(f"Error during detection: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/retrain-info', methods=['GET'])
def retrain_info():
    """Information about Falcon integration for retraining"""
    return jsonify({
        'falcon_integration': {
            'description': 'Falcon can be used to keep your space station object detection model updated',
            'benefits': [
                'Automatic synthetic data generation',
                'Continuous model retraining',
                'No real-world data collection needed',
                'Adaptation to new scenarios and objects'
            ],
            'use_cases': [
                'New space station configurations',
                'Different lighting conditions',
                'Additional object types',
                'Improved detection accuracy'
            ]
        }
    })

if __name__ == '__main__':
    # Check if model is loaded before starting
    if model is None:
        logger.warning("Model not loaded. Please check the MODEL_PATH.")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
