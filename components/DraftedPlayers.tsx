import React from 'react';
import type { Player } from '../types';

interface DraftedPlayersProps {
    players: Player[];
}

const DraftedPlayers: React.FC<DraftedPlayersProps> = ({ players }) => {
    const sortedPlayers = [...players].sort((a, b) => a.draftPick! - b.draftPick!);

    return (
        <div className="bg-brand-secondary border border-brand-border rounded-lg p-4 flex flex-col flex-grow min-h-0">
            <h2 className="text-xl font-bold text-brand-text mb-3 flex-shrink-0">Draft Feed</h2>
            <div className="flex-grow space-y-2 overflow-y-auto pr-2 -mr-2">
                {sortedPlayers.length > 0 ? (
                    sortedPlayers.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 rounded-md bg-brand-primary animate-fade-in">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-brand-subtle text-center w-6">{player.draftPick}</span>
                                <div>
                                    <p className="font-semibold text-brand-text leading-tight">{player.name}</p>
                                    <p className="text-xs text-brand-subtle">{player.position} - {player.team} <span className="font-semibold">(T{player.teamNumber})</span></p>
                                </div>
                            </div>
                            <span className="font-bold text-green-400 text-lg">{player.fantasyPointsPerGame2025Projected?.toFixed(1)}</span>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                         <p className="text-center text-brand-subtle text-sm py-4">The draft has not started yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DraftedPlayers;