import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { TimerProvider } from "./contexts/TimerContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { FilterProvider } from "./contexts/FilterContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { PlanProvider } from "./contexts/PlanContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navbar from "./components/Navbar";
import FloatingChat from "./components/FloatingChat";
import Footer from "./components/Footer/Footer";
import OnboardingModal from "./components/OnboardingModal";
import AIAssistant from "./components/AIAssistant";
// ⭐ NEW — Facebook-Messenger-style global chat dock
import GlobalChatDock from "./components/GlobalChatDock";

// ✅ Landing is now the default page
import Landing from "./pages/Landing";

import Home from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import PrivacyPage from "./pages/PrivacyPage";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import ResetPassword from "./components/Auth/ResetPassword";
import ResetPasswordVerify from "./components/Auth/ResetPasswordVerify";
import ResetPasswordUpdate from "./components/Auth/ResetPasswordUpdate";
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
import Momento from "./pages/Momento";
import Wallet from "./pages/Wallet";
// ✅ Category pages
import Vehicles from "./pages/Vehicles";
import VehicleDetail from "./pages/VehicleDetail";
import Mobiles from "./pages/Mobiles";
import MobileDetail from "./pages/MobileDetail";
import Property from "./pages/Property";
import MyListings from "./pages/MyListings";
import Electronics from "./pages/Electronics";
import ElectronicsDetail from "./pages/ElectronicsDetail";
import Feed from "./pages/Feed";
import PostAd from "./pages/PostAd";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import PropertyDetail from "./pages/PropertyDetail";
import AIPageShell from "./components/AIPageShell";
// ⭐ NEW — Listing status page
import ListingStatusPage from "./pages/ListingStatusPage";

// ✅ Toys
import ToyDetail from "./pages/ToyDetail";
// ✅ Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminOnboarding from "./pages/AdminOnboarding";
import AIImageGenerator from "./pages/AIImageGenerator";
import Library from "./pages/Library";
import RemoveBackground from "./pages/RemoveBackground";
import AIChat from "./pages/AIChatpromt";
import Img_GeneratorPro from "./pages/Img_GeneratorPro";
// ⭐ NEW — Boost checkout
import BoostCheckout from "./pages/BoostCheckout";

// ✅ Global toast + notifications
import GlobalToaster from "./components/GlobalToaster";
import usePaymentNotifications from "./hooks/usePaymentNotifications";
import PremiumWelcomePopup from "./components/PremiumWelcomePopup";
import MarketplaceChat from "./pages/MarketplaceChat";
// ✅ Theme hook
import { useTheme } from "./hooks/useTheme";

/* ═══════════════════════════════════════════════════════════════
  ADMIN EMAILS
  ═══════════════════════════════════════════════════════════════ */
const ADMIN_EMAILS = ["hasnainwebdeveloper1122@gmail.com"];

/* ═══════════════════════════════════════════════════════════════
  GLOBAL THEME STYLES  — LIGHT IS THE DEFAULT
  ═══════════════════════════════════════════════════════════════ */
