import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Hospital, Clock, Shield, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '../elements/Alert';
import { Card, CardHeader, CardTitle, CardContent } from '../elements/Card';
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
      
      // Refresh claim details and hospital info after verification
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
    <>
      <Navbar />
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Hospital className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Hospital Dashboard</h2>
      </div>

      {/* Hospital Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Hospital Profile</CardTitle>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                hospitalInfo.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {hospitalInfo.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Hospital Name</p>
                <p className="text-lg font-medium">{hospitalInfo.name || "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Verifications</p>
                <p className="text-lg font-medium">{hospitalInfo.totalVerifications}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Last Verification</p>
                <p className="text-lg font-medium">{hospitalInfo.lastVerificationTime}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claim Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={claimId}
                onChange={(e) => setClaimId(e.target.value)}
                placeholder="Enter Claim ID"
                className="flex-1 p-2 border rounded-md"
              />
              <button
                onClick={getClaimDetails}
                disabled={loading || !claimId}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  'Get Details'
                )}
              </button>
            </div>

            {claimDetails && (
              <div className="border rounded-lg p-4 mt-4">
                <h3 className="font-medium mb-2">Claim Details</h3>
                <div className="space-y-2 text-sm">
                  <p>Claim ID: {claimDetails.id}</p>
                  <p>Claimant: {formatAddress(claimDetails.claimant)}</p>
                  <p>Amount: {claimDetails.amount} ETH</p>
                  <p>Submission Date: {claimDetails.timestamp}</p>
                  <p>Hospital Verified: {claimDetails.hospitalVerified ? 'Yes' : 'No'}</p>
                  <button
                    onClick={verifyClaimByHospital}
                    disabled={loading || claimDetails.hospitalVerified}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Claim'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  </>
  );
};

export default HospitalDashboard;