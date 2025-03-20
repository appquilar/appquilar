
import React from 'react';
import SearchBar from './SearchBar';

const Hero = () => {
  return (
    <div className="pt-28 pb-10 px-4 sm:px-6 md:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-3 px-3 py-1 bg-primary/10 rounded-full">
          <span className="text-xs font-medium uppercase tracking-wider">
            Rent quality tools when you need them
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight mb-6 animate-slide-down">
          The Smart Way to Rent Tools
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-down" style={{ animationDelay: '50ms' }}>
          Get access to professional-grade equipment without the cost of ownership. Perfect for DIY projects, events, and professional work.
        </p>
        
        <div className="animate-slide-down" style={{ animationDelay: '100ms' }}>
          <SearchBar />
        </div>
      </div>
    </div>
  );
};

export default Hero;
