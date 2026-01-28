/**
 * PERFORMANCE EQUITY MVP v2.0
 * Bank-Grade Verification Protocol for Human Performance
 */

import { useState, useCallback } from 'react';
import type { ViewType } from './types';

// Screens
import { Overview } from './screens/Overview';
import { ScoreAnalysis } from './screens/ScoreAnalysis';
import { VerificationProtocol } from './screens/VerificationProtocol';
import { AICongruency } from './screens/AICongruency';
import { PerformanceMetrics } from './screens/PerformanceMetrics';
import { TransactionLedger } from './screens/TransactionLedger';
import { SessionInitiation } from './screens/SessionInitiation';
import { ActiveSession } from './screens/ActiveSession';
import { TrustProfile } from './screens/TrustProfile';

// Components
import { BottomNav } from './components/navigation/BottomNav';

// Mock Data
import {
  mockUser,
  mockGAVLLayers,
  mockTransactions,
  mockSystemHealth,
  mockGateDistribution,
  mockCongruencyResult,
  mockPhysiologicalBaseline,
  mockTrainingStatus,
  mockWeeklyMetrics,
  mockZoneDistribution,
  generateScoreHistory,
  generateActivityCalendar,
  generateWeeklyTrends,
} from './services/mockData';

import { COLORS } from './constants';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');

  // Generate data once
  const [scoreHistory] = useState(() => generateScoreHistory());
  const [activityCalendar] = useState(() => generateActivityCalendar());
  const [weeklyTrends] = useState(() => generateWeeklyTrends());

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
            user={mockUser}
            layers={mockGAVLLayers}
            transactions={mockTransactions}
            systemHealth={mockSystemHealth}
            onNavigate={handleNavigate}
          />
        );

      case 'score':
        return (
          <ScoreAnalysis
            score={mockUser.pes}
            factors={mockUser.scoreFactors}
            history={scoreHistory}
            onNavigate={handleNavigate}
          />
        );

      case 'protocol':
        return (
          <VerificationProtocol
            layers={mockGAVLLayers}
            gateDistribution={mockGateDistribution}
            onNavigate={handleNavigate}
          />
        );

      case 'congruency':
        return (
          <AICongruency
            congruency={mockCongruencyResult}
            baseline={mockPhysiologicalBaseline}
            recentSession={mockTransactions[0]}
            onNavigate={handleNavigate}
          />
        );

      case 'metrics':
        return (
          <PerformanceMetrics
            trainingStatus={mockTrainingStatus}
            weeklyMetrics={mockWeeklyMetrics}
            activityCalendar={activityCalendar}
            weeklyTrends={weeklyTrends}
            zoneDistribution={mockZoneDistribution}
            onNavigate={handleNavigate}
          />
        );

      case 'ledger':
        return (
          <TransactionLedger
            transactions={mockTransactions}
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
            trust={mockUser.trust}
            onNavigate={handleNavigate}
          />
        );

      case 'login':
        return (
          <PlaceholderScreen
            title="AUTHENTICATION"
            description="Secure login coming soon."
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <Overview
            user={mockUser}
            layers={mockGAVLLayers}
            transactions={mockTransactions}
            systemHealth={mockSystemHealth}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.background }}
    >
      {renderView()}
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}

/**
 * PlaceholderScreen - Temporary placeholder for screens not yet implemented
 */
interface PlaceholderScreenProps {
  title: string;
  description: string;
  onNavigate: (view: ViewType) => void;
}

function PlaceholderScreen({ title, description, onNavigate }: PlaceholderScreenProps) {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 border-b"
        style={{
          backgroundColor: COLORS.background,
          borderColor: COLORS.border,
        }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('overview')}
            className="text-sm font-mono"
            style={{ color: COLORS.textSecondary }}
          >
            ← Back
          </button>
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: COLORS.textPrimary }}
          >
            {title}
          </span>
          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-4xl mx-auto">
        <div
          className="p-8 rounded-lg border text-center"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: COLORS.accent + '20' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.accent}
              strokeWidth="1.5"
            >
              <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
              <path d="M12 8v4" />
              <circle cx="12" cy="16" r="1" fill={COLORS.accent} />
            </svg>
          </div>
          <h2
            className="text-xl font-mono font-bold mb-2"
            style={{ color: COLORS.textPrimary }}
          >
            {title}
          </h2>
          <p
            className="text-sm font-mono"
            style={{ color: COLORS.textMuted }}
          >
            {description}
          </p>
          <button
            onClick={() => onNavigate('overview')}
            className="mt-6 px-6 py-2 rounded-lg font-mono text-sm transition-all"
            style={{
              backgroundColor: COLORS.accent,
              color: COLORS.background,
            }}
          >
            Return to Overview
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
