import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Hospital, Clock, Shield, Activity, Search, CheckCircle } from 'lucide-react';
import contractABI from "../config/abi.json";
import { contractAddress } from "../config/contractAddress";
import Navbar from './Navbar';

const HospitalDashboard = () => {
  const [hospitalInfo, setHospitalInfo] = useState({
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

  // Initialize connection and fetch hospital data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setConnectedAddress(accounts[0]);
        
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        const hospital = await contract.hospitals(accounts[0]);
        const isAuthorized = await contract.authorizedHospitals(accounts[0]);

        setHospitalInfo({
          name: hospital.name,
          isActive: hospital.isActive && isAuthorized,
          totalVerifications: hospital.totalVerifications.toString(),
          lastVerificationTime: hospital.lastVerificationTime.toString() === "0" 
            ? "Never" 
            : formatDate(hospital.lastVerificationTime)
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
        assignedHospital: claim.assignedHospital
      });
    } catch (err) {
      setError(`Failed to fetch claim: ${err.message}`);
      setClaimDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyClaimByHospital = async () => {
    if (!claimId || !claimDetails) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      const tx = await contract.verifyClaimByHospital(claimId);
      await tx.wait();
      
      await getClaimDetails();
      const hospital = await contract.hospitals(connectedAddress);
      setHospitalInfo(prev => ({
        ...prev,
        totalVerifications: hospital.totalVerifications.toString(),
        lastVerificationTime: formatDate(hospital.lastVerificationTime)
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
      <div className="max-w-xl mx-auto p-6 space-y-8 pt-20">
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="p-3 bg-blue-500 rounded-lg">
            <Hospital className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Hospital Dashboard</h2>
        </div>

        {/* Hospital Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Hospital Profile</h3>
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                hospitalInfo.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {hospitalInfo.isActive ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Active
                </>
              ) : (
                'Inactive'
              )}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-4 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hospital Name</p>
                  <p className="text-lg font-bold text-gray-800">{hospitalInfo.name || "Unknown"}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Verifications</p>
                  <p className="text-lg font-bold text-gray-800">{hospitalInfo.totalVerifications}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Verification</p>
                  <p className="text-lg font-bold text-gray-800">{hospitalInfo.lastVerificationTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Claim Verification</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={claimId}
                  onChange={(e) => setClaimId(e.target.value)}
                  placeholder="Enter Claim ID"
                  className="w-full p-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              </div>
              <button
                onClick={getClaimDetails}
                disabled={loading || !claimId}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors duration-300 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Get Details'
                )}
              </button>
            </div>

            {claimDetails && (
              <div className="bg-gray-50 rounded-xl p-6 mt-6 border border-gray-100">
                <h4 className="font-bold text-lg mb-4 text-gray-800">Claim Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-gray-600">Claim ID:</span>
                      <span className="font-medium">{claimDetails.id}</span>
                    </p>
                    <p className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-gray-600">Claimant:</span>
                      <span className="font-medium">{formatAddress(claimDetails.claimant)}</span>
                    </p>
                    <p className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{claimDetails.amount} ETH</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-gray-600">Submission Date:</span>
                      <span className="font-medium">{claimDetails.timestamp}</span>
                    </p>
                    <p className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-gray-600">Hospital Verified:</span>
                      <span className={`font-medium ${claimDetails.hospitalVerified ? 'text-green-600' : 'text-orange-600'}`}>
                        {claimDetails.hospitalVerified ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={verifyClaimByHospital}
                  disabled={loading || claimDetails.hospitalVerified}
                  className="mt-6 w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors duration-300 flex items-center justify-center gap-2"
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
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mt-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;