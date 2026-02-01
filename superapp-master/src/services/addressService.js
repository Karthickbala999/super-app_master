import API_CONFIG from '../config/api.config.js';

class AddressService {
  // Helper to normalize backend data to frontend model
  static normalizeAddress(data, fallback = {}) {
    if (!data || typeof data !== 'object') {
      if (fallback && Object.keys(fallback).length > 0) return AddressService.normalizeAddress(fallback);
      return null;
    }

    // Check if object is practically empty (no name, no phone, no address parts)
    // We check against both data and fallback merged
    const merged = { ...fallback, ...data };

    // Core fields check
    const hasContent = merged.fullName || merged.full_name || merged.name ||
      merged.houseNo || merged.house_no ||
      merged.roadName || merged.road_name ||
      merged.city || merged.pincode || merged.zip_code;

    if (!hasContent) return null;

    return {
      _id: data._id || data.id || fallback._id || fallback.id,
      fullName: data.fullName || data.full_name || data.name || fallback.fullName || '',
      phoneNumber: data.phoneNumber || data.phone_number || data.contact || fallback.phoneNumber || '',
      altPhoneNumber: data.altPhoneNumber || data.alt_phone_number || fallback.altPhoneNumber || '',
      houseNo: data.houseNo || data.house_no || data.house_number || fallback.houseNo || '',
      addressLine2: data.addressLine2 || data.address_line_2 || fallback.addressLine2 || '',
      roadName: data.roadName || data.road_name || data.street || fallback.roadName || '',
      landmark: data.landmark || fallback.landmark || '',
      city: data.city || fallback.city || '',
      state: data.state || fallback.state || '',
      pincode: data.pincode || data.zip_code || data.postal_code || fallback.pincode || '',
      country: data.country || fallback.country || '',
      companyName: data.companyName || data.company_name || fallback.companyName || '',
      deliveryInstructions: data.deliveryInstructions || data.delivery_instructions || fallback.deliveryInstructions || '',
      selectedAddressType: data.selectedAddressType || data.selected_address_type || data.address_type || fallback.selectedAddressType || 'Home'
    };
  }

