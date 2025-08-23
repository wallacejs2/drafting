import React from 'react';

interface HeaderProps {
    currentPick: number;
    totalTeams: number;
    teamOnTheClock: number;
    isMyTurn: boolean;
    onAnalyze: () => void;
    canAnalyze: boolean;
    onSyncData: () => void;
    onResetDraft: () => void;
    isSyncing: boolean;
    timeRemaining: number;
}

const Header: React.FC<HeaderProps> = ({ 
    currentPick, 
    totalTeams, 
    teamOnTheClock, 
    isMyTurn, 
    onAnalyze, 
    canAnalyze, 
    onSyncData, 
    onResetDraft,
    isSyncing,
    timeRemaining
}) => {
    
    const round = Math.floor((currentPick - 1) / totalTeams) + 1;
    const pickInRound = ((currentPick - 1) % totalTeams) + 1;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <header className="bg-brand-secondary border-b border-brand-border shadow-md sticky top-0 z-20">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.046l4.243 4.243a1 1 0 01-1.414 1.414L12 5.414V14.5a1 1 0 01-2 0V5.414L7.172 8.707a1 1 0 01-1.414-1.414L10 2.046V2a1 1 0 011.3-.954zM4 14a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm1 3a1 1 0 100 2h8a1 1 0 100-2H5z" clipRule="evenodd" />
                    </svg>
                    <h1 className="text-xl md:text-2xl font-bold text-brand-text">Draft Assistant</h1>
                </div>
                 <div className="text-center" aria-live="polite" aria-atomic="true">
                    <div className="flex flex-col items-center">
                        {isMyTurn ? (
                            <p className="text-lg font-semibold text-green-400 animate-pulse">You are on the clock!</p>
                        ) : (
                            <p className="text-sm font-semibold text-brand-subtle">Team {teamOnTheClock} is picking</p>
                        )}
                        <p className="text-2xl font-mono font-bold text-brand-text tracking-wider">{formatTime(timeRemaining)}</p>
                         <p className="text-xs text-brand-subtle">
                            Pick {currentPick} (R{round}.P{pickInRound})
                        </p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                     <button
                        onClick={onResetDraft}
                        disabled={isSyncing}
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center text-sm"
                        title="Reset Draft"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        <span>Reset</span>
                     </button>
                     <button
                        onClick={onSyncData}
                        disabled={isSyncing}
                        className="bg-brand-accent text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center text-sm"
                    >
                        {isSyncing ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                        )}
                        <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                    </button>
                    <button
                        onClick={onAnalyze}
                        disabled={!canAnalyze || isSyncing}
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