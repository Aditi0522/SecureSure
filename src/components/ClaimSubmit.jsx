import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AlertCircle } from 'lucide-react';
import contractABI from '../config/abi.json';
import { contractAddress } from '../config/contractAddress';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

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
        company: '',
        aiOracle: ''
    });

    const [status, setStatus] = useState({
        loading: false,
        error: null,
        success: false
    });

    const connectWallet = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.BrowserProvider(window.ethereum);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClaimTypeChange = (e) => {
        setFormData(prev => ({
            ...prev,
            claimType: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });

        try {
            if (!contract || !account) {
                throw new Error("Please connect your wallet first");
            }

            const claimAmountWei = ethers.parseEther(formData.claimAmount);

            const tx = await contract.submitClaim(
                claimAmountWei,
                formData.ipfsHash,
                formData.claimType,
                formData.hospital,
                formData.company,
                formData.aiOracle
            );

            await tx.wait();

            setStatus({ loading: false, error: null, success: true });

            setFormData({
                claimAmount: '',
                ipfsHash: '',
                claimType: '0',
                hospital: '',
                company: '',
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

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length > 0) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const contract = new ethers.Contract(contractAddress, contractABI, signer);

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
                window.ethereum.removeListener('accountsChanged', () => { });
            }
        };
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
                <motion.div
                    className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Submit Insurance Claim
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Fill in the details below to submit your insurance claim
                        </p>
                    </div>

                    {!account && (
                        <motion.button
                            onClick={connectWallet}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out"
                        >
                            Connect Wallet
                        </motion.button>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Claim Type
                            </label>
                            <select
                                value={formData.claimType}
                                onChange={handleClaimTypeChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="0">Medical</option>
                                <option value="1">Accident</option>
                                <option value="2">Life</option>
                                <option value="3">Senior</option>
                                <option value="4">Other</option>
                            </select>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Insurance Company Address
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                placeholder="Enter authorized insurance company address"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </motion.div>

                        {status.error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-red-50 border border-red-200 rounded-md p-4"
                            >
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <p className="text-sm text-red-700 mt-1">{status.error}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {status.success && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-green-50 border border-green-200 rounded-md p-4"
                            >
                                <h3 className="text-sm font-medium text-green-800">Success</h3>
                                <p className="text-sm text-green-700 mt-1">
                                    Your claim has been successfully submitted!
                                </p>
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={status.loading || !account}
                            whileHover={{ scale: (status.loading || !account) ? 1 : 1.02 }}
                            whileTap={{ scale: (status.loading || !account) ? 1 : 0.98 }}
                            className={`w-full py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white 
                                ${status.loading || !account
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out'
                                }`}
                        >
                            {status.loading ? 'Submitting...' : 'Submit Claim'}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default ClaimSubmit;