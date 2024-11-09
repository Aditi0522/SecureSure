import React from 'react';
import { Shield, Lock, Clock, Check, ChevronRight, Database, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <nav className="bg-white shadow-sm fixed w-full z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">SecureSure</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
                            <a href="#technology" className="text-gray-700 hover:text-blue-600">Technology</a>
                            <a href="#workflow" className="text-gray-700 hover:text-blue-600">How it Works</a>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                onClick={() => navigate("/user")}
                            >
                                
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <header className="relative overflow-hidden pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl">
                            <span className="block">Decentralized Smart Insurance</span>
                            <span className="block text-blue-600">Claim Processing</span>
                        </h1>
                        <p className="mt-5 max-w-md mx-auto text-xl text-gray-600 sm:text-2xl md:mt-8 md:max-w-3xl">
                            Leverage the power of Web3 and Generative AI for transparent, fraud-resistant insurance claims processing.
                        </p>
                        <div className="mt-8 flex justify-center">
                            <motion.a
                                href="#"
                                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                whileHover={{ scale: 1.05 }}
                            >
                                Get Started
                            </motion.a>
                            <motion.a
                                href="#"
                                className="ml-4 inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-blue-600 bg-white border border-blue-600 hover:bg-blue-50"
                                whileHover={{ scale: 1.05 }}
                            >
                                Learn More
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </header>

            <section id="features" className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Key Features
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Discover what makes SecureSure unique
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <Feature
                            icon={<Database className="h-8 w-8 text-blue-600" />}
                            title="Decentralized Storage"
                            description="Secure, transparent claim data storage using blockchain technology."
                        />
                        <Feature
                            icon={<Check className="h-8 w-8 text-blue-600" />}
                            title="Smart Contracts"
                            description="Automated disbursements with smart contract technology."
                        />
                        <Feature
                            icon={<AlertCircle className="h-8 w-8 text-blue-600" />}
                            title="AI-Powered Analysis"
                            description="Advanced fraud detection using pattern analysis."
                        />
                    </div>
                </div>
            </section>

            <section id="technology" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Built with Modern Technology
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Leveraging cutting-edge tools for optimal performance
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
                        <TechItem title="React" description="Frontend Development" />
                        <TechItem title="Python" description="Backend & AI" />
                        <TechItem title="Ethereum" description="Blockchain Layer" />
                        <TechItem title="IPFS" description="Decentralized Storage" />
                    </div>
                </div>
            </section>

            <section id="workflow" className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            How it Works
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            A seamless process from start to finish
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-4">
                        <WorkflowStep
                            number="1"
                            title="Submit Claim"
                            description="Submit your claim through our user-friendly interface."
                        />
                        <WorkflowStep
                            number="2"
                            title="AI Analysis"
                            description="Our AI system analyzes the claim for validity."
                        />
                        <WorkflowStep
                            number="3"
                            title="Smart Contract"
                            description="Automated verification and processing."
                        />
                        <WorkflowStep
                            number="4"
                            title="Payment"
                            description="Quick and secure disbursement of approved claims."
                        />
                    </div>
                </div>
            </section>

            <footer className="bg-gray-800">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center text-white">
                                <Shield className="h-8 w-8" />
                                <span className="ml-2 text-xl font-bold">SecureSure</span>
                            </div>
                            <p className="mt-4 text-gray-400">
                                Empowering secure and transparent insurance processing.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Product</h3>
                            <ul className="mt-4 space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Security</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Resources</h3>
                            <ul className="mt-4 space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">API</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Guides</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Company</h3>
                            <ul className="mt-4 space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-8 text-center">
                        <p className="text-gray-500">&copy; 2023 SecureSure. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const Feature = ({ icon, title, description }) => {
    return (
        <motion.div
            className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow hover:shadow-lg"
            whileHover={{ y: -5 }}
        >
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                {icon}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-gray-600">{description}</p>
        </motion.div>
    );
};

const TechItem = ({ title, description }) => {
    return (
        <motion.div
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-lg"
            whileHover={{ y: -5 }}
        >
            <div className="text-blue-600">
                <i className="fas fa-code fa-2x"></i>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-gray-600">{description}</p>
        </motion.div>
    );
};

const WorkflowStep = ({ number, title, description }) => {
    return (
        <motion.div
            className="relative flex flex-col items-center p-6 bg-white rounded-lg shadow hover:shadow-lg"
            whileHover={{ y: -5 }}
        >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">
                {number}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-gray-600 text-center">{description}</p>
        </motion.div>
    );
};

export default LandingPage;