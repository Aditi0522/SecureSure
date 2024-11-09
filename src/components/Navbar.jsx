import React, { useState, useEffect } from 'react';
import { Shield, User, Building2, Hospital } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setWalletAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-100' : '';
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">SecureSure</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/user" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-50 transition ${isActive('/user')}`}
            >
              <User className="h-5 w-5" />
              <span>User Dashboard</span>
            </Link>
            
            <Link 
              to="/company" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-50 transition ${isActive('/company')}`}
            >
              <Building2 className="h-5 w-5" />
              <span>Company Dashboard</span>
            </Link>
            
            <Link 
              to="/hospital" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-blue-50 transition ${isActive('/hospital')}`}
            >
              <Hospital className="h-5 w-5" />
              <span>Hospital Dashboard</span>
            </Link>

            {isConnected ? (
              <div className="flex items-center ml-4">
                <div className="bg-gray-100 px-4 py-2 rounded-md">
                  <span className="text-gray-700">{formatAddress(walletAddress)}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition ml-4"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;