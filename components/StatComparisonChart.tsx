import React from 'react';
import type { Stats } from '../types';
import { Position } from '../types';

interface StatComparisonChartProps {
    stats2023: Stats;
    stats2024Projected: Stats | undefined;
    position: Position;
}

const Bar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
    const width = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-text-secondary w-8">{label}</span>
            <div className="flex-grow bg-bg-primary rounded-full h-4">
                <div
                    className={`h-4 rounded-full ${color} flex items-center justify-end pr-2 transition-all duration-500 ease-out`}
                    style={{ width: `${width}%` }}
                >
                    <span className="text-xs font-bold text-white mix-blend-difference">{value.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};


const StatGroup: React.FC<{ title: string; value2023: number; value2024: number }> = ({ title, value2023, value2024 }) => {
    const maxValue = Math.max(value2023, value2024, 0) * 1.1;

    return (
        <div>
            <h4 className="text-sm font-semibold text-text-primary mb-2">{title}</h4>
            <div className="space-y-1.5">
                <Bar value={value2023} maxValue={maxValue} color="bg-text-secondary" label="2023" />
                <Bar value={value2024} maxValue={maxValue} color="bg-accent-primary" label="2024" />
            </div>
        </div>
    );
};


const StatComparisonChart: React.FC<StatComparisonChartProps> = ({ stats2023, stats2024Projected, position }) => {
    if (!stats2024Projected) return null;

    const statsToCompare: { title: string; key: keyof Stats }[] = [];

    switch (position) {
        case Position.QB:
            statsToCompare.push({ title: 'Passing Yards', key: 'passingYards' });
            statsToCompare.push({ title: 'Passing TDs', key: 'passingTds' });
            statsToCompare.push({ title: 'Rushing Yards', key: 'rushingYards' });
            break;
        case Position.RB:
            statsToCompare.push({ title: 'Rushing Yards', key: 'rushingYards' });
            statsToCompare.push({ title: 'Rushing TDs', key: 'rushingTds' });
            statsToCompare.push({ title: 'Receptions', key: 'receptions' });
            statsToCompare.push({ title: 'Receiving Yards', key: 'receivingYards' });
            break;
        case Position.WR:
        case Position.TE:
            statsToCompare.push({ title: 'Receptions', key: 'receptions' });
            statsToCompare.push({ title: 'Receiving Yards', key: 'receivingYards' });
            statsToCompare.push({ title: 'Receiving TDs', key: 'receivingTds' });
            break;
        case Position.K:
            statsToCompare.push({ title: 'FG Made (0-39)', key: 'fieldGoalsMade0to39' });
            statsToCompare.push({ title: 'FG Made (40-49)', key: 'fieldGoalsMade40to49' });
            statsToCompare.push({ title: 'FG Made (50+)', key: 'fieldGoalsMade50plus' });
            statsToCompare.push({ title: 'Extra Points', key: 'extraPointsMade' });
            break;
        case Position.DST:
            statsToCompare.push({ title: 'Sacks', key: 'sacks' });
            statsToCompare.push({ title: 'Interceptions', key: 'defensiveInterceptions' });
            statsToCompare.push({ title: 'Defensive TDs', key: 'defensiveTds' });
            break;
        default:
            return null; // Don't show the component if no stats are applicable
    }

    if (statsToCompare.length === 0) {
         return <p className="text-center text-text-secondary text-sm p-4">No detailed stat comparison for this position.</p>;
    }

    return (
        <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Season Comparison Analysis</h2>
            <div className="space-y-6">
                {statsToCompare.map(({ title, key }) => (
                    <StatGroup
                        key={key}
                        title={title}
                        value2023={stats2023[key] as number ?? 0}
                        value2024={stats2024Projected[key] as number ?? 0}
                    />
                ))}
            </div>
        </div>
    );
};

export default StatComparisonChart;