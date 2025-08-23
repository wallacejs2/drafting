import React from 'react';
import type { Player } from '../types';
import { Position } from '../types';

interface MyTeamProps {
    players: Player[];
    totalTeams: number;
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

const MyTeam: React.FC<MyTeamProps> = ({ players, totalTeams }) => {
    const sortedPlayers = [...players].sort((a, b) => (a.draftPick ?? 0) - (b.draftPick ?? 0));
    
    const byeWeekCounts = players.reduce((acc, player) => {
        acc[player.byeWeek] = (acc[player.byeWeek] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);
    const sortedByeWeeks = Object.entries(byeWeekCounts).sort(([a], [b]) => Number(a) - Number(b));


    const getRoundAndPick = (pick: number) => {
        const round = Math.floor((pick - 1) / totalTeams) + 1;
        const pickInRound = ((pick - 1) % totalTeams) + 1;
        return `R${round}.${pickInRound}`;
    }

    return (
        <div className="bg-bg-secondary border border-border-primary rounded-lg p-4 animate-fade-in">
            <h2 className="text-xl font-bold text-text-primary mb-1">My Team</h2>
            {players.length > 0 && (
                 <div className="mb-3 text-xs text-text-secondary flex flex-wrap gap-x-3 gap-y-1 items-center border-b border-border-primary pb-2">
                    <span className="font-bold">Bye Weeks:</span>
                    {sortedByeWeeks.map(([week, count]) => (
                        <span key={week} className={`font-semibold px-1.5 py-0.5 rounded ${count > 2 ? 'text-accent-negative bg-red-900/50' : count > 1 ? 'text-accent-warning bg-yellow-900/50' : 'text-text-secondary'}`}>
                            W{week} ({count})
                        </span>
                    ))}
                </div>
            )}
            <div className="space-y-2">
                {sortedPlayers.length > 0 ? (
                    sortedPlayers.map(player => (
                        <div key={player.id} className="flex items-center justify-between p-2 rounded-md bg-bg-primary">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-text-secondary text-sm w-10 text-center">{getRoundAndPick(player.draftPick!)}</span>
                                <div className={`w-1.5 h-8 rounded-full ${getPositionClass(player.position)}`}></div>
                                <div>
                                    <p className="font-semibold text-text-primary leading-tight">{player.name}</p>
                                    <p className="text-xs text-text-secondary">{player.position} - {player.team} (Bye {player.byeWeek})</p>
                                </div>
                            </div>
                            <span className="font-bold text-accent-positive text-lg">{player.fantasyPointsPerGame2025Projected?.toFixed(1)}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-text-secondary text-sm py-4">You haven't drafted any players yet.</p>
                )}
            </div>
        </div>
    );
};

export default MyTeam;