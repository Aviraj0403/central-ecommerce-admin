import Axios from '../utils/Axios';

export const getAllOffers = async () => {
  try {
    const response = await fetch('/api/offers');
    const data = await response.json();
    console.log("All Offers:", data);
    return data;
  } catch (error) {
    console.error("Error fetching all offers:", error);
  }
};
export const getActiveOffers = async () => {
  try {
    const response = await fetch('/offers/active');
    const data = await response.json();
    console.log("Active Offers:", data);
    return data;
  } catch (error) {
    console.error("Error fetching active offers:", error);
  }
};
export const getActivePromoCodeOffers = async () => {
  try {
    const response = await fetch('/offers/active/promos');
    const data = await response.json();
    console.log("Active Promo Code Offers:", data);
    return data;
  } catch (error) {
    console.error("Error fetching active promo code offers:", error);
  }
};
export const getOfferById = async (id) => {
  try {
    const response = await fetch(`/offers/${id}`);
    const data = await response.json();
    console.log("Offer by ID:", data);
    return data;
  } catch (error) {
    console.error("Error fetching offer by ID:", error);
  }
};
export const validatePromoCode = async (code) => {
  try {
    const response = await fetch(`/offers/validate/${code}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
      }
    });
    const data = await response.json();
    console.log("Promo code validation result:", data);
    return data;
  } catch (error) {
    console.error("Error validating promo code:", error);
  }
};
export const applyDiscount = async (promoCode) => {
  try {
    const response = await fetch('/offers/apply-discount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
      },
      body: JSON.stringify({ promoCode }),
    });
    const data = await response.json();
    console.log("Discount applied:", data);
    return data;
  } catch (error) {
    console.error("Error applying discount:", error);
  }
};
export const createOffer = async (offerData) => {
  try {
    const response = await fetch('/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, // Assuming admin token is stored in localStorage
      },
      body: JSON.stringify(offerData),
    });
    const data = await response.json();
    console.log("Offer created:", data);
    return data;
  } catch (error) {
    console.error("Error creating offer:", error);
  }
};
export const updateOffer = async (id, updatedData) => {
  try {
    const response = await fetch(`/offers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, // Assuming admin token is stored in localStorage
      },
      body: JSON.stringify(updatedData),
    });
    const data = await response.json();
    console.log("Offer updated:", data);
    return data;
  } catch (error) {
    console.error("Error updating offer:", error);
  }
};
export const deleteOffer = async (id) => {
  try {
    const response = await fetch(`/offers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`, // Assuming admin token is stored in localStorage
      },
    });
    const data = await response.json();
    console.log("Offer deleted:", data);
    return data;
  } catch (error) {
    console.error("Error deleting offer:", error);
  }
};
