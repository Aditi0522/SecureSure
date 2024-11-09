import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../elements/Card";
import {
  Upload,
  File,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

const DocumentUpload = () => {
  const [files, setFiles] = useState({
    bills: null,
    doctorReports: null,
    testReports: null,
    policyDocuments: null,
  });

  const [uploading, setUploading] = useState({
    bills: false,
    doctorReports: false,
    testReports: false,
    policyDocuments: false,
  });

  const [uploadResults, setUploadResults] = useState({
    bills: null,
    doctorReports: null,
    testReports: null,
    policyDocuments: null,
  });

  const [errors, setErrors] = useState({
    bills: "",
    doctorReports: "",
    testReports: "",
    policyDocuments: "",
  });

  const uploadToPinata = async (file, documentType) => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [documentType]: true }));
    setErrors((prev) => ({ ...prev, [documentType]: "" }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Add metadata
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          type: documentType,
          uploadDate: new Date().toISOString(),
        },
      });
      formData.append("pinataMetadata", metadata);

      // Add pinata options
      const pinataOptions = JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false,
      });
      formData.append("pinataOptions", pinataOptions);

      const response = await axios.post(PINATA_API_URL, formData, {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      const existingUploads = JSON.parse(
        localStorage.getItem("documentUploads") || "[]"
      );
      const newUpload = {
        name: file.name,
        cid: response.data.IpfsHash,
        timestamp: new Date().toISOString(),
        size: file.size,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      };
      localStorage.setItem(
        "documentUploads",
        JSON.stringify([...existingUploads, newUpload])
      );

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

      setUploadResults((prev) => ({
        ...prev,
        [documentType]: {
          cid: response.data.IpfsHash,
          timestamp: response.data.Timestamp,
          size: file.size,
          ipfsUrl: ipfsUrl,
        },
      }));
    } catch (error) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        [documentType]:
          error.response?.data?.message ||
          error.message ||
          "Failed to upload. Please try again.",
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setErrors((prev) => ({
          ...prev,
          [documentType]: "File size exceeds 10MB limit",
        }));
        return;
      }
      setFiles((prev) => ({ ...prev, [documentType]: file }));
      uploadToPinata(file, documentType);
    }
  };

  const renderUploadStatus = (documentType) => {
    if (uploading[documentType]) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
    if (uploadResults[documentType]?.ipfsUrl) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (errors[documentType]) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return null;
  };

  const DocumentUploadSection = ({ title, type }) => (
    <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <File className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        {renderUploadStatus(type)}
      </div>
      <input
        type="file"
        onChange={(e) => handleFileChange(e, type)}
        accept=".pdf,.jpg,.jpeg,.png"
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {errors[type] && (
        <p className="mt-2 text-sm text-red-500">{errors[type]}</p>
      )}
      {uploadResults[type]?.ipfsUrl && (
        <div className="mt-2 space-y-1">
          <p className="text-sm text-green-600">
            Upload successful! CID: {uploadResults[type].cid}
          </p>
          <a
            href={uploadResults[type].ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View on IPFS <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <DocumentUploadSection title="Medical Bills" type="bills" />
              <DocumentUploadSection
                title="Doctor Reports"
                type="doctorReports"
              />
              <DocumentUploadSection title="Test Reports" type="testReports" />
              <DocumentUploadSection
                title="Policy Documents"
                type="policyDocuments"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUpload;
