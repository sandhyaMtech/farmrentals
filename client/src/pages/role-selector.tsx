import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleSelectorProps {
  onSelectRole: (role: "farmer" | "owner") => void;
  language: string;
}

export default function RoleSelector({ onSelectRole, language }: RoleSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{t('app.title')}</h2>
      <p className="text-center text-gray-600 mb-8">{t('role.select')}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card 
          className="p-6 border-2 border-transparent hover:border-primary transition-all cursor-pointer"
          onClick={() => onSelectRole("farmer")}
        >
          <CardContent className="flex flex-col items-center p-0">
            <img 
              src="https://images.unsplash.com/photo-1620857493479-a2585a3480fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
              alt="Farmer" 
              className="w-24 h-24 object-cover rounded-full mb-4"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('role.farmer.title')}</h3>
            <p className="text-center text-gray-600">{t('role.farmer.subtitle')}</p>
            <p className="text-center text-gray-600 mt-1">விவசாயி</p>
            <Button 
              className="mt-4 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-full transition-colors"
              onClick={() => onSelectRole("farmer")}
            >
              {t('role.farmer.continue')}
            </Button>
          </CardContent>
        </Card>
        
        <Card 
          className="p-6 border-2 border-transparent hover:border-secondary transition-all cursor-pointer"
          onClick={() => onSelectRole("owner")}
        >
          <CardContent className="flex flex-col items-center p-0">
            <img 
              src="https://images.unsplash.com/photo-1593672715438-d88a1cf7a48f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
              alt="Equipment Owner" 
              className="w-24 h-24 object-cover rounded-full mb-4"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('role.owner.title')}</h3>
            <p className="text-center text-gray-600">{t('role.owner.subtitle')}</p>
            <p className="text-center text-gray-600 mt-1">உபகரண உரிமையாளர்</p>
            <Button 
              className="mt-4 bg-[#B45309] hover:bg-[#92400E] text-white font-medium py-2 px-6 rounded-full transition-colors"
              onClick={() => onSelectRole("owner")}
            >
              {t('role.owner.continue')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
