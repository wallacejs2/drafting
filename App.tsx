import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Player, AIAnalysis } from './types';
import { INITIAL_PLAYERS, calculateFantasyPoints } from './constants';
import { getProjections, getDraftAnalysis } from './services/geminiService';
import Header from './components/Header';
import PlayerCard from './components/PlayerCard';
import DraftAssistant from './components/DraftAssistant';
import PositionalAnalysis from './components/PositionalAnalysis';
import DraftedPlayers from './components/DraftedPlayers';
import PositionFilter from './components/PositionFilter';
import MyTeam from './components/MyTeam';
import { Position } from './types';

/**
 * Processes a player object to calculate fantasy points for 2024 and 2025.
 * If AI-powered 2025 stats are available, it uses them. Otherwise, it generates
 * a reasonable fallback projection based on 2024 performance and injury risk.
 * This ensures every player has a projection score at all times.
 * @param p The player object.
 * @returns A new player object with all fantasy points calculated.
 */
const processPlayerWithStats = (p: Player): Player => {
    const fantasyPoints2024 = calculateFantasyPoints(p.stats2024, p.position, p.gamesPlayed2024);
    const fantasyPointsPerGame2024 = p.gamesPlayed2024 > 0 ? parseFloat((fantasyPoints2024 / p.gamesPlayed2024).toFixed(2)) : 0;

    let fantasyPoints2025Projected: number;
    let gamesPlayed2025Projected: number;
    let fantasyPointsPerGame2025Projected: number;

    // Use AI-projected stats if they exist
    if (p.stats2025Projected && p.gamesPlayed2025Projected != null) {
        gamesPlayed2025Projected = p.gamesPlayed2025Projected;
        fantasyPoints2025Projected = calculateFantasyPoints(p.stats2025Projected, p.position, gamesPlayed2025Projected);
    } else {
        // Otherwise, create a fallback projection based on 2024 data
        let fallbackProjectedGames = 17;
        if (p.injuryRisk === 'High') fallbackProjectedGames = 14;
        else if (p.injuryRisk === 'Medium') fallbackProjectedGames = 16;
        
        gamesPlayed2025Projected = fallbackProjectedGames;
        
        const gamesPlayedFactor = p.gamesPlayed2024 > 0 ? p.gamesPlayed2024 : 17;
        // For rookies or players with 0 points, provide a sane baseline to avoid a 0 projection
        let basePoints = fantasyPoints2024;
        if (basePoints <= 0) {
            switch(p.position) {
                case Position.QB: basePoints = 250; break;
                case Position.RB: basePoints = 180; break;
                case Position.WR: basePoints = 180; break;
                case Position.TE: basePoints = 100; break;
                default: basePoints = 50;
            }
        }
        fantasyPoints2025Projected = (basePoints / gamesPlayedFactor) * gamesPlayed2025Projected * 0.95;
    }

    fantasyPointsPerGame2025Projected = gamesPlayed2025Projected > 0 ? parseFloat((fantasyPoints2025Projected / gamesPlayed2025Projected).toFixed(2)) : 0;

    return {
        ...p,
        fantasyPoints2024,
        fantasyPointsPerGame2024,
        fantasyPoints2025Projected,
        gamesPlayed2025Projected,
        fantasyPointsPerGame2025Projected,
    };
};


