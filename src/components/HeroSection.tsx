import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import DynamicBackground from './DynamicBackground'; // Import the new component

const backgroundImages = [
  '/images/backgrounds/hero-bg-1.jpg', // Replace with your actual image paths
  '/images/backgrounds/hero-bg-2.jpg', // Make sure these files exist in public/images/backgrounds
  '/images/backgrounds/hero-bg-3.jpg',
];

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-[calc(100vh-64px)] flex items-center justify-center text-center overflow-hidden bg-gradient-to-br from-icarion-blue-dark to-icarion-blue-DEFAULT text-white p-4">
      <DynamicBackground images={backgroundImages} interval={8000} className="absolute inset-0 z-0">
        {/* Darker overlay on top of the image for better text contrast and depth */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        {/* Gradient overlay for brand color integration */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-icarion-blue-dark to-icarion-blue-DEFAULT opacity-70"></div>
      </DynamicBackground>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight animate-slide-in-left">
          Soar to New Heights with Icarion Virtual Airline
        </h1>
        <p className="text-lg md:text-xl text-gray-200 animate-fade-in delay-200">
          Experience the thrill of virtual aviation with a community dedicated to realism, professionalism, and unforgettable flights.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-fade-in delay-400">
          <Link to="/logbook">
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg font-semibold border-white text-white hover:bg-white hover:text-icarion-blue-DEFAULT transition-all duration-300 transform hover:scale-105">
              View Logbook
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;