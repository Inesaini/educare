import React from 'react';
import FaceDetectionUploader from './FaceDetectionUploader';

const IdPhotoUploadPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Upload Your ID Photo</h1>
      <p className="text-gray-600 text-center mb-8">
        Please upload a clear photo of your ID document that shows your face clearly.
        The system will validate the photo to ensure it meets our requirements.
      </p>
      <FaceDetectionUploader />
    </div>
  );
};

export default IdPhotoUploadPage;