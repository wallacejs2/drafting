import React, { useState } from 'react';
import type { Player, Stats } from '../types';
import { Position } from '../types';

interface PlayerCardProps {
    player: Player;
    onDraft: (playerId: number) => void;
    isRecommended?: boolean;
}

const StatDisplay: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-brand-subtle">{label}</span>
        <span className="font-medium text-brand-text">{value ?? 'N/A'}</span>
    </div>
);

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

const PlayerStatsDisplay: React.FC<{ stats: Stats | undefined, position: Position }> = ({ stats, position }) => {
    if (!stats) return null;

    const statEntries: React.ReactNode[] = [];

    switch (position) {
        case Position.QB:
            if (stats.passingYards != null) statEntries.push(<StatDisplay key="py" label="Pass Yds" value={stats.passingYards} />);
            if (stats.passingTds != null) statEntries.push(<StatDisplay key="ptd" label="Pass TDs" value={stats.passingTds} />);
            if (stats.rushingYards != null) statEntries.push(<StatDisplay key="ruy" label="Rush Yds" value={stats.rushingYards} />);
            if (stats.rushingTds != null) statEntries.push(<StatDisplay key="rutd" label="Rush TDs" value={stats.rushingTds} />);
            break;
        case Position.RB:
            if (stats.rushingYards != null) statEntries.push(<StatDisplay key="ruy" label="Rush Yds" value={stats.rushingYards} />);
            if (stats.rushingTds != null) statEntries.push(<StatDisplay key="rutd" label="Rush TDs" value={stats.rushingTds} />);
            if (stats.receptions != null) statEntries.push(<StatDisplay key="rec" label="Receptions" value={stats.receptions} />);
            if (stats.receivingYards != null) statEntries.push(<StatDisplay key="rey" label="Rec Yds" value={stats.receivingYards} />);
            break;
        case Position.WR:
        case Position.TE:
            if (stats.receptions != null) statEntries.push(<StatDisplay key="rec" label="Receptions" value={stats.receptions} />);
            if (stats.receivingYards != null) statEntries.push(<StatDisplay key="rey" label="Rec Yds" value={stats.receivingYards} />);
            if (stats.receivingTds != null) statEntries.push(<StatDisplay key="retd" label="Rec TDs" value={stats.receivingTds} />);
            break;
        case Position.K:
            const fgs = (stats.fieldGoalsMade0to39 ?? 0) + (stats.fieldGoalsMade40to49 ?? 0) + (stats.fieldGoalsMade50plus ?? 0);
            if (fgs > 0) statEntries.push(<StatDisplay key="fgm" label="FGs Made" value={fgs} />);
            if (stats.extraPointsMade != null) statEntries.push(<StatDisplay key="xpm" label="XPs Made" value={stats.extraPointsMade} />);
            break;
        case Position.DST:
            if (stats.sacks != null) statEntries.push(<StatDisplay key="sacks" label="Sacks" value={stats.sacks} />);
            if (stats.defensiveInterceptions != null) statEntries.push(<StatDisplay key="int" label="INTs" value={stats.defensiveInterceptions} />);
            if (stats.fumblesRecovered != null) statEntries.push(<StatDisplay key="fr" label="Fum Rec" value={stats.fumblesRecovered} />);
            if (stats.defensiveTds != null) statEntries.push(<StatDisplay key="td" label="Def TDs" value={stats.defensiveTds} />);
            break;
    }

    return <div className="space-y-1">{statEntries}</div>;
};


const PlayerCard: React.FC<PlayerCardProps> = ({ player, onDraft, isRecommended = false }) => {
    const [show2024Stats, setShow2024Stats] = useState(false);
    
    const recommendedClass = isRecommended ? 'animate-glow' : '';

    return (
        <div className={`bg-brand-secondary border border-brand-border rounded-lg shadow-lg p-4 flex flex-col justify-between transition-all duration-300 hover:scale-105 hover:border-brand-accent ${recommendedClass}`}>
            <div>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-brand-text">{player.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-semibold text-brand-accent">{player.position} - {player.team}</p>
                            <InjuryRiskBadge risk={player.injuryRisk} />
                        </div>
                    </div>
                    <div className="text-right">
                         <p className="text-xs text-brand-subtle">PROJ. PPG</p>
                         <p className="text-2xl font-bold text-green-400">{player.fantasyPointsPerGame2025Projected?.toFixed(2)}</p>
                         <p className="text-xs text-brand-subtle">Total: {player.fantasyPoints2025Projected?.toFixed(1)}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <h4 className="text-sm font-bold text-brand-subtle border-b border-brand-border pb-1 mb-2">2025 Projections</h4>
                        <PlayerStatsDisplay stats={player.stats2025Projected} position={player.position} />
                    </div>
                     <div>
                         <button onClick={() => setShow2024Stats(!show2024Stats)} className="w-full text-left text-sm font-bold text-brand-subtle border-b border-brand-border pb-1 mb-2 flex justify-between items-center hover:text-brand-text transition-colors">
                            <span>2024 Performance</span>
                             <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${show2024Stats ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {show2024Stats && (
                            <div className="space-y-1 mt-2 animate-fade-in">
                                <StatDisplay label="Fantasy PPG" value={player.fantasyPointsPerGame2024?.toFixed(2)} />
                                <StatDisplay label="Total Pts" value={player.fantasyPoints2024?.toFixed(2)} />
                                <PlayerStatsDisplay stats={player.stats2024} position={player.position} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={() => onDraft(player.id)}
                className="mt-4 w-full bg-brand-accent text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
            >
                Draft Player
            </button>
        </div>
    );
};

export default PlayerCard;