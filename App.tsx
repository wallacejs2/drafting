import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Player, AIAnalysis, AnalyticsData, PositionalAdvantage, PlayerOutlook } from './types';
import { INITIAL_PLAYERS, UPDATED_PLAYER_DATA_SIMULATION, calculateFantasyPoints } from './constants';
import { getDraftAnalysis, getTeamAnalysis, getPlayerOutlook } from './services/geminiService';
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
import Loader from './components/Loader';

const getRiskScore = (risk: Player['injuryRisk']): number => {
    switch (risk) {
        case 'Low': return 100;
        case 'Medium': return 70;
        case 'High': return 40;
        default: return 60;
    }
};

const getSosScore = (sosRank: number): number => {
    return ((32 - sosRank) / 31) * 100;
};

const getOpportunityScore = (share: Player['opportunityShare']): number => {
    switch (share) {
        case 'High': return 100;
        case 'Medium': return 80;
        case 'Low': return 50;
        default: return 75;
    }
};

const getTierScore = (tier: number): number => {
    if (tier <= 1) return 100;
    if (tier === 2) return 95;
    if (tier === 3) return 90;
    if (tier === 4) return 85;
    if (tier === 5) return 80;
    if (tier === 6) return 75;
    return 70;
};

const scoreToGrade = (score: number): string => {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
};

const initializePlayers = (initialPlayers: Player[]): Player[] => {
    let playersWithStats = initialPlayers.map(p => {
        const fantasyPoints2023 = calculateFantasyPoints(p.stats2023, p.position, p.gamesPlayed2023);
        const fantasyPointsPerGame2023 = p.gamesPlayed2023 > 0 ? parseFloat((fantasyPoints2023 / p.gamesPlayed2023).toFixed(2)) : 0;

        let fantasyPoints2024Projected: number;
        let gamesPlayed2024Projected: number;
        let fantasyPointsPerGame2024Projected: number;

        if (p.stats2024Projected && p.gamesPlayed2024Projected != null) {
            gamesPlayed2024Projected = p.gamesPlayed2024Projected;
            fantasyPoints2024Projected = calculateFantasyPoints(p.stats2024Projected, p.position, gamesPlayed2024Projected);
        } else {
            let fallbackProjectedGames = 17;
            if (p.injuryRisk === 'High') fallbackProjectedGames = 14;
            else if (p.injuryRisk === 'Medium') fallbackProjectedGames = 16;
            
            gamesPlayed2024Projected = fallbackProjectedGames;
            
            let basePoints = fantasyPoints2023;
            let gamesPlayedFactor = p.gamesPlayed2023 > 0 ? p.gamesPlayed2023 : 17;

            if (basePoints <= 0) {
                 switch(p.position) {
                    case Position.QB: basePoints = 250; break;
                    case Position.RB: basePoints = 180; break;
                    case Position.WR: basePoints = 180; break;
                    case Position.TE: basePoints = 100; break;
                    case Position.K: basePoints = 120; break;
                    case Position.DST: basePoints = 100; break;
                    default: basePoints = 50;
                }
                gamesPlayedFactor = 17;
            }

            fantasyPoints2024Projected = (basePoints / gamesPlayedFactor) * gamesPlayed2024Projected * 0.95;
        }

        fantasyPointsPerGame2024Projected = gamesPlayed2024Projected > 0 ? parseFloat((fantasyPoints2024Projected / gamesPlayed2024Projected).toFixed(2)) : 0;

        return {
            ...p,
            fantasyPoints2023,
            fantasyPointsPerGame2023,
            fantasyPoints2024Projected,
            gamesPlayed2024Projected,
            fantasyPointsPerGame2024Projected,
        };
    });

    const playersSortedByProjection = [...playersWithStats]
        .sort((a, b) => (b.fantasyPointsPerGame2024Projected ?? 0) - (a.fantasyPointsPerGame2024Projected ?? 0));

    playersWithStats = playersWithStats.map(p => ({
        ...p,
        projectionRank: playersSortedByProjection.findIndex(sortedP => sortedP.id === p.id) + 1,
    }));

    const maxPpgByPosition = playersWithStats.reduce((acc, player) => {
        const ppg = player.fantasyPointsPerGame2024Projected ?? 0;
        if (!acc[player.position] || ppg > acc[player.position]) {
            acc[player.position] = ppg;
        }
        return acc;
    }, {} as Record<string, number>);

    const playersWithGrades = playersWithStats.map(player => {
        const { fantasyPointsPerGame2024Projected, position, adp, projectionRank, injuryRisk, strengthOfSchedule, opportunityShare, tier } = player;

        if (position === Position.K || position === Position.DST || !projectionRank) {
            return { ...player, draftGrade: 'N/A' };
        }

        const maxPpg = maxPpgByPosition[position] ?? 1;
        const ppg = fantasyPointsPerGame2024Projected ?? 0;
        const pointsScore = (ppg / maxPpg) * 100;

        const valueDiff = (adp ?? 200) - projectionRank;
        const valueScore = Math.min(100, Math.max(0, 50 + valueDiff * 2));
        
        const tierScore = getTierScore(tier);
        const riskScore = getRiskScore(injuryRisk);
        const sosScore = getSosScore(strengthOfSchedule);
        const opportunityScore = getOpportunityScore(opportunityShare);

        const overallScore =
            (pointsScore * 0.30) +      // Raw projection
            (valueScore * 0.20) +       // Value vs ADP
            (tierScore * 0.20) +        // Expert tier
            (riskScore * 0.10) +        // Injury risk
            (sosScore * 0.10) +         // Schedule
            (opportunityScore * 0.10);  // Volume/Usage
        
        const draftGrade = scoreToGrade(overallScore);

        return { ...player, draftGrade };
    });

    return playersWithGrades;
};

