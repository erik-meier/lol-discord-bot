// Riot Games API Response Models
// Based on official Riot API documentation

// Region and Routing Models
export interface RegionConfig {
    platform: string;
    region: string;
    continent: string;
}

export const REGIONS: Record<string, RegionConfig> = {
    'na1': { platform: 'na1', region: 'na1', continent: 'americas' },
    'euw1': { platform: 'euw1', region: 'euw1', continent: 'europe' },
    'eune1': { platform: 'eune1', region: 'eune1', continent: 'europe' },
    'kr': { platform: 'kr', region: 'kr', continent: 'asia' },
    'jp1': { platform: 'jp1', region: 'jp1', continent: 'asia' },
    'br1': { platform: 'br1', region: 'br1', continent: 'americas' },
    'la1': { platform: 'la1', region: 'la1', continent: 'americas' },
    'la2': { platform: 'la2', region: 'la2', continent: 'americas' },
    'oc1': { platform: 'oc1', region: 'oc1', continent: 'sea' },
    'tr1': { platform: 'tr1', region: 'tr1', continent: 'europe' },
    'ru': { platform: 'ru', region: 'ru', continent: 'europe' },
    'ph2': { platform: 'ph2', region: 'ph2', continent: 'sea' },
    'sg2': { platform: 'sg2', region: 'sg2', continent: 'sea' },
    'th2': { platform: 'th2', region: 'th2', continent: 'sea' },
    'tw2': { platform: 'tw2', region: 'tw2', continent: 'sea' },
    'vn2': { platform: 'vn2', region: 'vn2', continent: 'sea' }
};

// Summoner API Models
export interface RiotSummoner {
    accountId: string;
    profileIconId: number;
    revisionDate: number;
    name: string;
    id: string;
    puuid: string;
    summonerLevel: number;
}

// Account API Models  
export interface RiotAccount {
    puuid: string;
    gameName: string;
    tagLine: string;
}

// League API Models
export interface LeagueEntry {
    leagueId: string;
    summonerId: string;
    queueType: QueueType;
    tier: Tier;
    rank: Rank;
    leaguePoints: number;
    wins: number;
    losses: number;
    hotStreak: boolean;
    veteran: boolean;
    freshBlood: boolean;
    inactive: boolean;
    miniSeries?: MiniSeries;
}

export interface MiniSeries {
    target: number;
    wins: number;
    losses: number;
    progress: string;
}

export enum QueueType {
    RANKED_SOLO_5x5 = 'RANKED_SOLO_5x5',
    RANKED_FLEX_SR = 'RANKED_FLEX_SR',
    RANKED_FLEX_TT = 'RANKED_FLEX_TT'
}

export enum Tier {
    IRON = 'IRON',
    BRONZE = 'BRONZE', 
    SILVER = 'SILVER',
    GOLD = 'GOLD',
    PLATINUM = 'PLATINUM',
    EMERALD = 'EMERALD',
    DIAMOND = 'DIAMOND',
    MASTER = 'MASTER',
    GRANDMASTER = 'GRANDMASTER',
    CHALLENGER = 'CHALLENGER'
}

export enum Rank {
    I = 'I',
    II = 'II', 
    III = 'III',
    IV = 'IV'
}

// Champion Mastery API Models
export interface ChampionMastery {
    puuid: string;
    championId: number;
    championLevel: number;
    championPoints: number;
    lastPlayTime: number;
    championPointsSinceLastLevel: number;
    championPointsUntilNextLevel: number;
    markRequiredForNextLevel: number;
    tokensEarned: number;
    championSeasonMilestone: number;
    milestoneGrades?: string[];
}

// Match API Models
export interface Match {
    metadata: MatchMetadata;
    info: MatchInfo;
}

export interface MatchMetadata {
    dataVersion: string;
    matchId: string;
    participants: string[];
}

export interface MatchInfo {
    endOfGameResult: string;
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp: number;
    gameId: number;
    gameMode: string;
    gameName: string;
    gameStartTimestamp: number;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: Participant[];
    platformId: string;
    queueId: number;
    teams: Team[];
    tournamentCode?: string;
}

