import Axios from '../utils/Axios';

// Public API - Get active promo banners for frontend
export const getPromoBanners = async () => {
  try {
    const response = await Axios.get('/promo-banners');
    if (response.data.success) {
      return response.data.banners || response.data.data || response.data;
    } else {
      throw new Error('Failed to fetch promo banners');
    }
  } catch (error) {
    console.error('Error fetching promo banners:', error);
    return [];
  }
};

// Admin APIs - Protected routes
export const getAdminPromoBanners = async () => {
  try {
    const response = await Axios.get('/promo-banners/admin');
    console.log('Full API Response:', response.data); // Debug log
    
    if (response.data.success) {
      // Try different possible response structures
      const banners = response.data.banners || response.data.data || response.data.promoBanners || [];
      console.log('Extracted banners:', banners); // Debug log
      return Array.isArray(banners) ? banners : [];
    } else {
      console.warn('API response success is false:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching admin promo banners:', error);
    // If it's a 404 or endpoint doesn't exist, return empty array
    if (error.response?.status === 404) {
      console.warn('Promo banners endpoint not found (404)');
    }
    return [];
  }
};

export const getPromoBanner = async (bannerId) => {
  try {
    console.log('Fetching banner with ID:', bannerId);
    const response = await Axios.get(`/promo-banners/admin/${bannerId}`);
    console.log('Get banner API response:', response.data);
    
    if (response.data.success) {
      const banner = response.data.promoBanner || response.data.banner || response.data.data;
      console.log('Extracted banner data:', banner);
      return banner;
    } else {
      throw new Error('Failed to fetch promo banner');
    }
  } catch (error) {
    console.error('Error fetching promo banner:', error);
    return null;
  }
};

export const createPromoBanner = async (bannerData) => {
  try {
    const formData = new FormData();
    
    // Append all banner data to FormData
    Object.keys(bannerData).forEach(key => {
      if (bannerData[key] !== null && bannerData[key] !== undefined) {
        formData.append(key, bannerData[key]);
      }
    });

    const response = await Axios.post('/promo-banners/admin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data.banner || response.data.data;
    } else {
      throw new Error('Failed to create promo banner');
    }
  } catch (error) {
    console.error('Error creating promo banner:', error);
    throw error;
  }
};

export const updatePromoBanner = async (bannerId, bannerData) => {
  try {
    const formData = new FormData();
    
    // Append all banner data to FormData
    Object.keys(bannerData).forEach(key => {
      if (bannerData[key] !== null && bannerData[key] !== undefined) {
        formData.append(key, bannerData[key]);
      }
    });

    const response = await Axios.patch(`/promo-banners/admin/${bannerId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data.banner || response.data.data;
    } else {
      throw new Error('Failed to update promo banner');
    }
  } catch (error) {
    console.error('Error updating promo banner:', error);
    throw error;
  }
};

export const deletePromoBanner = async (bannerId) => {
  try {
    const response = await Axios.delete(`/promo-banners/admin/${bannerId}`);
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error('Failed to delete promo banner');
    }
  } catch (error) {
    console.error('Error deleting promo banner:', error);
    throw error;
  }
};

export const toggleBannerStatus = async (bannerId) => {
  try {
    const response = await Axios.patch(`/promo-banners/admin/${bannerId}/toggle`);
    if (response.data.success) {
      return response.data.promoBanner || response.data.banner || response.data.data;
    } else {
      throw new Error('Failed to toggle banner status');
    }
  } catch (error) {
    console.error('Error toggling banner status:', error);
    throw error;
  }
};