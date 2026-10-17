"use client";

import { useState } from 'react';
import { RiStarFill, RiStarHalfFill, RiStarLine } from 'react-icons/ri';

export default function Rating({
  initialValue = 0,
  maxStars = 5,
  editable = false,
  size = 20,
  className = '',
  onRatingChange,
}) {
  const [rating, setRating] = useState(initialValue);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (newRating) => {
    if (editable) {
      setRating(newRating);
      if (onRatingChange) {
        onRatingChange(newRating);
      }
    }
  };

  const handleMouseEnter = (hoverValue) => {
    if (editable) {
      setHoverRating(hoverValue);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div
      className={`flex items-center ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isHalfStar = displayRating >= starValue - 0.5 && displayRating < starValue;
        const isFullStar = displayRating >= starValue;

        return (
          <div
            key={index}
            className={`${editable ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
          >
            {isFullStar ? (
              <RiStarFill
                size={size}
                className="text-yellow-400"
              />
            ) : isHalfStar ? (
              <RiStarHalfFill
                size={size}
                className="text-yellow-400"
              />
            ) : (
              <RiStarLine
                size={size}
                className="text-yellow-400"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}