export interface Participant {
    assists: number;
    baronKills: number;
    bountyLevel: number;
    champExperience: number;
    champLevel: number;
    championId: number;
    championName: string;
    commandPings: number;
    championTransform: number;
    consumablesPurchased: number;
    damageDealtToBuildings: number;
    damageDealtToObjectives: number;
    damageDealtToTurrets: number;
    damageSelfMitigated: number;
    deaths: number;
    detectorWardsPlaced: number;
    doubleKills: number;
    dragonKills: number;
    eligibleForProgression: boolean;
    firstBloodAssist: boolean;
    firstBloodKill: boolean;
    firstTowerAssist: boolean;
    firstTowerKill: boolean;
    gameEndedInEarlySurrender: boolean;
    gameEndedInSurrender: boolean;
    goldEarned: number;
    goldSpent: number;
    individualPosition: string;
    inhibitorKills: number;
    inhibitorTakedowns: number;
    inhibitorsLost: number;
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;
    itemsPurchased: number;
    killingSprees: number;
    kills: number;
    lane: string;
    largestCriticalStrike: number;
    largestKillingSpree: number;
    largestMultiKill: number;
    longestTimeSpentLiving: number;
    magicDamageDealt: number;
    magicDamageDealtToChampions: number;
    magicDamageTaken: number;
    neutralMinionsKilled: number;
    nexusKills: number;
    nexusLost: number;
    nexusTakedowns: number;
    objectivesStolen: number;
    objectivesStolenAssists: number;
    participantId: number;
    pentaKills: number;
    perks: Perks;
    physicalDamageDealt: number;
    physicalDamageDealtToChampions: number;
    physicalDamageTaken: number;
    placement: number;
    playerAugment1: number;
    playerAugment2: number;
    playerAugment3: number;
    playerAugment4: number;
    playerSubteamId: number;
    puuid: string;
    quadraKills: number;
    riotIdGameName: string;
    riotIdTagline: string;
    role: string;
    sightWardsBoughtInGame: number;
    spell1Casts: number;
    spell2Casts: number;
    spell3Casts: number;
    spell4Casts: number;
    subteamPlacement: number;
    summoner1Casts: number;
    summoner1Id: number;
    summoner2Casts: number;
    summoner2Id: number;
    summonerId: string;
    summonerLevel: number;
    summonerName: string;
    teamEarlySurrendered: boolean;
    teamId: number;
    teamPosition: string;
    timeCCingOthers: number;
    timePlayed: number;
    totalDamageDealt: number;
    totalDamageDealtToChampions: number;
    totalDamageShieldedOnTeammates: number;
    totalDamageTaken: number;
    totalHeal: number;
    totalHealsOnTeammates: number;
    totalMinionsKilled: number;
    totalTimeCCDealt: number;
    totalTimeSpentDead: number;
    totalUnitsHealed: number;
    tripleKills: number;
    trueDamageDealt: number;
    trueDamageDealtToChampions: number;
    trueDamageTaken: number;
    turretKills: number;
    turretTakedowns: number;
    turretsLost: number;
    unrealKills: number;
    visionScore: number;
    visionWardsBoughtInGame: number;
    wardsKilled: number;
    wardsPlaced: number;
    win: boolean;
}

export interface Perks {
    statPerks: StatPerks;
    styles: PerkStyle[];
}

export interface StatPerks {
    defense: number;
    flex: number;
    offense: number;
}

export interface PerkStyle {
    description: string;
    selections: PerkStyleSelection[];
    style: number;
}

export interface PerkStyleSelection {
    perk: number;
    var1: number;
    var2: number;
    var3: number;
}

export interface Team {
    bans: Ban[];
    objectives: Objectives;
    teamId: number;
    win: boolean;
}

export interface Ban {
    championId: number;
    pickTurn: number;
}

export interface Objectives {
    baron: ObjectiveTeamStat;
    champion: ObjectiveTeamStat;
    dragon: ObjectiveTeamStat;
    horde: ObjectiveTeamStat;
    inhibitor: ObjectiveTeamStat;
    riftHerald: ObjectiveTeamStat;
    tower: ObjectiveTeamStat;
}

export interface ObjectiveTeamStat {
    first: boolean;
    kills: number;
}

// API Error Models
export interface RiotApiError {
    status: {
        message: string;
        status_code: number;
    };
}

// Cache Models
export interface CachedData<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

// Utility Types
export type SummonerLookupParams = {
    summonerName: string;
    region: string;
};

export type MatchHistoryParams = {
    puuid: string;
    region: string;
    start?: number;
    count?: number;
    queue?: number;
    type?: string;
    startTime?: number;
    endTime?: number;
};