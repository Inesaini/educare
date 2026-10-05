import React from 'react'
import Form from './Form'

export default function Forgotpassword() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image: Visible only on lg+ screens */}
      <img 
        src="/medecin.png" 
        className="fixed top-0 left-0 w-full h-full object-cover lg:block hidden" 
        alt="Background"
      />
      {/* Overlay to darken image for better readability */}
      <div className="fixed top-0 left-0 w-full h-full lg:block hidden"></div>

      {/* Form container */}
      <div className="relative z-10 w-full flex justify-center items-center">
        <Form />
      </div>
    </div>
  );
}
