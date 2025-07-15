import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Bids from "./pages/Bids";
import BidCalculator from "./pages/BidCalculator";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Subscription from "./pages/Subscription";
import Estimate from "./pages/Estimate";
import Contract from "./pages/Contract";
import SignContractScreen from "./screens/SignContractScreen";
import ContractPreviewScreen from "./screens/ContractPreviewScreen";
import LoginScreen from "./screens/Login";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/bids" element={<Bids />} />
            <Route path="/calculator/new" element={<BidCalculator />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/estimate" element={<Estimate />} />
            <Route path="/contract" element={<Contract />} />
            <Route path="/contracts/preview/:clientID/:bidId" element={<ContractPreviewScreen />} />
            <Route path="/contracts/sign/:clientID/:bidId" element={<SignContractScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;