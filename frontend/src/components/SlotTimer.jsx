import { useEffect, useState } from 'react';
import axiosInstance from '@services/api/axiosInstance';
import { AlertCircle, Clock } from 'lucide-react';

/**
 * SlotTimer Component
 * Displays a countdown timer for slot lock duration
 * Fetches remaining time from backend and updates every second
 */
const SlotTimer = ({ serviceId, startTime, onExpired, isVisible = true }) => {
  const [remainingTime, setRemainingTime] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch timer info from backend
  const fetchTimerInfo = async () => {
    if (!serviceId || !startTime || !isVisible) return;

    try {
      const response = await axiosInstance.get('/bookings/timer', {
        params: {
          service_id: serviceId,
          start_time: startTime,
        },
      });

      const data = response.data?.data || {};
      setIsLocked(data.locked);
      setRemainingTime(data.remaining_seconds || 0);
      setError(null);

      // If lock expired and callback provided, trigger it
      if (!data.locked && onExpired) {
        onExpired();
      }
    } catch (err) {
      console.warn('Failed to fetch timer info:', err);
      // Don't set error for non-critical fetch failures
    } finally {
      setLoading(false);
    }
  };

  // Fetch timer info on mount and when dependencies change
  useEffect(() => {
    fetchTimerInfo();
  }, [serviceId, startTime, isVisible]);

  // Set up interval to refresh timer
  useEffect(() => {
    if (!isVisible || !isLocked) return;

    // Fetch fresh data every 3 seconds
    const interval = setInterval(fetchTimerInfo, 3000);

    // Also decrement locally every second for smoother UI
    const countdown = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null || prev <= 0) return 0;
        const newTime = prev - 1;
        if (newTime === 0 && onExpired) {
          onExpired();
        }
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [isVisible, isLocked, onExpired]);

  if (!isVisible || loading || !isLocked) {
    return null;
  }

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const isWarning = remainingTime <= 30; // Warning when less than 30 seconds
  const isExpired = remainingTime === 0;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${
      isExpired
        ? 'bg-red-50 border-red-200 text-red-600'
        : isWarning
        ? 'bg-yellow-50 border-yellow-200 text-yellow-600 animate-pulse'
        : 'bg-blue-50 border-blue-200 text-blue-600'
    }`}>
      {isExpired ? (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <Clock className="w-5 h-5 flex-shrink-0" />
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider opacity-70">
          {isExpired ? 'Lock Expired' : 'Time Remaining'}
        </span>
        <span className="text-lg font-mono">
          {isExpired ? '00:00' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
        </span>
      </div>

      {isWarning && !isExpired && (
        <div className="ml-auto text-xs font-bold uppercase tracking-wider">
          Hurry!
        </div>
      )}
    </div>
  );
};

export default SlotTimer;
