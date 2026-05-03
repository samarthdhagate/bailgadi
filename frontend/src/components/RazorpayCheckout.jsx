import { useEffect, useState } from 'react';
import axiosInstance from '@services/api/axiosInstance';

const RazorpayCheckout = ({ reservationId, amount, onSuccess, onFailure, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      onFailure?.(new Error('Failed to load Razorpay script'));
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [onFailure]);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      alert('Razorpay is still loading. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Create order on backend
      const orderResponse = await axiosInstance.post('/payments/create-order', {
        reservation_id: reservationId,
      });

      const { order_id, amount: orderAmount, key_id, currency } = orderResponse.data.data;

      // Open Razorpay checkout
      const options = {
        key: key_id,
        amount: orderAmount,
        currency: currency,
        order_id: order_id,
        name: 'Zilla Appointments',
        description: 'Book your appointment',
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyResponse = await axiosInstance.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              onSuccess?.(verifyResponse.data.data);
            } else {
              onFailure?.(new Error('Payment verification failed'));
            }
          } catch (err) {
            onFailure?.(err);
          }
        },
        prefill: {
          name: localStorage.getItem('user_name') || 'Customer',
          email: localStorage.getItem('user_email') || 'customer@example.com',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment creation error:', err);
      onFailure?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading || !scriptLoaded}
      className="btn-primary px-20 py-5 text-xl min-w-[300px] rounded-2xl shadow-2xl shadow-primary/30"
    >
      {loading ? 'Processing...' : scriptLoaded ? 'Pay ₹' + amount : 'Loading...'}
    </button>
  );
};

export default RazorpayCheckout;
