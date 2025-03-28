import { useState } from "react";
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
import { format, addDays, differenceInDays } from "date-fns";
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
  
  const [purpose, setPurpose] = useState<string>("Field Preparation");
  
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
    
    const days = differenceInDays(selectedDates.to, selectedDates.from) + 1;
    const baseAmount = equipment.rate * days;
    const serviceFee = Math.round(baseAmount * 0.1); // 10% service fee
    const insurance = Math.round(baseAmount * 0.12); // 12% insurance
    const totalAmount = baseAmount + serviceFee + insurance;
    
    // Format dates to ISO string for API
    const bookingData = {
      equipmentId: equipment.id,
      farmerId: currentUser.id,
      ownerId: equipment.ownerId,
      startDate: selectedDates.from?.toISOString(),
      endDate: selectedDates.to?.toISOString(),
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
    
    const days = differenceInDays(selectedDates.to, selectedDates.from) + 1;
    const baseAmount = equipment.rate * days;
    const serviceFee = Math.round(baseAmount * 0.1); // 10% service fee
    const insurance = Math.round(baseAmount * 0.12); // 12% insurance
    const total = baseAmount + serviceFee + insurance;
    
    return { days, baseAmount, serviceFee, insurance, total };
  };
  
  const summary = calculateSummary();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
            <div className="mt-2">
              <Calendar
                mode="range"
                selected={selectedDates}
                onSelect={(range) => setSelectedDates(range as DateSelection)}
                className="border rounded-md p-2"
                disabled={[
                  { before: new Date() }
                ]}
              />
            </div>
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
                  <SelectContent>
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
