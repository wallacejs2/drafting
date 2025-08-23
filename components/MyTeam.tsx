import React from 'react';
import type { Player } from '../types';

interface MyTeamProps {
    players: Player[];
    totalTeams: number;
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
        <div className="bg-brand-secondary border border-brand-border rounded-lg p-4 animate-fade-in">
            <h2 className="text-xl font-bold text-brand-text mb-1">My Team</h2>
            {players.length > 0 && (
                 <div className="mb-3 text-xs text-brand-subtle flex flex-wrap gap-x-3 gap-y-1 items-center border-b border-brand-border pb-2">
                    <span className="font-bold">Bye Weeks:</span>
                    {sortedByeWeeks.map(([week, count]) => (
                        <span key={week} className={`font-semibold px-1.5 py-0.5 rounded ${count > 2 ? 'text-red-400 bg-red-900/50' : count > 1 ? 'text-yellow-400 bg-yellow-900/50' : 'text-brand-subtle'}`}>
                            W{week} ({count})
                        </span>
                    ))}
                </div>
            )}
            <div className="space-y-2">
                {sortedPlayers.length > 0 ? (
                    sortedPlayers.map(player => (
                        <div key={player.id} className="flex items-center justify-between p-2 rounded-md bg-brand-primary">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-brand-subtle text-sm w-10 text-center">{getRoundAndPick(player.draftPick!)}</span>
                                <div>
                                    <p className="font-semibold text-brand-text leading-tight">{player.name}</p>
                                    <p className="text-xs text-brand-subtle">{player.position} - {player.team} (Bye {player.byeWeek})</p>
                                </div>
                            </div>
                            <span className="font-bold text-green-400 text-lg">{player.fantasyPointsPerGame2024Projected?.toFixed(1)}</span>
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
