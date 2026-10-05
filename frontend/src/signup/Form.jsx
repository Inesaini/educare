import React, { useState } from "react";
import {
  MailIcon,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Phone,
  IdCard,
  Tag,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Outlet, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { API_URL } from "../api.js";

export default function Form() {
  const [email, setEmail] = useState("");
  const [categorie, setCategorie] = useState("Etudiant");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [first_name, setFirstname] = useState("");
  const [last_name, setLastname] = useState("");
  const [birth_date, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [matricule, setMatricule] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [sex, setSex] = useState("");

  const [loading, setLoading] = useState(false); // Add loading state

  const navigate = useNavigate();

  const handleClick = async (e) => {
    setLoading(true);
    await handleSignup(e);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    console.log("im clicked");
    e.preventDefault();
    if (loading) return; // Prevent multiple clicks
    setLoading(true); // Start loading
    // Validate birth date format
    /* if (!/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) {
      setError("Invalid birth date format. Please enter YYYY-MM-DD.");
      setLoading(false);
      return;
    }*/

    // Validate matricule number format
    if (!/^\d{12}$/.test(matricule)) {
      setError("Invalid matricule. It must be exactly 12 digits.");
      setLoading(false);
      return;
    }

    // Validate phone number format
    if (!/^0\d{9}$/.test(phone)) {
      setError(
        "Invalid phone number. It must start with 0 and be exactly 10 digits."
      );
      setLoading(false);
      return;
    }

    try {
      console.log("im trying");
      const res = await axios.post(
        `${API_URL}/patients/register`,
        {
          email,
          password,
          first_name,
          last_name,
          birth_date,
          phone,
          matricule,
          categorie,
          sex,
        }
      );
      console.log("not getting the response from the server ");
      setMessage(res.data.message);

      if (res.status === 201) {
        setTimeout(() => {
          navigate("/checkemail", { state: { email: email } }); // Redirect to checkmail page after signup
        }, 2000); // Delay for user feedback
      }
    } catch (error) {
      console.log("network error please try again Later");

      console.log(error.response?.data?.error || error.message); // ✅ Log actual error response
      setMessage(error.response?.data?.error || "Error signing up. Try again");
    }
  };

  return (
    <div className="relative bg-[#679294] min-h-screen overflow-auto p-6 pb-[3px] lg:w-[519px] mx-auto ml-[114px] md:w-full sm:w-full">
      <h2 className=" decoration-white font-exo2 text-3xl font-bold text-center mt-[10px]">
        Create an account
      </h2>

      <form className="flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="flex gap-x-4 mt-[20px]">
            <div className="relative w-[200px]">
              <input
                type="text"
                value={first_name}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder="First Name"
                className="border border-white rounded-[10px] text-white w-full p-2 pl-3"
              />
            </div>
            <div className="relative w-[200px]">
              <input
                type="text"
                value={last_name}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Last Name"
                className="border border-white rounded-[10px] text-white w-full p-2 pl-3"
              />
            </div>
          </div>
          {/*birthdate*/}
          <div className="relative mt-[30px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white-500 w-5 h-5" />
            <DatePicker
              selected={birth_date ? new Date(birth_date) : null} // Convert string to Date object
              onChange={(date) =>
                setBirthdate(date.toISOString().split("T")[0])
              } // Convert Date to string "YYYY-MM-DD"
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className="border border-white rounded-[10px] text-white w-[420px] p-2 pl-10"
            />
          </div>
          {/*phone*/}
          <div className="relative mt-[30px]">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white-500 w-5 h-5" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number:0654237890"
              className="border border-white rounded-[10px] text-white w-[420px] p-2 pl-10"
            />
          </div>
          {/*matricule*/}
          <div className="relative mt-[30px]">
            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-white-500 w-5 h-5" />
            <input
              type="text"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="Matricule:"
              className="border border-white rounded-[10px] text-white w-[420px] p-2 pl-10"
            />
          </div>
          {/*categorie */}

          <div className="relative mt-[30px]">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-white-500 w-5 h-5" />
            <select
              name="categorie"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className=" border border-white rounded-[10px] text-white w-[420px] p-2 pl-10 bg-transparent"
            >
              <option className="text-black" value="Etudiant">
                Étudiant
              </option>
              <option className="text-black" value="Enseignant">
                Enseignant
              </option>
              <option className="text-black" value="Ats">
                Ats
              </option>
            </select>
          </div>

          {/*email*/}
          <div className="relative mt-[30px]">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white-500 w-5 h-5" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border border-white rounded-[10px] text-white w-[420px] p-2 pl-10"
            />
          </div>
          {/*Password*/}
          <div className="relative mt-[20px]">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white-500 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password:"
              className="border border-white rounded-[10px] text-white w-[420px] p-2 pl-10 transition-all duration-300 hover:border-[#2E3D40]"
            />
            {/*show/hid password*/}
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>
          {/* Sex selection */}
          <div className="relative mt-[30px] w-[420px]">
            <label className="text-white block mb-2 pl-1">Sex</label>
            <div className="flex gap-x-6 pl-1">
              <label className="flex items-center text-white gap-x-2">
                <input
                  type="radio"
                  name="sex"
                  value="Male"
                  checked={sex === "Male"}
                  onChange={(e) => setSex(e.target.value)}
                  className="accent-white"
                />
                Male
              </label>
              <label className="flex items-center text-white gap-x-2">
                <input
                  type="radio"
                  name="sex"
                  value="Female"
                  checked={sex === "Female"}
                  onChange={(e) => setSex(e.target.value)}
                  className="accent-white"
                />
                Female
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading} // Disable while loading
            onClick={handleClick}
            onMouseDown={(e) => (e.target.style.opacity = "0.8")} // changes the opacity
            onMouseUp={(e) => (e.target.style.opacity = "1")}
            className="bg-white text-[#679294] rounded-[10px] w-[420px] h-[40px] mt-[30px] cursor-pointer"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>

          <p className="mt-[5px]">
            Already have an account?
            <Link to="/signin" className="text-[#2E3D40]">
              Log in
            </Link>
          </p>
          {/* Error Messages */}
          <p className="text-red-500 mt-3">{message}</p>
          <p className="text-red-500 mt-1">{error}</p>
        </div>
      </form>
      <img
        src="/logo.png"
        className="w-[150px] h-[59px] block mx-auto  bottom-0"
      />
    </div>
  );
}
