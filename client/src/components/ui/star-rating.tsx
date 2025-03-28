import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  count,
  size = "md",
  showCount = true,
  className,
}: StarRatingProps) {
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - filledStars - (hasHalfStar ? 1 : 0);
  
  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }[size];
  
  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }[size];

  return (
    <div className={`flex items-center ${className || ""}`}>
      <div className="flex">
        {Array.from({ length: filledStars }).map((_, i) => (
          <Star key={`filled-${i}`} className={`${sizeClass} text-accent fill-accent`} />
        ))}
        {hasHalfStar && (
          <Star className={`${sizeClass} text-accent fill-accent`} />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={`${sizeClass} text-gray-300`} />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className={`text-gray-600 ml-1 ${textSize}`}>
          {rating.toFixed(1)} ({count} {count === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
}
