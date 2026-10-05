import React, { useState, useEffect } from "react";
import OneDoctor from "./OneDoctor";
import { FaPlus } from "react-icons/fa6";
import { API_URL } from "../api.js";


const DisplayDoctors = (/*{ doctors, addDoctor }*/) => {
  const [addOpen, setAddOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  /*useEffect(() => {
      fetchPatients();
    }, []);*/
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    role: "",
    speciality: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [errors, setErrors] = useState({});
  const handleEdit = async (email, name) => {
    const confirmed = window.confirm(
      "Are you sure you want to edit the doctor state?"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token"); // Retrieve token
      if (!token) throw new Error("Authentication token is missing");

      const response = await fetch(
        `${API_URL}/admin/edit-medecin-state/${encodeURIComponent(
          email
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // Add token
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to edit doctor state: ${errorText}`);
      }

      console.log("Doctor state updated successfully");

      // Refresh the page after successful edit
      window.location.reload();
    } catch (error) {
      console.error("Error editing doctor state:", error);
    }
  };

  const handleDelete = async (email) => {
    console.log("Trying to delete doctor with email:", email);

    const confirmed = window.confirm(
      "Are you sure you want to delete this doctor?"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token"); // Récupérer le token
      if (!token) throw new Error("Authentication token is missing");

      console.log(
        `Fetching: ${API_URL}/admin/delete-user/${encodeURIComponent(
          email
        )}`
      );

      const response = await fetch(
        `${API_URL}/admin/delete-user/${encodeURIComponent(
          email
        )}`,
        //setErrorMessage(response.error);
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // Ajout du token
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete doctor: ${errorText}`);
      }

      console.log("Doctor deleted successfully");

      // Mettre à jour la liste après suppression
      setDoctors((prevDoctors) =>
        prevDoctors.filter((doctor) => doctor.email !== email)
      );
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  const getAllMedecins = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/admin/get-all-medecins/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch data: ${errorMessage}`);
      }

      const data = await response.json();
      console.log("Fetched doctors:", data); // ✅ Vérifier si les données arrivent
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    getAllMedecins();
  }, []);
  const validateForm = () => {
    let newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.includes("@")) newErrors.email = "Enter a valid email";

    if (!formData.phone.match(/^0[567][0-9]{8}$/)) {
      newErrors.phone = "Phone must start with +213 and be 9-10 digits";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.role) newErrors.role = "Please select a role";
    if (!formData.speciality)
      newErrors.speciality = "Please select a speciality";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (validateForm()) {
  //     const newDoctor = {
  //       id: doctors.length + 1,
  //       name: `${formData.firstName} ${formData.lastName}`,
  //       email: formData.email,
  //       state: "Active",
  //       role: formData.speciality,
  //     };
  //     addDoctor(newDoctor);
  //     setAddOpen(false);
  //     setFormData({
  //       firstName: '',
  //       lastName: '',
  //       email: '',
  //       phone: '',
  //       password: '',
  //       dob: '',
  //       role: '',
  //       speciality: '',
  //     });
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing");

      const response = await fetch(
        `${API_URL}/medecins/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            birth_date: formData.dob,
            matricule: Math.floor(Math.random() * 1000000).toString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Response:", errorData);
        throw new Error(errorData.error || "Failed to add doctor");
      }

      setErrorMessage("");
      await getAllMedecins();
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        dob: "",
        role: "",
        speciality: "",
      });
      setAddOpen(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
      setErrorMessage(error.message);
    }
  };

  const formFields = [
    { name: "firstName", type: "text", placeholder: "First name" },
    { name: "lastName", type: "text", placeholder: "Last name" },
    { name: "email", type: "email", placeholder: "Email" },
    { name: "phone", type: "text", placeholder: "Phone number" },
    { name: "password", type: "password", placeholder: "Password" },
    { name: "dob", type: "date", placeholder: "Date of birth" },
  ];

  const dropdowns = [
    { name: "role", options: ["Select Role", "Doctor", "Nurse"] },
    {
      name: "speciality",
      options: [
        "Select Speciality",
        "General",
        "Cardiology",
        "Neurology",
        "Pediatrics",
      ],
    },
  ];

  return (
    <div className="flex flex-col justify-end items-end bg-[#FFFEFE]  mx-8 mb-6 rounded-[15px] border border-[#CACACA] shadow-md py-2 px-4">
      {errorMessage && (
        <p className="w-full text-red-600 text-sm px-3 pt-2">{errorMessage}</p>
      )}
      <div className="w-full grid grid--6 gap-2 items-center p-3 h-full">
        {/* Titles */}
        <div className="flex justify-between  font-medium text-[#BBBBBF] border-b pb-2">
          <span className="md:w-[180px]">Name</span>
          <span className="md:w-[200px]">Email</span>
          <span className="md:w-[130px]">State</span>
          <span className="md:w-[140px]"></span>
          <span className="md:w-[120px]"></span>
        </div>

        <div className="max-h-[300px]  min-h-[250px] flex flex-col overflow-x-auto overflow-y-auto">
          {doctors.map((doctor) => (
            <OneDoctor
              key={doctor.email}
              id={doctor.email}
              name={`${doctor.prenom} ${doctor.nom}`}
              email={doctor.email}
              state={doctor.archive ? 0 : 1}
              role={doctor.speciality}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Add Doctor Button */}
      <button
        onClick={() => setAddOpen(true)}
        className="hover:bg-[linear-gradient(to_left,#2E3D40,transparent)] px-4 py-2 cursor-pointer shadow-[0px_4px_10px_rgba(0,0,0,0.5)] 
        flex justify-center items-center gap-2 bg-[#679294] md:px-4 rounded-[10px] text-white my-3"
      >
        <FaPlus />
        Add
      </button>

      {/* Modal */}
      {addOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)]"
          onClick={(e) => e.target === e.currentTarget && setAddOpen(false)}
        >
          <div className="bg-[#FFFEFE] rounded-[15px] p-8 shadow-lg">
            <h1 className="text-2xl text-[#679294] font-extrabold mb-4 text-center">
              New Doctor
            </h1>
            <form
              onSubmit={handleSubmit}
              className="max-h-[440px] overflow-y-auto flex flex-col w-[350px] my-2 space-y-2"
            >
              {formFields.map((field, index) => (
                <div key={index}>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="border border-gray-400 p-2 rounded w-full"
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-[12px]">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}

              {dropdowns.map((dropdown, index) => (
                <div key={index}>
                  <select
                    name={dropdown.name}
                    value={formData[dropdown.name]}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5F8B8E]"
                  >
                    {dropdown.options.map((option, idx) => (
                      <option
                        key={idx}
                        value={idx === 0 ? "" : option}
                        disabled={idx === 0}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors[dropdown.name] && (
                    <p className="text-red-500 text-[12px]">
                      {errors[dropdown.name]}
                    </p>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  className="bg-[#679294] w-full cursor-pointer hover:bg-[linear-gradient(to_left,#2E3D40,transparent)]  px-4 py-2 rounded text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayDoctors;
