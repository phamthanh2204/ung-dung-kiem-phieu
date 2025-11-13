import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import SetupStep from './components/SetupStep';
import VotingStep from './components/VotingStep';
import ResultsStep from './components/ResultsStep';
import ContactModal from './components/ContactModal';
import { BookOpenIcon } from './components/icons';
import { Step, CalculationMode, InvalidBallotCriteria, ResultData, ElectionResults } from './types';

const LOCAL_STORAGE_KEY = 'electionAppState';

interface ElectionState {
  step: Step;
  candidates: string[];
  ballotCount: number;
  candidatesToElect: number;
  votes: string[][];
  hasVisitedVoting: boolean;
  prefillCount: number;
  calculationMode: CalculationMode;
  invalidBallotCriteria: InvalidBallotCriteria;
  electionResults: ElectionResults | null;
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
       if (typeof savedState.electionResults === 'undefined') {
          savedState.electionResults = null;
      }
      if (typeof savedState.prefillCount === 'undefined') {
          savedState.prefillCount = 0;
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
    prefillCount: 0,
    calculationMode: 'validBallots',
    invalidBallotCriteria: defaultInvalidBallotCriteria,
    electionResults: null,
  });

  const [step, setStep] = useState<Step>(initialState.step as Step);
  const [candidates, setCandidates] = useState<string[]>(initialState.candidates);
  const [ballotCount, setBallotCount] = useState<number>(initialState.ballotCount);
  const [candidatesToElect, setCandidatesToElect] = useState<number>(initialState.candidatesToElect);
  const [votes, setVotes] = useState<string[][]>(initialState.votes);
  const [hasVisitedVoting, setHasVisitedVoting] = useState<boolean>(initialState.hasVisitedVoting);
  const [prefillCount, setPrefillCount] = useState<number>(initialState.prefillCount);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>((initialState.calculationMode || 'validBallots') as CalculationMode);
  const [invalidBallotCriteria, setInvalidBallotCriteria] = useState<InvalidBallotCriteria>(initialState.invalidBallotCriteria || defaultInvalidBallotCriteria);
  const [electionResults, setElectionResults] = useState<ElectionResults | null>(initialState.electionResults);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const instructionsUrl = 'https://docs.google.com/spreadsheets/d/18Hn0APJ-lNPxTXN5vn3f9IyLF4rbOZOnpBO38W_vzNQ/edit?usp=sharing';


  useEffect(() => {
    const stateToSave: ElectionState = { step, candidates, ballotCount, candidatesToElect, votes, hasVisitedVoting, prefillCount, calculationMode, invalidBallotCriteria, electionResults };
    if (step !== 'setup' || candidates.length > 0 || ballotCount > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Lỗi khi lưu trạng thái vào localStorage:", error);
      }
    }
  }, [step, candidates, ballotCount, candidatesToElect, votes, hasVisitedVoting, prefillCount, calculationMode, invalidBallotCriteria, electionResults]);

  const calculateResults = useCallback((mode: CalculationMode): ElectionResults | null => {
    if (candidates.length === 0) {
        return null;
    }
      
    const voteCounts: { [key: string]: number } = {};
    candidates.forEach(c => voteCounts[c] = 0);

    const totalBallotsCount = votes.length;
    let validBallotsCount = 0;
    let totalValidSelections = 0;

    const isBallotInvalid = (ballot: string[], criteria: InvalidBallotCriteria, toElect: number): boolean => {
        if (!ballot) return true;
        const selectionCount = ballot.length;
        if (criteria.moreThanRequired && selectionCount > toElect) return true;
        if (criteria.lessThanRequired && selectionCount > 0 && selectionCount < toElect) return true;
        if (criteria.blank && selectionCount === 0) return true;
        return false;
    }

    votes.forEach(ballot => {
      if (ballot && !isBallotInvalid(ballot, invalidBallotCriteria, candidatesToElect)) {
        validBallotsCount++;
        ballot.forEach(candidateName => {
          if (voteCounts.hasOwnProperty(candidateName)) {
            voteCounts[candidateName]++;
            totalValidSelections++;
          }
        });
      }
    });

    const invalidBallotsCount = totalBallotsCount - validBallotsCount;

    const sortedCandidates = candidates
      .map(c => ({ name: c, votes: voteCounts[c] }))
      .sort((a, b) => b.votes - a.votes);
    
    const resultData: ResultData[] = sortedCandidates.map(candidate => {
      let denominator: number;
      if (mode === 'validBallots') {
          denominator = validBallotsCount > 0 ? validBallotsCount : 1;
      } else { // 'totalBallots'
          denominator = totalBallotsCount > 0 ? totalBallotsCount : 1;
      }
      const percentageValue = (candidate.votes / denominator) * 100;
      
      const isWinner = percentageValue > 50;

      return {
        name: candidate.name,
        votes: candidate.votes,
        percentage: percentageValue.toFixed(2) + '%',
        isWinner: isWinner,
      };
    });
    
    const invalidReasonParts: string[] = [];
    if (invalidBallotCriteria.moreThanRequired) invalidReasonParts.push(`chọn nhiều hơn ${candidatesToElect} ứng viên`);
    if (invalidBallotCriteria.lessThanRequired) invalidReasonParts.push(`chọn ít hơn ${candidatesToElect} ứng viên (nhưng không phải phiếu trắng)`);
    if (invalidBallotCriteria.blank) invalidReasonParts.push("để trống");
    
    let note = 'Phiếu hợp lệ là phiếu không vi phạm bất kỳ quy tắc nào được chọn ở bước thiết lập.';
    if (invalidReasonParts.length > 0 && invalidReasonParts.length < 3) {
      note = `Phiếu bị coi là không hợp lệ nếu: ${invalidReasonParts.join('; ')}.`;
    } else if (invalidReasonParts.length === 0) {
        note = 'Tất cả các phiếu đều được coi là hợp lệ theo thiết lập.';
    } else { // All 3 are selected
        note = `Phiếu hợp lệ là phiếu đã chọn đúng ${candidatesToElect} ứng viên.`
    }

    const winners = resultData.filter(r => r.isWinner);

    return {
      results: resultData, 
      totalVotes: totalValidSelections, 
      totalBallots: totalBallotsCount,
      validBallots: validBallotsCount,
      invalidBallots: invalidBallotsCount,
      validityNote: note,
      winners: winners
    };
  }, [candidates, votes, candidatesToElect, invalidBallotCriteria]);

  useEffect(() => {
    if (step === 'results') {
        const newResults = calculateResults(calculationMode);
        if (newResults) {
            setElectionResults(newResults);
        }
    }
  }, [calculationMode, step, calculateResults]);


  const handleStartVoting = useCallback((newCandidates: string[], newBallotCount: number, newCandidatesToElect: number, newPrefillCount: number, newInvalidBallotCriteria: InvalidBallotCriteria) => {
    setCandidates(newCandidates);
    setBallotCount(newBallotCount);
    setCandidatesToElect(newCandidatesToElect);
    setPrefillCount(newPrefillCount);
    setInvalidBallotCriteria(newInvalidBallotCriteria);
    setHasVisitedVoting(true);

    const initialVotes = Array.from({ length: newBallotCount }, (_, index) => {
      if (index < newPrefillCount) {
        return [...newCandidates];
      }
      return [];
    });
    setVotes(initialVotes);
    
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
    const initialResults = calculateResults(calculationMode);
     if (initialResults) {
        setElectionResults(initialResults);
    }
    setStep('results');
  }, [calculateResults, calculationMode]);

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
    setPrefillCount(0);
    setCalculationMode('validBallots');
    setInvalidBallotCriteria(defaultInvalidBallotCriteria);
    setElectionResults(null);
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
                  initialPrefillCount={prefillCount}
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
        return electionResults ? <ResultsStep 
                  resultsData={electionResults}
                  candidates={candidates}
                  votes={votes}
                  onReview={handleReviewVoting}
                  onNewPoll={handleNewPoll}
                  calculationMode={calculationMode}
                  onCalculationModeChange={setCalculationMode}
                /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col">
      <Header className="no-print" />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderStep()}
      </main>
      <footer className="no-print text-center py-4 text-gray-500 text-sm">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>Phát triển bởi ThanhPV</p>
            <div className="flex items-center justify-center flex-wrap gap-4">
               <a
                  href={instructionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-600 text-white hover:bg-gray-700 font-bold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out flex items-center gap-2"
                >
                  <BookOpenIcon className="w-5 h-5" />
                  Hướng dẫn
              </a>
              <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="bg-sky-500 text-white hover:bg-sky-600 font-bold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out animate-pulse"
              >
                  Liên hệ hỗ trợ
              </button>
            </div>
        </div>
      </footer>
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
};

export default App;