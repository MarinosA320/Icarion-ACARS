import React, { useState, useEffect } from 'react';

interface DynamicBackgroundProps {
  images: string[];
  interval?: number; // Interval in milliseconds to change images
  children: React.ReactNode;
  className?: string;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  images,
  interval = 8000, // Default to 8 seconds
  children,
  className,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) {
      console.log("DynamicBackground: No images provided.");
      return;
    }
    console.log("DynamicBackground: Images array:", images);

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        console.log(`DynamicBackground: Changing image from index ${prevIndex} to ${nextIndex}. Current image: ${images[nextIndex]}`);
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  if (images.length === 0) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out`}
          style={{
            backgroundImage: `url(${image})`,
            opacity: index === currentImageIndex ? 1 : 0,
            width: '100%',
            height: '100%',
          }}
        />
      ))}
      {children}
    </div>
  );
};

export default DynamicBackground;