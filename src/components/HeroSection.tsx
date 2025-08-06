import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-[calc(100vh-64px)] flex items-center justify-center text-center overflow-hidden bg-gradient-to-br from-blue-900 to-gray-900 dark:from-blue-950 dark:to-black text-white p-4">
      {/* Background Overlay/Image Placeholder */}
      <div className="absolute inset-0 z-0 opacity-30" style={{ 
        backgroundImage: 'url(/placeholder.svg)', // Replace with a real image path like '/images/hero-background.jpg'
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        filter: 'grayscale(50%) blur(2px)', // Subtle effect
      }}></div>
      <div className="absolute inset-0 z-0 bg-black opacity-50"></div> {/* Dark overlay */}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight animate-slide-in-left">
          Soar to New Heights with Icarion Virtual Airline
        </h1>
        <p className="text-lg md:text-xl text-gray-200 animate-fade-in delay-200">
          Experience the thrill of virtual aviation with a community dedicated to realism, professionalism, and unforgettable flights.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-fade-in delay-400">
          <Link to="/plan-flight">
            <Button size="lg" className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
              Plan Your First Flight
            </Button>
          </Link>
          <Link to="/logbook">
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg font-semibold border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
              View Logbook
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;