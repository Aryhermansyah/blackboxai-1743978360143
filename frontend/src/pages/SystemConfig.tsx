import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Config {
  ocr_confidence_threshold: number;
  detection_timeout: number;
  auto_save: boolean;
  export_format: string;
  export_quality: number;
  debug_mode: boolean;
}

const SystemConfig: React.FC = () => {
  const [config, setConfig] = useState<Config>({
    ocr_confidence_threshold: 0.7,
    detection_timeout: 30,
    auto_save: true,
    export_format: 'jpg',
    export_quality: 90,
    debug_mode: false
  });
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/config');
      setConfig(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch configuration');
      console.error('Error fetching config:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/config', config);
      setStatus('Configuration saved successfully');
      setError('');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setError('Failed to save configuration');
      console.error('Error saving config:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setConfig({
      ...config,
      [e.target.name]: value
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Configuration</h2>
      
      {status && (
        <div className="mb-4 p-4 bg-green-50 rounded-md flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
          <span className="text-green-700">{status}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            OCR Confidence Threshold
            <input
              type="number"
              name="ocr_confidence_threshold"
              value={config.ocr_confidence_threshold}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Detection Timeout (seconds)
            <input
              type="number"
              name="detection_timeout"
              value={config.detection_timeout}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Export Format
            <select
              name="export_format"
              value={config.export_format}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="tiff">TIFF</option>
            </select>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Export Quality
            <input
              type="number"
              name="export_quality"
              value={config.export_quality}
              onChange={handleChange}
              min="1"
              max="100"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="auto_save"
            checked={config.auto_save}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Enable Auto Save
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="debug_mode"
            checked={config.debug_mode}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Debug Mode
          </label>
        </div>

        <div className="pt-5">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemConfig;