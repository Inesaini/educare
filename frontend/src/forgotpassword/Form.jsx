import React, { useState } from 'react';
import { MailIcon,Lock } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { API_URL } from "../api.js";


export default function Form() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      console.log("im trying");
      const res = await axios.post(`${API_URL}/patients/forgot-password`, { email });

      console.log("request sent ");

      //Redirect user to the emailsent page after request
      navigate("/emailsent", { state: { email } }); 
      setMessage("A password reset link has been sent to your email.");
    } catch (error) {
      console.log(error.response?.data?.error || error.message); // Log actual error response
      setMessage(
        error.response?.data?.error || "Error  sending message. Try again"
      );
    } finally {
      setIsLoading(false); // Stop loading after request completes
    }
  };

  return (
    <div className="relative bg-[#679294] h-screen p-6  lg:w-[519px] mx-auto ml-[114px] md:w-full sm:w-full">

      <h2 className=" decoration-white font-exo2 text-3xl font-bold text-center mt-[125px]">Forgot password</h2>
      <AlertCircle className="w-[30px] h-[30px] text-[#2E3D40] font-size[10px] ml-[222px] mt-[15px]" />
      <h3 className='mt-[20px] text-[#2E3D40] font-bold text-center'>Enter your Email and we will send you a link to reset your password</h3>

      <form className="flex justify-center items-center">
        <div className="flex flex-col items-center">

      <div className="relative mt-[30px]">
        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white-500 w-5 h-5" />
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border border-white rounded-[10px] text-white w-[420px] p-2 pl-10 "
        />
      </div>
      
        <button 
        onClick={handleForgotPassword } 
        disabled={isLoading}
        onMouseDown={(e) => e.target.style.opacity = "0.8"} 
        onMouseUp={(e) => e.target.style.opacity = "1"}
        className="bg-white text-[#679294] rounded-[10px] w-[420px] h-[40px] mt-[30px] cursor-pointer">
           {isLoading ? "Submitting.." : "Submit"}
        </button>
        <p className="text-red-500 mt-3">{message}</p>
        </div>
      </form>
      <img
          src="/logo.png"
          className="w-[150px] h-[59px] block mx-auto mt-[25px]"
        />
    </div>
  );
}