const App: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>(() => initializePlayers(INITIAL_PLAYERS));
    const [draftPosition, setDraftPosition] = useState<number>(1);
    const [totalTeams, setTotalTeams] = useState<number>(12);
    const [currentPick, setCurrentPick] = useState<number>(1);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'draft' | 'analytics'>('draft');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isPlayerWorkstationOpen, setIsPlayerWorkstationOpen] = useState(false);
    const [selectedPlayerForAnalysis, setSelectedPlayerForAnalysis] = useState<Player | null>(null);
    const [playerOutlook, setPlayerOutlook] = useState<PlayerOutlook | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const availablePlayers = useMemo(() =>
        players
            .filter(p => !p.drafted)
            .filter(p => selectedPosition === 'ALL' || p.position === selectedPosition)
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => (a.adp ?? 999) - (b.adp ?? 999)),
    [players, selectedPosition, searchQuery]);
    
    const draftedPlayers = useMemo(() => players.filter(p => p.drafted).sort((a, b) => (a.draftPick ?? 0) - (b.draftPick ?? 0)), [players]);
    const myTeamPlayers = useMemo(() => players.filter(p => p.teamNumber === draftPosition), [players, draftPosition]);
    
    const getTeamForPick = useCallback((pick: number, teams: number): number => {
        const round = Math.ceil(pick / teams);
        const pickInRound = (pick - 1) % teams;
        if (round % 2 !== 0) { 
            return pickInRound + 1;
        } else {
            return teams - pickInRound;
        }
    }, []);

    useEffect(() => {
        setAiAnalysis(null);

        const handler = setTimeout(() => {
            const allAvailablePlayers = players
                .filter(p => !p.drafted)
                .sort((a, b) => (a.adp ?? 999) - (b.adp ?? 999));
            
            if (allAvailablePlayers.length > 0) {
                const myPicks = Array.from({ length: players.length }, (_, i) => i + 1)
                .filter(pick => getTeamForPick(pick, totalTeams) === draftPosition);
                
                const myNextPick = myPicks.find(p => p > currentPick) || -1;
                
                const teamsPickingBeforeNext = [];
                if (myNextPick !== -1) {
                    for (let i = currentPick + 1; i < myNextPick; i++) {
                        teamsPickingBeforeNext.push(getTeamForPick(i, totalTeams));
                    }
                }
                
                const analysis = getDraftAnalysis(myTeamPlayers, allAvailablePlayers, draftedPlayers, currentPick, myNextPick, teamsPickingBeforeNext);
                setAiAnalysis(analysis);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [players, currentPick, draftPosition, totalTeams, getTeamForPick, myTeamPlayers, draftedPlayers]);
    
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

    const handleSyncData = useCallback(() => {
        setIsSyncing(true);
        // Simulate network delay for fetching data
        setTimeout(() => {
            const currentPlayers = INITIAL_PLAYERS; // Start from a clean slate to merge
    
            const updatedDataMap = new Map(
                UPDATED_PLAYER_DATA_SIMULATION.map(p => [p.id, p])
            );
    
            const mergedPlayers = currentPlayers.map(player => {
                if (updatedDataMap.has(player.id)) {
                    const updates = updatedDataMap.get(player.id);
                    return { ...player, ...updates };
                }
                return player;
            });
    
            const reinitializedPlayers = initializePlayers(mergedPlayers);
            setPlayers(reinitializedPlayers);
            setIsSyncing(false);
            // Reset draft progress after a full sync
            setCurrentPick(1); 
        }, 2500);
    }, []);

    const handleAnalyzeTeam = useCallback(() => {
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
                    teamData[player.position] += player.fantasyPointsPerGame2024Projected ?? 0;
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
        
        const teamAnalysis = getTeamAnalysis(myTeamPlayers, positionalAdvantages, totalTeams);

        setAnalyticsData({ teamAnalysis, positionalAdvantages });
        setViewMode('analytics');
    }, [players, totalTeams, draftPosition, myTeamPlayers]);

    const handleSelectPlayerForAnalysis = useCallback((playerId: number) => {
        const player = players.find(p => p.id === playerId);
        if (!player) return;
        
        setSelectedPlayerForAnalysis(player);
        setPlayerOutlook(null);
        setIsPlayerWorkstationOpen(true);
    
        const outlook = getPlayerOutlook(player);
        setPlayerOutlook(outlook);
    }, [players]);

    const recommendedPlayer = useMemo(() => {
        if (aiAnalysis?.primary?.name) {
            return availablePlayers.find(p => p.name === aiAnalysis.primary.name) || (availablePlayers.length > 0 ? availablePlayers[0] : null);
        }
        return availablePlayers.length > 0 ? availablePlayers[0] : null;
    }, [aiAnalysis, availablePlayers]);

    const teamOnTheClock = getTeamForPick(currentPick, totalTeams);

    if (viewMode === 'analytics') {
        return <PerformanceAnalytics analyticsData={analyticsData} onBackToDraft={handleBackToDraft} />;
    }

    return (
        <div className="min-h-screen bg-brand-primary">
            {isSyncing && <Loader message="Syncing latest player data from all sources..." />}
            <Header 
                currentPick={currentPick}
                totalTeams={totalTeams}
                teamOnTheClock={teamOnTheClock}
                isMyTurn={teamOnTheClock === draftPosition}
                onAnalyze={handleAnalyzeTeam}
                canAnalyze={myTeamPlayers.length > 0}
                onSyncData={handleSyncData}
                isSyncing={isSyncing}
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
                                availablePlayers={availablePlayers}
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