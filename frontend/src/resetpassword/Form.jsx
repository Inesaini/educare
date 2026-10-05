import React, { useState } from "react";
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api.js";

export default function Form() {
  const { token } = useParams();
  const [newPassword, setNewpassword] = useState("");
  const [verifypassword, setVerifypassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const resetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== verifypassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const res = await axios.post(
        `${API_URL}/patients/set-new-password`,
        { token, newPassword }
      );
      setMessage(res.message);

      if (res.status === 200) {
        setTimeout(() => navigate("/passwordchanged"), 2000); // Redirect user to passwordchanged page after success
      }
    } catch (error) {
      console.log(error.response?.data?.error || error.message); // ✅ Log actual error response
      setMessage(
        error.response?.data?.error || "Error  sending message. Try again"
      );
    } finally {
      setIsLoading(false); // Stop loading after request completes
    }
  };

  return (
    <div className="relative bg-[#679294] h-screen p-6  lg:w-[519px] mx-auto  ml-[114px] md:w-full sm:w-fulll">
      <h2 className=" decoration-white font-exo2 text-3xl font-bold text-center mt-[140px]">
        Reset Password
      </h2>
      <AlertCircle className="w-[30px] h-[30px] text-[#2E3D40] font-size[10px] ml-[222px] mt-[15px]" />

      <form className="flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="relative mt-[20px]">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white-500 w-5 h-5" />
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewpassword(e.target.value)}
              placeholder="New Password:"
              className="border border-white rounded-[10px] text-white w-[420px] p-2 pl-10 transition-all duration-300 hover:border-[#2E3D40]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="relative mt-[20px]">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white-500 w-5 h-5" />
            <input
              type={showVerifyPassword ? "text" : "password"}
              id="password"
              value={verifypassword}
              onChange={(e) => setVerifypassword(e.target.value)}
              placeholder="Confirm New Password:"
              className="border border-white rounded-[10px] text-white w-[420px] p-2 pl-10 transition-all duration-300 hover:border-[#2E3D40]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
              onClick={() => setShowVerifyPassword(!showVerifyPassword)}
            >
              {showVerifyPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
          {/*submit button*/}
          <button
            type="submit"
            onClick={resetPassword}
            disabled={isLoading} // Disable when loading
            onMouseDown={(e) => (e.target.style.opacity = "0.8")}
            onMouseUp={(e) => (e.target.style.opacity = "1")}
            className="bg-white text-[#679294] rounded-[10px] w-[420px] h-[40px] mt-[30px] cursor-pointer"
          >
            {isLoading ? "Submitting..." : "Submit"}
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
