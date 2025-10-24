import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFilePdf, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

const PDFUpload = ({ onDataExtracted, theme }) => {
  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setError('');
      await processFile(file);
    } else {
      setError('Please upload a valid PDF file');
    }
  };

  const processFile = async (file) => {
    setIsProcessing(true);
    setError('');

    try {
      if (!user || !user.sessionId) {
        setError('Please log in to upload a resume');
        return;
      }

      const formData = new FormData();
      formData.append('pdf', file);

      // Use the smart portfolio endpoint with enhanced resume processing
      const response = await axios.post(`${API_BASE_URL}/api/smart/user/${user.sessionId}/portfolio`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Smart portfolio data is already in the correct format
        onDataExtracted(response.data.portfolio);
      } else {
        setError('Failed to process PDF');
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error.response?.data?.message || 'Error processing PDF. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError('');
  };



  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="mb-8">
      <h2 className="text-blue-600 dark:text-blue-400 text-2xl md:text-3xl mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-blue-600 dark:after:bg-blue-400">
        Upload Resume
      </h2>

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <FaUpload className="text-4xl text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop a PDF file here, or click to select
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaFilePdf className="text-red-500 text-2xl mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {isProcessing ? (
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <FaSpinner className="animate-spin mr-2" />
                <span>Processing...</span>
              </div>
            ) : (
              <button
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <FaTimes className="text-xl" />
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PDFUpload;
