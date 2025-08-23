import React, { useState } from 'react';
import type { Player, AIAnalysis } from '../types';
import TierDropAnalysis from './TierDropAnalysis';
import ValueBoard from './ValueBoard';

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
    availablePlayers: Player[];
}

const InjuryRiskBadge: React.FC<{ risk: Player['injuryRisk'] }> = ({ risk }) => {
    const riskStyles = {
        Low: 'border-accent-positive text-accent-positive',
        Medium: 'border-accent-warning text-accent-warning',
        High: 'border-accent-negative text-accent-negative',
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
    teamOnTheClock,
    availablePlayers
}) => {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const isMyTurn = teamOnTheClock === draftPosition;

    if (!player && !analysis) {
        return (
            <div className="sticky top-6">
                <div className="bg-bg-secondary border border-border-primary rounded-lg p-4 text-center">
                    <h2 className="text-xl font-bold mb-2">Draft Complete!</h2>
                    <p className="text-text-secondary">All players have been drafted.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="sticky top-6">
            <div className="bg-bg-secondary border border-border-primary rounded-lg mb-6">
                 <button onClick={() => setSettingsOpen(!settingsOpen)} className="w-full text-left text-lg font-bold text-text-primary p-4 flex justify-between items-center hover:bg-border-primary/20 transition-colors">
                    <span>Draft Settings</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {settingsOpen && (
                    <div className="p-4 border-t border-border-primary animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="total-teams" className="block text-sm font-medium text-text-secondary">Teams</label>
                                <select
                                    id="total-teams"
                                    value={totalTeams}
                                    onChange={e => setTotalTeams(Number(e.target.value))}
                                    className="mt-1 block w-full bg-bg-primary border border-border-primary rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm text-text-primary"
                                >
                                    {[8, 10, 12, 14].map(num => <option key={num} value={num}>{num}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="draft-position" className="block text-sm font-medium text-text-secondary">Your Pick</label>
                                <select
                                    id="draft-position"
                                    value={draftPosition}
                                    onChange={e => setDraftPosition(Number(e.target.value))}
                                    className="mt-1 block w-full bg-bg-primary border border-border-primary rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm text-text-primary"
                                >
                                    {Array.from({ length: totalTeams }, (_, i) => i + 1).map(num => <option key={num} value={num}>{num}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`bg-bg-secondary border-2 ${isMyTurn ? 'border-accent-positive animate-glow' : 'border-border-primary'} rounded-lg shadow-2xl p-4 space-y-4 transition-all duration-300`} style={{ '--glow-color': '#34D399' } as React.CSSProperties}>
                 <div className="text-center">
                    {isMyTurn ? (
                         <h2 className="text-2xl font-bold text-accent-positive animate-subtle-pulse">YOU ARE ON THE CLOCK!</h2>
                    ) : (
                         <h2 className="text-xl font-bold text-text-primary">Draft Analysis</h2>
                    )}
                </div>
                
                {!analysis || !player ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                         <p className="ml-3 text-text-secondary">Calculating...</p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div>
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">AI Strategic Narrative</h3>
                            <div className="bg-bg-primary rounded-lg p-3 h-28 overflow-y-auto">
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {analysis.strategicNarrative}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mt-4 mb-2">Primary Recommendation</h3>
                            <div className="bg-bg-primary rounded-lg p-3">
                                <div className="text-center">
                                     <div className="flex items-center justify-center gap-3 mb-1">
                                        <h3 className="text-2xl font-bold text-text-primary">{player.name}</h3>
                                        <InjuryRiskBadge risk={player.injuryRisk} />
                                    </div>
                                    <p className="text-3xl font-bold text-accent-positive">{player.fantasyPointsPerGame2025Projected?.toFixed(2)} <span className="text-lg text-text-secondary">PROJ. PPG</span></p>
                                </div>
                                <p className="text-text-secondary text-xs leading-relaxed mt-2 p-2 bg-bg-secondary rounded-md h-16 overflow-y-auto">
                                    {analysis.primary.reasoning}
                                </p>
                            </div>
                        </div>

                         <div>
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mt-4 mb-2">Alternative Options</h3>
                            <div className="space-y-2">
                                {analysis.alternatives.map((alt, index) => (
                                    <div key={index} className="bg-bg-primary rounded-lg p-2">
                                        <p className="font-bold text-text-primary">{alt.name}</p>
                                        <p className="text-xs text-text-secondary">{alt.reasoning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 mt-4 border-t border-border-primary">
                            <ValueBoard availablePlayers={availablePlayers} />
                            <TierDropAnalysis availablePlayers={availablePlayers} />
                        </div>

                        <button
                            onClick={() => player && onDraft(player.id)}
                            disabled={!isMyTurn || !player}
                            className="w-full text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200 text-lg
                            disabled:bg-gray-600 disabled:cursor-not-allowed
                            bg-accent-positive hover:bg-green-500 focus:ring-green-400"
                        >
                            {isMyTurn && player ? `Draft ${player.name}`: 'Waiting for pick...'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DraftAssistant;