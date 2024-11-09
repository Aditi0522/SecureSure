import React, { useState, useEffect } from 'react';
import IPFSHashDashboard from './IPFSHashDashboard';
import Navbar from './Navbar';

const IPFSRecordsPage = () => {
  const [formSubmission, setFormSubmission] = useState(null);
  const [documentUploads, setDocumentUploads] = useState([]);

  useEffect(() => {
    // In a real application, you would fetch this data from your backend
    // For now, we'll simulate getting the data from localStorage
    
    // Get form submission data
    const storedFormSubmission = localStorage.getItem('formSubmission');
    if (storedFormSubmission) {
      setFormSubmission(JSON.parse(storedFormSubmission));
    }

    // Get document uploads data
    const storedDocumentUploads = localStorage.getItem('documentUploads');
    if (storedDocumentUploads) {
      setDocumentUploads(JSON.parse(storedDocumentUploads));
    }
  }, []);

  return (
    <>
      <Navbar />
      <IPFSHashDashboard 
        formSubmission={formSubmission}
        documentUploads={documentUploads}
      />
    </>
  );
};

export default IPFSRecordsPage;