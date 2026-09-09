import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navbar from "./components/Navbar";
import FloatingChat from "./components/FloatingChat";
import Home from "./pages/Home";
import QuizGenerator from "./components/Quiz/QuizGenerator";
import FlashcardsPage from "./pages/FlashcardsPage";
import SummarizePage from "./pages/SummarizePage";
import DashboardPage from "./pages/DashboardPage";
import PrivacyPage from "./pages/PrivacyPage";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import SubscriptionPage from "./components/Subscription/SubscriptionPage";
import ContactPage from "./pages/ContactPage";
import SettingsPage from "./pages/SettingsPage";
import ChatPage from "./pages/ChatPage";
import Footer from "./components/Footer/Footer";
import ResetPassword from './components/Auth/ResetPassword ';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white dark:bg-stone-950 transition-colors duration-300">
          <Navbar />
          <Routes>
            {/* Public Routes - Anyone can access */}
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes - Require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/summarize" element={
              <ProtectedRoute>
                <SummarizePage />
              </ProtectedRoute>
            } />
            <Route path="/quiz-generator" element={
              <ProtectedRoute>
                <QuizGenerator />
              </ProtectedRoute>
            } />
            <Route path="/flashcards" element={
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            } />
            <Route path="/quiz" element={
              <ProtectedRoute>
                <QuizGenerator />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
          <FloatingChat />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;