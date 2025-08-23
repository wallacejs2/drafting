import React from 'react';
import type { Player } from '../types';
import { Position } from '../types';

interface PlayerCardProps {
    player: Player;
    onDraft: (playerId: number) => void;
    onAnalyzePlayer: (playerId: number) => void;
    isRecommended?: boolean;
}

const GradeBadge: React.FC<{ grade?: string }> = ({ grade }) => {
    if (!grade || grade === 'N/A') return <div className="w-9 h-9"></div>;

    const gradeColor = () => {
        if (grade.startsWith('A')) return 'bg-green-500/80 border-green-400';
        if (grade.startsWith('B')) return 'bg-sky-500/80 border-sky-400';
        if (grade.startsWith('C')) return 'bg-yellow-500/80 border-yellow-400';
        return 'bg-red-500/80 border-red-400';
    };

    return (
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-base border-2 shadow-md ${gradeColor()}`}>
            {grade}
        </div>
    );
};

const InfoItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-brand-text' }) => (
     <div className="text-center">
        <p className="text-xs text-brand-subtle">{label}</p>
        <p className={`text-base font-bold ${color}`}>{value}</p>
    </div>
);

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onDraft, onAnalyzePlayer, isRecommended = false }) => {
    const recommendedClass = isRecommended ? 'animate-glow' : '';

    return (
        <div className={`bg-brand-secondary border border-brand-border rounded-lg shadow-lg p-3 flex flex-col justify-between transition-all duration-300 hover:border-brand-accent ${recommendedClass}`}>
            <div>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-grow min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-bold text-brand-text leading-tight truncate" title={player.name}>{player.name}</h3>
                            {player.notes && (
                                <div title={player.notes} className="flex-shrink-0 cursor-help">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-subtle" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-xs font-semibold text-brand-accent">{player.position} - {player.team}</p>
                            <p className="text-xs font-bold bg-gray-600 px-1.5 py-0.5 rounded text-gray-200" title={player.archetype}>TIER {player.tier}</p>
                        </div>
                         <p className="text-[11px] font-semibold text-sky-300 mt-1.5 truncate" title={player.archetype}>{player.archetype}</p>
                    </div>
                    <div className="flex-shrink-0">
                        <GradeBadge grade={player.draftGrade} />
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-y-3 gap-x-1 text-center my-3 p-2 bg-brand-primary/50 rounded-md">
                   <InfoItem label="PROJ. PPG" value={player.fantasyPointsPerGame2024Projected?.toFixed(1) ?? 'N/A'} color="text-green-400" />
                   <InfoItem label="ADP" value={player.adp ?? 'N/A'} />
                   <InfoItem label="BYE" value={player.byeWeek} />
                </div>
                
                <div className="grid grid-cols-3 gap-y-3 gap-x-1 text-center my-3 text-sm">
                     <div>
                        <p className="text-xs text-brand-subtle">SOS</p>
                        <p className={`font-bold ${
                            player.strengthOfSchedule <= 10 ? 'text-green-400' :
                            player.strengthOfSchedule <= 22 ? 'text-yellow-400' : 'text-red-500'
                        }`}>{player.strengthOfSchedule <= 10 ? 'EASY' : player.strengthOfSchedule <= 22 ? 'AVG' : 'HARD'}</p>
                    </div>
                     <div>
                        <p className="text-xs text-brand-subtle">RISK</p>
                        <p className={`font-bold ${
                            player.injuryRisk === 'Low' ? 'text-green-400' :
                            player.injuryRisk === 'Medium' ? 'text-yellow-400' : 'text-red-500'
                        }`}>{player.injuryRisk}</p>
                    </div>
                    <div>
                        <p className="text-xs text-brand-subtle">OPP.</p>
                        <p className={`font-bold ${
                            player.opportunityShare === 'High' ? 'text-green-400' :
                            player.opportunityShare === 'Medium' ? 'text-yellow-400' : 'text-red-500'
                        }`}>{player.opportunityShare}</p>
                    </div>
                </div>

            </div>

            <div className="mt-auto pt-2 flex items-stretch gap-2 border-t border-brand-border/50">
                <button
                    type="button"
                    onClick={() => onDraft(player.id)}
                    className="flex-grow bg-brand-accent text-white font-bold py-1.5 px-3 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200 text-sm"
                >
                    Draft
                </button>
                <button
                    type="button"
                    onClick={() => onAnalyzePlayer(player.id)}
                    aria-label={`Analyze ${player.name}`}
                    title={`Analyze ${player.name}`}
                    className="flex-shrink-0 bg-brand-primary border border-brand-border text-brand-subtle p-1.5 rounded-md hover:bg-brand-secondary hover:text-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-75 transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 12H12V2.252z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default React.memo(PlayerCard);