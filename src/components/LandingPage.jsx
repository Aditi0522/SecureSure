import React, { useEffect } from 'react';
import { Shield, Lock, Clock, Check, ChevronRight, Database, AlertCircle } from 'lucide-react';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const controls = useAnimation();

    // Parallax effect for header
    const headerY = useTransform(scrollY, [0, 500], [0, -150]);
    const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Animated background shapes */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <motion.div
                    className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full bg-blue-100 opacity-20 blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                    }}
                />
                <motion.div
                    className="absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full bg-purple-100 opacity-20 blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                    }}
                />
            </div>

            {/* Navbar with glass effect */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <motion.div 
                            className="flex items-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                SecureSure
                            </span>
                        </motion.div>
                        <div className="hidden md:flex items-center space-x-8">
                            <NavLink href="#features">Features</NavLink>
                            <NavLink href="#technology">Technology</NavLink>
                            <NavLink href="#workflow">How it Works</NavLink>
                            <motion.button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/user")}
                            >
                                Get Started
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero section with parallax */}
            <motion.header 
                className="relative overflow-hidden pt-32 pb-20"
                style={{ y: headerY }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-7xl font-extrabold">
                            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Decentralized Smart
                            </span>
                            <span className="block mt-2">
                                Insurance Claims
                            </span>
                        </h1>
                        <motion.p 
                            className="mt-8 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Leverage the power of Web3 and Generative AI for transparent, fraud-resistant insurance claims processing.
                        </motion.p>
                        <motion.div 
                            className="mt-10 flex flex-wrap justify-center gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <motion.button
                                className="px-8 py-3 text-lg font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get Started
                            </motion.button>
                            <motion.button
                                className="px-8 py-3 text-lg font-medium rounded-full text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Learn More
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.header>

            {/* Features section with cards */}
            <section id="features" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Key Features
                        </h2>
                        <p className="mt-4 text-xl text-gray-600">
                            Discover what makes SecureSure unique
                        </p>
                    </motion.div>
                    <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            icon={<Database className="h-8 w-8 text-blue-600" />}
                            title="Decentralized Storage"
                            description="Secure, transparent claim data storage using blockchain technology."
                        />
                        <FeatureCard
                            icon={<Check className="h-8 w-8 text-blue-600" />}
                            title="Smart Contracts"
                            description="Automated disbursements with smart contract technology."
                        />
                        <FeatureCard
                            icon={<AlertCircle className="h-8 w-8 text-blue-600" />}
                            title="AI-Powered Analysis"
                            description="Advanced fraud detection using pattern analysis."
                        />
                    </div>
                </div>
            </section>

            {/* Technology section with floating cards */}
            <section id="technology" className="py-20 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Built with Modern Technology
                        </h2>
                        <p className="mt-4 text-xl text-gray-600">
                            Leveraging cutting-edge tools for optimal performance
                        </p>
                    </motion.div>
                    <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
                        <TechCard title="React" description="Frontend Development" />
                        <TechCard title="Python" description="Backend & AI" />
                        <TechCard title="Ethereum" description="Blockchain Layer" />
                        <TechCard title="IPFS" description="Decentralized Storage" />
                    </div>
                </div>
            </section>

            {/* Workflow section with connected steps */}
            <section id="workflow" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            How it Works
                        </h2>
                        <p className="mt-4 text-xl text-gray-600">
                            A seamless process from start to finish
                        </p>
                    </motion.div>
                    <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-4 relative">
                        <WorkflowCard number="1" title="Submit Claim" description="Submit your claim through our user-friendly interface." />
                        <WorkflowCard number="2" title="AI Analysis" description="Our AI system analyzes the claim for validity." />
                        <WorkflowCard number="3" title="Smart Contract" description="Automated verification and processing." />
                        <WorkflowCard number="4" title="Payment" description="Quick and secure disbursement of approved claims." />
                    </div>
                </div>
            </section>

            {/* Footer with gradient background */}
            <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <motion.div 
                                className="flex items-center"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Shield className="h-8 w-8" />
                                <span className="ml-2 text-xl font-bold">SecureSure</span>
                            </motion.div>
                            <p className="mt-4 text-gray-400">
                                Empowering secure and transparent insurance processing.
                            </p>
                        </div>
                        <FooterLinks 
                            title="Product" 
                            links={['Features', 'Security', 'Pricing']} 
                        />
                        <FooterLinks 
                            title="Resources" 
                            links={['Documentation', 'API', 'Guides']} 
                        />
                        <FooterLinks 
                            title="Company" 
                            links={['About', 'Blog', 'Contact']} 
                        />
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-8 text-center">
                        <p className="text-gray-500">&copy; 2023 SecureSure. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const NavLink = ({ href, children }) => (
    <motion.a
        href={href}
        className="text-gray-700 hover:text-blue-600 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        {children}
    </motion.a>
);

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        className="relative p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
    >
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg">
                {icon}
            </div>
        </div>
        <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-gray-600">{description}</p>
        </div>
    </motion.div>
);

const TechCard = ({ title, description }) => (
    <motion.div
        className="p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{
            y: -5,
            background: "linear-gradient(135deg, #EEF2FF 0%, #ffffff 100%)",
        }}
    >
        <div className="text-center">
            <div className="text-blue-600 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {title}
            </div>
            <p className="mt-4 text-gray-600">{description}</p>
        </div>
    </motion.div>
);

const WorkflowCard = ({ number, title, description }) => (
    <motion.div
        className="relative p-6 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport
        ={{ once: true }}
            whileHover={{ y: -5 }}
            >
            <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">
                {number}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {title}
                </h3>
                <p className="mt-2 text-gray-600">
                {description}
                </p>
            </div>
            </motion.div>
        );
        const FooterLinks = ({ title, links }) => (
            <div>
                <h4 className="text-lg font-semibold text-gray-200">{title}</h4>
                <ul className="mt-4 space-y-2">
                    {links.map((link, index) => (
                        <li key={index}>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                {link}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        );

        export default LandingPage;