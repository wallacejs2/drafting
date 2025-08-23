import React, { useState, useMemo } from 'react';
import type { LeagueHistoryRecord } from '../types';
import { LEAGUE_HISTORY_DATA } from '../data/leagueHistory';

interface LeagueHistoryProps {
    onBackToDraft: () => void;
}

const SortIndicator: React.FC<{ direction: 'ascending' | 'descending' }> = ({ direction }) => {
    return direction === 'ascending' ? <span>&uarr;</span> : <span>&darr;</span>;
};

const LeagueHistory: React.FC<LeagueHistoryProps> = ({ onBackToDraft }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof LeagueHistoryRecord; direction: 'ascending' | 'descending' } | null>({ key: 'final_standing', direction: 'ascending' });

    const sortedHistory = useMemo(() => {
        let sortableItems = [...LEAGUE_HISTORY_DATA];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [sortConfig]);

    const requestSort = (key: keyof LeagueHistoryRecord) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const tableHeaders: { key: keyof LeagueHistoryRecord; label: string; numeric: boolean }[] = [
        { key: 'year', label: 'Year', numeric: true },
        { key: 'owner', label: 'Owner', numeric: false },
        { key: 'team_name', label: 'Team Name', numeric: false },
        { key: 'final_standing', label: 'Rank', numeric: true },
        { key: 'win', label: 'W', numeric: true },
        { key: 'loss', label: 'L', numeric: true },
        { key: 'points_for', label: 'PF', numeric: true },
        { key: 'points_against', label: 'PA', numeric: true },
    ];

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary animate-fade-in">
            <header className="bg-bg-secondary border-b border-border-primary shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                     <h1 className="text-xl md:text-2xl font-bold text-text-primary">League History</h1>
                     <button
                        type="button"
                        onClick={onBackToDraft}
                        className="bg-accent-primary text-white font-bold py-2 px-4 rounded-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-colors duration-200"
                    >
                        &larr; Back to Draft
                    </button>
                </div>
            </header>
            <main className="container mx-auto p-4 lg:p-6">
                <div className="bg-bg-secondary border border-border-primary rounded-lg p-4 overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm text-left">
                        <thead className="border-b-2 border-border-primary text-xs text-text-secondary uppercase">
                            <tr>
                                {tableHeaders.map(({ key, label, numeric }) => (
                                    <th key={key} scope="col" className={`p-3 cursor-pointer hover:bg-bg-primary ${numeric ? 'text-right' : 'text-left'}`} onClick={() => requestSort(key)}>
                                        {label}
                                        {sortConfig?.key === key && <SortIndicator direction={sortConfig.direction} />}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedHistory.map((record, index) => (
                                <tr key={index} className="border-b border-border-primary hover:bg-bg-primary/50">
                                    <td className="p-3 font-medium text-text-primary">{record.year}</td>
                                    <td className="p-3 font-medium text-text-primary capitalize">{record.owner}</td>
                                    <td className="p-3 text-text-secondary">{record.team_name}</td>
                                    <td className="p-3 font-bold text-center text-accent-primary text-base">{record.final_standing}</td>
                                    <td className="p-3 text-right text-accent-positive">{record.win}</td>
                                    <td className="p-3 text-right text-accent-negative">{record.loss}</td>
                                    <td className="p-3 text-right font-semibold text-text-primary">{record.points_for.toFixed(2)}</td>
                                    <td className="p-3 text-right text-text-secondary">{record.points_against.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default LeagueHistory;
