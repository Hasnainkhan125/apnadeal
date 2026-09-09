// App.jsx - Updated with TimerProvider
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { TimerProvider } from "./contexts/TimerContext"; // ✅ NEW
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navbar from "./components/Navbar";
import FloatingChat from "./components/FloatingChat";
import Footer from "./components/Footer/Footer";
import SidebarLayout from "./components/SidebarLayout";
import Home from "./pages/Home";
import QuizGenerator from "./components/StudentHub/StudentHub";
import FlashcardsPage from "./pages/FlashcardsPage";
import SummarizePage from "./pages/SummarizePage";
import DashboardPage from "./pages/DashboardPage";
import PrivacyPage from "./pages/PrivacyPage";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import ResetPassword from "./components/Auth/ResetPassword";
import ResetPasswordUpdate from "./components/Auth/ResetPasswordUpdate";
import SubscriptionPage from "./components/Subscription/SubscriptionPage";
import ContactPage from "./pages/ContactPage";
import SettingsPage from "./pages/SettingsPage";
import ChatPage from "./pages/ChatPage";
import HowItWorks from "./components/LiveStudyMatching/HowItWorks";
import Premium from "./pages/Premium";
import Services from "./pages/Services";
import UserServices from "./pages/UserServices";
import ServiceDetail from "./pages/ServiceDetail";
import StudyGroups from "./pages/StudyGroups";
import StudyPartnerRegister from "./pages/StudyPartnerRegister";
import StudyChat from "./pages/StudyChat";
import GroupDetail from "./pages/GroupDetail";
import StudyPosts from "./pages/StudyPosts";

// ─── Layout Wrapper ────────────────────────────────────────────────────
const Layout = ({ children }) => {
  const location = useLocation();
  const authPages = ['/signin', '/signup', '/reset-password', '/reset-password/update'];
  const isAuthPage = authPages.includes(location.pathname);
  const isChatPage = location.pathname === '/chat';
  
  const shouldHideNavbar = isAuthPage;
  const shouldHideFooter = isAuthPage || isChatPage;
  const shouldHideFloatingChat = isAuthPage || isChatPage;
  
  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main className={!shouldHideNavbar ? 'pt-16 sm:pt-20' : ''}>
        {children}
      </main>
      {!shouldHideFooter && <Footer />}
      {!shouldHideFloatingChat && <FloatingChat />}
    </>
  );
};

// ─── App ───────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <TimerProvider> {/* ✅ NEW - Wrap everything */}
            <div className="min-h-screen bg-white dark:bg-stone-950 transition-colors duration-300">
              <Routes>
                {/* ─── Auth Pages ─────────────────────────────────────────── */}
                <Route path="/signin" element={
                  <Layout>
                    <SignIn />
                  </Layout>
                } />
                <Route path="/signup" element={
                  <Layout>
                    <SignUp />
                  </Layout>
                } />
                <Route path="/reset-password" element={
                  <Layout>
                    <ResetPassword />
                  </Layout>
                } />
                <Route path="/reset-password/update" element={
                  <Layout>
                    <ResetPasswordUpdate />
                  </Layout>
                } />

                {/* ─── Chat Page ───────────────────────────────────────────── */}
                <Route path="/chat" element={
                  <Layout>
                    <ProtectedRoute requirePremium={true}>
                      <ChatPage />
                    </ProtectedRoute>
                  </Layout>
                } />

                {/* ─── How It Works ────────────────────────────────────────── */}
                <Route path="/how-it-works" element={
                  <Layout>
                    <HowItWorks />
                  </Layout>
                } />

                {/* ─── Public Pages ────────────────────────────────────────── */}
                <Route path="/" element={
                  <Layout>
                    <Home />
                  </Layout>
                } />
                <Route path="/subscription" element={
                  <Layout>
                    <SubscriptionPage />
                  </Layout>
                } />
                <Route path="/privacy" element={
                  <Layout>
                    <PrivacyPage />
                  </Layout>
                } />
                <Route path="/contact" element={
                  <Layout>
                    <ContactPage />
                  </Layout>
                } />

                {/* ─── Premium Page ────────────────────────────────────────── */}
                <Route path="/premium" element={
                  <Layout>
                    <Premium />
                  </Layout>
                } />

                {/* ─── Services Pages ──────────────────────────────────────── */}
                <Route path="/services" element={
                  <Layout>
                    <ProtectedRoute>
                      <SidebarLayout>
                        <Services />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />

                <Route path="/user-services/:userId" element={
                  <Layout>
                    <ProtectedRoute>
                      <SidebarLayout>
                        <UserServices />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />

                <Route path="/service/:serviceId" element={
                  <Layout>
                    <ProtectedRoute>
                      <SidebarLayout>
                        <ServiceDetail />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />

                {/* ─── Study Groups Pages ──────────────────────────────────── */}
                <Route path="/study-groups" element={
                  <Layout>
                    <ProtectedRoute>
                      <SidebarLayout>
                        <StudyGroups />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />

                <Route path="/study-groups/:groupId" element={
                  <Layout>
                    <ProtectedRoute>
                      <SidebarLayout>
                        <GroupDetail />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />

                <Route path="/study-groups/register" element={
                  <Layout>
                    <ProtectedRoute requirePremium={true}>
                      <SidebarLayout>
                        <StudyPartnerRegister />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />

                <Route path="/study-group-chat/:groupId" element={
                  <Layout>
                    <ProtectedRoute>
                      <SidebarLayout>
                        <StudyChat />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />

                <Route path="/study-posts" element={
                  <Layout>
                    <ProtectedRoute>
                      <SidebarLayout>
                        <StudyPosts />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />

                {/* ─── Protected Pages ─────────────────────────────────────── */}
                <Route path="/settings" element={
                  <Layout>
                    <ProtectedRoute>
                      <SidebarLayout>
                        <SettingsPage />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/dashboard" element={
                  <Layout>
                    <ProtectedRoute>
                      <SidebarLayout>
                        <DashboardPage />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/summarize" element={
                  <Layout>
                    <ProtectedRoute requirePremium={true}>
                      <SidebarLayout>
                        <SummarizePage />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/quiz-generator" element={
                  <Layout>
                    <ProtectedRoute requirePremium={true}>
                      <SidebarLayout>
                        <QuizGenerator />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/flashcards" element={
                  <Layout>
                    <ProtectedRoute requirePremium={true}>
                      <SidebarLayout>
                        <FlashcardsPage />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/quiz" element={
                  <Layout>
                    <ProtectedRoute requirePremium={true}>
                      <SidebarLayout>
                        <QuizGenerator />
                      </SidebarLayout>
                    </ProtectedRoute>
                  </Layout>
                } />
              </Routes>
            </div>
          </TimerProvider> {/* ✅ End TimerProvider */}
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;