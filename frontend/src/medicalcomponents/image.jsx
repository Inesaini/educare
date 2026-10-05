import React, { useState, useEffect } from 'react';
import { API_URL } from "../api.js";

function PatientPhoto() {
  const email = "ahlampatient@esi-sba.dz"; // static email, no trailing space
  const [imageSrc, setImageSrc] = useState('/default.png'); // default image at start

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const imgUrl = `${API_URL}/patients/get-patient-photo/${email}`;
        const response = await fetch(imgUrl);

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.image) {
            setImageSrc(data.image);
            console.log('Image URL loaded:', data.image);
          } else {
            console.warn('No image found in response, using fallback');
            setImageSrc('/default.png');
          }
        } else {
          console.warn('Failed to fetch image URL, using fallback');
          setImageSrc('/default.png');
        }
      } catch (error) {
        console.error('Error fetching image URL:', error);
        setImageSrc('/default.png');
      }
    };

    fetchImageUrl();
  }, []);

  return (
    <img
      src={imageSrc}
      alt="Patient"
      onError={(e) => {
        console.error('Image load error, switching to default-profile.png');
        e.target.onerror = null;
        e.target.src = '/default.png';
      }}
      className="text-black w-[133px] h-[194px] object-cover border-4 border-gray-300"
    />
  );
}

export default PatientPhoto;
