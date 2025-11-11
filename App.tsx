import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import SetupStep from './components/SetupStep';
import VotingStep from './components/VotingStep';
import ResultsStep from './components/ResultsStep';
import { Step } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('setup');
  const [candidates, setCandidates] = useState<string[]>([]);
  const [ballotCount, setBallotCount] = useState<number>(0);
  const [candidatesToElect, setCandidatesToElect] = useState<number>(0);
  const [votes, setVotes] = useState<string[][]>([]);

  const handleStartVoting = useCallback((newCandidates: string[], newBallotCount: number, newCandidatesToElect: number) => {
    setCandidates(newCandidates);
    setBallotCount(newBallotCount);
    setCandidatesToElect(newCandidatesToElect);
    setVotes(Array(newBallotCount).fill([])); // Initialize each ballot with an empty array
    setStep('voting');
  }, []);

  const handleVote = useCallback((ballotIndex: number, candidateName: string) => {
    setVotes(prevVotes => {
      const newVotes = [...prevVotes];
      const ballot = [...(newVotes[ballotIndex] || [])];
      const candidateIndex = ballot.indexOf(candidateName);

      if (candidateIndex > -1) {
        // Candidate is already selected, so remove them (deselect)
        ballot.splice(candidateIndex, 1);
      } else {
        // Candidate is not selected, add them only if the limit is not reached
        if (ballot.length < candidatesToElect) {
          ballot.push(candidateName);
        }
      }
      
      newVotes[ballotIndex] = ballot; // Update the ballot in the main votes array
      return newVotes;
    });
  }, [candidatesToElect]);

  const handleFinishVoting = useCallback(() => {
    setStep('results');
  }, []);

  const handleReviewVoting = useCallback(() => {
    setStep('voting');
  }, []);
  
  const handleGoToSetup = useCallback(() => {
    setStep('setup');
    // Optional: Reset state if you want a clean slate when going back
    // setCandidates([]);
    // setBallotCount(0);
    // setCandidatesToElect(0);
    // setVotes([]);
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'setup':
        return <SetupStep onStart={handleStartVoting} />;
      case 'voting':
        return <VotingStep 
                  candidates={candidates} 
                  ballotCount={ballotCount} 
                  votes={votes}
                  onVote={handleVote}
                  onFinish={handleFinishVoting}
                  candidatesToElect={candidatesToElect}
                  onBackToSetup={handleGoToSetup}
                />;
      case 'results':
        return <ResultsStep 
                  candidates={candidates} 
                  votes={votes}
                  onReview={handleReviewVoting}
                  candidatesToElect={candidatesToElect}
                  ballotCount={ballotCount}
                  onNewPoll={handleGoToSetup}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {renderStep()}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Phát triển bởi ThanhPV</p>
      </footer>
    </div>
  );
};

export default App;