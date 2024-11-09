import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ethers, BrowserProvider } from 'ethers';
import { 
  Hospital, 
  AlertCircle, 
  Clock, 
  FileCheck,
  Activity,
  Shield,
  RefreshCw
} from 'lucide-react';
import { Alert, AlertDescription } from '../elements/Alert';
import contractABI from '../config/abi.json';
import { contractAddress } from '../config/contractAddress';
import Navbar from './Navbar';

const formatAddress = (address) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const HospitalDashboard = ({ userAddress }) => {
  const [contract, setContract] = useState(null);
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState({
    name: '',
    isActive: false,
    totalVerifications: 0,
    lastVerificationTime: 'Never'
  });
  const [claims, setClaims] = useState({
    pending: [],
    verified: []
  });
  const [loading, setLoading] = useState({
    contract: true,
    hospitalData: false,
    claims: false
  });
  const [error, setError] = useState({
    contract: null,
    hospitalData: null,
    claims: null
  });

  const resetErrors = () => {
    setError({
      contract: null,
      hospitalData: null,
      claims: null
    });
  };

  // Initialize contract and get connected address
  useEffect(() => {
    const initializeContract = async () => {
      resetErrors();
      try {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask to use this dashboard");
        }

        const provider = new BrowserProvider(window.ethereum);
        
        window.ethereum.on('networkChanged', () => {
          window.location.reload();
        });

        window.ethereum.on('accountsChanged', (accounts) => {
          setConnectedAddress(accounts[0] || null);
        });

        const accounts = await provider.send('eth_requestAccounts', []);
        setConnectedAddress(accounts[0]);

        const signer = await provider.getSigner();
        const hospitalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        setContract(hospitalContract);
        setLoading(prev => ({ ...prev, contract: false }));
      } catch (err) {
        console.error('Contract initialization error:', err);
        setError(prev => ({
          ...prev,
          contract: `Failed to initialize contract: ${err.message}`
        }));
        setLoading(prev => ({ ...prev, contract: false }));
      }
    };

    initializeContract();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('networkChanged');
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const effectiveAddress = userAddress || connectedAddress;

  const fetchHospitalData = async () => {
    if (!effectiveAddress || !contract) return;
    
    setLoading(prev => ({ ...prev, hospitalData: true }));
    resetErrors();
    
    try {
      const hospital = await contract.hospitals(effectiveAddress);
      const isAuthorized = await contract.authorizedHospitals(effectiveAddress);
      
      // Convert BigInt values to numbers safely
      const lastVerificationTimeBigInt = hospital.lastVerificationTime;
      const totalVerificationsBigInt = hospital.totalVerifications;

      setHospitalInfo({
        name: hospital.name,
        isActive: hospital.isActive && isAuthorized,
        totalVerifications: totalVerificationsBigInt.toString(),
        lastVerificationTime: lastVerificationTimeBigInt.toString() === '0'
          ? 'Never'
          : new Date(Number(lastVerificationTimeBigInt) * 1000).toLocaleDateString()
      });
    } catch (err) {
      console.error('Hospital data fetch error:', err);
      setError(prev => ({
        ...prev,
        hospitalData: `Failed to fetch hospital data: ${err.message}`
      }));
    } finally {
      setLoading(prev => ({ ...prev, hospitalData: false }));
    }
  };

  const fetchClaims = async () => {
    if (!effectiveAddress || !contract) return;
    
    setLoading(prev => ({ ...prev, claims: true }));
    resetErrors();
    
    try {
      // Get total claims and iterate through them
      const totalClaims = await contract.totalClaims();
      const pendingClaims = [];
      const verifiedClaims = [];

      // Convert BigInt to number safely for iteration
      const totalClaimsNumber = Number(totalClaims);

      for (let i = 0; i < totalClaimsNumber; i++) {
        const claim = await contract.claims(i);
        if (claim.assignedHospital === effectiveAddress) {
          const claimData = {
            id: claim.claimId.toString(),
            claimant: claim.claimant,
            amount: ethers.formatEther(claim.claimAmount.toString()),
            timestamp: new Date(Number(claim.submissionTime) * 1000).toLocaleDateString()
          };

          if (!claim.hospitalVerified) {
            pendingClaims.push(claimData);
          } else {
            verifiedClaims.push(claimData);
          }
        }
      }

      setClaims({
        pending: pendingClaims,
        verified: verifiedClaims
      });
    } catch (err) {
      console.error('Claims fetch error:', err);
      setError(prev => ({
        ...prev,
        claims: `Failed to fetch claims: ${err.message}`
      }));
    } finally {
      setLoading(prev => ({ ...prev, claims: false }));
    }
  };

  const verifyClaimByHospital = async (claimId) => {
    if (!contract || !effectiveAddress) return;
    
    setLoading(prev => ({ ...prev, verification: true }));
    resetErrors();
    
    try {
      const tx = await contract.verifyClaimByHospital(claimId);
      await tx.wait();
      await fetchClaims();
    } catch (err) {
      console.error('Verification error:', err);
      setError(prev => ({
        ...prev,
        claims: `Failed to verify claim: ${err.message}`
      }));
    } finally {
      setLoading(prev => ({ ...prev, verification: false }));
    }
  };

  useEffect(() => {
    if (contract && effectiveAddress) {
      fetchHospitalData();
      fetchClaims();
    }
  }, [contract, effectiveAddress]);

  return (
    <>
    <Navbar />
    <div className="max-w-7xl mx-auto p-4 space-y-6 pt-20">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hospital Dashboard</h2>
        <button
          onClick={() => {
            fetchHospitalData();
            fetchClaims();
          }}
          disabled={loading.hospitalData || loading.claims}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading.hospitalData || loading.claims ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Hospital Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Hospital className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold">Hospital Profile</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            hospitalInfo.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {hospitalInfo.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Hospital Name</p>
              <p className="text-lg font-medium">{hospitalInfo.name || 'Unknown'}</p>
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
      </div>

      {/* Claims Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Claims */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="text-xl font-semibold">Pending Claims</h3>
          </div>
          {loading.claims ? (
            <div className="flex justify-center py-8">
              <Clock className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {claims.pending.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending claims</p>
              ) : (
                claims.pending.map(claim => (
                  <div key={claim.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Claim #{claim.id}</p>
                        <p className="text-sm text-gray-500">
                          From: {formatAddress(claim.claimant)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: {claim.amount} ETH
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {claim.timestamp}
                        </p>
                      </div>
                      <button
                        onClick={() => verifyClaimByHospital(claim.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Verified Claims */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="w-5 h-5 text-green-500" />
            <h3 className="text-xl font-semibold">Verified Claims</h3>
          </div>
          {loading.claims ? (
            <div className="flex justify-center py-8">
              <Clock className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {claims.verified.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No verified claims</p>
              ) : (
                claims.verified.map(claim => (
                  <div key={claim.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Claim #{claim.id}</p>
                        <p className="text-sm text-gray-500">
                          From: {formatAddress(claim.claimant)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: {claim.amount} ETH
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {claim.timestamp}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Alerts */}
      <div className="space-y-2">
        {Object.entries(error).map(([key, message]) => 
          message && (
            <Alert key={key} variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )
        )}
      </div>
    </div>
    </>
  );
};

HospitalDashboard.propTypes = {
  userAddress: PropTypes.string
};

export default HospitalDashboard;