const GlobalThemeStyles = () => (
  <style>{`
    html, body, #root {
      margin: 0;
      padding: 0;
      min-height: 100%;
      transition: background-color 0.35s ease, color 0.35s ease;
    }

    html.theme-dark,
    html.theme-dark body,
    html.theme-dark #root {
      background-color: #0A0A12;
      color-scheme: dark;
    }

    html.theme-light,
    html.theme-light body,
    html.theme-light #root {
      background-color: #FFFFFF;
      color-scheme: light;
    }

    /* ⭐ DEFAULT (no class yet) → LIGHT colors */
    html:not(.theme-dark):not(.theme-light),
    html:not(.theme-dark):not(.theme-light) body,
    html:not(.theme-dark):not(.theme-light) #root {
      background-color: #FFFFFF;
      color-scheme: light;
      color: #1A1613;
    }

    /* ⭐ Also seed light-mode CSS vars on the root before hydration */
    html:not(.theme-dark):not(.theme-light) {
      --nav-bg:           #FFFFFF;
      --nav-bg-2:         #FAF7F3;
      --nav-panel:        #FFFFFF;
      --nav-panel-2:      #F8F7FB;
      --nav-surface:      rgba(0,0,0,0.04);
      --nav-surface-2:    rgba(0,0,0,0.02);
      --nav-line:         rgba(20,20,30,0.08);
      --nav-line-str:     rgba(20,20,30,0.15);
      --nav-txt:          #1A1613;
      --nav-txt-soft:     rgba(26,22,19,0.62);
      --nav-txt-faint:    rgba(26,22,19,0.42);
      --nav-primary:      #c8631f;
      --nav-primary-2:    #eb7d34;
      --nav-primary-3:    #f59e0b;
      --nav-primary-soft: rgba(200,99,31,0.10);
      --nav-primary-glow: rgba(200,99,31,0.35);
      --nav-shadow:       0 8px 24px -12px rgba(0,0,0,0.12);

      --app-bg:           #FFFFFF;
      --app-bg-2:         #FAF7F3;
      --app-txt:          #1A1613;
      --app-txt-soft:     rgba(26,22,19,0.62);
      --app-txt-faint:    rgba(26,22,19,0.42);
      --app-line:         rgba(20,20,30,0.08);
      --app-primary:      #c8631f;
      --app-primary-2:    #eb7d34;
    }

    html.theme-dark {
      --nav-bg:           #0A0A12;
      --nav-bg-2:         #0F0F1A;
      --nav-panel:        #16161F;
      --nav-panel-2:      #1C1C28;
      --nav-surface:      rgba(255,255,255,0.045);
      --nav-surface-2:    rgba(255,255,255,0.02);
      --nav-line:         rgba(255,255,255,0.08);
      --nav-line-str:     rgba(255,255,255,0.15);
      --nav-txt:          #FFFFFF;
      --nav-txt-soft:     rgba(255,255,255,0.65);
      --nav-txt-faint:    rgba(255,255,255,0.45);
      --nav-primary:      #eb7d34;
      --nav-primary-2:    #f59e0b;
      --nav-primary-3:    #c8631f;
      --nav-primary-soft: rgba(235,125,52,0.14);
      --nav-primary-glow: rgba(235,125,52,0.45);
      --nav-shadow:       0 8px 24px -12px rgba(0,0,0,0.6);

      --app-bg:           #0A0A12;
      --app-bg-2:         #0F0F1A;
      --app-txt:          #FFFFFF;
      --app-txt-soft:     rgba(255,255,255,0.65);
      --app-txt-faint:    rgba(255,255,255,0.45);
      --app-line:         rgba(255,255,255,0.08);
      --app-primary:      #eb7d34;
      --app-primary-2:    #f59e0b;
    }

    html.theme-light {
      --nav-bg:           #FFFFFF;
      --nav-bg-2:         #FAF7F3;
      --nav-panel:        #FFFFFF;
      --nav-panel-2:      #F8F7FB;
      --nav-surface:      rgba(0,0,0,0.04);
      --nav-surface-2:    rgba(0,0,0,0.02);
      --nav-line:         rgba(20,20,30,0.08);
      --nav-line-str:     rgba(20,20,30,0.15);
      --nav-txt:          #1A1613;
      --nav-txt-soft:     rgba(26,22,19,0.62);
      --nav-txt-faint:    rgba(26,22,19,0.42);
      --nav-primary:      #c8631f;
      --nav-primary-2:    #eb7d34;
      --nav-primary-3:    #f59e0b;
      --nav-primary-soft: rgba(200,99,31,0.10);
      --nav-primary-glow: rgba(200,99,31,0.35);
      --nav-shadow:       0 8px 24px -12px rgba(0,0,0,0.12);

      --app-bg:           #FFFFFF;
      --app-bg-2:         #FAF7F3;
      --app-txt:          #1A1613;
      --app-txt-soft:     rgba(26,22,19,0.62);
      --app-txt-faint:    rgba(26,22,19,0.42);
      --app-line:         rgba(20,20,30,0.08);
      --app-primary:      #c8631f;
      --app-primary-2:    #eb7d34;
    }

    .app-shell {
      background-color: var(--app-bg, #FFFFFF);
      color: var(--app-txt, #1A1613);
      transition: background-color 0.35s ease, color 0.35s ease;
    }
  `}</style>
);

