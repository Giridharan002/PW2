import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

class PortfolioService {
  // Create portfolio from PDF (self.so's approach)
  async createPortfolio(sessionId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `/api/user/${sessionId}/portfolio`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 90000 // 90 second timeout for AI processing
        }
      );

      console.log('✅ Portfolio Creation Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Portfolio Creation Failed:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create portfolio');
    }
  }

  // Get user's portfolios
  async getUserPortfolios(sessionId) {
    try {
      const response = await axios.get(`/api/user/${sessionId}/portfolios`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch portfolios');
    }
  }

  // Get specific portfolio
  async getPortfolio(sessionId, portfolioId) {
    try {
      const response = await axios.get(`/api/user/${sessionId}/portfolio/${portfolioId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch portfolio');
    }
  }

  // Get public portfolio by slug
  async getPublicPortfolio(slug) {
    try {
      const response = await axios.get(`/api/public/${slug}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Portfolio not found');
    }
  }

  // Update portfolio
  async updatePortfolio(sessionId, portfolioId, data) {
    try {
      const response = await axios.put(`/api/user/${sessionId}/portfolio/${portfolioId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update portfolio');
    }
  }

  // Upload profile photo for a portfolio
  async uploadPortfolioPhoto(sessionId, portfolioId, file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post(`/api/user/${sessionId}/portfolio/${portfolioId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload photo');
    }
  }

  // Toggle publish status
  async togglePublish(sessionId, portfolioId, isPublished) {
    try {
      const response = await axios.put(`/api/user/${sessionId}/portfolio/${portfolioId}/publish`, { isPublished });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update portfolio status');
    }
  }

  // Delete portfolio
  async deletePortfolio(sessionId, portfolioId) {
    try {
      const response = await axios.delete(`/api/user/${sessionId}/portfolio/${portfolioId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete portfolio');
    }
  }
}

export default new PortfolioService();
