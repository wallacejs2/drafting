import React from 'react';

interface HeaderProps {
    currentPick: number;
    totalTeams: number;
    teamOnTheClock: number;
    isMyTurn: boolean;
    onAnalyze: () => void;
    canAnalyze: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentPick, totalTeams, teamOnTheClock, isMyTurn, onAnalyze, canAnalyze }) => {
    
    const round = Math.floor((currentPick - 1) / totalTeams) + 1;
    const pickInRound = ((currentPick - 1) % totalTeams) + 1;

    return (
        <header className="bg-brand-secondary border-b border-brand-border shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.046l4.243 4.243a1 1 0 01-1.414 1.414L12 5.414V14.5a1 1 0 01-2 0V5.414L7.172 8.707a1 1 0 01-1.414-1.414L10 2.046V2a1 1 0 011.3-.954zM4 14a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm1 3a1 1 0 100 2h8a1 1 0 100-2H5z" clipRule="evenodd" />
                    </svg>
                    <h1 className="text-xl md:text-2xl font-bold text-brand-text">Draft Assistant</h1>
                </div>
                 <div className="text-center" aria-live="polite" aria-atomic="true">
                    <p className="text-sm font-bold text-brand-text">
                        Pick {currentPick} <span className="text-brand-subtle">(R{round}.P{pickInRound})</span>
                    </p>
                    {isMyTurn ? (
                         <p className="text-sm font-semibold text-green-400 animate-pulse">You are on the clock!</p>
                    ) : (
                         <p className="text-sm font-semibold text-brand-subtle">Team {teamOnTheClock} is picking</p>
                    )}
                </div>
                 <div>
                    <button
                        onClick={onAnalyze}
                        disabled={!canAnalyze}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                            <path d="M12 2.252A8.014 8.014 0 0117.748 12H12V2.252z" />
                        </svg>
                        <span>Analyze Team</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;