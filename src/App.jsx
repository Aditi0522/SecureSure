import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AdminPage from './components/AdminPage';
import HospitalDashboard from './components/HospitalDashboard';
import CompanyDashboard from './components/CompanyDasboard';
import UserDashboard from './components/UserDashboard';
import ClaimSubmit from './components/ClaimSubmit';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path='/hospital' element={<HospitalDashboard />} />
            <Route path='/company' element={<CompanyDashboard />} />
            <Route path='/user' element={<UserDashboard />} />
            <Route path='/claim' element={<ClaimSubmit />} />
        </Routes>
    </Router>
);

export default App;