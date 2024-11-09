import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AlertCircle } from 'lucide-react';
import contractABI from '../config/abi.json';
import { contractAddress } from '../config/contractAddress';
import Navbar from './Navbar';

const ClaimSubmit = () => {
    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    
    const [formData, setFormData] = useState({
      claimAmount: '',
      ipfsHash: '',
      claimType: '0',
      hospital: '',
      aiOracle: ''
    });
    
    const [status, setStatus] = useState({
      loading: false,
      error: null,
      success: false
    });
  
    // Connect to MetaMask and initialize contract
    const connectWallet = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          // For ethers v6
          const provider = new ethers.BrowserProvider(window.ethereum);
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const signer = await provider.getSigner();
          const account = await signer.getAddress();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          
          setProvider(provider);
          setSigner(signer);
          setAccount(account);
          setContract(contract);
        } else {
          throw new Error("Please install MetaMask");
        }
      } catch (error) {
        setStatus({ 
          loading: false, 
          error: error.message || "Failed to connect wallet", 
          success: false 
        });
      }
    };
  
    // Handle input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    // Handle claim type selection
    const handleClaimTypeChange = (e) => {
      setFormData(prev => ({
        ...prev,
        claimType: e.target.value
      }));
    };
  
    // Submit claim
    const handleSubmit = async (e) => {
      e.preventDefault();
      setStatus({ loading: true, error: null, success: false });
  
      try {
        if (!contract || !account) {
          throw new Error("Please connect your wallet first");
        }
  
        // Convert claim amount to wei
        const claimAmountWei = ethers.parseEther(formData.claimAmount);
        
        // Submit transaction
        const tx = await contract.submitClaim(
          claimAmountWei,
          formData.ipfsHash,
          formData.claimType,
          formData.hospital,
          formData.aiOracle
        );
  
        // Wait for transaction to be mined
        await tx.wait();
  
        setStatus({ loading: false, error: null, success: true });
        
        // Reset form
        setFormData({
          claimAmount: '',
          ipfsHash: '',
          claimType: '0',
          hospital: '',
          aiOracle: ''
        });
  
      } catch (error) {
        setStatus({ 
          loading: false, 
          error: error.message || "Transaction failed", 
          success: false 
        });
      }
    };
  
    // Listen for account changes
    useEffect(() => {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', async (accounts) => {
          if (accounts.length > 0) {
            // Reconnect with new account
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
            
            setAccount(accounts[0]);
            setProvider(provider);
            setSigner(signer);
            setContract(contract);
          } else {
            setAccount('');
            setSigner(null);
            setContract(null);
            setProvider(null);
          }
        });
      }
  
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', () => {});
        }
      };
    }, []);
  
    return (
    <>
    <Navbar />
      <div className="max-w-2xl mx-auto p-6 pt-20">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Submit Insurance Claim</h2>
            <p className="text-gray-600 mt-1">Fill in the details below to submit your insurance claim</p>
          </div>
  
          {!account && (
            <button
              onClick={connectWallet}
              className="w-full mb-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Claim Amount (ETH)
              </label>
              <input
                type="number"
                name="claimAmount"
                value={formData.claimAmount}
                onChange={handleInputChange}
                placeholder="Enter claim amount in ETH"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IPFS Hash
              </label>
              <input
                type="text"
                name="ipfsHash"
                value={formData.ipfsHash}
                onChange={handleInputChange}
                placeholder="Enter IPFS hash of claim documents"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Claim Type
              </label>
              <select
                value={formData.claimType}
                onChange={handleClaimTypeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="0">Medical</option>
                <option value="1">Accident</option>
                <option value="2">Life</option>
                <option value="3">Senior</option>
                <option value="4">Other</option>
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hospital Address
              </label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleInputChange}
                placeholder="Enter authorized hospital address"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Oracle Address
              </label>
              <input
                type="text"
                name="aiOracle"
                value={formData.aiOracle}
                onChange={handleInputChange}
                placeholder="Enter AI oracle address"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
  
            {status.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{status.error}</p>
                  </div>
                </div>
              </div>
            )}
  
            {status.success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your claim has been successfully submitted!
                </p>
              </div>
            )}
  
            <button 
              type="submit" 
              disabled={status.loading || !account}
              className={`w-full px-4 py-2 text-white font-medium rounded-md 
                ${status.loading || !account 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {status.loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </form>
        </div>
      </div>
      </>
    );
  };
  
  export default ClaimSubmit;