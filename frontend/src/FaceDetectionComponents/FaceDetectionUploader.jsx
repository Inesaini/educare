/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as tf from "@tensorflow/tfjs";
import { API_URL } from "../api.js";

function FaceDetectionUploader() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [existingPhotoUrl, setExistingPhotoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // Fetch existing photo when component mounts
  useEffect(() => {
    const fetchPatientPhoto = async () => {
      try {
        const patientId = localStorage.getItem("patientId");
        if (!patientId) return;

        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/patients/get-patient-photo/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.photoUrl) {
            setExistingPhotoUrl(data.data.photoUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching patient photo:", error);
      }
    };

    fetchPatientPhoto();
  }, []);

  // Load the face detection model
  const loadModel = async () => {
    try {
      await tf.ready();
      // First try loading with tfjs runtime
      try {
        const model = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: "tfjs",
            modelType: "short",
            maxFaces: 1,
          }
        );
        return model;
      } catch (tfjsError) {
        console.log("TFJS runtime failed, trying mediapipe...", tfjsError);
        // Fallback to mediapipe runtime with local models
        const model = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: "mediapipe",
            solutionPath: "/models",
            maxFaces: 1,
          }
        );
        return model;
      }
    } catch (error) {
      console.error("Failed to load face detection model:", error);
      setErrorMessage(
        "Face detection model failed to load. Please refresh and try again."
      );
      return null;
    }
  };

  // Function to detect faces in the image
  const detectFaces = async (imageElement) => {
    let model;
    try {
      model = await loadModel();
      if (!model) return false;

      const faces = await model.estimateFaces(imageElement);
      tf.disposeVariables();

      if (faces.length === 0) {
        setErrorMessage("No face detected in the image");
        return false;
      }

      if (faces.length > 1) {
        setErrorMessage(
          "Multiple faces detected. Please upload an ID with only one face"
        );
        return false;
      }

      const face = faces[0];
      const { height, width } = imageElement;
      const box = face.box;
      const faceSize = (box.width * box.height) / (width * height);

      // Check if face is centered and of appropriate size for an ID
      const isCentered =
        Math.abs((box.xMin + box.width / 2) / width - 0.5) < 0.2 &&
        Math.abs((box.yMin + box.height / 2) / height - 0.5) < 0.2;

      if (!isCentered) {
        setErrorMessage("Face is not properly centered in the image");
        return false;
      }

      if (faceSize < 0.1) {
        setErrorMessage("Face is too small in the image");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error during face detection:", error);
      setErrorMessage("Error processing the image");
      return false;
    } finally {
      if (model) {
        model.dispose();
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes("image/")) {
      setErrorMessage("Please select an image file");
      return;
    }

    setIsLoading(true);
    setImage(file);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target.result;
      setImageUrl(imageUrl);

      // Create an image element for the face-api
      const img = new Image();
      img.src = imageUrl;

      img.onload = async () => {
        const isValidFace = await detectFaces(img);
        setIsValid(isValidFace);
        setIsLoading(false);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!image || !isValid) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);

      // Retrieve patient ID from local storage and append it
      const patientId = localStorage.getItem("patientId");
      formData.append("patientId", patientId);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/patients/upload-id-photo`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      if (data.success && data.data?.imageUrl) {
        setUploadedUrl(data.data.imageUrl);
        setErrorMessage("");
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    let model;
    const loadAndSetModel = async () => {
      model = await loadModel();
    };
    loadAndSetModel();

    return () => {
      if (model) {
        model.dispose();
      }
      tf.disposeVariables();
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold mb-2">ID Photo Upload</h2>
        <p className="text-gray-600">
          Upload a clear photo of your ID with your face visible
        </p>
      </div>

      <div className="w-full mb-6">
        {!imageUrl && !existingPhotoUrl ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all"
            onClick={() => fileInputRef.current.click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mb-4"
            >
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
            </svg>
            <p className="text-gray-500 text-center">
              Click to select an ID photo
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Supported formats: JPG, PNG
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imageUrl || existingPhotoUrl}
              alt="ID preview"
              className="w-full h-64 object-contain rounded-lg border border-gray-300"
            />
            <button
              className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-gray-100"
              onClick={() => {
                setImage(null);
                setImageUrl("");
                setIsValid(null);
                setErrorMessage("");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center mb-4 w-full">
          <div className="flex items-center space-x-2 p-3 bg-blue-50 text-blue-600 rounded-md w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            <span>Analyzing image...</span>
          </div>
        </div>
      )}

      {!isLoading && isValid === true && (
        <div className="flex items-center justify-center mb-4 w-full">
          <div className="flex items-center space-x-2 p-3 bg-green-50 text-green-600 rounded-md w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Valid ID photo detected</span>
          </div>
        </div>
      )}

      {!isLoading && isValid === false && (
        <div className="flex items-center justify-center mb-4 w-full">
          <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-600 rounded-md w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage || "Invalid ID photo. Please try again."}</span>
          </div>
        </div>
      )}

      {(uploadedUrl || existingPhotoUrl) && (
        <div className="flex items-center justify-center mb-4 w-full">
          <div className="flex items-center space-x-2 p-3 bg-green-50 text-green-600 rounded-md w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Image successfully uploaded!</span>
          </div>
        </div>
      )}

      <div className="w-full">
        <button
          className={`w-full py-3 rounded-md flex items-center justify-center space-x-2 ${
            isValid && !isUploading
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isValid || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spin mr-2"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Upload ID Photo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default FaceDetectionUploader;
