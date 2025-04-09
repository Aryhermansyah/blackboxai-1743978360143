import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SystemConfig {
  status: string;
  lightroom_connected: boolean;
  ocr_status: boolean;
}

const SystemConfig: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/config');
      setConfig(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch system configuration');
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">System Configuration</h2>
                
                {/* System Status */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">System Status</h3>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${config?.status === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="capitalize">{config?.status || 'Unknown'}</span>
                  </div>
                </div>

                {/* Lightroom Connection */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Lightroom Connection</h3>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${config?.lightroom_connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{config?.lightroom_connected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>

                {/* OCR Status */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">OCR System</h3>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${config?.ocr_status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{config?.ocr_status ? 'Operational' : 'Not Working'}</span>
                  </div>
                </div>

                {/* Refresh Button */}
                <div className="mt-8">
                  <button
                    onClick={fetchConfig}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    <i className="fas fa-sync-alt mr-2"></i>
                    Refresh Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;