import { StarIcon } from "lucide-react";
import { useState } from "react";
interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}
export function StarRating({
  rating,
  onRatingChange,
  size = 20,
  readonly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const handleClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index);
    }
  };
  const handleMouseEnter = (index: number) => {
    if (!readonly) {
      setHoverRating(index);
    }
  };
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={`${readonly ? "cursor-default" : "cursor-pointer"} p-0.5 focus:outline-none`}
        >
          <StarIcon
            size={size}
            className={`transition-colors ${(hoverRating || rating) >= index ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
          />
        </button>
      ))}
    </div>
  );
}
