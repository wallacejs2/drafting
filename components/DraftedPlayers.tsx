import React from 'react';
import type { Player } from '../types';

interface DraftBoardProps {
    players: Player[];
    totalTeams: number;
    currentPick: number;
}

const DraftedPlayers: React.FC<DraftBoardProps> = ({ players, totalTeams, currentPick }) => {
    const draftedPlayerMap = new Map(players.filter(p => p.draftPick).map(p => [p.draftPick, p]));
    const totalRounds = 15; // Standard draft length

    const renderBoard = () => {
        const rounds = [];
        for (let round = 1; round <= totalRounds; round++) {
            const picksInRound = [];
            const isOddRound = round % 2 !== 0;

            for (let teamIndex = 1; teamIndex <= totalTeams; teamIndex++) {
                const team = isOddRound ? teamIndex : totalTeams - teamIndex + 1;
                const pickNumber = (round - 1) * totalTeams + teamIndex;
                const player = draftedPlayerMap.get(pickNumber);
                
                const isCurrentPick = pickNumber === currentPick;
                const pickClasses = `
                    text-center p-1 border-b border-r border-brand-border
                    ${isCurrentPick ? 'bg-green-500/20 ring-2 ring-green-400 animate-pulse' : ''}
                    ${round % 2 === 0 ? 'bg-brand-primary/30' : ''}
                `;

                picksInRound.push(
                    <div key={pickNumber} className={pickClasses}>
                        <div className="text-[10px] text-brand-subtle">{round}.{team.toString().padStart(2, '0')}</div>
                        {player ? (
                            <div className="text-xs font-semibold text-brand-text truncate" title={player.name}>
                                {player.name}
                                <span className="text-brand-accent block text-[10px]">{player.position}</span>
                            </div>
                        ) : (
                            <div className="h-7"></div>
                        )}
                    </div>
                );
            }
            rounds.push(
                 <div key={round} className="grid" style={{ gridTemplateColumns: `repeat(${totalTeams}, minmax(0, 1fr))`}}>
                    {picksInRound}
                </div>
            );
        }
        return rounds;
    };
    
    return (
        <div className="bg-brand-secondary border border-brand-border rounded-lg p-4 flex flex-col flex-grow min-h-0">
            <h2 className="text-xl font-bold text-brand-text mb-3 flex-shrink-0">Draft Board</h2>
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                 <div className="sticky top-0 bg-brand-secondary z-10 grid" style={{ gridTemplateColumns: `repeat(${totalTeams}, minmax(0, 1fr))` }}>
                    {Array.from({ length: totalTeams }, (_, i) => i + 1).map(teamNum => (
                        <div key={teamNum} className="text-center font-bold text-sm text-brand-subtle p-2 border-b-2 border-r border-brand-border">
                            T{teamNum}
                        </div>
                    ))}
                </div>
                {renderBoard()}
            </div>
        </div>
    );
};

export default DraftedPlayers;