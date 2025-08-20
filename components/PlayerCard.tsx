
import React from 'react';
import type { Player } from '../types';
import { Position } from '../types';

interface PlayerCardProps {
    player: Player;
    onDraft: (playerId: number) => void;
    onAnalyzePlayer: (playerId: number) => void;
    isRecommended?: boolean;
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

const CompactStat: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-xs text-brand-subtle">{label}</p>
        <p className="text-sm font-bold text-brand-text">{value ?? '-'}</p>
    </div>
);


const PlayerCard: React.FC<PlayerCardProps> = ({ player, onDraft, onAnalyzePlayer, isRecommended = false }) => {
    const recommendedClass = isRecommended ? 'animate-glow' : '';

    const renderStats = () => {
        const stats = player.stats2025Projected;
        if (!stats || Object.keys(stats).length === 0) {
            // Return a placeholder to maintain card height consistency
            return <div className="h-[42px] border-t border-brand-border mt-2"></div>;
        }

        let statItems: React.ReactNode[] = [];

        switch (player.position) {
            case Position.QB:
                statItems = [
                    <CompactStat key="py" label="P.YDS" value={stats.passingYards} />,
                    <CompactStat key="ptd" label="P.TDS" value={stats.passingTds} />,
                    <CompactStat key="ruy" label="R.YDS" value={stats.rushingYards} />,
                ];
                break;
            case Position.RB:
                statItems = [
                    <CompactStat key="ruy" label="R.YDS" value={stats.rushingYards} />,
                    <CompactStat key="rec" label="REC" value={stats.receptions} />,
                    <CompactStat key="retd" label="R.TDS" value={stats.rushingTds} />,
                ];
                break;
            case Position.WR:
            case Position.TE:
                statItems = [
                    <CompactStat key="rec" label="REC" value={stats.receptions} />,
                    <CompactStat key="rey" label="R.YDS" value={stats.receivingYards} />,
                    <CompactStat key="retd" label="R.TDS" value={stats.receivingTds} />,
                ];
                break;
            default:
                // Return a placeholder for positions like K and DST
                return <div className="h-[42px] border-t border-brand-border mt-2"></div>;
        }

        return (
            <div className="grid grid-cols-3 gap-1 text-center mt-2 border-t border-brand-border pt-2">
                {statItems}
            </div>
        );
    };

    return (
        <div className={`bg-brand-secondary border border-brand-border rounded-lg shadow-lg p-3 flex flex-col justify-between transition-all duration-300 hover:border-brand-accent ${recommendedClass}`}>
            <div>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-grow min-w-0">
                        <h3 className="text-base font-bold text-brand-text leading-tight truncate" title={player.name}>{player.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-xs font-semibold text-brand-accent">{player.position} - {player.team}</p>
                             {player.adp && <p className="text-xs font-mono bg-brand-primary px-1.5 py-0.5 rounded text-brand-subtle">ADP {player.adp}</p>}
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                         <p className="text-xs text-brand-subtle">PPG</p>
                         <p className="text-lg font-bold text-green-400">{player.fantasyPointsPerGame2025Projected?.toFixed(1)}</p>
                    </div>
                </div>
                <div className="flex justify-start mb-1">
                     <InjuryRiskBadge risk={player.injuryRisk} />
                </div>
                
                {renderStats()}
            </div>

            <div className="mt-3 flex items-stretch gap-2">
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