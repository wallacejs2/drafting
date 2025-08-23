import React from 'react';
import type { Player } from '../types';
import { Position } from '../types';

interface TierDropAnalysisProps {
    availablePlayers: Player[];
}

const TierDropAnalysis: React.FC<TierDropAnalysisProps> = ({ availablePlayers }) => {
    const positionsToAnalyze: Position[] = [Position.QB, Position.RB, Position.WR, Position.TE];

    const analysis = positionsToAnalyze.map(pos => {
        const playersInPos = availablePlayers.filter(p => p.position === pos);
        if (playersInPos.length === 0) return null;

        const topTier = playersInPos[0].tier;
        const playersInTier = playersInPos.filter(p => p.tier === topTier);

        if (playersInTier.length <= 2) {
            return {
                position: pos,
                tier: topTier,
                players: playersInTier,
            };
        }
        return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    if (analysis.length === 0) {
        return null;
    }

    return (
        <div>
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Upcoming Tier Drops</h3>
            <div className="space-y-2">
                {analysis.map(({ position, tier, players }) => (
                    <div key={position} className="bg-bg-primary rounded-lg p-3 border border-accent-warning/50">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-accent-warning">{position} - Tier {tier}</h4>
                            <span className="text-xs font-semibold bg-yellow-900/70 text-yellow-300 px-2 py-0.5 rounded-full">{players.length} Left</span>
                        </div>
                        <ul className="text-xs text-text-secondary mt-1 list-disc list-inside">
                            {players.map(p => <li key={p.id}><span className="text-text-primary">{p.name}</span></li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TierDropAnalysis;