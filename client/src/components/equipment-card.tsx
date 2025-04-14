import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Equipment, User } from "@/types";
import { MapPin, Clock, Phone, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: () => void;
  language: string;
}

export default function EquipmentCard({ equipment, onBook, language }: EquipmentCardProps) {
  const { t } = useTranslation();
  
  // Fetch equipment owner details
  const { data: owner } = useQuery({
    queryKey: ['/api/users', equipment.ownerId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${equipment.ownerId}`);
      if (!res.ok) throw new Error('Failed to fetch owner details');
      return res.json();
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  const formatAvailability = () => {
    // This would ideally check the actual availability data
    // For now, we're just returning a static message
    return equipment.available 
      ? t('farmer.equipmentCard.availableNow')
      : `${t('farmer.equipmentCard.availableFrom')} ${format(new Date(2023, 7, 15), 'MMM dd')}`;
  };

  return (
    <Card className="overflow-hidden">
      <img 
        src={equipment.imageUrl} 
        alt={equipment.name} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{equipment.name}</h3>
            <p className="text-sm text-gray-600">{equipment.description}</p>
          </div>
          <div className="bg-[#FEF3C7] text-[#92400E] px-2 py-1 rounded text-sm font-medium">
            ₹{equipment.rate}{t('common.perDay')}
          </div>
        </div>
        
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          {equipment.location}, {equipment.distance}km {t('farmer.equipmentCard.kmAway')}
        </div>
        
        <div className="flex items-center mt-1 text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {formatAvailability()}
        </div>
        
        <div className="flex items-center mt-1 text-sm">
          <StarRating 
            rating={equipment.rating} 
            count={equipment.ratingCount} 
            size="sm"
          />
        </div>
        
        {/* Owner information */}
        {owner && (
          <div className="mt-3 p-2 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-700">{t('farmer.equipmentCard.owner')}</p>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <UserIcon className="h-4 w-4 mr-1" />
              <span>{owner.name}</span>
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-1" />
              <span>{owner.phone}</span>
            </div>
          </div>
        )}
        
        <Button 
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded transition-colors mt-3"
          onClick={onBook}
        >
          {t('common.bookNow')}
        </Button>
      </CardContent>
    </Card>
  );
}
