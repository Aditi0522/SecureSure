import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Building, Clock, Shield, Activity, Search, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../elements/Alert';
import { Card, CardHeader, CardTitle, CardContent } from '../elements/Card';
import contractABI from "../config/abi.json";
import { contractAddress } from "../config/contractAddress";
import Navbar from './Navbar';

const CompanyDashboard = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    isActive: false,
    totalVerifications: 0,
    lastVerificationTime: "Never"
  });
  const [claimId, setClaimId] = useState('');
  const [claimDetails, setClaimDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectedAddress, setConnectedAddress] = useState(null);

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  // Initialize connection and fetch company data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setConnectedAddress(accounts[0]);
        
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        const company = await contract.companies(accounts[0]);
        const isAuthorized = await contract.authorizedCompanies(accounts[0]);

        setCompanyInfo({
          name: company.name,
          isActive: company.isActive && isAuthorized,
          totalVerifications: company.totalVerifications.toString(),
          lastVerificationTime: company.lastVerificationTime.toString() === "0" 
            ? "Never" 
            : formatDate(company.lastVerificationTime)
        });
      } catch (err) {
        setError(`Failed to initialize: ${err.message}`);
      }
    };

    initializeData();
  }, []);

  const getClaimDetails = async () => {
    if (!claimId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const claim = await contract.claims(claimId);
      
      setClaimDetails({
        id: claimId,
        claimant: claim.claimant,
        amount: ethers.formatEther(claim.claimAmount.toString()),
        timestamp: formatDate(claim.submissionTime),
        status: claim.status,
        hospitalVerified: claim.hospitalVerified,
        companyVerified: claim.companyVerified,
        assignedCompany: claim.assignedCompany
      });
    } catch (err) {
      setError(`Failed to fetch claim: ${err.message}`);
      setClaimDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyClaimByCompany = async () => {
    if (!claimId || !claimDetails) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      if (!claimDetails.hospitalVerified) {
        throw new Error('Claim must be verified by hospital first');
      }
      
      const tx = await contract.verifyClaimByCompany(claimId);
      await tx.wait();
      
      await getClaimDetails();
      const company = await contract.companies(connectedAddress);
      setCompanyInfo(prev => ({
        ...prev,
        totalVerifications: company.totalVerifications.toString(),
        lastVerificationTime: formatDate(company.lastVerificationTime)
      }));
    } catch (err) {
      setError(`Failed to verify claim: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-8 pt-20">
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <Building className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Company Dashboard
          </h2>
        </div>

        {/* Company Profile Card */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Company Profile</h3>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                    companyInfo.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {companyInfo.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {companyInfo.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-blue-50 rounded-xl p-4 flex items-center space-x-4">
                  <Shield className="w-10 h-10 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p className="text-lg font-semibold text-gray-800">{companyInfo.name || "Unknown"}</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 flex items-center space-x-4">
                  <Activity className="w-10 h-10 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Verifications</p>
                    <p className="text-lg font-semibold text-gray-800">{companyInfo.totalVerifications}</p>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 flex items-center space-x-4">
                  <Clock className="w-10 h-10 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Verification</p>
                    <p className="text-lg font-semibold text-gray-800">{companyInfo.lastVerificationTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Claim Verification</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={claimId}
                  onChange={(e) => setClaimId(e.target.value)}
                  placeholder="Enter Claim ID"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
              <button
                onClick={getClaimDetails}
                disabled={loading || !claimId}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Get Details
                  </>
                )}
              </button>
            </div>

            {claimDetails && (
              <div className="bg-gray-50 rounded-xl p-6 mt-6 transform transition-all duration-300">
                <h4 className="font-semibold text-lg mb-4 text-gray-800">Claim Details</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="flex items-center justify-between">
                      <span className="text-gray-600">Claim ID:</span>
                      <span className="font-medium">{claimDetails.id}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-gray-600">Claimant:</span>
                      <span className="font-medium">{formatAddress(claimDetails.claimant)}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{claimDetails.amount} ETH</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center justify-between">
                      <span className="text-gray-600">Submission Date:</span>
                      <span className="font-medium">{claimDetails.timestamp}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-gray-600">Hospital Verified:</span>
                      <span className={`font-medium flex items-center gap-1 ${claimDetails.hospitalVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {claimDetails.hospitalVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {claimDetails.hospitalVerified ? 'Yes' : 'No'}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-gray-600">Company Verified:</span>
                      <span className={`font-medium flex items-center gap-1 ${claimDetails.companyVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {claimDetails.companyVerified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {claimDetails.companyVerified ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={verifyClaimByCompany}
                  disabled={loading || claimDetails.companyVerified || !claimDetails.hospitalVerified}
                  className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Verify Claim
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 animate-fade-in">
                <Alert variant="error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;