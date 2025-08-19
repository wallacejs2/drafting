import React from 'react';

interface HeaderProps {
    currentPick: number;
    totalTeams: number;
    teamOnTheClock: number;
    isMyTurn: boolean;
    projectionStatus: string | null;
}

const Header: React.FC<HeaderProps> = ({ currentPick, totalTeams, teamOnTheClock, isMyTurn, projectionStatus }) => {
    
    const round = Math.floor((currentPick - 1) / totalTeams) + 1;
    const pickInRound = ((currentPick - 1) % totalTeams) + 1;

    return (
        <header className="bg-brand-secondary border-b border-brand-border shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.046l4.243 4.243a1 1 0 01-1.414 1.414L12 5.414V14.5a1 1 0 01-2 0V5.414L7.172 8.707a1 1 0 01-1.414-1.414L10 2.046V2a1 1 0 011.3-.954zM4 14a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm1 3a1 1 0 100 2h8a1 1 0 100-2H5z" clipRule="evenodd" />
                    </svg>
                    <h1 className="text-xl md:text-2xl font-bold text-brand-text">AI Draft Assistant</h1>
                </div>
                 <div className="text-center">
                    <p className="text-sm font-bold text-brand-text">
                        Pick {currentPick} <span className="text-brand-subtle">(R{round}.P{pickInRound})</span>
                    </p>
                    {isMyTurn ? (
                         <p className="text-sm font-semibold text-green-400 animate-pulse">You are on the clock!</p>
                    ) : (
                         <p className="text-sm font-semibold text-brand-subtle">Team {teamOnTheClock} is picking</p>
                    )}
                </div>
            </div>
             {projectionStatus && (
                <div className={`text-center px-4 py-1 text-xs font-semibold transition-all duration-300 flex items-center justify-center ${
                    projectionStatus.includes("Error") ? 'bg-red-500/30 text-red-400' : 'bg-brand-accent/20 text-brand-accent'
                }`}>
                    {!projectionStatus.includes("Error") ? (
                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    )}
                    <span>{projectionStatus}</span>
                </div>
            )}
        </header>
    );
};

export default Header;