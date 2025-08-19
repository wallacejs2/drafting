import React from 'react';
import type { Player } from '../types';

interface MyTeamProps {
    players: Player[];
    totalTeams: number;
}

const MyTeam: React.FC<MyTeamProps> = ({ players, totalTeams }) => {
    const sortedPlayers = [...players].sort((a, b) => (a.draftPick ?? 0) - (b.draftPick ?? 0));

    const getRoundAndPick = (pick: number) => {
        const round = Math.floor((pick - 1) / totalTeams) + 1;
        const pickInRound = ((pick - 1) % totalTeams) + 1;
        return `R${round}.${pickInRound}`;
    }

    return (
        <div className="bg-brand-secondary border border-brand-border rounded-lg p-4 animate-fade-in">
            <h2 className="text-xl font-bold text-brand-text mb-3">My Team</h2>
            <div className="space-y-2">
                {sortedPlayers.length > 0 ? (
                    sortedPlayers.map(player => (
                        <div key={player.id} className="flex items-center justify-between p-2 rounded-md bg-brand-primary">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-brand-subtle text-sm w-10 text-center">{getRoundAndPick(player.draftPick!)}</span>
                                <div>
                                    <p className="font-semibold text-brand-text leading-tight">{player.name}</p>
                                    <p className="text-xs text-brand-subtle">{player.position} - {player.team}</p>
                                </div>
                            </div>
                            <span className="font-bold text-green-400 text-lg">{player.fantasyPointsPerGame2025Projected?.toFixed(1)}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-brand-subtle text-sm py-4">You haven't drafted any players yet.</p>
                )}
            </div>
        </div>
    );
};

export default MyTeam;
