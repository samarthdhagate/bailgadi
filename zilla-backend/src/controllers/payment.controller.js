const bookingService = require('../services/booking.service');

/**
 * Handle Razorpay payment verification and final booking confirmation.
 */
const verifyPaymentAndConfirm = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const paymentData = req.body;

    const result = await bookingService.verifyAndConfirmBooking(userId, paymentData);

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  verifyPaymentAndConfirm,
};
