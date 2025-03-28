import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Equipment } from "@/types";
import { MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: () => void;
  language: string;
}

export default function EquipmentCard({ equipment, onBook, language }: EquipmentCardProps) {
  const { t } = useTranslation();
  
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
        src={`${equipment.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80`} 
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
        
        <div className="flex items-center mt-1 mb-3 text-sm">
          <StarRating 
            rating={equipment.rating} 
            count={equipment.ratingCount} 
            size="sm"
          />
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded transition-colors"
          onClick={onBook}
        >
          {t('common.bookNow')}
        </Button>
      </CardContent>
    </Card>
  );
}
