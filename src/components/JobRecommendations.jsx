import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';
import { FaBriefcase, FaMapMarkerAlt, FaBuilding, FaClock, FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight, FaFilter, FaStar, FaUserGraduate, FaUserTie, FaSyncAlt, FaSortAmountDown, FaSearch, FaTimes, FaArrowRight } from 'react-icons/fa';

const JobRecommendations = ({ userId, sessionId, apiBaseUrl = API_BASE_URL }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Portfolio state
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalJobs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Filter state
  const [filters, setFilters] = useState({
    experienceLevel: '', // '' | 'fresher' | 'experienced' — mandatory
    location: '',
    jobType: 'all',
    source: 'all',
    sortBy: 'score',
    perPage: 10
  });

  // Track if experience level has been selected (mandatory)
  const [experienceSelected, setExperienceSelected] = useState(false);

  // Fetch job stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/jobs/stats`);
      if (response.data.success) {
        setStats(response.data.statistics);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [apiBaseUrl]);

  // Fetch Portfolios
  const fetchPortfolios = useCallback(async () => {
    if (!sessionId && !userId) return;
    try {
      setLoadingPortfolios(true);
      // Fallback to sessionId to fetch user's portfolios
      const sid = sessionId || 'default'; // In this app typically sessionId is used if userId isn't directly passed for auth
      const response = await axios.get(`${apiBaseUrl}/api/user/${sid}/portfolios`);
      if (response.data.success) {
        setPortfolios(response.data.portfolios || []);
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoadingPortfolios(false);
    }
  }, [apiBaseUrl, sessionId, userId]);

  // Fetch recommendations with pagination
  const fetchRecommendations = useCallback(async (page = 1) => {
    if (!experienceSelected) return;

    try {
      setLoading(true);
      setError(null);

      const endpoint = userId
        ? `/api/jobs/recommendations/${userId}`
        : `/api/jobs/recommendations/session/${sessionId}`;

      const params = new URLSearchParams({
        page: page.toString(),
        perPage: filters.perPage.toString(),
        sortBy: filters.sortBy,
        experienceLevel: filters.experienceLevel,
        ...(selectedPortfolioId && { portfolioId: selectedPortfolioId }),
        ...(filters.location && { location: filters.location }),
        ...(filters.jobType !== 'all' && { jobType: filters.jobType }),
        ...(filters.source !== 'all' && { source: filters.source })
      });

      const response = await axios.get(`${apiBaseUrl}${endpoint}?${params}`);

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching recommendations');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [userId, sessionId, apiBaseUrl, filters, experienceSelected, selectedPortfolioId]);

  // Initial stats fetch
  useEffect(() => {
    if (userId || sessionId) {
      fetchStats();
      fetchPortfolios();
    }
  }, [userId, sessionId, fetchStats, fetchPortfolios]);

  // Fetch when experience level is selected for the first time
  useEffect(() => {
    if (experienceSelected && selectedPortfolioId && (userId || sessionId)) {
      fetchRecommendations(1);
    }
  }, [experienceSelected, selectedPortfolioId, userId, sessionId, fetchRecommendations]);

  // Handle experience level selection (mandatory)
  const handleExperienceSelect = (level) => {
    setFilters(prev => ({ ...prev, experienceLevel: level }));
    setExperienceSelected(true);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters (reset to page 1)
  const handleApplyFilters = () => {
    fetchRecommendations(1);
  };

  // Page navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchRecommendations(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fetch progress state
  const [fetchProgress, setFetchProgress] = useState(null); // null = not fetching, object = progress data

  // Fetch fresh jobs with SSE progress
  const handleFreshFetch = () => {
    if (loading) return;
    setLoading(true);
    setFetchProgress({ messages: [], currentLoop: 0, maxLoops: 6, currentJobs: 0, targetJobs: 200, totalSaved: 0, phase: 'init' });

    const params = new URLSearchParams({
      ...(userId && { userId }),
      ...(sessionId && { sessionId }),
      ...(selectedPortfolioId && { portfolioId: selectedPortfolioId })
    });

    const eventSource = new EventSource(`${apiBaseUrl}/api/jobs/fetch-fresh-stream?${params}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setFetchProgress(prev => {
          if (!prev) return prev;
          const newMessages = [...prev.messages, data.message].slice(-8); // Keep last 8 messages

          const updates = { ...prev, messages: newMessages };

          if (data.type === 'loop_start') {
            updates.currentLoop = data.loop;
            updates.maxLoops = data.maxLoops;
            updates.phase = 'fetching';
          }
          if (data.type === 'loop_result') {
            updates.currentJobs = data.currentJobs || prev.currentJobs;
            updates.targetJobs = data.targetJobs || prev.targetJobs;
            updates.totalSaved = data.totalSaved || prev.totalSaved;
            updates.lastEvaluated = data.evaluated;
            updates.lastMatched = data.matched;
          }
          if (data.type === 'pruned') {
            updates.phase = 'pruning';
          }
          if (data.type === 'status' && data.currentJobs !== undefined) {
            updates.currentJobs = data.currentJobs;
            updates.targetJobs = data.targetJobs || prev.targetJobs;
          }
          if (data.type === 'complete') {
            updates.phase = 'complete';
            updates.currentJobs = data.totalJobs || prev.currentJobs;
            updates.totalSaved = data.totalSaved || prev.totalSaved;
          }
          if (data.type === 'error') {
            updates.phase = 'error';
          }

          return updates;
        });

        if (data.type === 'complete') {
          eventSource.close();
          // Wait a moment then refresh the job list
          setTimeout(async () => {
            await fetchStats();
            await fetchRecommendations(1);
            setLoading(false);
            // Keep progress visible for 3 seconds after completion
            setTimeout(() => setFetchProgress(null), 4000);
          }, 500);
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setFetchProgress(prev => prev ? { ...prev, phase: 'error', messages: [...prev.messages, '❌ Connection lost'] } : null);
      setLoading(false);
      setTimeout(() => setFetchProgress(null), 5000);
    };
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // Match score color
  const getScoreColor = (score) => {
    if (score >= 70) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  };

  // ─── PORTFOLIO SELECTION (STEP 1) ───
  if (loadingPortfolios && !selectedPortfolioId && portfolios.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <FaSyncAlt className="animate-spin text-blue-500 text-4xl mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Loading your portfolios...</h2>
      </div>
    );
  }

  if (!selectedPortfolioId) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 mb-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-500 mb-6 mx-auto">
              <FaBriefcase className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Select a Portfolio</h2>
            <p className="text-lg text-gray-500">
              Choose the portfolio profile you want to use. We will analyze its skills and experience to find the perfect jobs for you.
            </p>
          </div>

          {portfolios.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <FaBriefcase className="text-4xl text-gray-300" />
              </div>
              <p className="text-xl font-medium text-gray-900 mb-2">You haven't generated any portfolios yet!</p>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Create a portfolio first to get AI-matched job recommendations tailored to your skills.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolios.map(portfolio => (
                <button
                  key={portfolio._id}
                  onClick={() => setSelectedPortfolioId(portfolio._id)}
                  className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden flex flex-col h-full"
                >
                  {/* Portfolio Header matching Dashboard */}
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 flex-shrink-0 flex items-center justify-center group-hover:shadow-md transition-shadow">
                        {portfolio.header?.photoUrl ? (
                          <img src={`${apiBaseUrl}${portfolio.header.photoUrl}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 font-bold text-2xl">{portfolio.header?.name?.charAt(0) || portfolio.title?.charAt(0) || 'P'}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {portfolio.header?.name || portfolio.title}
                        </h3>
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          {portfolio.personaType || 'Professional Profile'}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {portfolio.header?.shortAbout || portfolio.summary || 'A professional portfolio ready to be matched with opportunities.'}
                    </p>
                  </div>

                  {/* Portfolio Select Button */}
                  <div className="p-6 bg-white border-t border-gray-50 mt-auto">
                    <div className="w-full py-3 px-4 rounded-xl bg-gray-900 text-white font-medium text-center group-hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-sm group-hover:shadow">
                      <span>Select Portfolio</span>
                      <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── EXPERIENCE LEVEL SELECTION (STEP 2) ───
  if (!experienceSelected) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="text-3xl font-bold text-green-700">Ready to Match</div>
            </div>
          </div>
        )}

        {/* Mandatory Experience Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center max-w-2xl mx-auto">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's Find Your Perfect Job</h2>
          <p className="text-gray-500 mb-8">Select your experience level to get personalized job recommendations matched to your resume</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fresher Card */}
            <button
              onClick={() => handleExperienceSelect('fresher')}
              className="group p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 text-left bg-gradient-to-br from-blue-50 to-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                  <FaUserGraduate className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Fresher</h3>
                  <p className="text-sm text-gray-500">0-1 years experience</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Entry-level, internships, graduate roles, and junior positions</p>
            </button>

            {/* Experienced Card */}
            <button
              onClick={() => handleExperienceSelect('experienced')}
              className="group p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 text-left bg-gradient-to-br from-indigo-50 to-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition">
                  <FaUserTie className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Experienced</h3>
                  <p className="text-sm text-gray-500">2+ years experience</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Mid-level, senior, lead, and management positions</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN JOB RECOMMENDATIONS VIEW ───
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            🎯 Job Recommendations
          </h1>
          <p className="text-gray-500">
            AI-matched jobs for your resume • {filters.experienceLevel === 'fresher' ? '👨‍🎓 Fresher' : '👔 Experienced'} roles
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          {portfolios.length > 1 && (
            <button
              onClick={() => { setSelectedPortfolioId(''); setExperienceSelected(false); setRecommendations([]); }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
            >
              <FaTimes className="text-xs" /> Change Portfolio
            </button>
          )}
          <button
            onClick={() => { setExperienceSelected(false); setRecommendations([]); }}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
          >
            <FaTimes className="text-xs" /> Change Level
          </button>
          <button
            onClick={handleFreshFetch}
            disabled={loading}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} /> Fetch Fresh Jobs
          </button>
        </div>
      </div>

      {/* Live Fetch Progress Panel */}
      {fetchProgress && (
        <div className={`mb-6 rounded-xl border overflow-hidden transition-all duration-500 ${fetchProgress.phase === 'complete' ? 'border-green-300 bg-green-50' :
            fetchProgress.phase === 'error' ? 'border-red-300 bg-red-50' :
              'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50'
          }`}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {fetchProgress.phase === 'complete' ? (
                <span className="text-green-600 text-lg">🎉</span>
              ) : fetchProgress.phase === 'error' ? (
                <span className="text-red-600 text-lg">❌</span>
              ) : (
                <FaSyncAlt className="text-blue-600 animate-spin" />
              )}
              <span className={`font-semibold text-sm ${fetchProgress.phase === 'complete' ? 'text-green-700' :
                  fetchProgress.phase === 'error' ? 'text-red-700' :
                    'text-blue-700'
                }`}>
                {fetchProgress.phase === 'complete' ? 'Fetch Complete!' :
                  fetchProgress.phase === 'error' ? 'Fetch Failed' :
                    fetchProgress.phase === 'pruning' ? 'Cleaning Up...' :
                      `Fetching Jobs — Loop ${fetchProgress.currentLoop}/${fetchProgress.maxLoops}`}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-600">
              {fetchProgress.totalSaved > 0 && `+${fetchProgress.totalSaved} saved`}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${fetchProgress.phase === 'complete' ? 'bg-green-500' :
                      fetchProgress.phase === 'error' ? 'bg-red-500' :
                        'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                  style={{
                    width: `${Math.min(100, fetchProgress.targetJobs > 0
                      ? (fetchProgress.currentJobs / fetchProgress.targetJobs) * 100
                      : (fetchProgress.currentLoop / fetchProgress.maxLoops) * 100
                    )}%`
                  }}
                />
              </div>
              <span className="text-xs font-mono text-gray-500 min-w-[60px] text-right">
                {fetchProgress.currentJobs}/{fetchProgress.targetJobs}
              </span>
            </div>
          </div>

          {/* Live Messages */}
          <div className="px-4 pb-3 max-h-32 overflow-y-auto">
            {fetchProgress.messages.map((msg, i) => (
              <div
                key={i}
                className={`text-xs py-0.5 transition-opacity duration-300 ${i === fetchProgress.messages.length - 1
                    ? 'text-gray-800 font-medium'
                    : 'text-gray-400'
                  }`}
              >
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
            <div className="text-xs text-gray-500">Matched Jobs</div>
            <div className="text-2xl font-bold text-green-700">{pagination.totalJobs}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl border border-orange-200">
            <div className="text-xs text-gray-500">Page</div>
            <div className="text-2xl font-bold text-orange-700">
              {pagination.currentPage}/{pagination.totalPages || 1}
            </div>
          </div>
        </div>
      )}

      {/* ─── FILTERS BAR ─── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="e.g. Remote, NYC"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Job Type</label>
            <select
              value={filters.jobType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="score">Match Score</option>
              <option value="date">Newest First</option>
              <option value="company">Company Name</option>
            </select>
          </div>

          {/* Per Page */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Results per Page</label>
            <select
              value={filters.perPage}
              onChange={(e) => handleFilterChange('perPage', parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Apply Button */}
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              <FaSearch className="text-xs" /> Apply Filters
            </button>
          </div>
        </div>

        {/* Experience level pills */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-500">Experience:</span>
          <button
            onClick={() => { handleFilterChange('experienceLevel', 'fresher'); }}
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${filters.experienceLevel === 'fresher'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            👨‍🎓 Fresher
          </button>
          <button
            onClick={() => { handleFilterChange('experienceLevel', 'experienced'); }}
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${filters.experienceLevel === 'experienced'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            👔 Experienced
          </button>
        </div>
      </div>

      {/* ─── ERROR ─── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* ─── LOADING ─── */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-500">Matching jobs to your resume...</p>
        </div>
      )}

      {/* ─── JOB CARDS ─── */}
      {!loading && recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              ✨ Top Matches for You
              <span className="text-sm font-normal text-gray-500 ml-2">
                Showing {((pagination.currentPage - 1) * pagination.perPage) + 1}–{Math.min(pagination.currentPage * pagination.perPage, pagination.totalJobs)} of {pagination.totalJobs}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {recommendations.map((job) => (
              <div
                key={job.jobId}
                onClick={() => setSelectedJob(selectedJob?.jobId === job.jobId ? null : job)}
                className={`bg-white border rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedJob?.jobId === job.jobId
                  ? 'border-blue-400 shadow-lg ring-1 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                {/* Job Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        #{job.rank}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 truncate">{job.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <FaBuilding className="text-xs" /> {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs" /> {job.location}
                      </span>
                      {job.experience && (
                        <span className="flex items-center gap-1">
                          <FaClock className="text-xs" /> {job.experience}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className={`flex flex-col items-center p-2 rounded-lg border ${getScoreColor(job.matchScore).bg} ${getScoreColor(job.matchScore).border}`}>
                    <div className="text-xs text-gray-500 font-medium">Match</div>
                    <div className={`text-xl font-bold ${getScoreColor(job.matchScore).text}`}>
                      {job.matchScore}%
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium">
                    {job.jobType}
                  </span>
                  {job.source && (
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium">
                      {job.source}
                    </span>
                  )}
                  {job.salaryRange && job.salaryRange.min && (
                    <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-md font-medium">
                      💰 {job.salaryRange.currency || '$'}{job.salaryRange.min?.toLocaleString()}–{job.salaryRange.max?.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Expandable Details */}
                {selectedJob?.jobId === job.jobId && (
                  <div className="border-t border-gray-100 pt-4 mt-4 space-y-4 animate-fadeIn">
                    {/* Description — rendered as HTML since APIs return HTML content */}
                    {job.description && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">📝 Job Description</h4>
                        <div
                          className="text-sm text-gray-600 leading-relaxed job-description-html max-h-80 overflow-y-auto pr-2"
                          style={{
                            '--tw-prose-body': '#4b5563',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: job.description.length > 2000
                              ? job.description.substring(0, 2000) + '...'
                              : job.description
                          }}
                        />
                      </div>
                    )}

                    {/* Skills */}
                    {job.requiredSkills?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">🛠️ Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.map((skill, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-medium border border-purple-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Apply Button */}
                    {job.sourceUrl && (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 w-full justify-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                      >
                        View & Apply <FaExternalLinkAlt className="text-xs" />
                      </a>
                    )}
                  </div>
                )}

                {/* Click hint */}
                {selectedJob?.jobId !== job.jobId && (
                  <div className="text-xs text-blue-500 mt-2 font-medium">Click to view details →</div>
                )}
              </div>
            ))}
          </div>

          {/* ─── PAGINATION ─── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8 mb-4">
              {/* First page */}
              <button
                onClick={() => goToPage(1)}
                disabled={!pagination.hasPrevPage}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="First page"
              >
                <FaAngleDoubleLeft className="text-sm" />
              </button>

              {/* Previous */}
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Previous page"
              >
                <FaChevronLeft className="text-sm" />
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((pageNum, idx) => (
                <React.Fragment key={idx}>
                  {pageNum === '...' ? (
                    <span className="px-2 py-1 text-gray-400">…</span>
                  ) : (
                    <button
                      onClick={() => goToPage(pageNum)}
                      className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition ${pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {pageNum}
                    </button>
                  )}
                </React.Fragment>
              ))}

              {/* Next */}
              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Next page"
              >
                <FaChevronRight className="text-sm" />
              </button>

              {/* Last page */}
              <button
                onClick={() => goToPage(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Last page"
              >
                <FaAngleDoubleRight className="text-sm" />
              </button>
            </div>
          )}

          {/* Page info text */}
          {pagination.totalPages > 1 && (
            <p className="text-center text-sm text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalJobs} total jobs matched
            </p>
          )}
        </div>
      )}

      {/* ─── NO RESULTS ─── */}
      {!loading && !initialLoad && recommendations.length === 0 && !error && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-600 mb-2 font-medium">No jobs found matching your filters</p>
          <p className="text-sm text-gray-400 mb-4">Try changing your filters or fetch fresh jobs</p>
          <button
            onClick={handleFreshFetch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Fetch Fresh Job Listings
          </button>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;
