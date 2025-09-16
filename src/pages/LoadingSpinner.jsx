import React from "react";
export const LoadingSpinner = ({ size = "lg" }) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={`animate-spin rounded-full border-4 border-solid border-current border-r-transparent ${sizes[size]}`}
    />
  );
};
