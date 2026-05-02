import { Calendar, Clock, User, CheckCircle, Clock3, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import { bookingService } from '@services/booking';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load your bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await bookingService.cancelBooking(id);
        fetchBookings(); // Refresh list
      } catch (err) {
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock3 className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="My Bookings">
      <div className="flex flex-col gap-6">
        <p className="text-gray-500">View and manage your upcoming and past appointments.</p>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : bookings.length === 0 ? (
          <Card className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven't made any bookings yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:border-primary transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{booking.serviceName}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{booking.resourceName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{booking.date} at {booking.time}</span>
                        </div>
                        <div className="font-medium text-primary">
                          {booking.price > 0 ? `$${booking.price}` : 'Free'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase ${getStatusStyle(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/booking/${booking.serviceId || 1}`, { state: { reschedulingBooking: booking } })}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBookings;
