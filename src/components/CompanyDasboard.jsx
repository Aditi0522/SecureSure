import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress } from '../config/contractAddress';
import abi from '../config/abi.json';
import Navbar from './Navbar';

const CompanyDashboard = () => {
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState({});
  const [notification, setNotification] = useState(null);
  const [totalClaims, setTotalClaims] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const initializeEthers = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const tempSigner = await provider.getSigner();
          setSigner(tempSigner);
          const contractInstance = new ethers.Contract(
            contractAddress,
            abi,
            tempSigner
          );
          setContract(contractInstance);
          await checkAuthorization(contractInstance, tempSigner);
        }
      } catch (error) {
        showNotification('error', 'Error initializing ethers: ' + error.message);
      }
    };

    initializeEthers();
  }, []);

  const checkAuthorization = async (contractInstance, signer) => {
    try {
      const address = await signer.getAddress();
      const isAuth = await contractInstance.authorizedCompanies(address);
      setIsAuthorized(isAuth);
      
      if (isAuth) {
        const companyInfo = await contractInstance.companies(address);
        setCompanyName(companyInfo.name);
      }
    } catch (error) {
      showNotification('error', 'Error checking authorization: ' + error.message);
    }
  };

  const fetchClaims = async () => {
    if (!contract) return;
    
    try {
      const total = await contract.totalClaims();
      setTotalClaims(Number(total));
      
      const claimsArray = [];
      for (let i = 1; i <= total; i++) {
        const claim = await contract.claims(i);
        if (claim.assignedCompany === await signer.getAddress()) {
          claimsArray.push({
            id: i,
            ...claim
          });
        }
      }
      setClaims(claimsArray);
    } catch (error) {
      showNotification('error', 'Error fetching claims: ' + error.message);
    }
  };

  useEffect(() => {
    if (contract && isAuthorized) {
      fetchClaims();
    }
  }, [contract, isAuthorized]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const verifyClaimByCompany = async (claimId) => {
    if (!contract || !signer) {
      showNotification('error', 'Web3 not initialized. Please check your connection.');
      return;
    }
  
    setLoading(prev => ({ ...prev, [claimId]: true }));
    
    try {
      // Get current claim status before proceeding
      const claim = await contract.claims(claimId);
      
      // Validate claim state
      if (!claim.hospitalVerified) {
        throw new Error('Claim must be verified by hospital first');
      }
      
      if (claim.companyVerified) {
        throw new Error('Claim has already been verified by company');
      }
  
      if (claim.status === 2) { // Rejected
        throw new Error('Cannot verify a rejected claim');
      }
  
      // Get gas estimate
      const gasEstimate = await contract.verifyClaimByCompany.estimateGas(claimId);
      
      // Add 10% buffer to gas estimate
      const gasLimit = Math.floor(gasEstimate * 1.1);
  
      // Send transaction with gas limit
      const tx = await contract.verifyClaimByCompany(claimId, {
        gasLimit: gasLimit
      });
  
      // Show pending notification
      showNotification('info', 'Transaction pending. Please wait for confirmation...');
  
      // Wait for transaction confirmation
      const receipt = await tx.wait();
  
      if (receipt.status === 1) {
        showNotification('success', `Claim #${claimId} verified successfully!`);
        
        // Refresh the claims list
        await fetchClaims();
        
        // Return true to indicate success
        return true;
      } else {
        throw new Error('Transaction failed');
      }
  
    } catch (error) {
      // Parse error message for user-friendly display
      let errorMessage = 'Error verifying claim: ';
      
      if (error.message.includes('user rejected transaction')) {
        errorMessage += 'Transaction was rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for gas';
      } else {
        errorMessage += error.message.split('revert ').pop() || error.message;
      }
      
      showNotification('error', errorMessage);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const getClaimStatusText = (status) => {
    const statusMap = {
      0: 'Pending',
      1: 'Verified',
      2: 'Rejected',
      3: 'Disputed'
    };
    return statusMap[status] || 'Unknown';
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You are not authorized as a company.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Company Dashboard</h1>
              <p className="text-gray-600">Welcome, {companyName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Claims in System</p>
              <p className="text-2xl font-bold text-blue-600">{totalClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claimant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{claim.id.toString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {claim.claimant.slice(0, 6)}...{claim.claimant.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ethers.formatEther(claim.claimAmount)} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${claim.status === 1 ? 'bg-green-100 text-green-800' : 
                          claim.status === 2 ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {getClaimStatusText(Number(claim.status))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {claim.hospitalVerified ? 
                        <span className="text-green-600">✓</span> : 
                        <span className="text-red-600">×</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {claim.aiVerified ? 
                        <span className="text-green-600">✓</span> : 
                        <span className="text-red-600">×</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!claim.companyVerified && (
                        <button
                          onClick={() => verifyClaimByCompany(claim.id)}
                          disabled={loading[claim.id]}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        >
                          {loading[claim.id] ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                      {claim.companyVerified && (
                        <span className="text-green-600">Verified ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </div>
  </>
  );
};

export default CompanyDashboard;