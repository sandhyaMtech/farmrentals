import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Equipment, Availability } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { format, isEqual, parseISO } from "date-fns";
import { CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailabilityManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment[];
  language: string;
}

export default function AvailabilityManagementDialog({
  isOpen,
  onClose,
  equipment,
  language
}: AvailabilityManagementDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [markAsAvailable, setMarkAsAvailable] = useState<boolean>(true);
  
  // Reset selected dates when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDates([]);
      
      // If there's only one equipment, auto-select it
      if (equipment.length === 1) {
        setSelectedEquipmentId(equipment[0].id);
      }
    }
  }, [isOpen, equipment]);
  
  // Get availability data for the selected equipment
  const { data: availabilityData = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['/api/availability', selectedEquipmentId],
    queryFn: async () => {
      if (!selectedEquipmentId) return [];
      const res = await fetch(`/api/availability/${selectedEquipmentId}`);
      if (!res.ok) throw new Error('Failed to fetch availability');
      return res.json();
    },
    enabled: !!selectedEquipmentId && isOpen
  });
  
  // Get bookings data for the selected equipment to disable booked dates
  const { data: bookingsData = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/bookings/equipment', selectedEquipmentId],
    queryFn: async () => {
      if (!selectedEquipmentId) return [];
      const res = await fetch(`/api/bookings/equipment/${selectedEquipmentId}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    enabled: !!selectedEquipmentId && isOpen
  });
  
  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ equipmentId, date, available }: { equipmentId: number; date: Date; available: boolean }) => {
      const existingAvailability = availabilityData.find((avail: Availability) => 
        isEqual(new Date(avail.date), date)
      );
      
      if (existingAvailability) {
        // Update existing availability
        const res = await apiRequest('PATCH', `/api/availability/${existingAvailability.id}`, {
          available
        });
        return res.json();
      } else {
        // Create new availability
        const res = await apiRequest('POST', '/api/availability', {
          equipmentId,
          date: date.toISOString(),
          available
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/availability', selectedEquipmentId] });
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      toast({
        title: t('owner.availability.availabilityUpdated'),
        description: markAsAvailable 
          ? t('common.markAvailable') 
          : t('common.markUnavailable'),
        duration: 3000
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive"
      });
    }
  });
  
  const handleDateSelect = (date: Date) => {
    setSelectedDates(prev => {
      const isSelected = prev.some(d => isEqual(d, date));
      
      if (isSelected) {
        // Deselect the date
        return prev.filter(d => !isEqual(d, date));
      } else {
        // Select the date
        return [...prev, date];
      }
    });
  };
  
  const isDateAvailable = (date: Date): boolean => {
    const matchingAvailability = availabilityData.find((availability: Availability) => {
      return isEqual(new Date(availability.date), date);
    });
    
    if (matchingAvailability) {
      return matchingAvailability.available;
    }
    
    // Default to available if no setting has been made
    return true;
  };
  
  const isDateSelected = (date: Date): boolean => {
    return selectedDates.some(d => isEqual(d, date));
  };
  
  const isDateBooked = (date: Date): boolean => {
    return bookingsData.some((booking: any) => {
      const startDate = parseISO(booking.startDate);
      const endDate = parseISO(booking.endDate);
      return date >= startDate && date <= endDate;
    });
  };
  
  const handleSaveChanges = () => {
    if (!selectedEquipmentId || selectedDates.length === 0) {
      toast({
        title: "Error",
        description: "Please select equipment and dates",
        variant: "destructive"
      });
      return;
    }
    
    // Update availability for each selected date
    selectedDates.forEach(date => {
      // Skip booked dates - cannot change their availability
      if (!isDateBooked(date)) {
        updateAvailabilityMutation.mutate({
          equipmentId: selectedEquipmentId,
          date,
          available: markAsAvailable
        });
      }
    });
    
    // Clear selected dates after saving
    setSelectedDates([]);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('owner.availability.managingAvailability')}</DialogTitle>
          <DialogDescription>
            {t('owner.availability.selectDates')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Equipment selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('owner.availability.selectEquipment')}
            </label>
            <Select 
              value={selectedEquipmentId?.toString() || ""}
              onValueChange={(value) => setSelectedEquipmentId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map(item => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Calendar */}
          {selectedEquipmentId && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  {t('owner.availability.selectDates')}
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant={markAsAvailable ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMarkAsAvailable(true)}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {t('owner.availability.markAvailable')}
                  </Button>
                  <Button
                    variant={!markAsAvailable ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMarkAsAvailable(false)}
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    {t('owner.availability.markUnavailable')}
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => {
                    if (Array.isArray(dates)) {
                      setSelectedDates(dates);
                    }
                  }}
                  disabled={bookingsData.map((booking: any) => ({
                    from: parseISO(booking.startDate),
                    to: parseISO(booking.endDate)
                  }))}
                  modifiers={{
                    booked: bookingsData.flatMap((booking: any) => {
                      const start = parseISO(booking.startDate);
                      const end = parseISO(booking.endDate);
                      const dates = [];
                      let current = start;
                      while (current <= end) {
                        dates.push(new Date(current));
                        current.setDate(current.getDate() + 1);
                      }
                      return dates;
                    }),
                    available: availabilityData
                      .filter((a: Availability) => a.available)
                      .map((a: Availability) => new Date(a.date)),
                    unavailable: availabilityData
                      .filter((a: Availability) => !a.available)
                      .map((a: Availability) => new Date(a.date))
                  }}
                  modifiersClassNames={{
                    booked: "bg-blue-100 text-blue-700",
                    available: "bg-green-100 text-green-700",
                    unavailable: "bg-red-100 text-red-700"
                  }}
                  className="rounded-md border"
                />
              </div>
              
              <div className="flex items-center justify-center mt-3 gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-100"></div>
                  <span>{t('owner.availability.availabilityLegend')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-100"></div>
                  <span>{t('owner.availability.bookedLegend')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-100"></div>
                  <span>{t('common.unavailable')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                  <span>{t('owner.availability.selectedLegend')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={!selectedEquipmentId || selectedDates.length === 0 || updateAvailabilityMutation.isPending}
          >
            {updateAvailabilityMutation.isPending ? 'Saving...' : t('owner.availability.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}