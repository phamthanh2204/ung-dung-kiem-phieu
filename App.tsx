import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import SetupStep from './components/SetupStep';
import VotingStep from './components/VotingStep';
import ResultsStep from './components/ResultsStep';
import { Step, CalculationMode, InvalidBallotCriteria } from './types';

const LOCAL_STORAGE_KEY = 'electionAppState';

interface ElectionState {
  step: Step;
  candidates: string[];
  ballotCount: number;
  candidatesToElect: number;
  votes: string[][];
  hasVisitedVoting: boolean;
  prefillVotes: boolean;
  calculationMode: CalculationMode;
  invalidBallotCriteria: InvalidBallotCriteria;
}

const defaultInvalidBallotCriteria: InvalidBallotCriteria = {
  moreThanRequired: true,
  lessThanRequired: true,
  blank: true,
};

const loadState = (): ElectionState | undefined => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    const savedState = JSON.parse(serializedState);
    if (savedState.step && Array.isArray(savedState.candidates)) {
      // Provide default for invalidBallotCriteria if it doesn't exist in saved state
      if (!savedState.invalidBallotCriteria) {
        savedState.invalidBallotCriteria = defaultInvalidBallotCriteria;
      }
      return savedState;
    }
    return undefined;
  } catch (error) {
    console.error("Lỗi khi tải trạng thái từ localStorage:", error);
    return undefined;
  }
};

const App: React.FC = () => {
  const [initialState] = useState(loadState() || {
    step: 'setup',
    candidates: [],
    ballotCount: 0,
    candidatesToElect: 0,
    votes: [],
    hasVisitedVoting: false,
    prefillVotes: false,
    calculationMode: 'totalBallots',
    invalidBallotCriteria: defaultInvalidBallotCriteria,
  });

  // Fix: Cast the step from initialState to the Step type. This is necessary because data from localStorage is treated as a generic string.
  const [step, setStep] = useState<Step>(initialState.step as Step);
  const [candidates, setCandidates] = useState<string[]>(initialState.candidates);
  const [ballotCount, setBallotCount] = useState<number>(initialState.ballotCount);
  const [candidatesToElect, setCandidatesToElect] = useState<number>(initialState.candidatesToElect);
  const [votes, setVotes] = useState<string[][]>(initialState.votes);
  const [hasVisitedVoting, setHasVisitedVoting] = useState<boolean>(initialState.hasVisitedVoting);
  const [prefillVotes, setPrefillVotes] = useState<boolean>(initialState.prefillVotes);
  // Fix: Cast calculationMode from initialState to the CalculationMode type. This ensures type safety for data loaded from localStorage.
  const [calculationMode, setCalculationMode] = useState<CalculationMode>((initialState.calculationMode || 'totalBallots') as CalculationMode);
  const [invalidBallotCriteria, setInvalidBallotCriteria] = useState<InvalidBallotCriteria>(initialState.invalidBallotCriteria || defaultInvalidBallotCriteria);


  useEffect(() => {
    const stateToSave: ElectionState = { step, candidates, ballotCount, candidatesToElect, votes, hasVisitedVoting, prefillVotes, calculationMode, invalidBallotCriteria };
    if (step !== 'setup' || candidates.length > 0 || ballotCount > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Lỗi khi lưu trạng thái vào localStorage:", error);
      }
    }
  }, [step, candidates, ballotCount, candidatesToElect, votes, hasVisitedVoting, prefillVotes, calculationMode, invalidBallotCriteria]);

  const handleStartVoting = useCallback((newCandidates: string[], newBallotCount: number, newCandidatesToElect: number, newPrefillVotes: boolean, newInvalidBallotCriteria: InvalidBallotCriteria) => {
    setCandidates(newCandidates);
    setBallotCount(newBallotCount);
    setCandidatesToElect(newCandidatesToElect);
    setPrefillVotes(newPrefillVotes);
    setInvalidBallotCriteria(newInvalidBallotCriteria);
    setHasVisitedVoting(true);

    if (newPrefillVotes) {
      const prefilledVotes = Array.from({ length: newBallotCount }, () => [...newCandidates]);
      setVotes(prefilledVotes);
    } else {
      setVotes(Array(newBallotCount).fill([]));
    }
    setStep('voting');
  }, []);

  const handleVote = useCallback((ballotIndex: number, candidateName: string) => {
    setVotes(prevVotes => {
      const newVotes = [...prevVotes];
      const ballot = [...(newVotes[ballotIndex] || [])];
      const candidateIndex = ballot.indexOf(candidateName);

      if (candidateIndex > -1) {
        ballot.splice(candidateIndex, 1);
      } else {
        if (ballot.length < candidatesToElect) {
          ballot.push(candidateName);
        }
      }
      
      newVotes[ballotIndex] = ballot;
      return newVotes;
    });
  }, [candidatesToElect]);

  const handleFinishVoting = useCallback(() => {
    setStep('results');
  }, []);

  const handleReviewVoting = useCallback(() => {
    setStep('voting');
  }, []);
  
  const handleNewPoll = useCallback(() => {
    setStep('setup');
    setCandidates([]);
    setBallotCount(0);
    setCandidatesToElect(0);
    setVotes([]);
    setHasVisitedVoting(false);
    setPrefillVotes(false);
    setCalculationMode('totalBallots');
    setInvalidBallotCriteria(defaultInvalidBallotCriteria);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error)
      {
      console.error("Lỗi khi xóa trạng thái khỏi localStorage:", error);
    }
  }, []);

  const handleBackToSetup = useCallback(() => {
    setStep('setup');
  }, []);

  const handleContinueVoting = useCallback(() => {
    setStep('voting');
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'setup':
        return <SetupStep 
                  onStart={handleStartVoting} 
                  initialCandidates={candidates}
                  initialBallotCount={ballotCount}
                  initialCandidatesToElect={candidatesToElect}
                  hasVisitedVoting={hasVisitedVoting}
                  onContinue={handleContinueVoting}
                  initialPrefillVotes={prefillVotes}
                  initialInvalidBallotCriteria={invalidBallotCriteria}
               />;
      case 'voting':
        return <VotingStep 
                  candidates={candidates} 
                  ballotCount={ballotCount} 
                  votes={votes}
                  onVote={handleVote}
                  onFinish={handleFinishVoting}
                  candidatesToElect={candidatesToElect}
                  onBackToSetup={handleBackToSetup}
                />;
      case 'results':
        return <ResultsStep 
                  candidates={candidates} 
                  votes={votes}
                  onReview={handleReviewVoting}
                  candidatesToElect={candidatesToElect}
                  ballotCount={ballotCount}
                  onNewPoll={handleNewPoll}
                  calculationMode={calculationMode}
                  onCalculationModeChange={setCalculationMode}
                  invalidBallotCriteria={invalidBallotCriteria}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header className="no-print" />
      <main className="container mx-auto px-4 py-8">
        {renderStep()}
      </main>
      <footer className="no-print text-center py-4 text-gray-500 text-sm">
        <p>Phát triển bởi ThanhPV</p>
      </footer>
    </div>
  );
};

export default App;
