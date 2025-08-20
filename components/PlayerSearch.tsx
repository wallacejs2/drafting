import React from 'react';

interface PlayerSearchProps {
    query: string;
    onQueryChange: (query: string) => void;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({ query, onQueryChange }) => {
    return (
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-brand-subtle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search for a player..."
                className="w-full bg-brand-secondary border border-brand-border rounded-lg py-2 pl-10 pr-4 text-brand-text placeholder-brand-subtle focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Search for a player"
            />
        </div>
    );
};

export default PlayerSearch;
