export enum Position {
    QB = 'QB',
    RB = 'RB',
    WR = 'WR',
    TE = 'TE',
    K = 'K',
    DST = 'DST',
}

export interface Stats {
    passingYards?: number;
    passingTds?: number;
    interceptions?: number;
    rushingYards?: number;
    rushingTds?: number;
    receptions?: number;
    receivingYards?: number;
    receivingTds?: number;
    fumblesLost?: number;
    // For Kicker
    fieldGoalsMade0to39?: number;
    fieldGoalsMade40to49?: number;
    fieldGoalsMade50plus?: number;
    extraPointsMade?: number;
    // For DST
    sacks?: number;
    defensiveInterceptions?: number;

    fumblesRecovered?: number;
    safeties?: number;
    defensiveTds?: number;
    pointsAllowed?: number;
    blockedKicks?: number;
}

export interface Player {
    id: number;
    name: string;
    position: Position;
    team: string;
    byeWeek: number;
    tier: number;
    archetype: string;
    injuryRisk: 'Low' | 'Medium' | 'High';
    strengthOfSchedule: number; // Rank from 1 (easiest) to 32 (hardest)
    adp?: number;
    espnRank?: number;
    opportunityShare: 'High' | 'Medium' | 'Low';
    stats2023: Stats;
    gamesPlayed2023: number;
    stats2024Projected?: Stats;
    gamesPlayed2024Projected?: number;
    fantasyPoints2023?: number;
    fantasyPointsPerGame2023?: number;
    fantasyPoints2024Projected?: number;
    fantasyPointsPerGame2024Projected?: number;
    drafted: boolean;
    draftPick?: number;
    teamNumber?: number;
    draftGrade?: string;
    projectionRank?: number;
    notes?: string;
}

export interface AIRecommendation {
  name: string;
  reasoning: string;
}

export interface AIAnalysis {
  primary: AIRecommendation;
  alternatives: AIRecommendation[];
  predictions: string[];
  positionalAnalysis: Record<string, number>;
  strategicNarrative: string;
}

export interface PositionalAdvantage {
  position: Position | string;
  yourPPG: number;
  leagueAveragePPG: number;
  rank: number;
}

export interface TeamAnalysis {
  grade: string;
  title: string;
  summary: string;
  insights: string[];
  archetypeCounts: Record<string, number>;
}

export interface AnalyticsData {
  teamAnalysis: TeamAnalysis;
  positionalAdvantages: PositionalAdvantage[];
}

export interface PlayerOutlook {
  summary: string;
  upside: string;
  downside: string;
  verdict: string;
  riskRewardScore: number;
  expertConsensus: string;
}