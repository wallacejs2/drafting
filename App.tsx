import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Player, AIAnalysis, AnalyticsData, PositionalAdvantage, PlayerOutlook } from './types';
import { INITIAL_PLAYERS, calculateFantasyPoints } from './constants';
import { getProjections, getDraftAnalysis, getTeamAnalysis, getPlayerOutlook } from './services/geminiService';
import Header from './components/Header';
import PlayerCard from './components/PlayerCard';
import DraftAssistant from './components/DraftAssistant';
import PositionalAnalysis from './components/PositionalAnalysis';
import DraftedPlayers from './components/DraftedPlayers';
import PositionFilter from './components/PositionFilter';
import MyTeam from './components/MyTeam';
import { Position } from './types';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import PlayerAnalyticsWorkstation from './components/PlayerAnalyticsWorkstation';
import PlayerSearch from './components/PlayerSearch';

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
        INITIAL_PLAYERS.map(processPlayerWithStats)
    );
    const [projectionStatus, setProjectionStatus] = useState<string | null>("Initializing AI projections...");
    const [draftPosition, setDraftPosition] = useState<number>(1);
    const [totalTeams, setTotalTeams] = useState<number>(12);
    const [currentPick, setCurrentPick] = useState<number>(1);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'draft' | 'analytics'>('draft');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPlayerWorkstationOpen, setIsPlayerWorkstationOpen] = useState(false);
    const [selectedPlayerForAnalysis, setSelectedPlayerForAnalysis] = useState<Player | null>(null);
    const [playerOutlook, setPlayerOutlook] = useState<PlayerOutlook | null>(null);

    const projectionsLoaded = useMemo(() => projectionStatus === null, [projectionStatus]);

    const availablePlayers = useMemo(() =>
        players
            .filter(p => !p.drafted)
            .filter(p => selectedPosition === 'ALL' || p.position === selectedPosition)
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                 if (projectionsLoaded) {
                    return (b.fantasyPointsPerGame2025Projected ?? 0) - (a.fantasyPointsPerGame2025Projected ?? 0);
                }
                // Before projections are loaded, sort by ADP (lower is better).
                return (a.adp ?? 999) - (b.adp ?? 999);
            }),
    [players, selectedPosition, searchQuery, projectionsLoaded]);
    
    const draftedPlayers = useMemo(() => players.filter(p => p.drafted).sort((a, b) => (a.draftPick ?? 0) - (b.draftPick ?? 0)), [players]);
    const myTeamPlayers = useMemo(() => players.filter(p => p.teamNumber === draftPosition), [players, draftPosition]);
    
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

                    const projectedPlayersFromApi = await getProjections(playersToProject);
                    const playersWithAIStats = projectedPlayersFromApi.map(processPlayerWithStats);
                    
                    setPlayers(prevPlayers => prevPlayers.map(p => {
                        const updatedPlayer = playersWithAIStats.find(up => up.id === p.id);
                        return updatedPlayer || p;
                    }));
                }
            } catch (error) {
                console.error("Failed to get one or more player projection batches:", error);
                setProjectionStatus("Error fetching some AI projections. Using fallback data.");
                setTimeout(() => setProjectionStatus(null), 5000);
                return;
            }

            setProjectionStatus(null);
        };

        fetchProjectionsInBatches();
    }, []);

    useEffect(() => {
        setAiAnalysis(null);

        const handler = setTimeout(() => {
            const allAvailablePlayers = players
                .filter(p => !p.drafted)
                .sort((a, b) => (b.fantasyPointsPerGame2025Projected ?? 0) - (a.fantasyPointsPerGame2025Projected ?? 0));
            
            if (allAvailablePlayers.length > 0 && projectionsLoaded) {
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
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [players, currentPick, draftPosition, totalTeams, getTeamForPick, myTeamPlayers, draftedPlayers, projectionsLoaded]);
    
    useEffect(() => {
        if (isPlayerWorkstationOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isPlayerWorkstationOpen]);

    const handleDraftPlayer = useCallback((playerId: number) => {
        const teamDrafting = getTeamForPick(currentPick, totalTeams);
        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === playerId ? { ...p, drafted: true, draftPick: currentPick, teamNumber: teamDrafting } : p
            )
        );
        setCurrentPick(prev => prev + 1);
    }, [currentPick, totalTeams, getTeamForPick]);

    const handleBackToDraft = () => {
        setViewMode('draft');
    };
    
    const handleCloseWorkstation = () => {
        setIsPlayerWorkstationOpen(false);
    };

    const handleAnalyzeTeam = useCallback(async () => {
        setIsAnalyzing(true);
        const allDraftedPlayers = players.filter(p => p.drafted);
        const positionsToAnalyze: Position[] = [Position.QB, Position.RB, Position.WR, Position.TE];

        const teamsData = new Map<number, Record<string, number>>();
        for (let i = 1; i <= totalTeams; i++) {
            teamsData.set(i, { QB: 0, RB: 0, WR: 0, TE: 0 });
        }

        for (const player of allDraftedPlayers) {
            if (player.teamNumber && positionsToAnalyze.includes(player.position)) {
                const teamData = teamsData.get(player.teamNumber);
                if (teamData) {
                    teamData[player.position] += player.fantasyPointsPerGame2025Projected ?? 0;
                }
            }
        }
        
        const leagueAveragePPG: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0 };
        for (const teamData of teamsData.values()) {
            for (const pos of positionsToAnalyze) {
                leagueAveragePPG[pos] += teamData[pos];
            }
        }
        for (const pos of positionsToAnalyze) {
            leagueAveragePPG[pos] /= totalTeams;
        }

        const myTeamPPG = teamsData.get(draftPosition) ?? { QB: 0, RB: 0, WR: 0, TE: 0 };
        const positionalAdvantages: PositionalAdvantage[] = [];

        for (const pos of positionsToAnalyze) {
            const allTeamScoresForPos = Array.from(teamsData.values()).map(data => data[pos]);
            allTeamScoresForPos.sort((a, b) => b - a);
            const myRank = allTeamScoresForPos.indexOf(myTeamPPG[pos]) + 1;
            
            positionalAdvantages.push({
                position: pos,
                yourPPG: myTeamPPG[pos],
                leagueAveragePPG: leagueAveragePPG[pos],
                rank: myRank,
            });
        }
        
        const teamAnalysis = await getTeamAnalysis(myTeamPlayers, positionalAdvantages, totalTeams);

        setAnalyticsData({ teamAnalysis, positionalAdvantages });
        setViewMode('analytics');
        setIsAnalyzing(false);
    }, [players, totalTeams, draftPosition, myTeamPlayers]);

    const handleSelectPlayerForAnalysis = useCallback(async (playerId: number) => {
        const player = players.find(p => p.id === playerId);
        if (!player) {
            console.error("Player not found for analysis");
            return;
        }
        
        setSelectedPlayerForAnalysis(player);
        setPlayerOutlook(null); // Clear previous outlook while fetching new one
        setIsPlayerWorkstationOpen(true);
    
        try {
            const outlook = await getPlayerOutlook(player);
            setPlayerOutlook(outlook);
        } catch (error) {
            console.error("Failed to get player outlook:", error);
            // The service has a fallback, so outlook will still be a valid object
        }
    }, [players]);

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

    if (viewMode === 'analytics') {
        return <PerformanceAnalytics analyticsData={analyticsData} onBackToDraft={handleBackToDraft} />;
    }

    return (
        <div className="min-h-screen bg-brand-primary">
            <Header 
                currentPick={currentPick}
                totalTeams={totalTeams}
                teamOnTheClock={teamOnTheClock}
                isMyTurn={teamOnTheClock === draftPosition}
                projectionStatus={projectionStatus}
                onAnalyze={handleAnalyzeTeam}
                isAnalyzing={isAnalyzing}
                canAnalyze={myTeamPlayers.length > 0}
            />
            <main className="container mx-auto p-4 lg:p-6">
                <div className="mb-6 bg-brand-secondary border border-brand-border rounded-lg p-4">
                    <PositionalAnalysis analysis={aiAnalysis?.positionalAnalysis} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                     <div className="lg:col-span-3">
                        <div className="lg:sticky lg:top-6 flex flex-col lg:h-[calc(100vh-6rem)]">
                            <DraftedPlayers players={draftedPlayers} />
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <h2 className="text-3xl font-bold mb-4 text-brand-text">Available Players</h2>
                        <PlayerSearch query={searchQuery} onQueryChange={setSearchQuery} />
                        <PositionFilter selectedPosition={selectedPosition} onSelectPosition={setSelectedPosition} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {availablePlayers.length > 0 ? availablePlayers.map(player => (
                                <PlayerCard 
                                    key={player.id} 
                                    player={player} 
                                    onDraft={handleDraftPlayer}
                                    isRecommended={player.id === recommendedPlayer?.id}
                                    onAnalyzePlayer={handleSelectPlayerForAnalysis}
                                 />
                            )) : (
                                 <div className="col-span-full text-center py-16 bg-brand-secondary rounded-lg">
                                    <p className="text-brand-subtle">No players found matching "{searchQuery}" for position: {selectedPosition}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
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
            
            {isPlayerWorkstationOpen && (
                 <PlayerAnalyticsWorkstation 
                    player={selectedPlayerForAnalysis}
                    outlook={playerOutlook}
                    onClose={handleCloseWorkstation}
                />
            )}
        </div>
    );
};

export default App;