  // Get all addresses for the current user
  static async getUserAddresses() {
    let backendAddresses = [];
    let localAddresses = [];

    // 1. Try fetching from backend
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.SAVED_ADDRESSES), {
        headers: API_CONFIG.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Backend address response:', data);

        // Handle different response structures: { data: [...] } or [...]
        const rawList = Array.isArray(data) ? data : (data.data || []);

        if (Array.isArray(rawList)) {
          backendAddresses = rawList.map(addr => AddressService.normalizeAddress(addr)).filter(Boolean);
        }
      } else {
        console.warn('Backend address fetch failed:', response.status);
      }
    } catch (error) {
      console.error('Error fetching addresses from backend:', error);
    }

    // 2. Fetch from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('userAddresses')) || [];
      localAddresses = stored.map(addr => AddressService.normalizeAddress(addr)).filter(Boolean);
    } catch (e) {
      console.error('Error parsing local addresses:', e);
    }

    // 3. Merge strategies (prefer backend, but allow local if backend is empty or for "ghost" local addresses)
    // For now, we'll simple concatenation, but ideally we should deduplicate by ID if possible.
    // If backend worked and returned 0, we still want to show local addresses if the user just added them offline.

    // Simple deduplication based on content (since local ones might not have IDs)
    const allAddresses = [...backendAddresses];

    localAddresses.forEach(localAddr => {
      // Check if this local address essentially exists in backend list
      const exists = backendAddresses.some(backendAddr =>
        (backendAddr._id && localAddr._id && backendAddr._id === localAddr._id) ||
        (backendAddr.formattedAddress === localAddr.formattedAddress) || // if we had a formatted unique string
        (backendAddr.houseNo === localAddr.houseNo && backendAddr.pincode === localAddr.pincode && backendAddr.roadName === localAddr.roadName)
      );

      if (!exists) {
        allAddresses.push(localAddr);
      }
    });

    console.log('Final merged addresses:', allAddresses);
    return allAddresses;
  }

  // Save a new address
  static async saveAddress(addressData) {
    // 1. Always save to local storage first for immediate UI feedback and backup
    const tempId = Date.now().toString(); // Temporary ID until backend confirms
    const localAddress = { ...addressData, _id: addressData._id || tempId };

    try {
      const existingAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
      const updatedAddresses = [...existingAddresses, localAddress];
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }

    // 2. Try saving to backend
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.SAVED_ADDRESSES), {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(),
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const data = await response.json();
        const savedBackendAddress = AddressService.normalizeAddress(data.data, localAddress);
        return savedBackendAddress;
      } else {
        console.warn('Backend save failed, keeping local copy:', response.status);
        return AddressService.normalizeAddress(localAddress);
      }
    } catch (error) {
      console.error('Error saving address to backend:', error);
      // Return the local one so the UI thinks it succeeded
      return AddressService.normalizeAddress(localAddress);
    }
  }

  // Update an existing address
  static async updateAddress(addressId, addressData) {
    // 1. Update local storage first (optimistic update)
    // We need to find the address by ID in the list, or fall back to index logic if we ever support that
    try {
      const existingAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
      const updatedAddresses = existingAddresses.map(addr => {
        // Compare strings carefully
        if (addr._id && String(addr._id) === String(addressId)) {
          return { ...addressData, _id: addr._id }; // keep ID
        }
        // If legacy address without ID, we can't easily match by ID unless addressId is the index?
        // For now, assume IDs are present on all items due to normalizeAddress
        return addr;
      });
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    } catch (e) {
      console.error("Error updating local storage:", e);
    }

    try {
      // If the ID looks like a timestamp (all digits, length ~13), it's likely local-only, so skip backend
      const isLocalId = /^\d{13,}$/.test(String(addressId));

      if (isLocalId) {
        // It's a local address check if we should try to save it as new?
        // No, 'updateAddress' implies editing. If it's local, we just updated local storage above.
        // We can try to POST it to backend to 'sync' it, but that would create a duplicate unless we handle it smart.
        // For now, just return success.
        return AddressService.normalizeAddress(addressData);
      }

      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.SAVED_ADDRESSES}/${addressId}`), {
        method: 'PUT',
        headers: API_CONFIG.getAuthHeaders(),
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const data = await response.json();
        return AddressService.normalizeAddress(data.data);
      } else {
        // Backend failed (maybe 404 if deleted on server but exists locally), but we updated local already
        console.warn('Backend update failed:', response.status);
        return AddressService.normalizeAddress(addressData);
      }
    } catch (error) {
      console.error('Error updating address in backend:', error);
      // We already updated local storage, so return success to the UI
      return AddressService.normalizeAddress(addressData);
    }

    // Ensure we always return something
    return AddressService.normalizeAddress(addressData);
  }

  // Delete an address
  static async deleteAddress(addressId) {
    // 1. Delete from local storage first
    try {
      const existingAddresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
      // Filter out by ID
      const updatedAddresses = existingAddresses.filter(addr => String(addr._id) !== String(addressId));
      localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    } catch (e) {
      console.error("Error deleting from local storage:", e);
    }

    try {
      const isLocalId = /^\d{13,}$/.test(String(addressId));
      if (isLocalId) return true;

      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.SAVED_ADDRESSES}/${addressId}`), {
        method: 'DELETE',
        headers: API_CONFIG.getAuthHeaders()
      });

      if (response.ok) {
        return true;
      } else {
        // Backend failure, but we deleted locally
        return true;
      }
    } catch (error) {
      console.error('Error deleting address from backend:', error);
      return true;
    }
  }

  // Get current location using browser geolocation
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Use Google Maps Geocoding API to get address from coordinates
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                const address = data.results[0];
                resolve({
                  latitude,
                  longitude,
                  formattedAddress: address.formatted_address,
                  addressComponents: address.address_components
                });
              } else {
                reject(new Error('No address found for this location'));
              }
            } else {
              reject(new Error('Failed to geocode location'));
            }
          } catch (error) {
            reject(new Error('Failed to get address from coordinates'));
          }
        },
        (error) => {
          reject(new Error('Failed to get current location: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  }

  // Search for places using Google Places API
  static async searchPlaces(query) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        return data.results || [];
      } else {
        throw new Error('Failed to search places');
      }
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  // Format address for display
  static formatAddress(address) {
    if (!address) return '';

    const parts = [];
    if (address.fullName) parts.push(address.fullName);
    if (address.houseNo) parts.push(address.houseNo);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.roadName) parts.push(address.roadName);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);

    return parts.join(', ');
  }

  // Format full address with all details
  static formatFullAddress(address) {
    if (!address) return '';

    const parts = [];

    // Name and Contact
    if (address.fullName) parts.push(`Name: ${address.fullName}`);
    if (address.phoneNumber) parts.push(`Phone: ${address.phoneNumber}`);
    if (address.altPhoneNumber) parts.push(`Alt Phone: ${address.altPhoneNumber}`);

    // Address lines
    const addressLines = [];
    if (address.houseNo) addressLines.push(address.houseNo);
    if (address.addressLine2) addressLines.push(address.addressLine2);
    if (address.roadName) addressLines.push(address.roadName);
    if (address.landmark) addressLines.push(`Near ${address.landmark}`);
    if (addressLines.length > 0) parts.push(`Address: ${addressLines.join(', ')}`);

    // Location
    const locationParts = [];
    if (address.city) locationParts.push(address.city);
    if (address.state) locationParts.push(address.state);
    if (address.pincode) locationParts.push(address.pincode);
    if (address.country) locationParts.push(address.country);
    if (locationParts.length > 0) parts.push(locationParts.join(', '));

    // Additional info
    if (address.companyName) parts.push(`Company: ${address.companyName}`);
    if (address.deliveryInstructions) parts.push(`Instructions: ${address.deliveryInstructions}`);

    return parts.join('\n');
  }
}

export default AddressService;
