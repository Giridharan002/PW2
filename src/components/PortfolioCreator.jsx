import React, { useState, useRef, useCallback } from 'react';
import { FaUpload, FaFilePdf, FaTimes, FaRocket, FaCheck, FaExclamationTriangle, FaCog, FaEye, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import portfolioService from '../services/portfolioService.js';

const PortfolioCreator = () => {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(1); // 1: Upload, 2: Processing, 3: Success, 4: Error
    const [error, setError] = useState('');
    const [createdPortfolio, setCreatedPortfolio] = useState(null);

    const fileInputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                setSelectedFile(file);
                setError('');
            } else {
                setError('Please upload a PDF file');
            }
        }
    }, []);

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setError('');
        } else {
            setError('Please select a PDF file');
        }
    };

    const handleCreatePortfolio = async () => {
        if (!selectedFile) {
            setError('Please select a PDF file first');
            return;
        }

        setProcessing(true);
        setStep(2);
        setError('');
        setProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 90) return prev + 5;
                    return prev;
                });
            }, 500);

            // Create portfolio using self.so's approach
            const result = await portfolioService.createPortfolio(user.sessionId, selectedFile);

            clearInterval(progressInterval);
            setProgress(100);

            console.log('🎉 Portfolio Creation Result:', result);

            if (result.success && result.portfolio) {
                setCreatedPortfolio(result.portfolio);
                setStep(3); // Success step
            } else {
                throw new Error(result.message || 'Portfolio creation failed');
            }

        } catch (err) {
            console.error('❌ Portfolio Creation Failed:', err);
            setError(err.message || 'Failed to create portfolio');
            setStep(4); // Error step
        } finally {
            setProcessing(false);
        }
    };

    const renderUploadStep = () => (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FaRocket className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Create Your Portfolio
                </h1>
                <p className="text-gray-600">
                    Upload your resume PDF and we'll create a beautiful portfolio automatically
                </p>
            </div>

            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : selectedFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {selectedFile ? (
                    <div className="space-y-4">
                        <FaFilePdf className="mx-auto h-12 w-12 text-red-600" />
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{selectedFile.name}</p>
                            <p className="text-gray-600">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <FaTimes className="text-sm" />
                            Remove File
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">
                                Drop your resume PDF here, or click to browse
                            </p>
                            <p className="text-sm text-gray-500">
                                We'll extract your information and create a professional portfolio
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <button
                onClick={handleCreatePortfolio}
                disabled={!selectedFile || processing}
                className={`w-full mt-6 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${selectedFile && !processing
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                    }`}
            >
                {processing ? (
                    <span className="flex items-center justify-center gap-2">
                        <FaCog className="animate-spin" />
                        Processing...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <FaRocket />
                        Create Portfolio
                    </span>
                )}
            </button>
        </div>
    );

    const renderProcessingStep = () => (
        <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
                <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FaCog className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Creating Your Portfolio
                </h2>
                <p className="text-gray-600">
                    Analyzing your resume and generating a professional portfolio...
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-sm text-gray-500">{progress}% Complete</p>

            {/* Processing Steps */}
            <div className="mt-8 space-y-4">
                <div className={`flex items-center gap-3 ${progress > 20 ? 'text-green-600' : 'text-gray-400'}`}>
                    <FaCheck className={progress > 20 ? 'text-green-600' : 'text-gray-400'} />
                    <span>PDF Text Extraction</span>
                </div>
                <div className={`flex items-center gap-3 ${progress > 40 ? 'text-green-600' : 'text-gray-400'}`}>
                    <FaCheck className={progress > 40 ? 'text-green-600' : 'text-gray-400'} />
                    <span>AI Data Extraction</span>
                </div>
                <div className={`flex items-center gap-3 ${progress > 60 ? 'text-green-600' : 'text-gray-400'}`}>
                    <FaCheck className={progress > 60 ? 'text-green-600' : 'text-gray-400'} />
                    <span>Portfolio Generation</span>
                </div>
                <div className={`flex items-center gap-3 ${progress > 80 ? 'text-green-600' : 'text-gray-400'}`}>
                    <FaCheck className={progress > 80 ? 'text-green-600' : 'text-gray-400'} />
                    <span>Finalizing</span>
                </div>
            </div>
        </div>
    );

    const renderSuccessStep = () => (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FaCheck className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Portfolio Created Successfully!
                </h2>
                <p className="text-gray-600">
                    Your professional portfolio is ready with all your information extracted from your resume
                </p>
            </div>

            {/* Portfolio Preview */}
            {createdPortfolio && (
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Preview</h3>
                    <div className="grid gap-4">
                        <div>
                            <span className="font-medium text-gray-700">Name:</span>
                            <span className="ml-2 text-gray-900">{createdPortfolio.header?.name || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="ml-2 text-gray-900">{createdPortfolio.header?.contacts?.email || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Location:</span>
                            <span className="ml-2 text-gray-900">{createdPortfolio.header?.location || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Skills:</span>
                            <span className="ml-2 text-gray-900">
                                {createdPortfolio.header?.skills?.join(', ') || 'Not provided'}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Experience:</span>
                            <span className="ml-2 text-gray-900">
                                {createdPortfolio.workExperience?.length || 0} positions
                                {createdPortfolio.workExperience?.length > 0 && (
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({createdPortfolio.workExperience.map(exp => exp.title).join(', ')})
                                    </span>
                                )}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Education:</span>
                            <span className="ml-2 text-gray-900">
                                {createdPortfolio.education?.length || 0} entries
                                {createdPortfolio.education?.length > 0 && (
                                    <span className="text-sm text-gray-500 ml-2">
                                        ({createdPortfolio.education.map(edu => edu.degree).join(', ')})
                                    </span>
                                )}
                            </span>
                        </div>
                        {createdPortfolio.summary && (
                            <div>
                                <span className="font-medium text-gray-700">Summary:</span>
                                <p className="ml-2 text-gray-900 mt-1 text-sm">
                                    {createdPortfolio.summary.substring(0, 150)}...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => window.open(`/portfolio/${createdPortfolio._id}`, '_blank')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
                >
                    <FaEye />
                    View Portfolio
                </button>
                <button
                    onClick={() => window.open(`/public/${createdPortfolio.urlSlug}`, '_blank')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 justify-center"
                >
                    <FaEye />
                    View Public Link
                </button>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 justify-center"
                >
                    <FaArrowRight />
                    Go to Dashboard
                </button>
            </div>
        </div>
    );

    const renderErrorStep = () => (
        <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
                <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <FaExclamationTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Something Went Wrong
                </h2>
                <p className="text-gray-600 mb-4">
                    {error}
                </p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => setStep(1)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );

    const renderStep = () => {
        switch (step) {
            case 1:
                return renderUploadStep();
            case 2:
                return renderProcessingStep();
            case 3:
                return renderSuccessStep();
            case 4:
                return renderErrorStep();
            default:
                return renderUploadStep();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {renderStep()}
            </div>
        </div>
    );
};

export default PortfolioCreator;