import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api.js";

export default function Form() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state
 
   const location = useLocation();
   const email = location.state?.email; // Get the passed email
   const handleResendEmailVerification = async (e) => {
     e.preventDefault();
     setIsLoading(true); // Set loading to true when clicked
     try {
       const res = await axios.post(
         `${API_URL}/patients/send-email-verification/`,
         { email }
       );
       //setMessage(res.message);
     } catch (error) {
       console.log(error.response?.data?.error || error.message); // ✅ Log actual error response
       setMessage(
         error.response?.data?.error || "Error  sending message. Try again"
       );
     } finally {
      setIsLoading(false); // Reset loading after request completes
    }
   };

  return (
    <div className="relative bg-[#679294] h-screen p-6 lg:w-[519px] mx-auto ml-[114px] md:w-full sm:w-full">
          <h1 className="decoration-white font-exo2 text-3xl font-bold text-center mt-[150px]">
         Please check your email
       </h1>
       <p className=" mt-[20px] text-[#2E3D40] font-bold-300 text-center">
         We have sent an email to {email} with a verification link. Please click on the
         link to verify your account.
       </p>
       <button
         onClick={handleResendEmailVerification}
         type="submit"
         disabled={isLoading}
         onMouseDown={(e) => e.target.style.opacity = "0.8"} 
         onMouseUp={(e) => e.target.style.opacity = "1"}
         className="block mx-auto bg-white text-[#679294] rounded-[10px] w-[420px] h-[40px] mt-[30px] "
       >
         {isLoading ? "Sending..." : "Resend mail"}
       </button>
       <p className="text-red-500 text-center mt-3">{message}</p>
       <img
         src="/logo.png"
         className="w-[150px] h-[59px] block mx-auto mt-[136px]"
       />
    </div>
  )
}
