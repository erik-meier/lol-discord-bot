export interface BotSite {
    name: string;
    enabled: boolean;
    url: string;
    authorization: string;
    body: string;
}

export interface RiotApiConfig {
    key: string;
    defaultRegion: string;
    baseUrls: {
        americas: string;
        asia: string;
        europe: string;
        sea: string;
    };
    rateLimits: {
        personalKey: {
            perSecond: number;
            per2Minutes: number;
        };
        productionKey: {
            perSecond: number;
            per10Minutes: number;
        };
    };
    cache: {
        enabled: boolean;
        summonerTtl: number;
        rankedTtl: number;
        matchesTtl: number;
        championMasteryTtl: number;
    };
}
