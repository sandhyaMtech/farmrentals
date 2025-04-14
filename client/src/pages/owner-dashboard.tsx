import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings, FileText, Sliders } from "lucide-react";
import { User, Equipment, Booking } from "@/types";
import BookingItem from "@/components/booking-item";
import AvailabilityCalendar from "@/components/availability-calendar";
import AvailabilityManagementDialog from "@/components/availability-management-dialog";
import EquipmentForm from "@/components/equipment-form";
import { apiRequest } from "@/lib/queryClient";

interface OwnerDashboardProps {
  currentUser: User | null;
  language: string;
}

export default function OwnerDashboard({ currentUser, language }: OwnerDashboardProps) {
  const { t } = useTranslation();
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Fetch owner's equipment
  const { data: equipment = [], isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['/api/equipment', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const res = await fetch(`/api/equipment?ownerId=${currentUser.id}`);
      if (!res.ok) throw new Error('Failed to fetch equipment');
      return res.json();
    },
    enabled: !!currentUser
  });

  // Fetch owner's bookings
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/bookings', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const res = await fetch(`/api/bookings?ownerId=${currentUser.id}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    enabled: !!currentUser
  });

  // Create equipment mutation
  const createEquipmentMutation = useMutation({
    mutationFn: async (newEquipment: Partial<Equipment>) => {
      const res = await apiRequest('POST', '/api/equipment', newEquipment);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      setIsEquipmentDialogOpen(false);
    }
  });

  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Equipment> }) => {
      const res = await apiRequest('PUT', `/api/equipment/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      setIsEquipmentDialogOpen(false);
      setSelectedEquipment(null);
    }
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest('PATCH', `/api/bookings/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    }
  });

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking: Booking) => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  // Calculate statistics
  const totalEquipment = equipment.length;
  const activeEquipment = equipment.filter((eq: Equipment) => eq.available).length;
  const upcomingBookings = bookings.filter((booking: Booking) => 
    booking.status === "confirmed" || booking.status === "pending"
  ).length;
  
  // Calculate earnings for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyEarnings = bookings
    .filter((booking: Booking) => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate.getMonth() === currentMonth && 
             bookingDate.getFullYear() === currentYear &&
             booking.status !== "cancelled";
    })
    .reduce((sum: number, booking: Booking) => sum + booking.totalAmount, 0);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Dashboard stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('owner.dashboard.totalEquipment')}</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-primary">{totalEquipment}</div>
              <div className="ml-2 text-sm text-gray-600">{t('owner.dashboard.activeListings')}: {activeEquipment}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('owner.dashboard.upcomingBookings')}</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-[#F59E0B]">{upcomingBookings}</div>
              <div className="ml-2 text-sm text-gray-600">{t('owner.dashboard.nextDays')}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('owner.dashboard.earnings')}</h3>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-[#B45309]">₹{monthlyEarnings.toLocaleString()}</div>
              <div className="ml-2 text-sm text-gray-600">{t('owner.dashboard.thisMonth')}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {/* Bookings section */}
          <Card className="mb-6">
            <CardHeader className="p-4 border-b flex justify-between items-center">
              <CardTitle className="font-bold text-gray-800">{t('owner.dashboard.upcomingBookings')}</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant={activeTab === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTab("all")}
                >
                  {t('owner.bookingList.all')}
                </Button>
                <Button 
                  variant={activeTab === "pending" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTab("pending")}
                >
                  {t('owner.bookingList.pending')}
                </Button>
                <Button 
                  variant={activeTab === "confirmed" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveTab("confirmed")}
                >
                  {t('owner.bookingList.confirmed')}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              {isLoadingBookings ? (
                <p>Loading bookings...</p>
              ) : filteredBookings.length === 0 ? (
                <p>No bookings found.</p>
              ) : (
                filteredBookings.map((booking: Booking) => (
                  <BookingItem 
                    key={booking.id} 
                    booking={booking} 
                    viewType="owner"
                    language={language}
                    onAccept={() => updateBookingStatusMutation.mutate({ id: booking.id, status: "confirmed" })}
                    onDecline={() => updateBookingStatusMutation.mutate({ id: booking.id, status: "cancelled" })}
                  />
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Equipment section */}
          <Card>
            <CardHeader className="p-4 border-b flex justify-between items-center">
              <CardTitle className="font-bold text-gray-800">{t('owner.equipment.myEquipment')}</CardTitle>
              <Button
                onClick={() => {
                  setSelectedEquipment(null);
                  setIsEquipmentDialogOpen(true);
                }}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm flex items-center"
              >
                <Plus className="h-5 w-5 mr-1" />
                {t('owner.equipment.addNew')}
              </Button>
            </CardHeader>
            
            <CardContent className="p-4">
              {isLoadingEquipment ? (
                <p>Loading equipment...</p>
              ) : equipment.length === 0 ? (
                <p>No equipment found. Add equipment to get started.</p>
              ) : (
                equipment.map((item: Equipment) => (
                  <div key={item.id} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex items-start">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-md mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-800">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                          <div className={
                            item.available 
                              ? "bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
                              : "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium"
                          }>
                            {item.available ? t('common.status.active') : t('common.status.underRepair')}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">{t('owner.equipment.rate')}:</span> ₹{item.rate}/day
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">{t('owner.equipment.status')}:</span>
                          {item.available ? t('common.available') : t('common.unavailable')}
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedEquipment(item);
                              setIsEquipmentDialogOpen(true);
                            }}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateEquipmentMutation.mutate({ id: item.id, data: { available: !item.available } })}
                          >
                            {item.available ? t('common.markUnavailable') : t('common.markAvailable')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {/* Calendar section */}
          <Card className="mb-6">
            <CardHeader className="p-4 border-b">
              <CardTitle className="font-bold text-gray-800">{t('owner.availability.title')}</CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <AvailabilityCalendar equipment={equipment} language={language} />
            </CardContent>
          </Card>
          
          {/* Quick Actions section */}
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="font-bold text-gray-800">{t('owner.quickActions.title')}</CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <Button 
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded mb-3 flex justify-center items-center"
                onClick={() => {
                  setSelectedEquipment(null);
                  setIsEquipmentDialogOpen(true);
                }}
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('owner.quickActions.addNewEquipment')}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full text-gray-700 font-medium py-2 rounded border border-gray-300 mb-3 flex justify-center items-center"
                onClick={() => setIsAvailabilityDialogOpen(true)}
              >
                <Sliders className="h-5 w-5 mr-2" />
                {t('owner.quickActions.manageAvailability')}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full text-gray-700 font-medium py-2 rounded border border-gray-300 mb-3 flex justify-center items-center"
              >
                <FileText className="h-5 w-5 mr-2" />
                {t('owner.quickActions.viewRentalHistory')}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full text-gray-700 font-medium py-2 rounded border border-gray-300 flex justify-center items-center"
              >
                <Settings className="h-5 w-5 mr-2" />
                {t('owner.quickActions.accountSettings')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add/Edit Equipment Dialog */}
      <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>
            {selectedEquipment ? t('common.edit') : t('common.addNew')} {t('owner.equipment.myEquipment')}
          </DialogTitle>
          <EquipmentForm 
            currentUser={currentUser}
            equipment={selectedEquipment}
            onSubmit={(data) => {
              if (selectedEquipment) {
                updateEquipmentMutation.mutate({ id: selectedEquipment.id, data });
              } else {
                createEquipmentMutation.mutate(data);
              }
            }}
            isSubmitting={createEquipmentMutation.isPending || updateEquipmentMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Availability Management Dialog */}
      <AvailabilityManagementDialog
        isOpen={isAvailabilityDialogOpen}
        onClose={() => setIsAvailabilityDialogOpen(false)}
        equipment={equipment}
        language={language}
      />
    </div>
  );
}
