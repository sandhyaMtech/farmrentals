import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { useAuth } from '@/hooks/use-auth';
import { Booking, Equipment } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Phone, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MobileBookingsPageProps {
  language: string;
}

export default function MobileBookingsPage({ language }: MobileBookingsPageProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'decline' | 'cancel' | null>(null);
  
  // Fetch bookings
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    enabled: !!user,
  });
  
  // Filter bookings based on user role
  const userBookings = bookings.filter((booking) => {
    if (user?.role === 'farmer') {
      return booking.farmerId === user.id;
    } else {
      return booking.ownerId === user.id;
    }
  });
  
  // Booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/bookings/${bookingId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setActionDialogOpen(false);
      
      let successMessage = '';
      if (actionType === 'accept') {
        successMessage = language === 'en' ? 'Booking accepted!' : 'முன்பதிவு ஏற்றுக்கொள்ளப்பட்டது!';
      } else if (actionType === 'decline') {
        successMessage = language === 'en' ? 'Booking declined!' : 'முன்பதிவு நிராகரிக்கப்பட்டது!';
      } else if (actionType === 'cancel') {
        successMessage = language === 'en' ? 'Booking cancelled!' : 'முன்பதிவு ரத்து செய்யப்பட்டது!';
      }
      
      toast({
        title: successMessage,
      });
    },
    onError: (error) => {
      toast({
        title: language === 'en' ? 'Action failed' : 'செயல் தோல்வியடைந்தது',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle booking actions
  const handleAction = (booking: Booking, action: 'accept' | 'decline' | 'cancel') => {
    setSelectedBooking(booking);
    setActionType(action);
    setActionDialogOpen(true);
  };
  
  const confirmAction = () => {
    if (!selectedBooking || !actionType) return;
    
    const newStatus = 
      actionType === 'accept' ? 'confirmed' : 
      actionType === 'decline' ? 'declined' : 'cancelled';
    
    updateBookingStatusMutation.mutate({
      bookingId: selectedBooking.id,
      status: newStatus,
    });
  };
  
  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
      case 'declined':
        return 'destructive';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };
  
  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };
  
  const translations = {
    en: {
      bookings: 'Bookings',
      pending: 'Pending',
      confirmed: 'Confirmed',
      declined: 'Declined',
      cancelled: 'Cancelled',
      completed: 'Completed',
      all: 'All',
      active: 'Active',
      history: 'History',
      noBookings: 'No bookings found',
      startBrowsing: 'Start browsing equipment',
      accept: 'Accept',
      decline: 'Decline',
      cancel: 'Cancel',
      days: 'days',
      totalAmount: 'Total Amount',
      purpose: 'Purpose',
      confirmAction: 'Confirm Action',
      confirmAccept: 'Are you sure you want to accept this booking?',
      confirmDecline: 'Are you sure you want to decline this booking?',
      confirmCancel: 'Are you sure you want to cancel this booking?',
      confirming: 'Confirming...',
      farmer: 'Farmer',
      owner: 'Owner',
      contact: 'Contact',
      details: 'Booking Details',
      status: 'Status',
      close: 'Close',
      duration: 'Duration',
      location: 'Location'
    },
    ta: {
      bookings: 'முன்பதிவுகள்',
      pending: 'நிலுவையில்',
      confirmed: 'உறுதிசெய்யப்பட்டது',
      declined: 'நிராகரிக்கப்பட்டது',
      cancelled: 'ரத்துசெய்யப்பட்டது',
      completed: 'நிறைவடைந்தது',
      all: 'அனைத்தும்',
      active: 'செயலில்',
      history: 'வரலாறு',
      noBookings: 'முன்பதிவுகள் எதுவும் இல்லை',
      startBrowsing: 'உபகரணங்களை பார்க்க தொடங்கவும்',
      accept: 'ஏற்றுக்கொள்',
      decline: 'நிராகரி',
      cancel: 'ரத்து செய்',
      days: 'நாட்கள்',
      totalAmount: 'மொத்த தொகை',
      purpose: 'நோக்கம்',
      confirmAction: 'செயலை உறுதிப்படுத்தவும்',
      confirmAccept: 'இந்த முன்பதிவை ஏற்க விரும்புகிறீர்களா?',
      confirmDecline: 'இந்த முன்பதிவை நிராகரிக்க விரும்புகிறீர்களா?',
      confirmCancel: 'இந்த முன்பதிவை ரத்து செய்ய விரும்புகிறீர்களா?',
      confirming: 'உறுதிப்படுத்துகிறது...',
      farmer: 'விவசாயி',
      owner: 'உரிமையாளர்',
      contact: 'தொடர்பு',
      details: 'முன்பதிவு விவரங்கள்',
      status: 'நிலை',
      close: 'மூடு',
      duration: 'காலம்',
      location: 'இடம்'
    }
  };
  
  const t = translations[language === 'en' ? 'en' : 'ta'];
  
  // Get translated status
  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return t.pending;
      case 'confirmed':
        return t.confirmed;
      case 'declined':
        return t.declined;
      case 'cancelled':
        return t.cancelled;
      case 'completed':
        return t.completed;
      default:
        return status;
    }
  };
  
  // Filter bookings based on tab
  const [activeTab, setActiveTab] = useState('all');
  const filteredBookings = userBookings.filter((booking) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'confirmed'].includes(booking.status);
    }
    if (activeTab === 'history') {
      return ['declined', 'cancelled', 'completed'].includes(booking.status);
    }
    return true;
  });
  
  return (
    <MobileLayout title={t.bookings} language={language}>
      <div className="space-y-4 py-4">
        {/* Tabs */}
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">{t.all}</TabsTrigger>
            <TabsTrigger value="active">{t.active}</TabsTrigger>
            <TabsTrigger value="history">{t.history}</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className="mobile-card"
              >
                {/* Equipment Image and Name */}
                <div className="flex gap-3 mb-3">
                  <div className="h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={booking.equipment?.imageUrl || ''}
                      alt={booking.equipment?.name || ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium line-clamp-1">{booking.equipment?.name || ''}</h3>
                    <Badge variant={getStatusVariant(booking.status) as any} className="mt-1">
                      {getTranslatedStatus(booking.status)}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                {/* Booking Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDateRange(booking.startDate, booking.endDate)}</span>
                  </div>
                  
                  {booking.equipment?.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{booking.equipment.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center font-medium">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      ₹{booking.totalAmount}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {user?.role === 'owner' && booking.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAction(booking, 'decline')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {t.decline}
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAction(booking, 'accept')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t.accept}
                      </Button>
                    </>
                  )}
                  
                  {user?.role === 'farmer' && ['pending', 'confirmed'].includes(booking.status) && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAction(booking, 'cancel')}
                    >
                      {t.cancel}
                    </Button>
                  )}
                  
                  {/* Contact Button - Always show this for active bookings */}
                  {['confirmed', 'pending'].includes(booking.status) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <a href={`tel:${user?.role === 'farmer' ? booking.owner?.phone : booking.farmer?.phone}`}>
                        <Phone className="h-4 w-4 mr-1" />
                        {t.contact}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-xl font-medium mb-2">{t.noBookings}</p>
          </div>
        )}
      </div>
      
      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.confirmAction}</DialogTitle>
            <DialogDescription>
              {actionType === 'accept' ? t.confirmAccept :
               actionType === 'decline' ? t.confirmDecline :
               t.confirmCancel}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
            >
              {t.close}
            </Button>
            <Button
              onClick={confirmAction}
              disabled={updateBookingStatusMutation.isPending}
              variant={actionType === 'decline' || actionType === 'cancel' ? 'destructive' : 'default'}
            >
              {updateBookingStatusMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full" />
                  {t.confirming}
                </div>
              ) : (
                actionType === 'accept' ? t.accept :
                actionType === 'decline' ? t.decline :
                t.cancel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}