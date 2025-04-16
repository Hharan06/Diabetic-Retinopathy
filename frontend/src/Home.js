import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [segmentationImage, setSegmentationImage] = useState("");

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPrediction("");
    setSegmentationImage("");
  };

  const handlePredict = async () => {
    if (!file) return alert("Select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/home", formData);
      setPrediction(res.data.prediction);
    } catch (err) {
      console.error(err);
      setPrediction("Error in prediction");
    }
  };

  const handleSegment = async () => {
    if (!file) return alert("Select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/home/segment", formData);
      setSegmentationImage(`data:image/png;base64,${res.data.segmentation_result}`);
    } catch (err) {
      console.error(err);
      setSegmentationImage("Error in segmentation");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">
          Retinal Image Analyzer
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="bg-gray-700 border border-gray-600 text-white p-2 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        />

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleSegment}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium w-full"
          >
            Segment Lesions
          </button>
          <button
            onClick={handlePredict}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium w-full"
          >
            Predict DR
          </button>
        </div>

        {/* Outputs in updated order */}
        {segmentationImage && typeof segmentationImage === "string" && (
          <div className="mt-6 text-center">
            <p className="mb-2 text-lg font-semibold text-purple-400">Segmentation Output:</p>
            <img src={segmentationImage} alt="Segmentation Result" className="mx-auto rounded-lg" />
          </div>
        )}

        {prediction && (
          <div className="mt-6 text-center text-lg">
            <p>
              Prediction:{" "}
              <span className="text-green-400 font-semibold">
                {prediction}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
