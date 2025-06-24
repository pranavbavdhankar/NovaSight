# 🚀 NovaSight – Object Detection in Space Station Environments

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6B35.svg)](https://ultralytics.com)
[![Flask](https://img.shields.io/badge/Flask-2.0+-000000.svg)](https://flask.palletsprojects.com)

NovaSight is a cutting-edge AI solution developed for the **[Duality AI Space Station Hackathon](https://www.duality.ai/edu)**. This full-stack application combines Flask backend with React frontend to deliver real-time object detection in space station environments using synthetic data from Falcon's digital twin platform.

**Live Demo Screenshots:**
![Image 1](./assets/1.png)
![Image 2](./assets/2.png)
![Image 3](./assets/3.png)





## 🎯 Project Objective

Train and deploy a robust object detection model using **100% synthetic data** to identify critical space station objects in real-time:

- 🧰 **Toolbox** - Essential maintenance equipment
- 🧯 **Fire Extinguisher** - Critical safety equipment  
- 🪫 **Oxygen Tank** - Life support systems

This project demonstrates the power of synthetic environments and digital twins for deploying AI models in challenging, high-risk environments where real data collection is difficult or impossible.

## 🏗️ Architecture Overview

```
NovaSight/
├── 📁 frontend/          # React-based user interface
│   ├── src/
│   ├── public/
│   └── package.json
├── 📁 backend/           # Flask API server
│   ├── app.py
│   ├── models/
│   └── requirements.txt
├── 📁 runs/              # YOLOv8 training outputs
│   ├── train/
│   └── val/
├── 📁 data/              # Synthetic dataset
├── config.yaml           # YOLOv8 configuration
└── README.md            # Project documentation
```

## ✨ Key Features

- **🤖 Custom YOLOv8 Model**: Fine-tuned on Falcon-generated synthetic data
- **🖥️ Interactive Web Interface**: Upload images and view real-time predictions
- **⚡ Real-time Inference**: Fast object detection via Flask API
- **📊 Comprehensive Metrics**: Detailed performance evaluation and visualizations
- **🌌 Space-Optimized**: Designed specifically for space station environments
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup (Flask + YOLOv8)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup (React)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 🎯 Usage

1. **Start both servers** following the setup instructions above
2. **Open your browser** to `http://localhost:3000`
3. **Upload an image** using the file upload interface
4. **View predictions** with bounding boxes and confidence scores
5. **Analyze results** with real-time detection feedback

## 📊 Model Performance

Our YOLOv8 model achieved excellent results after 100 epochs of training on synthetic data:

| Metric | Score |
|--------|-------|
| **mAP@0.5** | 94.4% |
| **mAP@0.5:0.95** | 88.6% |
| **Precision** | 98.4% |
| **Recall** | 91.3% |
| **F1-Score** | 94.7% |

### Training Performance Summary

| Phase | Box Loss | Classification Loss | DFL Loss | Training Time |
|-------|----------|-------------------|----------|---------------|
| **Initial (Epoch 1)** | 0.981 | 1.871 | 1.172 | 52.7 hours |
| **Final (Epoch 100)** | 0.259 | 0.200 | 0.786 | |
| **Improvement** | -73.6% | -89.3% | -32.8% | |

### Validation Metrics Progress

- **Precision**: Improved from 84.7% → 98.4% (+13.7%)
- **Recall**: Improved from 64.0% → 91.3% (+27.3%)  
- **mAP@0.5**: Improved from 79.0% → 94.4% (+15.4%)
- **mAP@0.5:0.95**: Improved from 58.7% → 88.6% (+29.9%)

### Training Highlights

✅ **Exceptional Convergence**: Model achieved 98.4% precision with excellent loss reduction  
✅ **High Recall Performance**: 91.3% recall ensures minimal missed detections  
✅ **Outstanding mAP Scores**: 94.4% mAP@0.5 demonstrates superior object localization  
✅ **Stable Training**: Consistent improvement across all metrics over 100 epochs  
✅ **Synthetic Data Success**: Proves effectiveness of Falcon-generated training data

## 🔧 Configuration

### Model Configuration (`config.yaml`)

```yaml
# Dataset paths
path: ./data
train: train/images
val: val/images
test: test/images

# Classes
names:
  0: toolbox
  1: fire_extinguisher
  2: oxygen_tank

# Training parameters
epochs: 100
batch_size: 16
imgsz: 640
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
FLASK_ENV=development
MODEL_PATH=./models/best.pt
UPLOAD_FOLDER=./uploads
MAX_CONTENT_LENGTH=16777216
```

## 🧪 Training Your Own Model

```bash
# Train with custom parameters (100 epochs used for final model)
python train.py --epochs 100 --batch-size 16 --imgsz 640

# Resume training from checkpoint
python train.py --resume runs/train/exp/weights/last.pt

# Train with different model sizes
python train.py --model yolov8n.pt  # nano
python train.py --model yolov8s.pt  # small  
python train.py --model yolov8m.pt  # medium
```

*Note: Final model was trained for 100 epochs achieving 94.4% mAP@0.5*

## 📦 API Reference

### Endpoints

#### `POST /predict`
Upload an image for object detection.

**Request:**
```bash
curl -X POST -F "file=@image.jpg" http://localhost:5000/predict
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "class": "toolbox",
      "confidence": 0.89,
      "bbox": [120, 150, 200, 250]
    }
  ],
  "image_url": "/static/results/predicted_image.jpg"
}
```

#### `GET /health`
Check API health status.

## 🛠️ Technologies Used

### Backend
- **YOLOv8** - State-of-the-art object detection
- **Flask** - Lightweight web framework
- **OpenCV** - Computer vision operations
- **NumPy** - Numerical computations
- **Pillow** - Image processing

### Frontend
- **React** - User interface framework
- **Axios** - HTTP client
- **tailwind** - CSS framework
- **React-Dropzone** - File upload component

### Data & Training
- **Falcon Digital Twin** - Synthetic data generation
- **Roboflow** - Dataset management
- **Ultralytics** - YOLOv8 implementation

## 🌟 Features

- **📊 Real-time Analytics Dashboard**: Monitor detection performance
- **🔄 Batch Processing**: Process multiple images simultaneously  
- **📱 Mobile-Responsive Design**: Optimized for all devices
- **🎨 Interactive Visualizations**: Hover effects and detailed tooltips
- **💾 Export Functionality**: Download results in multiple formats


## 🚀 Future Enhancements

- **🔧 Additional Object Classes**: Expand detection capabilities
- **📡 Real-time Video Processing**: Live camera feed integration
- **🤖 Model Optimization**: Edge deployment for space hardware
- **📊 Advanced Analytics**: Detailed usage and performance metrics
- **🔒 Security Features**: Authentication and access control

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍🚀 Acknowledgements

- **[Duality AI](https://www.duality.ai/)** for hosting the Space Station Hackathon
- **[Falcon Digital Twin Platform](https://falcon.duality.ai/)** for providing high-quality synthetic data
- **[Ultralytics](https://ultralytics.com/)** for the YOLOv8 framework
- **NASA** for inspiration and space station reference materials

## 🔗 Useful Links

- 🌐 [Duality AI Platform](https://www.duality.ai/)
- 🦅 [Falcon Digital Twin](https://falcon.duality.ai/)
- 📚 [YOLOv8 Documentation](https://docs.ultralytics.com/)
- 🚀 [Space Station Research](https://www.nasa.gov/mission_pages/station/)

---

<div align="center">
  <strong>Built with ❤️ for the Duality AI Space Station Hackathon</strong><br>
  <em>Pushing the boundaries of AI in space exploration</em>
</div>
