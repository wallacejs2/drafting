import React from 'react';
import type { Player } from '../types';
import { Position } from '../types';

interface PlayerCardProps {
    player: Player;
    onDraft: (playerId: number) => void;
    onAnalyzePlayer: (playerId: number) => void;
    isRecommended?: boolean;
}

const getPositionClass = (position: Position): string => {
    switch (position) {
        case Position.QB: return 'bg-pos-qb';
        case Position.RB: return 'bg-pos-rb';
        case Position.WR: return 'bg-pos-wr';
        case Position.TE: return 'bg-pos-te';
        default: return 'bg-gray-500';
    }
}
const getPositionBorderClass = (position: Position): string => {
    switch (position) {
        case Position.QB: return 'border-pos-qb';
        case Position.RB: return 'border-pos-rb';
        case Position.WR: return 'border-pos-wr';
        case Position.TE: return 'border-pos-te';
        default: return 'border-gray-500';
    }
}

const StatIndicator: React.FC<{ label: string; value: string; color: string; tooltip: string }> = ({ label, value, color, tooltip }) => (
    <div className="text-center" title={tooltip}>
        <p className="text-xs font-semibold text-text-secondary">{label}</p>
        <p className={`font-bold text-sm ${color}`}>{value}</p>
    </div>
);

const ModifierIcon: React.FC<{ type: 'catalyst' | 'concern'; count: number; items: string[] }> = ({ type, count, items }) => {
    if (count === 0) return null;
    const isCatalyst = type === 'catalyst';
    const color = isCatalyst ? 'text-accent-positive' : 'text-accent-negative';
    const icon = isCatalyst ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.707-11.707a1 1 0 00-1.414 0L9 7.586V11a1 1 0 102 0V7.586l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" /></svg>
    );

    return (
        <div className="relative group flex items-center gap-1">
            <div className={`flex items-center gap-0.5 font-bold text-xs ${color}`}>
                {icon}
                <span>{count}</span>
            </div>
            <div className="absolute bottom-full mb-2 w-48 bg-bg-primary border border-border-primary text-left p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <h4 className={`text-xs font-bold ${color}`}>{isCatalyst ? 'Catalysts' : 'Concerns'}:</h4>
                <ul className="list-disc list-inside text-xs text-text-secondary">
                    {items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2.5 h-2.5 bg-bg-primary border-r border-b border-border-primary rotate-45"></div>
            </div>
        </div>
    );
};

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onDraft, onAnalyzePlayer, isRecommended = false }) => {
    const recommendedClass = isRecommended ? 'animate-glow' : '';
    const recommendedStyle = isRecommended ? { '--glow-color': '#34D399' } as React.CSSProperties : {};
    
    const projectionModifiers = player.projectionModifiers;
    const sosColor = player.strengthOfSchedule <= 10 ? 'text-accent-positive' : player.strengthOfSchedule <= 22 ? 'text-accent-warning' : 'text-accent-negative';
    const riskColor = player.injuryRisk === 'Low' ? 'text-accent-positive' : player.injuryRisk === 'Medium' ? 'text-accent-warning' : 'text-accent-negative';
    const oppColor = player.opportunityShare === 'High' ? 'text-accent-positive' : player.opportunityShare === 'Medium' ? 'text-accent-warning' : 'text-accent-negative';

    return (
        <div className={`bg-bg-secondary border border-border-primary rounded-lg shadow-lg flex flex-col justify-between transition-all duration-300 hover:border-accent-primary hover:scale-[1.02] relative overflow-hidden ${recommendedClass}`} style={recommendedStyle}>
            <div className={`absolute top-0 left-0 h-full w-1.5 ${getPositionClass(player.position)}`}></div>
            <div className="p-3 pl-5 flex flex-col flex-grow">
                <div>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-grow min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-text-primary leading-tight truncate" title={player.name}>{player.name}</h3>
                                {player.notes && (
                                    <div title={player.notes} className="flex-shrink-0 cursor-help">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <p className="text-sm font-semibold text-accent-primary">{player.position} - {player.team}</p>
                                <p className="text-xs font-bold bg-border-primary px-1.5 py-0.5 rounded text-text-secondary">TIER {player.tier}</p>
                            </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className="text-xs font-semibold text-text-secondary">GRADE</p>
                            <p className="text-2xl font-extrabold text-text-primary">{player.draftGrade ?? 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div className="my-3 p-2 bg-bg-primary rounded-md">
                        <div className="flex justify-between items-center text-center">
                            <div className="flex-1">
                                <p className="text-xs text-text-secondary">AI PROJ.</p>
                                <p className="text-xl font-bold text-accent-positive">{player.fantasyPointsPerGame2024Projected?.toFixed(1) ?? 'N/A'}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-text-secondary">ESPN</p>
                                <p className="text-lg font-bold text-text-primary">{player.espnPpgProjected?.toFixed(1) ?? 'N/A'}</p>
                            </div>
                             <div className="flex-1">
                                <p className="text-xs text-text-secondary">SLEEPER</p>
                                <p className="text-lg font-bold text-text-primary">{player.sleeperPpgProjected?.toFixed(1) ?? 'N/A'}</p>
                            </div>
                             <div className="flex items-center gap-2 pr-1">
                                <ModifierIcon type="catalyst" count={projectionModifiers?.catalysts.length ?? 0} items={projectionModifiers?.catalysts ?? []} />
                                <ModifierIcon type="concern" count={projectionModifiers?.concerns.length ?? 0} items={projectionModifiers?.concerns ?? []} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-1 text-center my-3">
                         <StatIndicator label="ADP" value={player.adp?.toString() ?? 'N/A'} color="text-text-primary" tooltip="Average Draft Position" />
                        <StatIndicator label="SOS" value={player.strengthOfSchedule <= 10 ? 'EASY' : player.strengthOfSchedule <= 22 ? 'AVG' : 'HARD'} color={sosColor} tooltip={`Strength of Schedule (Rank ${player.strengthOfSchedule})`} />
                        <StatIndicator label="RISK" value={player.injuryRisk.toUpperCase()} color={riskColor} tooltip={`${player.injuryRisk} Injury Risk`} />
                        <StatIndicator label="OPP." value={player.opportunityShare.toUpperCase()} color={oppColor} tooltip={`${player.opportunityShare} Opportunity Share`} />
                    </div>
                </div>

                <div className="mt-auto pt-3 flex items-stretch gap-2 border-t border-border-primary/50">
                    <button
                        type="button"
                        onClick={() => onDraft(player.id)}
                        className="flex-grow bg-accent-primary text-white font-bold py-2 px-3 rounded-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-colors duration-200 text-sm"
                    >
                        Draft
                    </button>
                    <button
                        type="button"
                        onClick={() => onAnalyzePlayer(player.id)}
                        aria-label={`Analyze ${player.name}`}
                        title={`Analyze ${player.name}`}
                        className="flex-shrink-0 bg-bg-primary border border-border-primary text-text-secondary p-2 rounded-md hover:bg-border-primary hover:text-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-75 transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                            <path d="M12 2.252A8.014 8.014 0 0117.748 12H12V2.252z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(PlayerCard);