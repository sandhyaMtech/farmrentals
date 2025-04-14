import { Button } from "@/components/ui/button";
import { Booking } from "@/types";
import { User, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface BookingItemProps {
  booking: Booking;
  viewType: "farmer" | "owner";
  language: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}

export default function BookingItem({ 
  booking, 
  viewType, 
  language,
  onAccept,
  onDecline,
  onCancel
}: BookingItemProps) {
  const { t } = useTranslation();
  
  if (!booking.equipment) {
    return null; // Don't render if we don't have the equipment details
  }
  
  const formatBookingDates = () => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    
    // Format: "Aug 18-19, 2023" or "Aug 18, 2023" if same day
    if (start.getTime() === end.getTime()) {
      return format(start, 'MMM d, yyyy');
    }
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')}-${format(end, 'd, yyyy')}`;
    }
    
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex items-start">
        <img 
          src={`${booking.equipment.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80`}
          alt={booking.equipment.name} 
          className="w-16 h-16 object-cover rounded-md mr-3"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-800">{booking.equipment.name}</h4>
              <p className="text-sm text-gray-600">
                {viewType === "farmer" 
                  ? `${t('farmer.bookedFor')} ${formatBookingDates()}`
                  : `${formatBookingDates()} • ${getDurationText(booking.startDate, booking.endDate)}`
                }
              </p>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(booking.status)}`}>
              {t(`common.status.${booking.status}`)}
            </div>
          </div>
          
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            {viewType === "farmer" 
              ? `${t('farmer.owner')}: ${booking.owner?.name} | `
              : `${t('owner.bookingList.renter')}: ${booking.farmer?.name} | `
            }
            <Phone className="h-4 w-4 ml-2 mr-1" />
            {viewType === "farmer" ? booking.owner?.phone : booking.farmer?.phone}
          </div>
          
          {viewType === "owner" && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{t('common.totalAmount')}:</span> ₹{booking.totalAmount.toLocaleString()}
            </div>
          )}
          
          <div className="mt-3 flex space-x-2">
            {viewType === "farmer" ? (
              <>
                <Button variant="default" size="sm">
                  {t('common.viewDetails')}
                </Button>
                {booking.status !== 'cancelled' && (
                  <Button variant="outline" size="sm" className="text-red-600" onClick={onCancel}>
                    {t('common.cancel')}
                  </Button>
                )}
              </>
            ) : (
              booking.status === 'pending' ? (
                <>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white" 
                    size="sm"
                    onClick={onAccept}
                  >
                    {t('common.accept')}
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white" 
                    size="sm"
                    onClick={onDecline}
                  >
                    {t('common.decline')}
                  </Button>
                  <Button variant="outline" size="sm">
                    {t('common.viewDetails')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="default" size="sm">
                    {t('common.contactRenter')}
                  </Button>
                  <Button variant="outline" size="sm">
                    {t('common.viewDetails')}
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getDurationText(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
