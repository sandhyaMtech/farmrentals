import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDay } from "@/components/ui/calendar-day";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Equipment, Availability } from "@/types";
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface AvailabilityCalendarProps {
  equipment: Equipment[];
  language: string;
}

export default function AvailabilityCalendar({ equipment, language }: AvailabilityCalendarProps) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    equipment.length > 0 ? equipment[0].id : null
  );
  
  // Update selected equipment when equipment list changes
  useEffect(() => {
    if (equipment.length > 0 && !selectedEquipmentId) {
      setSelectedEquipmentId(equipment[0].id);
    }
  }, [equipment, selectedEquipmentId]);
  
  // Fetch availability data for the selected equipment
  const { data: availabilityData = [] } = useQuery({
    queryKey: ['/api/availability', selectedEquipmentId],
    queryFn: async () => {
      if (!selectedEquipmentId) return [];
      const res = await fetch(`/api/availability/${selectedEquipmentId}`);
      if (!res.ok) throw new Error('Failed to fetch availability');
      return res.json();
    },
    enabled: !!selectedEquipmentId
  });
  
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  // Generate calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const startWeekday = getDay(startOfMonth(currentMonth));
    const calendarDays = [];
    
    // Add previous month's days to fill the first row
    for (let i = 0; i < startWeekday; i++) {
      calendarDays.push({
        day: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0 - (startWeekday - i - 1)).getDate(),
        isCurrentMonth: false
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const available = checkAvailability(date);
      
      calendarDays.push({
        day: i,
        isCurrentMonth: true,
        isAvailable: available,
        date
      });
    }
    
    // Add next month's days to fill the last row
    const remainingCells = 7 - (calendarDays.length % 7 || 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        calendarDays.push({
          day: i,
          isCurrentMonth: false
        });
      }
    }
    
    return calendarDays;
  };
  
  // Check if a date is available based on availability data
  const checkAvailability = (date: Date): boolean => {
    if (!availabilityData.length) return true;
    
    const matchingAvailability = availabilityData.find((availability: Availability) => {
      const availDate = new Date(availability.date);
      return isSameDay(availDate, date);
    });
    
    return matchingAvailability ? matchingAvailability.available : true;
  };
  
  const calendarDays = renderCalendarGrid();
  
  return (
    <div>
      {equipment.length > 0 && (
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Select Equipment</label>
          <select 
            className="w-full border border-gray-300 rounded p-2"
            value={selectedEquipmentId || ""}
            onChange={(e) => setSelectedEquipmentId(Number(e.target.value))}
          >
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>
        </div>
      )}
      
      <div className="flex justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h4 className="font-bold text-gray-700">
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-gray-700">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-sm">
        {calendarDays.map((day, index) => (
          <CalendarDay
            key={index}
            day={day.day}
            isCurrentMonth={day.isCurrentMonth}
            isAvailable={day.isCurrentMonth ? (day.isAvailable || false) : false}
          />
        ))}
      </div>
      
      <div className="mt-4 flex justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#ECFCCB] mr-1 rounded-full"></div>
          <span>{t('owner.availability.availabilityLegend')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#FEE2E2] mr-1 rounded-full"></div>
          <span>{t('owner.availability.bookedLegend')}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#4D7C0F] mr-1 rounded-full"></div>
          <span>{t('owner.availability.selectedLegend')}</span>
        </div>
      </div>
    </div>
  );
}
