/**
 * PERFORMANCE EQUITY MVP v2.0
 * Bank-Grade Verification Protocol for Human Performance
 */

import { useState, useCallback, useEffect } from 'react';
import type { ViewType, VerifiedTransaction } from './types';
import { isLiveMode } from './config';

// Auth Screens
import { Splash } from './screens/Splash';
import { Login } from './screens/Login';
import { Onboarding } from './screens/Onboarding';

// Main Screens
import { Overview } from './screens/Overview';
import { ScoreAnalysis } from './screens/ScoreAnalysis';
import { VerificationProtocol } from './screens/VerificationProtocol';
import { AICongruency } from './screens/AICongruency';
import { PerformanceMetrics } from './screens/PerformanceMetrics';
import { TransactionLedger } from './screens/TransactionLedger';
import { SessionInitiation } from './screens/SessionInitiation';
import { ActiveSession } from './screens/ActiveSession';
import { TrustProfile } from './screens/TrustProfile';
import { ConnectDevices } from './screens/ConnectDevices';
import { PrivacySettings } from './screens/PrivacySettings';
import { EquityStatements } from './screens/EquityStatements';
import { Redeem } from './screens/Redeem';

// Components
import { BottomNav } from './components/navigation/BottomNav';

// Data Service (demo mode = mock data, live mode = real API + mock fallback)
import {
  fetchTransactions,
  getUser,
  getGAVLLayers,
  getSystemHealth,
  getGateDistribution,
  getCongruencyResult,
  getPhysiologicalBaseline,
  getTrainingStatus,
  getWeeklyMetrics,
  getZoneDistribution,
  getScoreHistory,
  getActivityCalendar,
  getWeeklyTrends,
  getEquityStatements,
  getPEBalance,
  getRecentPETransactions,
} from './services/dataService';

import { COLORS, DEMO_CREDENTIALS } from './constants';

function App() {
  // Auth state
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const [currentView, setCurrentView] = useState<ViewType>('overview');

  // Data from service layer
  const user = getUser();
  const gavlLayers = getGAVLLayers();
  const systemHealth = getSystemHealth();
  const gateDistribution = getGateDistribution();
  const congruencyResult = getCongruencyResult();
  const physiologicalBaseline = getPhysiologicalBaseline();
  const trainingStatus = getTrainingStatus();
  const weeklyMetrics = getWeeklyMetrics();
  const zoneDistribution = getZoneDistribution();
  const equityStatements = getEquityStatements();
  const peBalance = getPEBalance();
  const recentPETransactions = getRecentPETransactions();

  // Generate data once
  const [scoreHistory] = useState(() => getScoreHistory());
  const [activityCalendar] = useState(() => getActivityCalendar());
  const [weeklyTrends] = useState(() => getWeeklyTrends());

  // Transactions: stateful in live mode (fetched from API)
  const [transactions, setTransactions] = useState<VerifiedTransaction[]>([]);

  useEffect(() => {
    fetchTransactions().then(setTransactions);
  }, []);

  // Auth handlers
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setHasCompletedOnboarding(true);
  }, []);

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentView('overview');
  }, []);

  // Navigation handler
  const handleNavigate = useCallback((view: ViewType) => {
    setCurrentView(view);
    // Scroll to top on navigation
    window.scrollTo(0, 0);
  }, []);

  // Session handlers
  const handleStartSession = useCallback(() => {
    setCurrentView('session-active');
  }, []);

  const handleEndSession = useCallback(() => {
    setCurrentView('overview');
  }, []);

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <Overview
            user={user}
            layers={gavlLayers}
            transactions={transactions}
            systemHealth={systemHealth}
            onNavigate={handleNavigate}
          />
        );

      case 'score':
        return (
          <ScoreAnalysis
            score={user.pes}
            factors={user.scoreFactors}
            history={scoreHistory}
            onNavigate={handleNavigate}
          />
        );

      case 'protocol':
        return (
          <VerificationProtocol
            layers={gavlLayers}
            gateDistribution={gateDistribution}
            onNavigate={handleNavigate}
          />
        );

      case 'congruency':
        return (
          <AICongruency
            congruency={congruencyResult}
            baseline={physiologicalBaseline}
            recentSession={transactions[0]}
            onNavigate={handleNavigate}
          />
        );

      case 'metrics':
        return (
          <PerformanceMetrics
            trainingStatus={trainingStatus}
            weeklyMetrics={weeklyMetrics}
            activityCalendar={activityCalendar}
            weeklyTrends={weeklyTrends}
            zoneDistribution={zoneDistribution}
            onNavigate={handleNavigate}
          />
        );

      case 'ledger':
        return (
          <TransactionLedger
            transactions={transactions}
            onNavigate={handleNavigate}
          />
        );

      case 'session-init':
      case 'initiate':
        return (
          <SessionInitiation
            onNavigate={handleNavigate}
            onStartSession={handleStartSession}
          />
        );

      case 'session-active':
      case 'active':
        return (
          <ActiveSession
            onNavigate={handleNavigate}
            onEndSession={handleEndSession}
          />
        );

      case 'trust':
        return (
          <TrustProfile
            trust={user.trust}
            onNavigate={handleNavigate}
          />
        );

      case 'connect-devices':
        return <ConnectDevices onNavigate={handleNavigate} />;

      case 'settings':
        return <PrivacySettings onNavigate={handleNavigate} onSignOut={handleSignOut} />;

      case 'equity-statements':
        return <EquityStatements statements={equityStatements} onNavigate={handleNavigate} />;

      case 'redeem':
        return (
          <Redeem
            peBalance={peBalance}
            recentTransactions={recentPETransactions}
            pesScore={user.pes}
            trustTier={user.trust.tier}
            onNavigate={handleNavigate}
          />
        );

      case 'splash':
        return <Splash onComplete={handleSplashComplete} />;

      case 'login':
        return <Login onLogin={handleLogin} />;

      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;

      default:
        return (
          <Overview
            user={user}
            layers={gavlLayers}
            transactions={transactions}
            systemHealth={systemHealth}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  // Auth flow: Splash → Login → Onboarding → Main App
  if (showSplash) {
    return <Splash onComplete={handleSplashComplete} />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Main authenticated app
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.background }}
    >
      {isLiveMode && (
        <div
          className="fixed top-1 right-1 z-50 px-2 py-0.5 rounded text-[10px] font-mono font-bold"
          style={{ backgroundColor: '#00C853', color: '#000' }}
        >
          LIVE
        </div>
      )}
      {renderView()}
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
