import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, MapPin, Phone, User } from "lucide-react";
import { Equipment, Booking, User as UserType } from "@/types";
import EquipmentCard from "@/components/equipment-card";
import BookingItem from "@/components/booking-item";
import BookingModal from "@/components/booking-modal";

interface FarmerDashboardProps {
  currentUser: UserType | null;
  language: string;
}

export default function FarmerDashboard({ currentUser, language }: FarmerDashboardProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Equipment");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  // Fetch all equipment
  const { data: equipmentList = [], isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['/api/equipment', selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "All Equipment") {
        params.append('category', selectedCategory);
      }
      const res = await fetch(`/api/equipment?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch equipment');
      return res.json();
    }
  });

  // Fetch farmer's bookings
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/bookings', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const res = await fetch(`/api/bookings?farmerId=${currentUser.id}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    enabled: !!currentUser
  });

  const handleEquipmentSelect = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedEquipment(null);
  };

  // Filter equipment by search term
  const filteredEquipment = equipmentList.filter((equipment: Equipment) => 
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { id: "all", name: t('farmer.categories.all') },
    { id: "tractors", name: t('farmer.categories.tractors') },
    { id: "harvesters", name: t('farmer.categories.harvesters') },
    { id: "plows", name: t('farmer.categories.plows') },
    { id: "seeders", name: t('farmer.categories.seeders') },
    { id: "irrigation", name: t('farmer.categories.irrigation') }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search and filter section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('farmer.findEquipment')}</h2>
            <div className="relative">
              <Input
                type="text"
                placeholder={t('farmer.searchPlaceholder')}
                className="border border-gray-300 rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                className={selectedCategory === category.name ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Equipment list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoadingEquipment ? (
          <p>Loading equipment...</p>
        ) : filteredEquipment.length === 0 ? (
          <p>No equipment found. Try adjusting your filters.</p>
        ) : (
          filteredEquipment.map((item: Equipment) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onBook={() => handleEquipmentSelect(item)}
              language={language}
            />
          ))
        )}
      </div>
      
      {/* My Bookings Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('farmer.myBookings')}</h2>
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800">{t('farmer.upcomingBookings')}</h3>
              <Button variant="link" className="text-primary text-sm font-medium">
                {t('farmer.viewAll')}
              </Button>
            </div>
          </div>
          
          <CardContent className="p-4">
            {isLoadingBookings ? (
              <p>Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p>No bookings found. Book equipment to see your bookings here.</p>
            ) : (
              bookings.map((booking: Booking) => (
                <BookingItem 
                  key={booking.id} 
                  booking={booking} 
                  viewType="farmer" 
                  language={language}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Booking Modal */}
      {selectedEquipment && (
        <BookingModal
          equipment={selectedEquipment}
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          currentUser={currentUser}
          language={language}
        />
      )}
    </div>
  );
}
