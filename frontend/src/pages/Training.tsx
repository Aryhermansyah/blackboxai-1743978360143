import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface UploadedFile {
  id: number;
  name: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const Training: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      status: 'uploading' as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    acceptedFiles.forEach((file, index) => {
      const formData = new FormData();
      formData.append('file', file);

      const config = {
        onUploadProgress: (progressEvent: any) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setFiles(prev => prev.map(f => 
            f.name === file.name ? { ...f, progress } : f
          ));
        }
      };

      axios.post('http://localhost:5000/api/upload', formData, config)
        .then(response => {
          setFiles(prev => prev.map(f => 
            f.name === file.name 
              ? { ...f, status: 'success' as const, progress: 100 } 
              : f
          ));
        })
        .catch(error => {
          setFiles(prev => prev.map(f => 
            f.name === file.name 
              ? { 
                  ...f, 
                  status: 'error' as const, 
                  error: error.response?.data?.message || 'Upload failed' 
                } 
              : f
          ));
        });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4', '.mov']
    }
  });

  const removeFile = (id: number) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400'}`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">
          Drag & drop files here, or click to select files
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Support for JPG, PNG, MP4, and MOV files
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {files.map(file => (
              <li key={file.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    {file.status === 'success' && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                    )}
                    {file.status === 'error' && (
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    {file.status === 'uploading' && (
                      <div className="h-5 w-5 mr-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      {file.status === 'error' && (
                        <p className="text-sm text-red-500">{file.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    {file.status === 'uploading' && (
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(file.progress)}%
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                {file.status === 'uploading' && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Training History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Training History</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.filter(f => f.status === 'success').map(file => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {file.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date().toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Training;