import { Routes, Route } from "react-router-dom";

// import Landing from "../pages/Landing";
import About from "../pages/About";
import Home from "../pages/Home";
import Contact from "../pages/Contact";
import Profile from "../pages/Profile";
import AIAgent from "../pages/AIAgent";
import Login from "../pages/Login";
import PostQuery from "../pages/PostQuery";
import HeroDashboard from "../pages/HeroDashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/aiagent" element={<AIAgent />} />
      <Route path="/login" element={<Login />} />
      <Route path="/post-query" element={<PostQuery />} />
      <Route path="/hero-dashboard" element={<HeroDashboard />} />
    </Routes>
  );
}

export default AppRoutes;
