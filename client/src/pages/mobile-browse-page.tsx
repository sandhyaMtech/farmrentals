import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { useAuth } from '@/hooks/use-auth';
import { Equipment } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { BookingModalMobile } from '@/components/booking-modal-mobile';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Star, 
  Clock,
  X,
  ChevronDown
} from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

interface MobileBrowsePageProps {
  language: string;
}

export default function MobileBrowsePage({ language }: MobileBrowsePageProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [maxRate, setMaxRate] = useState<number>(2000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  // Fetch equipment list
  const { data: equipmentList = [] } = useQuery<Equipment[]>({
    queryKey: ['/api/equipment'],
  });
  
  // Filter equipment based on search and filters
  const filteredEquipment = equipmentList.filter((equipment) => {
    // Only show available equipment
    if (!equipment.available) return false;
    
    // Filter by search query
    if (searchQuery && !equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !equipment.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !equipment.category.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by categories if any are selected
    if (selectedCategories.size > 0 && !selectedCategories.has(equipment.category)) {
      return false;
    }
    
    // Filter by distance
    if (equipment.distance > maxDistance) {
      return false;
    }
    
    // Filter by rate
    if (equipment.rate > maxRate) {
      return false;
    }
    
    return true;
  });
  
  // Handle booking equipment
  const handleBookEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setBookingModalOpen(true);
  };
  
  // Toggle category selection
  const toggleCategory = (category: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };
  
  // Get all unique categories from equipment
  const categories = Array.from(
    new Set(equipmentList.map((equipment) => equipment.category))
  );
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategories(new Set());
    setMaxDistance(50);
    setMaxRate(2000);
  };
  
  // Translations
  const translations = {
    en: {
      browse: 'Browse Equipment',
      search: 'Search equipment...',
      filter: 'Filter',
      sort: 'Sort',
      categories: 'Categories',
      distance: 'Max Distance',
      rate: 'Max Rate',
      km: 'km',
      perDay: '/day',
      available: 'Available',
      book: 'Book',
      viewDetails: 'View Details',
      resetFilters: 'Reset Filters',
      applyFilters: 'Apply Filters',
      noResults: 'No equipment found',
      tryAdjusting: 'Try adjusting your filters',
      selectCategories: 'Select categories',
      rating: 'Rating',
      distanceAway: 'km away',
      categories_label: 'Categories',
      priceRange: 'Price Range',
      locationRange: 'Distance Range',
      rupeeSymbol: '₹'
    },
    ta: {
      browse: 'உபகரணங்களை பார்க்க',
      search: 'உபகரணங்களைத் தேடுங்கள்...',
      filter: 'வடிகட்டு',
      sort: 'வரிசைப்படுத்து',
      categories: 'வகைகள்',
      distance: 'அதிகபட்ச தூரம்',
      rate: 'அதிகபட்ச கட்டணம்',
      km: 'கி.மீ',
      perDay: '/நாள்',
      available: 'கிடைக்கிறது',
      book: 'முன்பதிவு',
      viewDetails: 'விவரங்களைக் காண்க',
      resetFilters: 'வடிகட்டிகளை மீட்டமை',
      applyFilters: 'வடிகட்டிகளைப் பயன்படுத்து',
      noResults: 'எந்த உபகரணமும் கிடைக்கவில்லை',
      tryAdjusting: 'உங்கள் வடிகட்டிகளை சரிசெய்ய முயற்சிக்கவும்',
      selectCategories: 'வகைகளைத் தேர்ந்தெடுக்கவும்',
      rating: 'மதிப்பீடு',
      distanceAway: 'கி.மீ தூரத்தில்',
      categories_label: 'வகைகள்',
      priceRange: 'விலை வரம்பு',
      locationRange: 'தூர வரம்பு',
      rupeeSymbol: '₹'
    }
  };
  
  const t = translations[language === 'en' ? 'en' : 'ta'];
  
  return (
    <MobileLayout title={t.browse} language={language}>
      <div className="space-y-4 py-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
            {searchQuery && (
              <button 
                className="absolute right-2 top-2.5"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Equipment List */}
        {filteredEquipment.length > 0 ? (
          <div className="space-y-4">
            {filteredEquipment.map((equipment) => (
              <div 
                key={equipment.id}
                className="mobile-card"
              >
                <div className="aspect-video bg-muted rounded-md overflow-hidden mb-3">
                  <img 
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{equipment.name}</h3>
                    <Badge variant="outline">
                      {equipment.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {equipment.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{equipment.location} • {equipment.distance} {t.distanceAway}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Star className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                    <span>{equipment.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">
                      ({equipment.ratingCount})
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="font-bold text-lg">
                      {t.rupeeSymbol}{equipment.rate}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        {t.perDay}
                      </span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleBookEquipment(equipment)}
                    >
                      {t.book}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-xl font-medium mb-2">{t.noResults}</p>
            <p className="text-muted-foreground">{t.tryAdjusting}</p>
            <Button 
              variant="outline" 
              onClick={resetFilters} 
              className="mt-4"
            >
              {t.resetFilters}
            </Button>
          </div>
        )}
      </div>
      
      {/* Filter Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t.filter}</SheetTitle>
            <SheetDescription>
              {t.filter}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Categories */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="categories">
                <AccordionTrigger>{t.categories_label}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={selectedCategories.has(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Price Range */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">{t.priceRange}</h4>
              <div className="px-1">
                <Slider
                  defaultValue={[maxRate]}
                  max={5000}
                  step={100}
                  onValueChange={(values) => setMaxRate(values[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-muted-foreground">₹0</span>
                  <span className="text-sm font-medium">₹{maxRate}</span>
                  <span className="text-sm text-muted-foreground">₹5000</span>
                </div>
              </div>
            </div>
            
            {/* Distance Range */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">{t.locationRange}</h4>
              <div className="px-1">
                <Slider
                  defaultValue={[maxDistance]}
                  max={100}
                  step={5}
                  onValueChange={(values) => setMaxDistance(values[0])}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-muted-foreground">0 {t.km}</span>
                  <span className="text-sm font-medium">{maxDistance} {t.km}</span>
                  <span className="text-sm text-muted-foreground">100 {t.km}</span>
                </div>
              </div>
            </div>
          </div>
          
          <SheetFooter className="flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="w-full"
            >
              {t.resetFilters}
            </Button>
            <SheetClose asChild>
              <Button className="w-full">{t.applyFilters}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Booking Modal */}
      {selectedEquipment && (
        <BookingModalMobile
          equipment={selectedEquipment}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          currentUser={user}
          language={language}
        />
      )}
    </MobileLayout>
  );
}