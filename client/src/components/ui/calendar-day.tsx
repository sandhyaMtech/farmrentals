import { cn } from "@/lib/utils";

interface CalendarDayProps {
  day: number;
  isCurrentMonth?: boolean;
  isAvailable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CalendarDay({ 
  day, 
  isCurrentMonth = true, 
  isAvailable = true, 
  isSelected = false,
  onClick,
  className 
}: CalendarDayProps) {
  return (
    <div
      className={cn(
        "calendar-day",
        "w-10 h-10 flex items-center justify-center rounded-full cursor-pointer",
        isCurrentMonth ? "text-gray-800" : "text-gray-400",
        isAvailable && isCurrentMonth && !isSelected && "bg-[#ECFCCB]",
        !isAvailable && isCurrentMonth && "bg-[#FEE2E2] text-decoration-line-through cursor-not-allowed",
        isSelected && "bg-[#4D7C0F] text-white",
        className
      )}
      onClick={isAvailable && isCurrentMonth ? onClick : undefined}
    >
      {day}
    </div>
  );
}
