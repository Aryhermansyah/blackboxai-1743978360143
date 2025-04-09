import React, { useState, useRef } from 'react';
import axios from 'axios';

interface UploadStatus {
  file: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const Training: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const newUploads = files.map(file => ({
      file: file.name,
      status: 'pending' as const,
      progress: 0
    }));

    setUploads(prev => [...prev, ...newUploads]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploads(prev => prev.map(upload => 
          upload.file === file.name 
            ? { ...upload, status: 'uploading' }
            : upload
        ));

        const response = await axios.post('http://localhost:5000/api/training/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            setUploads(prev => prev.map(upload => 
              upload.file === file.name 
                ? { ...upload, progress }
                : upload
            ));
          }
        });

        setUploads(prev => prev.map(upload => 
          upload.file === file.name 
            ? { ...upload, status: 'success', progress: 100 }
            : upload
        ));
      } catch (error) {
        setUploads(prev => prev.map(upload => 
          upload.file === file.name 
            ? { 
                ...upload, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : upload
        ));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4 sm:px-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white shadow-lg sm:rounded-3xl px-4 py-10 sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Training Data Upload</h2>

                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  <div className="space-y-4">
                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                    <div className="text-lg">
                      Drag and drop your files here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        browse
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Supported formats: Images (JPG, PNG) and Videos (MP4)
                    </p>
                  </div>
                </div>

                {/* Upload Status List */}
                {uploads.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Uploads</h3>
                    <div className="space-y-4">
                      {uploads.map((upload, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium truncate">{upload.file}</span>
                            <span className={`text-sm ${
                              upload.status === 'success' ? 'text-green-500' :
                              upload.status === 'error' ? 'text-red-500' :
                              'text-blue-500'
                            }`}>
                              {upload.status === 'success' ? (
                                <i className="fas fa-check"></i>
                              ) : upload.status === 'error' ? (
                                <i className="fas fa-times"></i>
                              ) : (
                                `${upload.progress}%`
                              )}
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                upload.status === 'success' ? 'bg-green-500' :
                                upload.status === 'error' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${upload.progress}%` }}
                            ></div>
                          </div>

                          {upload.error && (
                            <p className="text-sm text-red-500 mt-2">{upload.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Training Guidelines</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                    <li>Upload high-quality images or videos for better training results</li>
                    <li>Include a variety of lighting conditions and subjects</li>
                    <li>Ensure files are in supported formats (JPG, PNG for images; MP4 for videos)</li>
                    <li>Maximum file size: 50MB per file</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;