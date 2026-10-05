import React from 'react';
import Form from './Form';

export default function Signup() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative">
      {/* Background image: Visible only on lg+ screens */}
      <img 
        src="/medecin.png" 
        className="absolute top-0 left-0 w-full h-full object-cover lg:block hidden" 
        alt="Background"
      />
      {/* Overlay to darken image for better readability */}
      <div className="absolute top-0 left-0 w-full h-full  lg:block hidden"></div>

      {/* Form container */}
      <div className="relative z-10  w-full">
        <Form />
      </div>
    </div>
  );
}