const App: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>(() =>
        // Load instantly with fallback projections. Solves slow loading & provides immediate data.
        INITIAL_PLAYERS.map(processPlayerWithStats)
    );
    const [projectionStatus, setProjectionStatus] = useState<string | null>("Initializing AI projections...");
    const [draftPosition, setDraftPosition] = useState<number>(1);
    const [totalTeams, setTotalTeams] = useState<number>(12);
    const [currentPick, setCurrentPick] = useState<number>(1);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');


    const availablePlayers = useMemo(() =>
        players
            .filter(p => !p.drafted)
            .filter(p => selectedPosition === 'ALL' || p.position === selectedPosition)
            .sort((a, b) => (b.fantasyPointsPerGame2025Projected ?? 0) - (a.fantasyPointsPerGame2025Projected ?? 0)),
    [players, selectedPosition]);
    
    const draftedPlayers = useMemo(() => players.filter(p => p.drafted).sort((a, b) => (a.draftPick ?? 0) - (b.draftPick ?? 0)), [players]);
    const myTeamPlayers = useMemo(() => players.filter(p => p.teamNumber === draftPosition), [players, draftPosition]);
    const projectionsLoaded = useMemo(() => projectionStatus === null, [projectionStatus]);

    const getTeamForPick = useCallback((pick: number, teams: number): number => {
        const round = Math.ceil(pick / teams);
        const pickInRound = (pick - 1) % teams;
        if (round % 2 !== 0) { // Odd rounds, normal order
            return pickInRound + 1;
        } else { // Even rounds, snake order
            return teams - pickInRound;
        }
    }, []);

    useEffect(() => {
        const fetchProjectionsInBatches = async () => {
            let currentPlayers = players;

            const positionGroups = [
                { position: Position.QB, name: "Quarterbacks" },
                { position: Position.RB, name: "Running Backs" },
                { position: Position.WR, name: "Wide Receivers" },
                { position: Position.TE, name: "Tight Ends" },
                { position: Position.K, name: "Kickers" },
                { position: Position.DST, name: "Defenses" },
            ];

            try {
                for (const group of positionGroups) {
                    setProjectionStatus(`Analyzing ${group.name}...`);
                    const playersToProject = INITIAL_PLAYERS.filter(p => p.position === group.position);

                    if (playersToProject.length === 0) continue;

                    // This makes smaller, faster API calls
                    const projectedPlayersFromApi = await getProjections(playersToProject);
                    const playersWithAIStats = projectedPlayersFromApi.map(processPlayerWithStats);
                    
                    // Progressively update the main player list
                    currentPlayers = currentPlayers.map(p => {
                        const updatedPlayer = playersWithAIStats.find(up => up.id === p.id);
                        return updatedPlayer || p;
                    });

                    setPlayers(currentPlayers);
                }
            } catch (error) {
                console.error("Failed to get one or more player projection batches:", error);
                setProjectionStatus("Error fetching some AI projections. Using fallback data.");
                setTimeout(() => setProjectionStatus(null), 5000); // Show error for 5s
                return;
            }

            setProjectionStatus(null); // All done
        };

        fetchProjectionsInBatches();
    }, []); // Runs once on mount

    useEffect(() => {
        const allAvailablePlayers = players.filter(p => !p.drafted).sort((a, b) => (b.fantasyPointsPerGame2025Projected ?? 0) - (a.fantasyPointsPerGame2025Projected ?? 0));
        
        if (allAvailablePlayers.length > 0 && projectionsLoaded) {
            setAiAnalysis(null);
            
            const myPicks = Array.from({ length: players.length }, (_, i) => i + 1)
              .filter(pick => getTeamForPick(pick, totalTeams) === draftPosition);
            
            const myNextPick = myPicks.find(p => p > currentPick) || -1;
            
            const teamsPickingBeforeNext = [];
            if (myNextPick !== -1) {
                for (let i = currentPick + 1; i < myNextPick; i++) {
                    teamsPickingBeforeNext.push(getTeamForPick(i, totalTeams));
                }
            }
            
            getDraftAnalysis(myTeamPlayers, allAvailablePlayers, draftedPlayers, currentPick, myNextPick, teamsPickingBeforeNext)
                .then(analysis => setAiAnalysis(analysis))
                .catch(err => {
                    console.error("Error fetching AI analysis:", err);
                });
        }
    }, [players, currentPick, draftPosition, totalTeams, getTeamForPick, myTeamPlayers, draftedPlayers, projectionsLoaded]);

    const handleDraftPlayer = (playerId: number) => {
        const teamDrafting = getTeamForPick(currentPick, totalTeams);
        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === playerId ? { ...p, drafted: true, draftPick: currentPick, teamNumber: teamDrafting } : p
            )
        );
        setCurrentPick(prev => prev + 1);
    };

    const recommendedPlayer = useMemo(() => {
        if (aiAnalysis?.primary?.name) {
            const foundPlayer = availablePlayers.find(p => p.name === aiAnalysis.primary.name);
            if (foundPlayer) {
                return foundPlayer;
            }
        }
        return availablePlayers.length > 0 ? availablePlayers[0] : null;
    }, [aiAnalysis, availablePlayers]);

    const teamOnTheClock = getTeamForPick(currentPick, totalTeams);

    return (
        <div className="min-h-screen bg-brand-primary">
            <Header 
                currentPick={currentPick}
                totalTeams={totalTeams}
                teamOnTheClock={teamOnTheClock}
                isMyTurn={teamOnTheClock === draftPosition}
                projectionStatus={projectionStatus}
            />
            <main className="container mx-auto p-4 lg:p-6">
                {/* AI Positional Analysis moved to the top for better visibility */}
                <div className="mb-6 bg-brand-secondary border border-brand-border rounded-lg p-4">
                    <PositionalAnalysis analysis={aiAnalysis?.positionalAnalysis} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Column 1: Draft Board (Sticky Left) */}
                     <div className="lg:col-span-3">
                        <div className="lg:sticky lg:top-6 flex flex-col lg:h-[calc(100vh-6rem)]">
                            <DraftedPlayers players={draftedPlayers} />
                        </div>
                    </div>

                    {/* Column 2: Available Players (Scrollable Center) */}
                    <div className="lg:col-span-5">
                        <h2 className="text-3xl font-bold mb-4 text-brand-text">Available Players</h2>
                        <PositionFilter selectedPosition={selectedPosition} onSelectPosition={setSelectedPosition} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                            {availablePlayers.length > 0 ? availablePlayers.map(player => (
                                <PlayerCard 
                                    key={player.id} 
                                    player={player} 
                                    onDraft={handleDraftPlayer}
                                    isRecommended={player.id === recommendedPlayer?.id}
                                 />
                            )) : (
                                 <div className="col-span-full text-center py-16 bg-brand-secondary rounded-lg">
                                    <p className="text-brand-subtle">No players available for position: {selectedPosition}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Column 3: Draft Assistant (Sticky Right) */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-6 space-y-6">
                             <DraftAssistant
                                player={recommendedPlayer}
                                analysis={aiAnalysis}
                                draftPosition={draftPosition}
                                setDraftPosition={setDraftPosition}
                                totalTeams={totalTeams}
                                setTotalTeams={setTotalTeams}
                                currentPick={currentPick}
                                onDraft={handleDraftPlayer}
                                teamOnTheClock={teamOnTheClock}
                            />
                            <MyTeam players={myTeamPlayers} totalTeams={totalTeams} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;