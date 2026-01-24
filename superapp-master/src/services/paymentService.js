import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Payment Service for Razorpay Integration
class PaymentService {
  constructor() {
    this.baseURL = API_CONFIG.getUrl('/api/payments');
    this.razorpay = null;
    this.initializeRazorpay();
  }

  // Initialize Razorpay SDK
  initializeRazorpay() {
    try {
      // Load Razorpay script dynamically
      if (typeof window !== 'undefined' && !window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ Razorpay SDK loaded successfully');
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay SDK');
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
    }
  }

  // Get Razorpay public key from backend
  async getRazorpayKey() {
    try {
      console.log('🔑 PaymentService: Fetching Razorpay key from backend...');
      const response = await axios.get(`${this.baseURL}/razorpay-key`);
      console.log('🔑 PaymentService: Backend response:', response.data);

      if (response.data.success) {
        const keyData = response.data.data;
        console.log('🔑 PaymentService: Key data:', {
          key_id: keyData.key_id ? 'Present' : 'Missing',
          test_mode: keyData.test_mode,
          connectivity: keyData.connectivity
        });

        if (keyData.connectivity === 'failed') {
          console.error('❌ PaymentService: Razorpay connectivity failed - payment service unavailable');
          console.error('❌ PaymentService: Please check Razorpay configuration in backend .env file');
          // Return null to indicate payment service is not available
          return null;
        }

        return keyData.key_id;
      }
      throw new Error('Failed to get Razorpay key');
    } catch (error) {
      console.error('❌ PaymentService: Error getting Razorpay key:', error);
      console.error('❌ PaymentService: Payment service unavailable - please check backend configuration');
      // Return null to indicate payment service is not available
      return null;
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('demoToken') || 'demo-token';
    console.log('🔍 PaymentService: Using token:', token ? 'Token present' : 'No token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Create payment order
  async createOrder(orderData) {
    try {
      console.log('🔍 PaymentService: createOrder called with data:', orderData);
      console.log('🔍 PaymentService: Headers:', this.getAuthHeaders());

      const response = await axios.post(
        `${this.baseURL}/create-order`,
        orderData,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ PaymentService: Order creation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService: Error creating payment order:', error);
      console.error('❌ PaymentService: Error response:', error.response?.data);
      console.error('❌ PaymentService: Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
  }

  // Verify payment signature
  async verifyPayment(paymentData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/verify`,
        paymentData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${paymentId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw new Error(error.response?.data?.message || 'Failed to get payment details');
    }
  }

  // Get user payments
  async getUserPayments(userId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/user/${userId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw new Error(error.response?.data?.message || 'Failed to get user payments');
    }
  }

  // Create order in database first
  async createOrderInDatabase(orderData) {
    try {
      console.log('📦 PaymentService: Creating order in database...');
      console.log('📦 PaymentService: Order data received:', orderData);

      const orderModel = orderData.order_model || 'Order';
      console.log('📦 PaymentService: Order model:', orderModel);

      if (orderModel === 'FoodOrder') {
        // Handle Food Order creation
        console.log('📦 PaymentService: Creating Food Order...');

        try {
          // Step 1: Create or update food cart with items
          console.log('📦 PaymentService: Creating food cart with items...');
          const cartItems = orderData.order_data?.items || [];

          // Clear existing cart first (this is needed for the backend to create the order)
          console.log('🧹 PaymentService: Clearing existing food cart...');
          await axios.delete(`${this.baseURL.replace('/payments', '')}/food-cart/clear`, {
            headers: this.getAuthHeaders()
          });

          // Add items to cart
          console.log('➕ PaymentService: Adding items to food cart...');
          for (const item of cartItems) {
            const cartItemPayload = {
              dish_id: item.dish_id,
              quantity: item.quantity,
              price: item.price,
              special_instructions: item.special_instructions || ''
            };

            await axios.post(`${this.baseURL.replace('/payments', '')}/food-cart/add`, cartItemPayload, {
              headers: this.getAuthHeaders()
            });
          }

          // Step 2: Create food order from cart
          const orderPayload = {
            delivery_address: orderData.order_data?.delivery_address || {
              address_line1: '123 Main Street',
              city: 'Food City',
              state: 'State',
              country: 'India',
              pincode: '123456',
              phone: '+91 9876543210'
            },
            payment_method: 'razorpay',
            delivery_instructions: orderData.order_data?.delivery_instructions || 'Please deliver at the main gate',
            special_instructions: orderData.order_data?.special_instructions || 'Handle with care'
          };

          console.log('📦 PaymentService: Sending food order payload:', orderPayload);
          const response = await axios.post(`${this.baseURL.replace('/payments', '')}/food-orders`, orderPayload, {
            headers: this.getAuthHeaders()
          });

          console.log('✅ PaymentService: Food Order created in database:', response.data);
          return {
            success: true,
            data: response.data.data || response.data
          };
        } catch (error) {
          console.error('❌ PaymentService: Food Order creation failed:', error);
          console.error('❌ PaymentService: Error response:', error.response?.data);
          throw new Error(`Food Order creation failed: ${error.response?.data?.message || error.message}`);
        }
      } else if (orderModel === 'Order') {
        // Handle regular E-commerce Order creation
        console.log('📦 PaymentService: Creating E-commerce Order...');

        try {
          // Get user's cart items
          console.log('📦 PaymentService: Fetching cart items...');
          const cartResponse = await axios.get(`${this.baseURL.replace('/payments', '')}/cart`, {
            headers: this.getAuthHeaders()
          });

          console.log('📦 PaymentService: Cart response:', cartResponse.data);

          if (!cartResponse.data.success || !cartResponse.data.data?.items?.length) {
            throw new Error('Cart is empty');
          }

          // Create order with cart items
          const orderPayload = {
            shipping_address: {
              address_line1: '123 Main Street', // TODO: Get from user profile
              city: 'Mumbai',
              state: 'Maharashtra',
              country: 'India',
              pincode: '400001',
              phone: orderData.contact
            },
            payment_method: 'razorpay',
            notes: `Payment via ${orderData.payment_method || 'Razorpay'}`
          };

          console.log('📦 PaymentService: Sending order payload:', orderPayload);
          const response = await axios.post(`${this.baseURL.replace('/payments', '')}/orders`, orderPayload, {
            headers: this.getAuthHeaders()
          });

          console.log('✅ PaymentService: Order created in database:', response.data);
          return {
            success: true,
            data: response.data.data || response.data
          };
        } catch (error) {
          console.error('❌ PaymentService: E-commerce Order creation failed:', error);
          console.error('❌ PaymentService: Error response:', error.response?.data);
          throw new Error(`E-commerce Order creation failed: ${error.response?.data?.message || error.message}`);
        }
      } else if (orderModel === 'Booking') {
        // Handle Hotel Booking creation
        console.log('📦 Creating Hotel Booking...');

        // Format booking data according to backend model requirements
        const bookingPayload = {
          hotel_id: orderData.order_data.hotel_id,
          room_id: orderData.order_data.room_id,
          name: orderData.order_data.name,
          contact_number: orderData.order_data.contact_number,
          check_in_date: new Date(orderData.order_data.check_in_date),
          check_out_date: new Date(orderData.order_data.check_out_date),
          guests: orderData.order_data.guests || {
            adults: 1,
            children: 0,
            infants: 0
          },
          total_nights: orderData.order_data.total_nights || 1,
          price_per_night: orderData.order_data.price_per_night,
          total_amount: orderData.order_data.total_amount,
          final_amount: orderData.order_data.final_amount,
          discount_amount: orderData.order_data.discount_amount || 0,
          payment_method: 'razorpay',
          payment_status: 'pending',
          booking_status: 'pending',
          special_requests: orderData.order_data.special_requests || ''
        };

        console.log('📦 Sending booking payload:', bookingPayload);
        const response = await axios.post(`${this.baseURL.replace('/payments', '')}/bookings`, bookingPayload, {
          headers: this.getAuthHeaders()
        });

        console.log('✅ Booking created in database:', response.data);
        return {
          success: true,
          data: response.data
        };
      } else if (orderModel === 'GroceryOrder') {
        // Handle Grocery Order creation
        console.log('📦 Creating Grocery Order...');

        // Format grocery order data according to backend model requirements
        const groceryOrderPayload = {
          total_amount: orderData.order_data.total_amount,
          shipping_address: orderData.order_data.shipping_address || 'Default Address',
          payment_method: 'razorpay',
          items: orderData.order_data.items.map(item => ({
            grocery_id: item.grocery_id,
            quantity: item.quantity,
            price: item.price
          })) || []
        };

        console.log('📦 Sending grocery order payload:', groceryOrderPayload);
        const response = await axios.post(`${this.baseURL.replace('/payments', '')}/gorders`, groceryOrderPayload, {
          headers: this.getAuthHeaders()
        });

        console.log('✅ Grocery Order created in database:', response.data);
        console.log('🔍 Grocery Order response structure:', {
          success: response.data.success,
          message: response.data.message,
          dataKeys: response.data.data ? Object.keys(response.data.data) : 'No data',
          dataId: response.data.data?._id,
          fullData: response.data.data
        });
        return {
          success: true,
          data: response.data.data  // Return the actual order object, not the wrapper
        };
      } else if (orderModel === 'TaxiRide') {
        // Handle Taxi Ride creation
        console.log('📦 Creating Taxi Ride...');

        // Format taxi ride data according to backend model requirements
        const taxiRidePayload = {
          user_id: orderData.order_data.user_id,
          driver_id: orderData.order_data.driver_id || '507f1f77bcf86cd799439011', // Default driver ID
          vehicle_id: orderData.order_data.vehicle_id || '507f1f77bcf86cd799439012', // Default vehicle ID
          pickup_location: orderData.order_data.pickup_location,
          dropoff_location: orderData.order_data.dropoff_location,
          distance: orderData.order_data.distance || 0,
          duration: orderData.order_data.duration || 0,
          fare: orderData.order_data.fare,
          payment_method: 'razorpay',
          payment_status: 'pending'
        };

        console.log('📦 Sending taxi ride payload:', taxiRidePayload);
        const response = await axios.post(`${this.baseURL.replace('/payments', '')}/taxi-rides`, taxiRidePayload, {
          headers: this.getAuthHeaders()
        });

        console.log('✅ Taxi Ride created in database:', response.data);
        return {
          success: true,
          data: response.data.data
        };
      } else if (orderModel === 'PorterBooking') {
        // Handle Porter Booking creation
        console.log('📦 Creating Porter Booking...');

        const porterBookingPayload = {
          user_id: orderData.order_data.user_id,
          driver_id: orderData.order_data.driver_id || '507f1f77bcf86cd799439011', // Default driver ID
          vehicle_id: orderData.order_data.vehicle_id || '507f1f77bcf86cd799439012', // Default vehicle ID
          pickup_location: orderData.order_data.pickup_location,
          dropoff_location: orderData.order_data.dropoff_location,
          vehicle_type: orderData.order_data.vehicle_type || 'Bike',
          distance: orderData.order_data.distance || 0,
          fare: orderData.order_data.fare,
          payment_method: 'razorpay',
          payment_status: 'pending',
          item_description: orderData.order_data.item_description || 'General delivery',
          item_weight: orderData.order_data.item_weight || 0,
          special_instructions: orderData.order_data.special_instructions || ''
        };

        console.log('📦 Sending porter booking payload:', porterBookingPayload);
        const response = await axios.post(`${this.baseURL.replace('/payments', '')}/porter-bookings`, porterBookingPayload, {
          headers: this.getAuthHeaders()
        });

        console.log('✅ Porter Booking created in database:', response.data);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        // Handle regular E-commerce Order creation
        console.log('📦 Creating E-commerce Order...');

        // Get user's cart items
        console.log('📦 Fetching cart items...');
        const cartResponse = await axios.get(`${this.baseURL.replace('/payments', '')}/cart`, {
          headers: this.getAuthHeaders()
        });

        console.log('📦 Cart response:', cartResponse.data);

        if (!cartResponse.data.success || !cartResponse.data.data?.items?.length) {
          throw new Error('Cart is empty');
        }

        // Create order with cart items
        const orderPayload = {
          shipping_address: {
            address_line1: '123 Main Street', // TODO: Get from user profile
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincode: '400001',
            phone: orderData.contact
          },
          payment_method: 'razorpay',
          notes: `Payment via ${orderData.payment_method || 'Razorpay'}`
        };

        console.log('📦 Sending order payload:', orderPayload);
        const response = await axios.post(`${this.baseURL.replace('/payments', '')}/orders`, orderPayload, {
          headers: this.getAuthHeaders()
        });

        console.log('✅ Order created in database:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      console.error('Error creating order in database:', error);
      throw new Error('Failed to create order in database');
    }
  }

  // Process Razorpay payment
  async processPayment(orderData, options = {}) {
    try {
      console.log('🚀 PaymentService: Starting payment processing...');
      console.log('🚀 PaymentService: Order data:', orderData);
      console.log('🚀 PaymentService: Options:', options);

      // Validate order data
      if (!orderData.amount || !orderData.order_model) {
        throw new Error('Missing required fields: amount, order_model');
      }

      // Step 1: Create order in database first
      console.log('📦 PaymentService: Creating order in database...');
      const dbOrderResponse = await this.createOrderInDatabase(orderData);

      if (!dbOrderResponse.success) {
        throw new Error(dbOrderResponse.message || 'Failed to create order in database');
      }

      console.log('✅ PaymentService: Database order created successfully:', dbOrderResponse.data);

      // Step 2: Check if Razorpay is properly configured
      const razorpayKey = await this.getRazorpayKey();
      const isTestMode = razorpayKey === 'rzp_test_51O8X8X8X8X8X8';
      const isPaymentUnavailable = razorpayKey === null;

      if (isTestMode || isPaymentUnavailable) {
        console.error('❌ PaymentService: Razorpay is not properly configured. Payment cannot proceed.');
        console.error('❌ PaymentService: Please configure Razorpay keys in the backend .env file.');

        // Show user-friendly error message instead of cancelling order
        const errorMessage = 'Payment service is temporarily unavailable. Please try again later or contact support.';

        if (options.onError) {
          options.onError(new Error(errorMessage));
        }

        // Don't throw error, just return failure
        return {
          success: false,
          error: errorMessage,
          orderCreated: true,
          orderId: dbOrderResponse.data._id
        };
      }

      // Step 3: Create Razorpay order (normal flow)
      console.log('💳 PaymentService: Creating Razorpay order...');
      const paymentOrderData = {
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        order_id: dbOrderResponse.data._id, // Use actual database order ID
        order_model: orderData.order_model,
        description: orderData.description || `Payment for ${orderData.order_model}`,
        email: orderData.email,
        contact: orderData.contact
      };

      console.log('💳 PaymentService: Payment order data:', paymentOrderData);
      const orderResponse = await this.createOrder(paymentOrderData);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      const { razorpayOrder, payment } = orderResponse.data;
      console.log('✅ PaymentService: Razorpay order created:', razorpayOrder);
      console.log('✅ PaymentService: Payment record:', payment);

      // Step 4: Get Razorpay key and initialize checkout
      console.log('🔑 PaymentService: Getting Razorpay key...');
      console.log('🔑 PaymentService: Razorpay key obtained:', razorpayKey ? 'Success' : 'Failed');

      if (!razorpayKey) {
        throw new Error('Payment service is not available. Please try again later.');
      }

      const paymentOptions = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: options.businessName || 'Super App',
        description: orderData.description || 'Payment for order',
        order_id: razorpayOrder.id,
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              },
              cards: {
                name: "Pay using Cards",
                instruments: [
                  {
                    method: "card"
                  }
                ]
              },
              netbanking: {
                name: "Pay using Netbanking",
                instruments: [
                  {
                    method: "netbanking"
                  }
                ]
              },
              wallet: {
                name: "Pay using Wallet",
                instruments: [
                  {
                    method: "wallet"
                  }
                ]
              }
            },
            sequence: ["block.banks", "block.cards", "block.netbanking", "block.wallet"],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        handler: async (response) => {
          try {
            // Step 3: Verify payment on backend
            const verificationData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: payment._id
            };

            const verificationResponse = await this.verifyPayment(verificationData);

            if (verificationResponse.success) {
              // Payment successful - include database order data
              const successData = {
                ...verificationResponse.data,
                dbOrder: dbOrderResponse.data
              };

              if (options.onSuccess) {
                options.onSuccess(successData);
              }
            } else {
              throw new Error(verificationResponse.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            if (options.onError) {
              options.onError(error);
            }
          }
        },
        prefill: {
          name: orderData.customerName || '',
          email: orderData.email || '',
          contact: orderData.contact || ''
        },
        notes: {
          order_id: orderData.order_id,
          order_type: orderData.order_model
        },
        theme: {
          color: options.themeColor || '#3399cc'
        },
        modal: {
          ondismiss: () => {
            if (options.onCancel) {
              options.onCancel();
            }
          }
        }
      };

      // Step 4: Open Razorpay checkout
      const razorpayInstance = new window.Razorpay(paymentOptions);
      razorpayInstance.open();

      return {
        success: true,
        order: razorpayOrder,
        payment: payment
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  }

  // Test payment endpoint
  async testPaymentEndpoint() {
    try {
      const response = await axios.get(`${this.baseURL}/test`);
      return response.data;
    } catch (error) {
      console.error('Error testing payment endpoint:', error);
      throw new Error('Payment service is not available');
    }
  }

  // Get payment status text
  getPaymentStatusText(status) {
    const statusMap = {
      'pending': 'Pending',
      'captured': 'Successful',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'partially_refunded': 'Partially Refunded'
    };
    return statusMap[status] || status;
  }

  // Get payment status color
  getPaymentStatusColor(status) {
    const colorMap = {
      'pending': 'text-yellow-600',
      'captured': 'text-green-600',
      'failed': 'text-red-600',
      'refunded': 'text-blue-600',
      'partially_refunded': 'text-orange-600'
    };
    return colorMap[status] || 'text-gray-600';
  }

  // Format amount for display
  formatAmount(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount / 100); // Convert from paise to rupees
  }

  // Validate payment data
  validatePaymentData(data) {
    const errors = [];

    // Check if amount exists and is at least ₹1 (1 rupee)
    if (!data.amount || data.amount < 1) {
      errors.push('Amount must be at least ₹1');
    }

    if (!data.email || !data.email.includes('@')) {
      errors.push('Valid email is required');
    }

    if (!data.contact || data.contact.length < 10) {
      errors.push('Valid contact number is required');
    }

    if (!data.order_id) {
      errors.push('Order ID is required');
    }

    if (!data.order_model) {
      errors.push('Order model is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

// Create singleton instance
const paymentService = new PaymentService();

export default paymentService; 