/* ─── Admin-only route guard ──────────────────────────────────── */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;
  const email = (user.email || "").toLowerCase();
  const allowed = ADMIN_EMAILS.map((e) => e.toLowerCase());
  if (!allowed.includes(email)) return <Navigate to="/" replace />;
  return children;
};

/* ─── Layout Wrapper ──────────────────────────────────────────── */
const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const authPages = [
    "/signin",
    "/signup",
    "/reset-password",
    "/reset-password/verify",
    "/reset-password/update",
  ];
  const isAuthPage = authPages.includes(location.pathname);
  const isChatPage = location.pathname === "/chat";
  const isAdminPage = location.pathname.startsWith("/admin");
  const isAIImagePage = location.pathname.startsWith("/ai-image");
  const isLibraryPage = location.pathname.startsWith("/library");
  const isRemoveBgPage = location.pathname.startsWith("/remove-bg");
  const isAIChatPage = location.pathname.startsWith("/ai-chat");
  const isImageGenPage = location.pathname.startsWith("/image-generator");

  const isPrivacyPage = location.pathname.startsWith("/privacy");
  const isContactPage = location.pathname.startsWith("/contact");
  const isTermsPage = location.pathname.startsWith("/terms");

  const shouldHideNavbar =
    isAuthPage || isAdminPage || isAIImagePage || isLibraryPage ||
    isRemoveBgPage || isAIChatPage || isImageGenPage ||
    isPrivacyPage || isContactPage || isTermsPage;

  const shouldHideFooter =
    !!user ||
    isAuthPage || isChatPage || isAdminPage || isAIImagePage ||
    isLibraryPage || isRemoveBgPage || isAIChatPage || isImageGenPage ||
    isPrivacyPage || isContactPage || isTermsPage;

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <main
        className={!shouldHideNavbar ? "pt-16 sm:pt-20" : ""}
        style={{ background: "transparent" }}
      >
        {children}
      </main>
      {!shouldHideFooter && <Footer />}
    </>
  );
};

/* ─── Global Onboarding ───────────────────────────────────────── */
const GlobalOnboarding = () => {
  const location = useLocation();
  const HIDDEN_PATHS = [
    "/signin",
    "/signup",
    "/reset-password",
    "/reset-password/verify",
    "/reset-password/update",
  ];
  if (location.pathname === "/") return null;
  if (location.pathname.startsWith("/admin")) return null;
  if (location.pathname.startsWith("/ai-image")) return null;
  if (location.pathname.startsWith("/library")) return null;
  if (location.pathname.startsWith("/remove-bg")) return null;
  if (location.pathname.startsWith("/ai-chat")) return null;
  if (location.pathname.startsWith("/image-generator")) return null;
  if (HIDDEN_PATHS.some((p) => location.pathname.startsWith(p))) return null;
  return <OnboardingModal />;
};

const GlobalAIAssistant = () => {
  const location = useLocation();
  const HIDDEN_PATHS = [
    "/signin",
    "/signup",
    "/reset-password",
    "/admin",
    "/ai-image",
    "/image-generator",
    "/library",
    "/remove-bg",
    "/ai-chat",
    "/chat",
    "/study-group-chat",
    "/feed",
    "/post-ad",
    "/momento",
    "/marketplace-chat",
  ];

  if (HIDDEN_PATHS.some((p) => location.pathname.startsWith(p))) return null;

  return <AIAssistant />;
};

/* ─── Payment notifications listener ─────────────────────────── */
const PaymentListener = () => {
  usePaymentNotifications();
  return null;
};

/* ⭐ Picks Boost vs regular Checkout based on ?boost= query param. */
const SmartCheckout = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isBoost = params.has("boost");

  if (isBoost) {
    return (
      <ProtectedRoute>
        <BoostCheckout />
      </ProtectedRoute>
    );
  }
  return (
    <ProtectedRoute>
      <Checkout />
    </ProtectedRoute>
  );
};

/* ⭐ GLOBAL CHAT DOCK — ONLY on Feed page */
const GuestAwareChatDock = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (location.pathname !== "/feed") return null;
  if (loading) return null;
  if (!user) return null;

  return <GlobalChatDock />;
};

