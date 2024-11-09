import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../elements/Card';
import { ExternalLink, File, FileText, Clock, Hash } from 'lucide-react';

const IPFSHashDashboard = ({ formSubmission, documentUploads }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-6 h-6" />
              IPFS Records Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Form Submission Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                Form Submission
              </h3>
              {formSubmission ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">IPFS Hash/CID</p>
                      <p className="font-mono text-sm">{formSubmission.hash}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submission Time</p>
                      <p className="text-sm">{new Date(formSubmission.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="md:col-span-2">
                      <a 
                        href={`https://gateway.pinata.cloud/ipfs/${formSubmission.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        View on IPFS <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No form submission found</p>
              )}
            </div>

            {/* Document Uploads Section */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <File className="w-5 h-5" />
                Document Uploads
              </h3>
              {documentUploads && documentUploads.length > 0 ? (
                <div className="space-y-4">
                  {documentUploads.map((doc, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="font-mono text-sm mt-1">{doc.cid}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(doc.timestamp).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Size: {(doc.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <a 
                            href={doc.ipfsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            View on IPFS <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents uploaded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IPFSHashDashboard;