import React from 'react'
import Form from './Form'

export default function Checkemail() {
  return (
    <div className="h-screen w-screen flex items-center justify-center relative">
        <img 
            src="/medecin.png" 
            className="absolute top-0 left-0 w-full h-full lg:block hidden" 
            alt="Background" 
          />
        <Form/>
    </div>
  )
}