/* ⭐ Landing → auto-redirect signed-in users to /feed */
const SmartLanding = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/feed" replace />;
  return <Landing />;
};

function App() {
  useTheme();

  return (
    <Router>
      <AuthProvider>
        <PlanProvider>
          <ProfileProvider>
            <SettingsProvider>
              <TimerProvider>
                <FilterProvider>
                  <OnboardingProvider>
                    <GlobalThemeStyles />

                    <GlobalToaster />
                    <PaymentListener />
                    <PremiumWelcomePopup />

                    <div className="min-h-screen duration-300 app-shell">
                      <Routes>
                        {/* ═══ Auth Pages ═══ */}
                        <Route path="/signin" element={<Layout><SignIn /></Layout>} />
                        <Route path="/signup" element={<Layout><SignUp /></Layout>} />
                        <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
                        <Route path="/reset-password/verify" element={<Layout><ResetPasswordVerify /></Layout>} />
                        <Route path="/reset-password/update" element={<Layout><ResetPasswordUpdate /></Layout>} />

                        {/* ═══ ADMIN ═══ */}
                        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/admin/onboarding" element={<AdminRoute><AdminOnboarding /></AdminRoute>} />

                        {/* ═══ AI TOOLS ═══ */}
                        <Route path="/ai-image" element={<AIImageGenerator />} />
                        <Route path="/image-generator" element={<Img_GeneratorPro />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/remove-bg" element={<RemoveBackground />} />
                        <Route path="/ai-chat" element={<AIChat />} />

                        {/* ═══ Chat pages ═══ */}
                        <Route path="/chat" element={
                          <Layout>
                            <ChatPage />
                          </Layout>
                        } />
                        <Route path="/marketplace-chat" element={
                          <Layout>
                            <MarketplaceChat />
                          </Layout>
                        } />

                        {/* ═══ Public Pages ═══ */}
                        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />

                        <Route path="/" element={<SmartLanding />} />

                        <Route path="/home" element={<Layout><Home /></Layout>} />
                        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
                        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

                        {/* ═══ Premium ═══ */}
                        <Route path="/premium" element={<Layout><Premium /></Layout>} />
                        <Route path="/subscription" element={<Navigate to="/premium" replace />} />

                        {/* ═══ Vehicles ═══ */}
                        <Route path="/vehicles" element={<Layout><Vehicles /></Layout>} />
                        <Route path="/vehicle/:id" element={
                          <Layout>
                            <VehicleDetail />
                          </Layout>
                        } />

                        {/* ═══ Mobiles ═══ */}
                        <Route path="/mobiles" element={<Layout><Mobiles /></Layout>} />
                        <Route path="/mobile/:id" element={
                          <Layout>
                            <MobileDetail />
                          </Layout>
                        } />

                        {/* ═══ Property ═══ */}
                        <Route path="/property" element={<Layout><Property /></Layout>} />
                        <Route path="/property/:id" element={
                          <Layout>
                            <PropertyDetail />
                          </Layout>
                        } />

                        {/* ═══ Electronics ═══ */}
                        <Route path="/electronics" element={<Layout><Electronics /></Layout>} />
                        <Route path="/electronic/:id" element={
                          <Layout>
                            <ElectronicsDetail />
                          </Layout>
                        } />

                        {/* ═══ Toys ═══ */}
                        <Route path="/toy/:id" element={
                          <Layout>
                            <ToyDetail />
                          </Layout>
                        } />

                        {/* ═══ Cart & Orders ═══ */}
                        <Route path="/cart" element={
                          <Layout>
                            <Orders initialTab="cart" />
                          </Layout>
                        } />
                        <Route path="/orders/cart" element={
                          <Layout>
                            <Orders initialTab="cart" />
                          </Layout>
                        } />
                        <Route path="/orders" element={
                          <Layout>
                            <Orders initialTab="orders" />
                          </Layout>
                        } />
                        <Route path="/orders/list" element={
                          <Layout>
                            <Orders initialTab="orders" />
                          </Layout>
                        } />
                        <Route path="/orders/track" element={<Navigate to="/orders" replace />} />

                        {/* ⭐ Checkout ═══ */}
                        <Route path="/checkout" element={
                          <Layout>
                            <SmartCheckout />
                          </Layout>
                        } />

                        {/* ⭐ Boost ═══ */}
                        <Route path="/boost" element={
                          <Layout>
                            <ProtectedRoute>
                              <BoostCheckout />
                            </ProtectedRoute>
                          </Layout>
                        } />

                        {/* ═══ Feed ═══ */}
                        <Route path="/feed" element={
                          <Layout>
                            <Feed />
                          </Layout>
                        } />

                        {/* ═══ My Listings ═══ */}
                        <Route path="/my-listings" element={
                          <Layout>
                            <MyListings />
                          </Layout>
                        } />

                        {/* ⭐ Listing status ═══ */}
                        <Route path="/listing/:id" element={
                          <Layout>
                            <ListingStatusPage />
                          </Layout>
                        } />
                        <Route path="/listing/:id/status" element={
                          <Layout>
                            <ListingStatusPage />
                          </Layout>
                        } />

                        {/* ═══ Post Ad ═══ */}
                        <Route path="/post-ad" element={
                          <Layout>
                            <PostAd />
                          </Layout>
                        } />

                        {/* ═══ Wallet ═══ */}
                        <Route path="/wallet" element={
                          <Layout>
                            <Wallet />
                          </Layout>
                        } />

                        {/* ═══ User Services ═══ */}
                        <Route path="/user-services/:userId" element={
                          <Layout>
                            <UserServices />
                          </Layout>
                        } />
                        <Route path="/service/:serviceId" element={
                          <Layout>
                            <ServiceDetail />
                          </Layout>
                        } />

                        {/* ═══ Study Groups ═══ */}
                        <Route path="/study-groups" element={
                          <Layout>
                            <StudyGroups />
                          </Layout>
                        } />
                        <Route path="/study-groups/:groupId" element={
                          <Layout>
                            <GroupDetail />
                          </Layout>
                        } />
                        <Route path="/study-groups/register" element={
                          <Layout>
                            <ProtectedRoute requirePremium={true}>
                              <StudyPartnerRegister />
                            </ProtectedRoute>
                          </Layout>
                        } />
                        <Route path="/study-group-chat/:groupId" element={
                          <Layout>
                            <ProtectedRoute>
                              <StudyChat />
                            </ProtectedRoute>
                          </Layout>
                        } />

                        {/* ═══ Momento ═══ */}
                        <Route path="/momento" element={
                          <Layout>
                            <Momento />
                          </Layout>
                        } />

                        {/* ⭐ Deep links — posts, shorts, videos, reels */}
                        <Route path="/momento/post/:id" element={
                          <Layout>
                            <Momento />
                          </Layout>
                        } />
                        <Route path="/momento/short/:id" element={
                          <Layout>
                            <Momento />
                          </Layout>
                        } />
                        <Route path="/momento/video/:id" element={
                          <Layout>
                            <Momento />
                          </Layout>
                        } />
                        <Route path="/momento/reel/:id" element={
                          <Layout>
                            <Momento />
                          </Layout>
                        } />

                        {/* ⭐ Shorts deep-link routes (path + query) */}
                        <Route path="/momento/shorts" element={
                          <Layout>
                            <Momento />
                          </Layout>
                        } />
                        <Route path="/momento/shorts/:id" element={
                          <Layout>
                            <Momento />
                          </Layout>
                        } />

                        {/* ═══ Settings / Dashboard ═══ */}
                        <Route path="/settings" element={
                          <Layout>
                            <SettingsPage />
                          </Layout>
                        } />
                        <Route path="/dashboard" element={
                          <Layout>
                            <DashboardPage />
                          </Layout>
                        } />

                        {/* ⭐ Fallback ═══ */}
                        <Route path="*" element={<SmartLanding />} />
                      </Routes>

                      <GlobalOnboarding />

                      <GlobalAIAssistant />

                      <GuestAwareChatDock />
                    </div>
                  </OnboardingProvider>
                </FilterProvider>
              </TimerProvider>
            </SettingsProvider>
          </ProfileProvider>
        </PlanProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;