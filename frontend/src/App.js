
import React, { useState, useRef } from 'react';
import { Upload, Camera, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import config from "./config.js"
function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(0.5);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('unknown');
  const fileInputRef = useRef(null);

  // Check backend health on component mount
  React.useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/health`);
      if (response.ok) {
        setBackendStatus('healthy');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, JPG, PNG)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setError(null);
      setSelectedImage(file);
      setDetectionResults(null);
    }
  };

  const handleDetection = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('confidence', confidence.toString());

      const response = await fetch(`${config.backendUrl}/detect`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDetectionResults(data);
      } else {
        setError(data.error || 'Detection failed');
      }
    } catch (error) {
      setError('Failed to connect to backend. Make sure the backend server is running.');
      console.error('Detection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetDetection = () => {
    setSelectedImage(null);
    setDetectionResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'healthy': return '#10B981';
      case 'offline': return '#EF4444';
      case 'error': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'healthy': return <CheckCircle size={16} />;
      case 'offline': return <AlertCircle size={16} />;
      case 'error': return <AlertCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #000000 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
            <Camera size={48} style={{ color: '#60A5FA', marginRight: '16px' }} />
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #60A5FA, #A78BFA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Space Station Object Detector
            </h1>
          </div>
          <p style={{ color: '#D1D5DB', fontSize: '1.125rem', margin: '8px 0' }}>
            Detect toolboxes, oxygen tanks, and fire extinguishers in space station images
          </p>
          
          {/* Backend Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px', color: getStatusColor() }}>
            {getStatusIcon()}
            <span style={{ marginLeft: '8px', fontSize: '0.875rem' }}>
              Backend: {backendStatus === 'healthy' ? 'Connected' : 
                       backendStatus === 'offline' ? 'Offline' : 
                       backendStatus === 'error' ? 'Error' : 'Checking...'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px' }}>
          {/* Upload Section */}
          <div style={{
            background: 'rgba(55, 65, 81, 0.5)',
            backdropFilter: 'blur(4px)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #374151'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <Upload size={24} style={{ color: '#60A5FA', marginRight: '8px' }} />
              Upload Image
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                border: '2px dashed #4B5563',
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
                transition: 'border-color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#60A5FA'}
              onMouseLeave={(e) => e.target.style.borderColor = '#4B5563'}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <Camera size={48} style={{ color: '#9CA3AF', marginBottom: '8px' }} />
                  <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>Choose an image</span>
                  <span style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '4px' }}>
                    Supports PNG, JPG, JPEG (max 10MB)
                  </span>
                </label>
              </div>

              {selectedImage && (
                <div style={{ marginTop: '16px' }}>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    style={{
                      width: '100%',
                      maxHeight: '256px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #4B5563'
                    }}
                  />
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '8px' }}>
                    Selected: {selectedImage.name}
                  </p>
                </div>
              )}

              {/* Confidence Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB' }}>
                  Confidence Threshold: {confidence}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#374151',
                    borderRadius: '4px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF' }}>
                  <span>0.1 (Low)</span>
                  <span>1.0 (High)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={handleDetection}
                  disabled={!selectedImage || loading || backendStatus !== 'healthy'}
                  style={{
                    flex: 1,
                    background: !selectedImage || loading || backendStatus !== 'healthy' 
                      ? 'linear-gradient(to right, #4B5563, #4B5563)' 
                      : 'linear-gradient(to right, #3B82F6, #8B5CF6)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: !selectedImage || loading || backendStatus !== 'healthy' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></div>
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Zap size={20} style={{ marginRight: '8px' }} />
                      Detect Objects
                    </>
                  )}
                </button>

                <button
                  onClick={resetDetection}
                  style={{
                    background: '#4B5563',
                    color: 'white',
                    fontWeight: '600',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#374151'}
                  onMouseLeave={(e) => e.target.style.background = '#4B5563'}
                >
                  Reset
                </button>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #EF4444',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <AlertCircle size={20} style={{ color: '#F87171', marginRight: '8px', flexShrink: 0 }} />
                  <span style={{ color: '#F87171' }}>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div style={{
            background: 'rgba(55, 65, 81, 0.5)',
            backdropFilter: 'blur(4px)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #374151'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <Zap size={24} style={{ color: '#A78BFA', marginRight: '8px' }} />
              Detection Results
            </h2>

            {!detectionResults ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
                <Camera size={64} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>Upload an image and click "Detect Objects" to see results</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Annotated Image */}
                {detectionResults.annotated_image && (
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '8px' }}>Detected Objects:</h3>
                    <img
                      src={detectionResults.annotated_image}
                      alt="Detection results"
                      style={{ width: '100%', borderRadius: '8px', border: '1px solid #4B5563' }}
                    />
                  </div>
                )}

                {/* Detection Statistics */}
                <div style={{ background: 'rgba(55, 65, 81, 0.5)', borderRadius: '8px', padding: '16px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '8px' }}>Detection Summary:</h3>
                  <p style={{ color: '#10B981', fontWeight: '600' }}>
                    Found {detectionResults.num_detections} object(s)
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                    Confidence threshold: {detectionResults.model_info?.confidence_threshold}
                  </p>
                </div>

                {/* Detailed Results */}
                {detectionResults.detections && detectionResults.detections.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '500' }}>Detected Objects:</h3>
                    {detectionResults.detections.map((detection, index) => (
                      <div key={index} style={{ background: 'rgba(55, 65, 81, 0.5)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '500', color: '#60A5FA' }}>
                            {detection.class}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: '#10B981' }}>
                            {(detection.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                          Position: ({Math.round(detection.bbox.x1)}, {Math.round(detection.bbox.y1)}) to ({Math.round(detection.bbox.x2)}, {Math.round(detection.bbox.y2)})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '48px', color: '#9CA3AF' }}>
          <p>Powered by YOLOv11 and trained on space station imagery</p>
        </div>
      </div>

      {/* Add CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
