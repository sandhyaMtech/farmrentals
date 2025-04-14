import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { Equipment, User, DateSelection } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { format, addDays, differenceInDays, isSameDay, isBefore, isAfter } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  language: string;
}

export default function BookingModal({ 
  equipment, 
  isOpen, 
  onClose, 
  currentUser,
  language
}: BookingModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [selectedDates, setSelectedDates] = useState<DateSelection>({
    from: undefined,
    to: undefined
  });
  
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [sameDay, setSameDay] = useState<boolean>(false);
  const [purpose, setPurpose] = useState<string>("Field Preparation");
  
  // Handle date selection to fix double-click error and allow same day bookings
  useEffect(() => {
    if (selectedDates.from && selectedDates.to) {
      // Check if it's a same day booking
      if (isSameDay(selectedDates.from, selectedDates.to)) {
        setSameDay(true);
      } else {
        setSameDay(false);
      }
    }
  }, [selectedDates.from, selectedDates.to]);
  
  // Fix for double-click calendar error
  const handleCalendarSelect = (range: any) => {
    // Prevent the same date from being clicked twice causing errors
    if (range && range.from && !range.to) {
      // When only one date is selected, auto-set it as both from and to
      setSelectedDates({ from: range.from, to: range.from });
      setSameDay(true);
    } else {
      setSelectedDates(range as DateSelection);
    }
  };
  
  // Get equipment availability
  const { data: availability = [] } = useQuery({
    queryKey: ['/api/availability', equipment.id],
    queryFn: async () => {
      const res = await fetch(`/api/availability/${equipment.id}`);
      if (!res.ok) throw new Error('Failed to fetch availability');
      return res.json();
    },
    enabled: isOpen
  });
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const res = await apiRequest('POST', '/api/bookings', bookingData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Confirmed",
        description: "Your booking has been successfully created!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleConfirmBooking = () => {
    if (!currentUser || !selectedDates.from || !selectedDates.to) {
      toast({
        title: "Error",
        description: "Please select booking dates",
        variant: "destructive"
      });
      return;
    }
    
    // Create copies of the dates to avoid mutating the original dates
    const startDate = new Date(selectedDates.from);
    const endDate = new Date(selectedDates.to);
    
    // Add time to the dates
    if (startTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDate.setHours(startHours, startMinutes, 0, 0);
    }
    
    if (endTime) {
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDate.setHours(endHours, endMinutes, 0, 0);
    }
    
    // Calculate days - ensure we have at least 1 day for same-day bookings
    let days = 1;
    
    // Calculate days only if it's not the same day
    if (!sameDay) {
      days = differenceInDays(selectedDates.to, selectedDates.from) + 1;
    }
    
    const baseAmount = equipment.rate * days;
    const serviceFee = Math.round(baseAmount * 0.1); // 10% service fee
    const insurance = Math.round(baseAmount * 0.12); // 12% insurance
    const totalAmount = baseAmount + serviceFee + insurance;
    
    // Format dates to ISO string for API with time included
    const bookingData = {
      equipmentId: equipment.id,
      farmerId: currentUser.id,
      ownerId: equipment.ownerId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: "pending",
      purpose: purpose,
      totalAmount: totalAmount
    };
    
    console.log('Submitting booking data:', bookingData);
    
    createBookingMutation.mutate(bookingData);
  };
  
  // Calculate booking summary
  const calculateSummary = () => {
    if (!selectedDates.from || !selectedDates.to) {
      return { days: 0, baseAmount: 0, serviceFee: 0, insurance: 0, total: 0 };
    }
    
    // Ensure we have at least 1 day for same-day bookings
    let days = 1;
    
    // Calculate days only if it's not the same day
    if (!sameDay) {
      days = differenceInDays(selectedDates.to, selectedDates.from) + 1;
    }
    
    const baseAmount = equipment.rate * days;
    const serviceFee = Math.round(baseAmount * 0.1); // 10% service fee
    const insurance = Math.round(baseAmount * 0.12); // 12% insurance
    const total = baseAmount + serviceFee + insurance;
    
    return { days, baseAmount, serviceFee, insurance, total };
  };
  
  const summary = calculateSummary();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('booking.title')}</DialogTitle>
          <DialogDescription>
            {t('booking.selectDates')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-start mb-4">
          <img 
            src={`${equipment.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80`} 
            alt={equipment.name} 
            className="w-24 h-24 object-cover rounded-md mr-3"
          />
          <div>
            <h4 className="font-bold text-gray-800">{equipment.name}</h4>
            <p className="text-sm text-gray-600">{equipment.description}</p>
            <div className="mt-1 text-lg font-bold text-[#B45309]">₹{equipment.rate}{t('common.perDay')}</div>
            <StarRating rating={equipment.rating} count={equipment.ratingCount} size="sm" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>{t('booking.selectDates')}</Label>
            <div className="mt-2 max-h-[320px] overflow-y-auto">
              <Calendar
                mode="range"
                selected={selectedDates}
                onSelect={handleCalendarSelect}
                className="border rounded-md p-2"
                disabled={[
                  { before: new Date() }
                ]}
              />
            </div>
            
            {/* Time selection */}
            {selectedDates.from && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-sm">
                    {t('booking.startTime')}
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-sm">
                    {t('booking.endTime')}
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            {/* Date-time selection info */}
            {selectedDates.from && selectedDates.to && (
              <div className="mt-2 text-sm text-gray-600">
                {sameDay ? (
                  <p>
                    {t('booking.selectedSameDay', {
                      date: format(selectedDates.from, 'MMM dd, yyyy'),
                      startTime: startTime,
                      endTime: endTime
                    })}
                  </p>
                ) : (
                  <p>
                    {t('booking.selectedMultipleDays', {
                      startDate: format(selectedDates.from, 'MMM dd, yyyy'),
                      endDate: format(selectedDates.to, 'MMM dd, yyyy')
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div>
            <Label>{t('booking.yourInformation')}</Label>
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div>
                <Label htmlFor="fullName" className="text-sm">{t('booking.fullName')}</Label>
                <Input 
                  id="fullName" 
                  defaultValue={currentUser?.name || ""} 
                  className="mt-1" 
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm">{t('booking.phoneNumber')}</Label>
                <Input 
                  id="phone" 
                  defaultValue={currentUser?.phone || ""} 
                  className="mt-1" 
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="purpose" className="text-sm">{t('booking.purposeOfRental')}</Label>
                <Select defaultValue={purpose} onValueChange={setPurpose}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="Field Preparation">{t('booking.purposes.fieldPreparation')}</SelectItem>
                    <SelectItem value="Harvesting">{t('booking.purposes.harvesting')}</SelectItem>
                    <SelectItem value="Planting">{t('booking.purposes.planting')}</SelectItem>
                    <SelectItem value="Transportation">{t('booking.purposes.transportation')}</SelectItem>
                    <SelectItem value="Other">{t('booking.purposes.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold text-gray-700 mb-2">{t('booking.bookingSummary')}</h4>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{equipment.name}</span>
              <span className="text-gray-800 font-medium">
                ₹{equipment.rate} x {summary.days} {t('booking.days')}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{t('booking.serviceFee')}</span>
              <span className="text-gray-800 font-medium">₹{summary.serviceFee}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{t('booking.insurance')}</span>
              <span className="text-gray-800 font-medium">₹{summary.insurance}</span>
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between">
              <span className="font-bold text-gray-800">{t('booking.total')}</span>
              <span className="font-bold text-gray-800">₹{summary.total}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded transition-colors"
            onClick={handleConfirmBooking}
            disabled={!selectedDates.from || !selectedDates.to || createBookingMutation.isPending}
          >
            {createBookingMutation.isPending ? 'Processing...' : t('booking.confirmBooking')}
          </Button>
        </DialogFooter>
        
        <p className="text-center text-xs text-gray-500 mt-3">
          {t('booking.termsText')}
        </p>
      </DialogContent>
    </Dialog>
  );
}
