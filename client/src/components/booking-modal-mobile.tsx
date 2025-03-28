import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Info } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Equipment, User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BookingModalMobileProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  language: string;
}

export function BookingModalMobile({ 
  equipment, 
  isOpen, 
  onClose, 
  currentUser,
  language
}: BookingModalMobileProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const translations = {
    en: {
      bookEquipment: 'Book Equipment',
      bookingDetails: 'Fill in the booking details',
      dates: 'Select Dates',
      purpose: 'Purpose of Booking',
      purposePlaceholder: 'E.g., Field preparation, harvesting, etc.',
      totalAmount: 'Total Amount',
      days: 'days',
      book: 'Confirm Booking',
      selectDates: 'Select dates',
      bookingSuccess: 'Booking Successful!',
      bookingSuccessMessage: 'Your booking request has been sent to the owner.',
      bookingError: 'Booking Failed',
      bookingErrorMessage: 'There was an error creating your booking. Please try again.',
      perDay: '/day'
    },
    ta: {
      bookEquipment: 'உபகரணத்தை முன்பதிவு செய்யுங்கள்',
      bookingDetails: 'முன்பதிவு விவரங்களை நிரப்பவும்',
      dates: 'தேதிகளைத் தேர்ந்தெடுக்கவும்',
      purpose: 'முன்பதிவின் நோக்கம்',
      purposePlaceholder: 'எ.கா., வயல் தயாரிப்பு, அறுவடை, போன்றவை.',
      totalAmount: 'மொத்த தொகை',
      days: 'நாட்கள்',
      book: 'முன்பதிவை உறுதிப்படுத்தவும்',
      selectDates: 'தேதிகளைத் தேர்ந்தெடுக்கவும்',
      bookingSuccess: 'முன்பதிவு வெற்றி!',
      bookingSuccessMessage: 'உங்கள் முன்பதிவு கோரிக்கை உரிமையாளருக்கு அனுப்பப்பட்டது.',
      bookingError: 'முன்பதிவு தோல்வியடைந்தது',
      bookingErrorMessage: 'உங்கள் முன்பதிவை உருவாக்குவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      perDay: '/நாள்'
    }
  };
  
  const t = translations[language === 'en' ? 'en' : 'ta'];
  
  // Calculate number of days and total amount
  const calculateDays = () => {
    if (dateRange.from && dateRange.to) {
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
      return diffDays;
    }
    return 0;
  };
  
  const totalDays = calculateDays();
  const totalAmount = totalDays * equipment.rate;
  
  // Form schema
  const bookingSchema = z.object({
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    purpose: z.string().min(5, "Purpose must be at least 5 characters"),
  });
  
  // Form
  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      purpose: '',
    },
  });
  
  // Update form values when date range changes
  React.useEffect(() => {
    if (dateRange.from) {
      form.setValue('startDate', dateRange.from);
    }
    if (dateRange.to) {
      form.setValue('endDate', dateRange.to);
    }
  }, [dateRange, form]);
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bookingSchema>) => {
      const response = await apiRequest('POST', '/api/bookings', {
        equipmentId: equipment.id,
        farmerId: currentUser?.id,
        ownerId: equipment.ownerId,
        startDate: data.startDate,
        endDate: data.endDate,
        purpose: data.purpose,
        totalAmount: totalAmount,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t.bookingSuccess,
        description: t.bookingSuccessMessage,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: t.bookingError,
        description: t.bookingErrorMessage,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof bookingSchema>) => {
    createBookingMutation.mutate(data);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl p-0 overflow-auto">
        <div className="h-1.5 w-12 bg-muted rounded-full mx-auto mt-2 mb-2" />
        
        <div className="px-4 py-2">
          <SheetHeader className="text-left pb-2">
            <SheetTitle className="text-xl">{t.bookEquipment}</SheetTitle>
            <SheetDescription>
              {t.bookingDetails}
            </SheetDescription>
          </SheetHeader>
          
          {/* Equipment Summary */}
          <div className="py-4">
            <div className="aspect-video mb-3 bg-muted rounded-md overflow-hidden">
              <img 
                src={equipment.imageUrl} 
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h3 className="font-semibold text-lg">{equipment.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{equipment.description}</p>
            
            <div className="flex items-center text-sm font-medium">
              <span className="text-lg">₹{equipment.rate}</span> 
              <span className="text-muted-foreground ml-1">{t.perDay}</span>
            </div>
            
            <Separator className="my-4" />
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Range Picker */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t.dates}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full h-12 justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                                </>
                              ) : (
                                format(dateRange.from, "PPP")
                              )
                            ) : (
                              <span>{t.selectDates}</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange as any}
                          numberOfMonths={1}
                          disabled={{ before: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Purpose */}
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.purpose}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t.purposePlaceholder}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Summary */}
              {totalDays > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>₹{equipment.rate} × {totalDays} {t.days}</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>{t.totalAmount}</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 mobile-button"
                disabled={createBookingMutation.isPending || totalDays === 0}
              >
                {createBookingMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-b-transparent rounded-full" />
                    {t.book}...
                  </div>
                ) : (
                  t.book
                )}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}