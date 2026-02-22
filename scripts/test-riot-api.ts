#!/usr/bin/env node

/**
 * Standalone test script for Riot API integration
 * 
 * This script allows you to test your Riot API setup without running the full Discord bot.
 * 
 * Usage:
 *   npm run build && node dist/test-riot-api.js
 *   npm run build && node dist/test-riot-api.js "Faker" "kr"
 *   npm run build && node dist/test-riot-api.js "Doublelift" "na1" full
 */

import { Logger } from '../src/services/index.js';
import { RiotApiTester } from '../src/utils/riot-api/index.js';

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    
    try {
        if (args.length === 0) {
            // No arguments - run quick test
            Logger.info('No arguments provided. Running quick test with well-known summoners...');
            await RiotApiTester.quickTest();
        } else if (args.length === 1) {
            // One argument - test summoner on default region (NA)
            const summonerName = args[0];
            Logger.info(`Testing summoner: ${summonerName} (NA1)`);
            await RiotApiTester.testSummoner(summonerName, 'na1');
        } else if (args.length === 2) {
            // Two arguments - test summoner on specified region
            const [summonerName, region] = args;
            Logger.info(`Testing summoner: ${summonerName} (${region.toUpperCase()})`);
            await RiotApiTester.testSummoner(summonerName, region);
        } else if (args.length >= 3 && args[2].toLowerCase() === 'full') {
            // Full test suite
            const [summonerName, region] = args;
            await RiotApiTester.runFullTest(summonerName, region);
        } else {
            Logger.error('Invalid arguments. Usage:');
            Logger.error('  node dist/test-riot-api.js                     # Quick test');
            Logger.error('  node dist/test-riot-api.js <summoner>          # Test summoner on NA');
            Logger.error('  node dist/test-riot-api.js <summoner> <region> # Test summoner on region');
            Logger.error('  node dist/test-riot-api.js <summoner> <region> full # Full test suite');
            process.exit(1);
        }
        
        Logger.info('✨ Test completed successfully!');
        process.exit(0);
        
    } catch (error) {
        Logger.error('❌ Test failed:', error);
        
        // Provide helpful error messages
        if (error.message.includes('API key')) {
            Logger.error('');
            Logger.error('💡 To fix this:');
            Logger.error('1. Get a Riot API key from: https://developer.riotgames.com/');
            Logger.error('2. Add it to your config.json file:');
            Logger.error('   "riotApi": { "key": "RGAPI-your-key-here" }');
            Logger.error('');
        }
        
        if (error.message.includes('Invalid region')) {
            Logger.error('');
            Logger.error('💡 Supported regions:');
            Logger.error('NA: na1, EUW: euw1, EUNE: eune1, KR: kr, JP: jp1');
            Logger.error('BR: br1, LAN: la1, LAS: la2, OCE: oc1, TR: tr1, RU: ru');
            Logger.error('PH: ph2, SG: sg2, TH: th2, TW: tw2, VN: vn2');
            Logger.error('');
        }
        
        process.exit(1);
    }
}

// Run the main function
main().catch(error => {
    Logger.error('Unhandled error:', error);
    process.exit(1);
});