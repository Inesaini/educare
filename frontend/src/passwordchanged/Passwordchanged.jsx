import React from 'react'
import Form from './Form';

export default function passwordchanged() {
  return (
     <div className="h-screen w-screen flex items-center justify-center relative">
       {/* Background image: Visible only on lg+ screens */}
       <img 
         src="/medecin.png" 
         className="absolute top-0 left-0 w-full h-full lg:block hidden" 
         alt="Background"
       />
       {/* Form remains visible on all screen sizes */}
       <Form />
     </div>
   )
}
