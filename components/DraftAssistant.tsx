import React, { useState } from 'react';
import type { Player, AIAnalysis } from '../types';

interface DraftAssistantProps {
    player: Player | null;
    analysis: AIAnalysis | null;
    draftPosition: number;
    setDraftPosition: (pos: number) => void;
    totalTeams: number;
    setTotalTeams: (teams: number) => void;
    currentPick: number;
    onDraft: (playerId: number) => void;
    teamOnTheClock: number;
}

const InjuryRiskBadge: React.FC<{ risk: Player['injuryRisk'] }> = ({ risk }) => {
    const riskStyles = {
        Low: 'border-green-500 text-green-400',
        Medium: 'border-yellow-500 text-yellow-400',
        High: 'border-red-500 text-red-500',
    };
    return (
        <span className={`text-xs font-bold px-2 py-0.5 border rounded-full ${riskStyles[risk]}`}>
            {risk.toUpperCase()} RISK
        </span>
    );
};

const DraftAssistant: React.FC<DraftAssistantProps> = ({
    player,
    analysis,
    draftPosition,
    setDraftPosition,
    totalTeams,
    setTotalTeams,
    currentPick,
    onDraft,
    teamOnTheClock
}) => {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const isMyTurn = teamOnTheClock === draftPosition;

    if (!player && !analysis) {
        return (
            <div className="sticky top-6">
                <div className="bg-brand-secondary border border-brand-border rounded-lg p-4 text-center">
                    <h2 className="text-xl font-bold mb-2">Draft Complete!</h2>
                    <p className="text-brand-subtle">All players have been drafted.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="sticky top-6">
            <div className="bg-brand-secondary border border-brand-border rounded-lg mb-6">
                 <button onClick={() => setSettingsOpen(!settingsOpen)} className="w-full text-left text-lg font-bold text-brand-text p-4 flex justify-between items-center hover:bg-brand-border/50 transition-colors">
                    <span>Draft Settings</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {settingsOpen && (
                    <div className="p-4 border-t border-brand-border animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="total-teams" className="block text-sm font-medium text-brand-subtle">Teams</label>
                                <select
                                    id="total-teams"
                                    value={totalTeams}
                                    onChange={e => setTotalTeams(Number(e.target.value))}
                                    className="mt-1 block w-full bg-brand-primary border border-brand-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm text-brand-text"
                                >
                                    {[8, 10, 12, 14].map(num => <option key={num} value={num}>{num}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="draft-position" className="block text-sm font-medium text-brand-subtle">Your Pick</label>
                                <select
                                    id="draft-position"
                                    value={draftPosition}
                                    onChange={e => setDraftPosition(Number(e.target.value))}
                                    className="mt-1 block w-full bg-brand-primary border border-brand-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm text-brand-text"
                                >
                                    {Array.from({ length: totalTeams }, (_, i) => i + 1).map(num => <option key={num} value={num}>{num}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`bg-brand-secondary border-2 ${isMyTurn ? 'border-green-500 animate-glow' : 'border-brand-border'} rounded-lg shadow-2xl p-4 space-y-4 transition-all duration-300`}>
                 <div className="text-center">
                    {isMyTurn ? (
                         <h2 className="text-2xl font-bold text-green-400 animate-pulse">YOU ARE ON THE CLOCK!</h2>
                    ) : (
                         <h2 className="text-xl font-bold text-brand-text">AI Analysis</h2>
                    )}
                </div>
                
                {!analysis || !player ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                         <p className="ml-3 text-brand-subtle">AI is thinking...</p>
                    </div>
                ) : (
                    <>
                        <div>
                            <h3 className="text-sm font-bold text-brand-text uppercase mb-2">Primary Recommendation</h3>
                            <div className="bg-brand-primary rounded-lg p-3">
                                <div className="text-center">
                                     <div className="flex items-center justify-center gap-3 mb-1">
                                        <h3 className="text-2xl font-bold text-brand-text">{player.name}</h3>
                                        <InjuryRiskBadge risk={player.injuryRisk} />
                                    </div>
                                    <p className="text-3xl font-bold text-green-400">{player.fantasyPointsPerGame2025Projected?.toFixed(2)} <span className="text-lg text-brand-subtle">PROJ. PPG</span></p>
                                </div>
                                <p className="text-brand-subtle text-sm leading-relaxed mt-2 p-2 bg-brand-secondary rounded-md h-20 overflow-y-auto">
                                    {analysis.primary.reasoning}
                                </p>
                            </div>
                        </div>

                         <div>
                            <h3 className="text-sm font-bold text-brand-text uppercase mb-2">Alternative Options</h3>
                            <div className="space-y-2">
                                {analysis.alternatives.map((alt, index) => (
                                    <div key={index} className="bg-brand-primary rounded-lg p-2">
                                        <p className="font-bold text-brand-text">{alt.name}</p>
                                        <p className="text-xs text-brand-subtle">{alt.reasoning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-brand-text uppercase mb-2">Watch List <span className="normal-case text-brand-subtle text-xs">(Predicted picks before your next turn)</span></h3>
                             <div className="grid grid-cols-3 gap-2 text-center">
                                {analysis.predictions.map((name, index) => (
                                    <div key={index} className="bg-brand-primary rounded p-1">
                                        <p className="text-xs text-brand-text truncate font-semibold">{name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => player && onDraft(player.id)}
                            disabled={!isMyTurn || !player}
                            className="w-full text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200 text-lg
                            disabled:bg-gray-600 disabled:cursor-not-allowed
                            bg-green-600 hover:bg-green-500 focus:ring-green-400"
                        >
                            {isMyTurn && player ? `Draft ${player.name}`: 'Waiting for pick...'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DraftAssistant;