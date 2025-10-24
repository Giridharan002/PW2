import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import portfolioService from '../services/portfolioService.js';
import { FaPlus, FaEye, FaEdit, FaTrash, FaCopy, FaShare, FaDownload, FaPalette, FaCog, FaArrowRight, FaExclamationTriangle, FaCheck, FaTimes, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, [user]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await portfolioService.getUserPortfolios(user.sessionId);
      if (response.success) {
        setPortfolios(response.portfolios || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if API call fails
      navigate('/');
    }
  };

  const handleDeletePortfolio = async () => {
    if (!portfolioToDelete) return;

    try {
      await portfolioService.deletePortfolio(user.sessionId, portfolioToDelete._id);
      setPortfolios(portfolios.filter(p => p._id !== portfolioToDelete._id));
      setShowDeleteModal(false);
      setPortfolioToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTogglePublish = async (portfolio) => {
    try {
      const response = await portfolioService.togglePublish(user.sessionId, portfolio._id, !portfolio.isPublished);
      if (response.success) {
        setPortfolios(portfolios.map(p =>
          p._id === portfolio._id
            ? { ...p, isPublished: !p.isPublished }
            : p
        ));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDuplicatePortfolio = async (portfolio) => {
    try {
      // Create a copy of the portfolio data
      const duplicateData = {
        title: `${portfolio.title} (Copy)`,
        header: portfolio.header,
        summary: portfolio.summary,
        workExperience: portfolio.workExperience,
        education: portfolio.education
      };

      // Create new portfolio with the same data
      const response = await portfolioService.updatePortfolio(user.sessionId, portfolio._id, duplicateData);
      if (response.success) {
        await fetchPortfolios(); // Refresh the list
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your professional portfolios</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/create'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaPlus />
                Create Portfolio
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <span className="text-gray-700 font-medium">{user?.name}</span>
                  <FaChevronDown className="text-gray-500 text-xs" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaSignOutAlt className="text-gray-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-red-600" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {portfolios.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaPlus className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No portfolios yet</h2>
            <p className="text-gray-600 mb-6">Create your first professional portfolio to get started</p>
            <button
              onClick={() => window.location.href = '/create'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <FaPlus />
              Create Your First Portfolio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <div key={portfolio._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Portfolio Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {portfolio.header?.name || portfolio.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${portfolio.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {portfolio.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {portfolio.header?.shortAbout || 'Professional portfolio'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{portfolio.workExperience?.length || 0} experience</span>
                    <span>{portfolio.education?.length || 0} education</span>
                  </div>
                </div>

                {/* Portfolio Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {portfolio.header?.skills?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {portfolio.workExperience?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Positions</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => window.open(`/portfolio/${portfolio._id}`, '_blank')}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <FaEye className="text-xs" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        if (!portfolio.isPublished) {
                          alert('This portfolio is not published yet. Please publish it first.');
                          return;
                        }
                        window.open(`/public/${portfolio.urlSlug}`, '_blank');
                      }}
                      disabled={!portfolio.isPublished}
                      className={`flex-1 px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1 ${portfolio.isPublished ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                      title={portfolio.isPublished ? 'Open public page' : 'Publish first to enable'}
                    >
                      <FaShare className="text-xs" />
                      Public
                    </button>
                    <button
                      onClick={() => handleTogglePublish(portfolio)}
                      className={`px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1 ${portfolio.isPublished
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      {portfolio.isPublished ? <FaTimes className="text-xs" /> : <FaCheck className="text-xs" />}
                      {portfolio.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDuplicatePortfolio(portfolio)}
                      className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <FaCopy className="text-xs" />
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        setPortfolioToDelete(portfolio);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Portfolio</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{portfolioToDelete?.header?.name || portfolioToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPortfolioToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePortfolio}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
