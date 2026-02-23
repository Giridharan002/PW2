import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobRecommendations = ({ userId, sessionId, apiBaseUrl = 'http://localhost:5000' }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    limit: 10,
    location: '',
    experience: false
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch job recommendations
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = userId 
        ? `/api/jobs/recommendations/${userId}`
        : `/api/jobs/recommendations/session/${sessionId}`;

      const params = new URLSearchParams({
        limit: filter.limit,
        ...(filter.location && { location: filter.location }),
        ...(filter.experience && { experience: 'filter' })
      });

      const response = await axios.get(`${apiBaseUrl}${endpoint}?${params}`);

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
      } else {
        setError(response.data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching recommendations');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch job statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/jobs/stats`);
      if (response.data.success) {
        setStats(response.data.statistics);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId || sessionId) {
      fetchRecommendations();
      fetchStats();
    }
  }, [userId, sessionId]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchRecommendations();
  };

  // Fetch fresh jobs
  const handleFreshFetch = async () => {
    try {
      setLoading(true);
      await axios.post(`${apiBaseUrl}/api/jobs/fetch-fresh`);
      await fetchRecommendations();
      await fetchStats();
    } catch (err) {
      setError('Failed to fetch fresh job listings');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🎯 Job Recommendations
        </h1>
        <p className="text-gray-600">
          AI-powered job matches based on your resume and experience
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Jobs</div>
            <div className="text-2xl font-bold text-purple-700">
              {stats.totalActiveJobs}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Sources</div>
            <div className="text-2xl font-bold text-blue-700">
              {Object.keys(stats.bySource).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Job Types</div>
            <div className="text-2xl font-bold text-green-700">
              {Object.keys(stats.byType).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Found Matches</div>
            <div className="text-2xl font-bold text-orange-700">
              {recommendations.length}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Results
            </label>
            <input
              type="number"
              name="limit"
              value={filter.limit}
              onChange={handleFilterChange}
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g., San Francisco"
              value={filter.location}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="experience"
                checked={filter.experience}
                onChange={handleFilterChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Filter by experience level
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
          >
            Apply Filters
          </button>
          
          <button
            onClick={handleFreshFetch}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition"
          >
            {loading ? 'Fetching...' : 'Fetch Fresh Jobs'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Finding perfect job matches...</p>
        </div>
      )}

      {/* Job Recommendations */}
      {!loading && recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✨ Top Matches for You
          </h2>

          <div className="space-y-4">
            {recommendations.map((job) => (
              <div
                key={job.jobId}
                onClick={() => setSelectedJob(selectedJob?.jobId === job.jobId ? null : job)}
                className={`border rounded-lg p-6 cursor-pointer transition transform hover:shadow-lg ${
                  selectedJob?.jobId === job.jobId
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Job Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded">
                        #{job.rank}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {job.company} • {job.location}
                    </p>
                  </div>

                  {/* Source Badge */}
                  {job.source && (
                    <div className="text-center p-3 rounded-lg bg-blue-100">
                      <div className="text-xs text-gray-600 font-medium">Source</div>
                      <div className="text-sm font-bold text-blue-700">{job.source}</div>
                    </div>
                  )}
                </div>

                {/* Job Meta */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {job.jobType}
                  </span>
                  {job.source && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {job.source}
                    </span>
                  )}
                  {job.salaryRange && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      ${job.salaryRange.min?.toLocaleString()}-${job.salaryRange.max?.toLocaleString()} {job.salaryRange.currency}
                    </span>
                  )}
                </div>



                {/* Expandable Details */}
                {selectedJob?.jobId === job.jobId && (
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                      {/* Job Description */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📝 Job Description:</h4>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                        {job.description || 'No description available'}
                      </p>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      View & Apply on {job.source} →
                    </a>
                  </div>
                )}

                {/* Quick View CTA */}
                {selectedJob?.jobId !== job.jobId && (
                  <div className="text-sm text-blue-600 font-medium">
                    Click to view details
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && recommendations.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-600 mb-4">No job recommendations found</p>
          <button
            onClick={handleFreshFetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Fetch Job Listings
          </button>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;
