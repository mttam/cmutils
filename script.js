
/**
 * Compute averages per position (role code) for a players object and return a map
 * Includes these stats per position:
 *  - nationality (most common), overall, potential, contractEnd (average date), skills,
 *    weakFoot, foot (most common), totalStats, value, wage, appearances, goals,
 *    assists, cleanSheets, yellowCards, redCards, avgRating
 * Returns an object: { POS: { nationality: 'ENG', overall: x, ... }, ... }
 */
function computePositionAverages(players) {
    const sums = {};
    const counts = {};
    const nationalityCounts = {};
    const footCounts = {};
    const contractSums = {};
    const contractCounts = {};

    Object.values(players).forEach(p => {
        const pos = p.role || 'Unknown';
        if (!sums[pos]) {
            sums[pos] = {
                nationality: {},
                overall: 0,
                potential: 0,
                skills: 0,
                weakFoot: 0,
                totalStats: 0,
                value: 0,
                wage: 0,
                appearances: 0,
                goals: 0,
                assists: 0,
                cleanSheets: 0,
                yellowCards: 0,
                redCards: 0,
                avgRating: 0
            };
            counts[pos] = 0;
            nationalityCounts[pos] = {};
            footCounts[pos] = {};
            contractSums[pos] = 0;
            contractCounts[pos] = 0;
        }

        // Numeric sums
        sums[pos].overall += Number(p.overall) || 0;
        sums[pos].potential += Number(p.potential) || 0;
        sums[pos].skills += Number(p.skills) || 0;
        sums[pos].weakFoot += Number(p.weakFoot) || 0;
        sums[pos].totalStats += Number(p.totalStats) || 0;
        sums[pos].value += Number(p.value) || 0;
        sums[pos].wage += Number(p.wage) || 0;
        sums[pos].appearances += Number(p.appearances) || 0;
        sums[pos].goals += Number(p.goals) || 0;
        sums[pos].assists += Number(p.assists) || 0;
        sums[pos].cleanSheets += Number(p.cleanSheets) || 0;
        sums[pos].yellowCards += Number(p.yellowCards) || 0;
        sums[pos].redCards += Number(p.redCards) || 0;
        sums[pos].avgRating += Number(p.avgRating) || 0;

        // Nationality counts
        const nat = p.nationality || 'Unknown';
        nationalityCounts[pos][nat] = (nationalityCounts[pos][nat] || 0) + 1;

        // Foot counts
        const foot = p.foot || 'Unknown';
        footCounts[pos][foot] = (footCounts[pos][foot] || 0) + 1;

        // Contract average via timestamp
        if (p.contractEnd) {
            const ts = Date.parse(p.contractEnd);
            if (!isNaN(ts)) {
                contractSums[pos] += ts;
                contractCounts[pos] += 1;
            }
        }

        counts[pos] += 1;
    });

    const averages = {};
    Object.keys(sums).forEach(pos => {
        const c = counts[pos] || 1;
        // determine most common nationality
        const natCounts = nationalityCounts[pos] || {};
        let topNat = 'N/A';
        let topNatCount = 0;
        Object.keys(natCounts).forEach(k => {
            if (natCounts[k] > topNatCount) { topNat = k; topNatCount = natCounts[k]; }
        });

        // most common foot
        const fCounts = footCounts[pos] || {};
        let topFoot = 'N/A';
        let topFootCount = 0;
        Object.keys(fCounts).forEach(k => {
            if (fCounts[k] > topFootCount) { topFoot = k; topFootCount = fCounts[k]; }
        });

        // average contract end as date string
        let avgContract = null;
        if (contractCounts[pos] > 0) {
            const avgTs = Math.round(contractSums[pos] / contractCounts[pos]);
            avgContract = new Date(avgTs).toISOString().split('T')[0];
        }

        averages[pos] = {
            nationality: topNat,
            nationalityCount: topNatCount,
            overall: +(sums[pos].overall / c).toFixed(2),
            potential: +(sums[pos].potential / c).toFixed(2),
            contractEnd: avgContract,
            skills: +(sums[pos].skills / c).toFixed(2),
            weakFoot: +(sums[pos].weakFoot / c).toFixed(2),
            foot: topFoot,
            footCount: topFootCount,
            totalStats: +(sums[pos].totalStats / c).toFixed(2),
            value: +(sums[pos].value / c).toFixed(2),
            wage: +(sums[pos].wage / c).toFixed(2),
            appearances: +(sums[pos].appearances / c).toFixed(2),
            goals: +(sums[pos].goals / c).toFixed(2),
            assists: +(sums[pos].assists / c).toFixed(2),
            cleanSheets: +(sums[pos].cleanSheets / c).toFixed(2),
            yellowCards: +(sums[pos].yellowCards / c).toFixed(2),
            redCards: +(sums[pos].redCards / c).toFixed(2),
            avgRating: +(sums[pos].avgRating / c).toFixed(2)
        };
    });

    return averages;
}

/**
 * Compute averages aggregated by POSITION_GROUPS (e.g. Goalkeepers, Defenders, ...)
 * Accepts players object (id -> player) and returns averages keyed by group name.
 */
function computeGroupAverages(players) {
    const sums = {};
    const counts = {};
    const nationalityCounts = {};
    const footCounts = {};
    const contractSums = {};
    const contractCounts = {};

    Object.values(players).forEach(p => {
        const group = getPositionGroup(p.role) || 'Unknown';
        if (!sums[group]) {
            sums[group] = {
                overall: 0,
                potential: 0,
                skills: 0,
                weakFoot: 0,
                totalStats: 0,
                value: 0,
                wage: 0,
                appearances: 0,
                goals: 0,
                assists: 0,
                cleanSheets: 0,
                yellowCards: 0,
                redCards: 0,
                avgRating: 0
            };
            counts[group] = 0;
            nationalityCounts[group] = {};
            footCounts[group] = {};
            contractSums[group] = 0;
            contractCounts[group] = 0;
        }

        sums[group].overall += Number(p.overall) || 0;
        sums[group].potential += Number(p.potential) || 0;
        sums[group].skills += Number(p.skills) || 0;
        sums[group].weakFoot += Number(p.weakFoot) || 0;
        sums[group].totalStats += Number(p.totalStats) || 0;
        sums[group].value += Number(p.value) || 0;
        sums[group].wage += Number(p.wage) || 0;
        sums[group].appearances += Number(p.appearances) || 0;
        sums[group].goals += Number(p.goals) || 0;
        sums[group].assists += Number(p.assists) || 0;
        sums[group].cleanSheets += Number(p.cleanSheets) || 0;
        sums[group].yellowCards += Number(p.yellowCards) || 0;
        sums[group].redCards += Number(p.redCards) || 0;
        sums[group].avgRating += Number(p.avgRating) || 0;

        const nat = p.nationality || 'Unknown';
        nationalityCounts[group][nat] = (nationalityCounts[group][nat] || 0) + 1;

        const foot = p.foot || 'Unknown';
        footCounts[group][foot] = (footCounts[group][foot] || 0) + 1;

        if (p.contractEnd) {
            const ts = Date.parse(p.contractEnd);
            if (!isNaN(ts)) { contractSums[group] += ts; contractCounts[group] += 1; }
        }

        counts[group] += 1;
    });

    const averages = {};
    Object.keys(sums).forEach(group => {
        const c = counts[group] || 1;

        // nationality mode
        const natCounts = nationalityCounts[group] || {};
        let topNat = 'N/A', topNatCount = 0;
        Object.keys(natCounts).forEach(k => { if (natCounts[k] > topNatCount) { topNat = k; topNatCount = natCounts[k]; } });

        // foot mode
        const fCounts = footCounts[group] || {};
        let topFoot = 'N/A', topFootCount = 0;
        Object.keys(fCounts).forEach(k => { if (fCounts[k] > topFootCount) { topFoot = k; topFootCount = fCounts[k]; } });

        let avgContract = null;
        if (contractCounts[group] > 0) {
            const avgTs = Math.round(contractSums[group] / contractCounts[group]);
            avgContract = new Date(avgTs).toISOString().split('T')[0];
        }

        averages[group] = {
            nationality: topNat,
            nationalityCount: topNatCount,
            overall: +(sums[group].overall / c).toFixed(2),
            potential: +(sums[group].potential / c).toFixed(2),
            contractEnd: avgContract,
            skills: +(sums[group].skills / c).toFixed(2),
            weakFoot: +(sums[group].weakFoot / c).toFixed(2),
            foot: topFoot,
            footCount: topFootCount,
            totalStats: +(sums[group].totalStats / c).toFixed(2),
            value: +(sums[group].value / c).toFixed(2),
            wage: +(sums[group].wage / c).toFixed(2),
            appearances: +(sums[group].appearances / c).toFixed(2),
            goals: +(sums[group].goals / c).toFixed(2),
            assists: +(sums[group].assists / c).toFixed(2),
            cleanSheets: +(sums[group].cleanSheets / c).toFixed(2),
            yellowCards: +(sums[group].yellowCards / c).toFixed(2),
            redCards: +(sums[group].redCards / c).toFixed(2),
            avgRating: +(sums[group].avgRating / c).toFixed(2)
        };
    });

    return averages;
}

/**
 * Render position averages table into #roleAveragesContainer (keeps existing container id)
 */
function renderPositionAverages(players) {
    const container = document.getElementById('roleAveragesContainer');
    if (!container) return;

    const averages = computeGroupAverages(players);
    // Keep the order defined in POSITION_GROUPS, then append any extra groups
    const orderedGroups = Object.keys(POSITION_GROUPS).filter(g => averages[g]);
    const extraGroups = Object.keys(averages).filter(g => !orderedGroups.includes(g)).sort();
    const positions = orderedGroups.concat(extraGroups);

    if (positions.length === 0) {
        container.innerHTML = '<div class="empty-state">No data available for position averages.</div>';
        return;
    }

    // Build table with the 17 requested columns in the order provided by the user
    let html = '<table class="min-w-full text-sm border-collapse">';
    html += '<thead><tr class="text-left">';
    html += '<th class="px-2 py-1">Position Group</th>'; // e.g. Goalkeepers, Defenders
    html += '<th class="px-2 py-1">Nationality (mode)</th>';
    html += '<th class="px-2 py-1">Overall</th>';
    html += '<th class="px-2 py-1">Potential</th>';
    html += '<th class="px-2 py-1">Contract End (avg)</th>';
    html += '<th class="px-2 py-1">Skills</th>';
    html += '<th class="px-2 py-1">Weak Foot</th>';
    html += '<th class="px-2 py-1">Foot (mode)</th>';
    html += '<th class="px-2 py-1">Total Stats</th>';
    html += '<th class="px-2 py-1">Value</th>';
    html += '<th class="px-2 py-1">Wage</th>';
    html += '<th class="px-2 py-1">Appearances</th>';
    html += '<th class="px-2 py-1">Goals</th>';
    html += '<th class="px-2 py-1">Assists</th>';
    html += '<th class="px-2 py-1">Clean Sheets</th>';
    html += '<th class="px-2 py-1">Yellow Cards</th>';
    html += '<th class="px-2 py-1">Red Cards</th>';
    html += '<th class="px-2 py-1">Avg Rating</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    positions.forEach(pos => {
        const a = averages[pos];
        html += `<tr class="border-t"><td class="px-2 py-1">${pos}</td><td class="px-2 py-1">${a.nationality} (${a.nationalityCount})</td><td class="px-2 py-1">${a.overall}</td><td class="px-2 py-1">${a.potential}</td><td class="px-2 py-1">${a.contractEnd || 'N/A'}</td><td class="px-2 py-1">${a.skills}</td><td class="px-2 py-1">${a.weakFoot}</td><td class="px-2 py-1">${a.foot}</td><td class="px-2 py-1">${a.totalStats}</td><td class="px-2 py-1">${formatNumber(a.value)}</td><td class="px-2 py-1">${formatNumber(a.wage)}</td><td class="px-2 py-1">${a.appearances}</td><td class="px-2 py-1">${a.goals}</td><td class="px-2 py-1">${a.assists}</td><td class="px-2 py-1">${a.cleanSheets}</td><td class="px-2 py-1">${a.yellowCards}</td><td class="px-2 py-1">${a.redCards}</td><td class="px-2 py-1">${a.avgRating}</td></tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Integrate position averages rendering into renderCharts flow
const _origRenderCharts = renderCharts;
renderCharts = function() {
    _origRenderCharts && _origRenderCharts();

    const season = getCurrentSeason();
    const players = season && season.roster && season.roster[currentSquad] ? season.roster[currentSquad].players : {};
    renderPositionAverages(players);
};
/**
 * CMutils - FC25 Career Mode Utility
 * Complete front-end application for managing football career mode data
 */

// Application state
let currentSeasons = [];
let currentSeasonId = null;
let currentSquad = 'main_squad';
let editingPlayerId = null;
let editingSeasonId = null;
let editingTransferKey = null; // when set, savePlayer will create a transfer-only snapshot
let draggedElement = null;
let charts = {};

// Position groups for drag-and-drop ordering
const POSITION_GROUPS = {
    'Goalkeepers': ['GK'],
    'Defenders': ['LB', 'CB', 'RB'],
    'Midfielders': ['CDM', 'LM', 'CM', 'RM', 'CAM'],
    'Forwards': ['LW', 'ST', 'RW']
};

// Color palette per position group (primary and lighter variant for record backgrounds)
const GROUP_COLORS = {
    'Goalkeepers': { color: '#FBBF24', light: '#FEF3C7' }, // Yellow
    'Defenders': { color: '#10B981', light: '#ECFDF5' },   // Green
    'Midfielders': { color: '#60A5FA', light: '#EFF6FF' }, // Light Blue/Blue
    'Forwards': { color: '#EF4444', light: '#FEE2E2' }     // Red
};

// Currency symbols
const CURRENCY_SYMBOLS = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    setupEventListeners();
    initializeApp();
});
    // Transfer list keys used in season.roster.transfers
    const TRANSFER_KEYS = {
        forSale: 'forSale',
        sold: 'sold',
        released: 'released',
        toBuyClub: 'toBuyClub',
        toBuyReleased: 'toBuyReleased'
    };

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Season management
    document.getElementById('addSeasonBtn').addEventListener('click', () => openSeasonModal());
    document.getElementById('saveSeasonBtn').addEventListener('click', saveSeason);
    document.getElementById('cancelSeasonBtn').addEventListener('click', closeSeasonModal);
    document.getElementById('closeSeasonModalBtn').addEventListener('click', closeSeasonModal);

    // Squad tabs
    document.getElementById('mainSquadTab').addEventListener('click', () => switchSquad('main_squad'));
    document.getElementById('youthAcademyTab').addEventListener('click', () => switchSquad('youth_academy'));

    // Player management
    document.getElementById('addPlayerBtn').addEventListener('click', () => openPlayerModal());
    document.getElementById('savePlayerBtn').addEventListener('click', savePlayer);
    document.getElementById('cancelBtn').addEventListener('click', closePlayerModal);
    document.getElementById('closeModalBtn').addEventListener('click', closePlayerModal);

    // Charts
    document.getElementById('showChartsBtn').addEventListener('click', showCharts);
    document.getElementById('hideChartsBtn').addEventListener('click', hideCharts);
    // Transfers
    const showTransfersBtn = document.getElementById('showTransfersBtn');
    if (showTransfersBtn) showTransfersBtn.addEventListener('click', showTransfers);
    const hideTransfersBtn = document.getElementById('hideTransfersBtn');
    if (hideTransfersBtn) hideTransfersBtn.addEventListener('click', hideTransfers);
    // Stat selector for position-based averages (if present)
    const statSelect = document.getElementById('statSelect');
    if (statSelect) {
        statSelect.addEventListener('change', () => {
            // re-render charts with new stat
            if (document.getElementById('chartsPanel') && !document.getElementById('chartsPanel').classList.contains('hidden')) {
                renderCharts();
            }
        });
    }

    // Import/Export
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('change', importData);

    // Storage management
    document.getElementById('storageInfoBtn').addEventListener('click', showStorageInfo);
    document.getElementById('closeStorageModalBtn').addEventListener('click', closeStorageModal);
    document.getElementById('closeStorageBtn').addEventListener('click', closeStorageModal);
    document.getElementById('clearStorageBtn').addEventListener('click', clearStorage);

    // Modal backdrop clicks
    document.getElementById('playerModal').addEventListener('click', (e) => {
        if (e.target.id === 'playerModal') closePlayerModal();
    });
    document.getElementById('seasonModal').addEventListener('click', (e) => {
        if (e.target.id === 'seasonModal') closeSeasonModal();
    });
    document.getElementById('storageModal').addEventListener('click', (e) => {
        if (e.target.id === 'storageModal') closeStorageModal();
    });
}

/**
 * Initialize the application with sample data if none exists
 */
async function initializeApp() {
    if (currentSeasons.length === 0) {
        try {
            const response = await fetch('data/sample.json');
            const data = await response.json();
            currentSeasons = data.seasons || [];
            saveToStorage();
        } catch (error) {
            console.warn('Could not load sample data:', error);
            // Create default season if no data available
            currentSeasons = [{
                id: generateId(),
                name: '2025/2026',
                currency: 'USD',
                roster: {
                    main_squad: { players: {} },
                    youth_academy: { players: {} }
                }
            }];
            saveToStorage();
        }
    }

    if (currentSeasons.length > 0 && !currentSeasonId) {
        currentSeasonId = currentSeasons[0].id;
    }

    renderSeasonTabs();
    renderPlayers();
    renderTransfers();
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get current season data
 */
function getCurrentSeason() {
    return currentSeasons.find(s => s.id === currentSeasonId);
}

/**
 * Get current squad players
 */
function getCurrentPlayers() {
    const season = getCurrentSeason();
    if (!season || !season.roster || !season.roster[currentSquad]) {
        return {};
    }
    return season.roster[currentSquad].players || {};
}

/**
 * Save data to localStorage with error handling
 */
function saveToStorage() {
    try {
        const dataString = JSON.stringify({ seasons: currentSeasons });
        const dataSize = new Blob([dataString]).size;
        
        // Check if data size is reasonable (warn if > 4MB, most browsers allow 5-10MB)
        if (dataSize > 4 * 1024 * 1024) {
            console.warn(`Warning: Data size is ${Math.round(dataSize / 1024 / 1024 * 100) / 100}MB, approaching localStorage limits`);
        }
        
        localStorage.setItem('cmutils_data', dataString);
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            handleStorageQuotaExceeded();
        } else {
            console.error('Error saving to localStorage:', error);
            alert('Error saving data. Please try exporting your data as a backup.');
        }
    }
}

/**
 * Handle localStorage quota exceeded error
 */
function handleStorageQuotaExceeded() {
    alert(`Storage quota exceeded! Your data is too large for localStorage.

Options:
1. Export your data now as a backup (recommended)
2. Clear some browser data to free up space
3. Remove old seasons or players to reduce data size

The app will continue to work, but changes won't be saved automatically.`);
    
    // Offer immediate export
    if (confirm('Would you like to export your data now as a backup?')) {
        exportData();
    }
}

/**
 * Load data from localStorage with error handling
 */
function loadFromStorage() {
    const stored = localStorage.getItem('cmutils_data');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            currentSeasons = data.seasons || [];
            
            // Validate and clean data
            currentSeasons = validateAndCleanSeasons(currentSeasons);
            
            if (currentSeasons.length > 0) {
                currentSeasonId = currentSeasons[0].id;
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
            alert('Error loading saved data. Starting with empty data.');
            currentSeasons = [];
        }
    }
}

/**
 * Validate and clean seasons data
 */
function validateAndCleanSeasons(seasons) {
    if (!Array.isArray(seasons)) {
        return [];
    }
    
    return seasons.map(season => {
        // Ensure season has required structure
        if (!season.id) season.id = generateId();
        if (!season.name) season.name = 'Unnamed Season';
        if (!season.currency) season.currency = 'USD';
        if (!season.roster) season.roster = { main_squad: { players: {} }, youth_academy: { players: {} } };
        
        // Validate roster structure
        if (!season.roster.main_squad) season.roster.main_squad = { players: {} };
        if (!season.roster.youth_academy) season.roster.youth_academy = { players: {} };
        if (!season.roster.main_squad.players) season.roster.main_squad.players = {};
        if (!season.roster.youth_academy.players) season.roster.youth_academy.players = {};

        // Ensure transfers structure exists at season level
        if (!season.transfers) {
            season.transfers = {
                forSale: [],
                sold: [],
                released: [],
                toBuyClub: [],
                toBuyReleased: []
            };
        }
        
        // Validate and clean players
        ['main_squad', 'youth_academy'].forEach(squadType => {
            const originalPlayers = season.roster[squadType].players || {};
            const rebuiltPlayers = {};

            Object.keys(originalPlayers).forEach(oldKey => {
                const player = originalPlayers[oldKey];

                // If player object doesn't have an id, generate one.
                if (!player.id) player.id = generateId();

                if (!player.firstName) player.firstName = 'Unknown';
                if (!player.lastName) player.lastName = 'Player';
                if (!player.role) player.role = 'ST';

                // Ensure numeric fields are numbers
                ['overall', 'potential', 'age', 'skills', 'weakFoot', 'value', 'wage', 
                 'appearances', 'goals', 'assists', 'cleanSheets', 'yellowCards', 'redCards'].forEach(field => {
                    if (player[field] && typeof player[field] !== 'number') {
                        player[field] = parseInt(player[field]) || 0;
                    }
                });
                if (player.avgRating && typeof player.avgRating !== 'number') {
                    player.avgRating = parseFloat(player.avgRating) || 0;
                }

                // Use the (possibly newly generated) player.id as the key in the rebuilt object
                rebuiltPlayers[player.id] = player;
            });

            // Replace the players object with the rebuilt one (this ensures keys match player.id)
            season.roster[squadType].players = rebuiltPlayers;
        });
        
        return season;
    });
}

/**
 * Transfer helper functions
 */
function getSeasonTransfers(season) {
    if (!season) return null;
    if (!season.transfers) season.transfers = { forSale: [], sold: [], released: [], toBuyClub: [], toBuyReleased: [] };
    return season.transfers;
}

function addPlayerToTransferList(playerId, key) {
    const season = getCurrentSeason();
    if (!season) return;
    const players = Object.assign({}, season.roster.main_squad.players, season.roster.youth_academy.players);
    const player = players[playerId];
    if (!player) return alert('Player not found');

    const transfers = getSeasonTransfers(season);

    // snapshot of player
    const snapshot = Object.assign({}, player);

    if (key === TRANSFER_KEYS.sold || key === TRANSFER_KEYS.released) {
        // remove from all squads
        delete season.roster.main_squad.players[playerId];
        delete season.roster.youth_academy.players[playerId];
    }

    // prevent duplicate snapshot ids
    if (!transfers[key].some(item => item.id && item.id.toString() === snapshot.id.toString())) {
        transfers[key].push(snapshot);
    }
    saveToStorage();
    renderPlayers();
    renderTransfers();
}

function addPlayerCopyToBuyList(playerId, key) {
    const season = getCurrentSeason();
    if (!season) return;
    const players = Object.assign({}, season.roster.main_squad.players, season.roster.youth_academy.players);
    const player = players[playerId];
    if (!player) return alert('Player not found');

    const transfers = getSeasonTransfers(season);
    const snapshot = Object.assign({}, player, { id: generateId() });
    if (!transfers[key].some(item => item.id && item.id.toString() === snapshot.id.toString())) {
        transfers[key].push(snapshot);
    }
    saveToStorage();
    renderTransfers();
}

/**
 * Take a transfer snapshot and add it into the main_squad players if not present.
 * This lets the user 'show' a transfer snapshot in their main player list.
 */
function showTransferInPlayers(listKey, snapshotId) {
    const season = getCurrentSeason();
    if (!season) return;
    const transfers = getSeasonTransfers(season);
    const list = transfers[listKey] || [];
    const snapshot = list.find(p => p.id && p.id.toString() === snapshotId.toString());
    if (!snapshot) return alert('Snapshot not found');

    // If a player with the same id already exists in any squad, warn and do nothing
    const allPlayers = Object.assign({}, season.roster.main_squad.players, season.roster.youth_academy.players);
    if (allPlayers[snapshot.id]) {
        return alert('This player snapshot already exists in your squads.');
    }

    // Insert into main_squad with same snapshot id to preserve link
    season.roster.main_squad.players[snapshot.id] = Object.assign({}, snapshot);
    // Normalize ordering so the new player appears correctly grouped
    normalizePlayerOrder(season, 'main_squad');
    saveToStorage();
    renderPlayers();
    alert(`Added ${snapshot.firstName} ${snapshot.lastName} to Main Squad`);
}

function removeFromTransferList(listKey, playerSnapshotId) {
    const season = getCurrentSeason();
    if (!season) return;
    const transfers = getSeasonTransfers(season);
    transfers[listKey] = (transfers[listKey] || []).filter(p => !(p.id && p.id.toString() === playerSnapshotId.toString()));
    saveToStorage();
    renderTransfers();
    // Re-render players so any 'for-sale' highlighting is updated/removed immediately
    renderPlayers();
}

function clearTransferList(listKey) {
    const season = getCurrentSeason();
    if (!season) return;
    const transfers = getSeasonTransfers(season);
    transfers[listKey] = [];
    saveToStorage();
    renderTransfers();
    // Re-render players to reflect cleared For Sale list
    renderPlayers();
}

/**
 * Render transfers UI into #transfersContainer
 */
function renderTransfers() {
    const container = document.getElementById('transfersContainer');
    if (!container) return;
    const season = getCurrentSeason();
    if (!season) { container.innerHTML = ''; return; }
    const transfers = getSeasonTransfers(season);

    const currency = CURRENCY_SYMBOLS[season.currency] || '$';

    function renderList(title, listKey) {
        const list = transfers[listKey] || [];
        // Add an "Add Player" button for the 'toBuy' lists which opens the player modal
        const isToBuy = listKey === TRANSFER_KEYS.toBuyClub || listKey === TRANSFER_KEYS.toBuyReleased;
        let addBtnHtml = '';
        if (isToBuy) {
            addBtnHtml = `<button onclick="openTransferPlayerModal('${listKey}')" class="text-xs text-blue-600">Add Player</button>`;
        }

        let html = `<div class="position-group mb-4">
            <div class="position-group-header flex justify-between items-center">${title} <div class="space-x-2">${addBtnHtml}<button onclick="clearTransferList('${listKey}')" class="text-xs text-red-600">Clear</button></div></div>`;
        if (list.length === 0) {
            html += `<div class="p-4 text-sm text-gray-600">No players</div>`;
        } else {
            list.forEach(p => {
                // compute group class so styling matches main player cards
                const grp = getPositionGroup(p.role) || 'Unknown';
                const groupClass = 'group-' + grp.toLowerCase().replace(/\s+/g, '-');

                html += `
                    <div class="player-card ${groupClass}" style="margin:8px;" data-transfer-id="${p.id}">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="font-semibold">${p.firstName} ${p.lastName}</div>
                                <div class="text-sm text-gray-500">${p.nationality || 'Unknown'} • ${p.role || '-'}</div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="showTransferInPlayers('${listKey}','${p.id}')" class="text-blue-600" title="Add the player to the main squad">➕</button>
                                <button onclick="removeFromTransferList('${listKey}','${p.id}')" class="text-red-600" title="Remove">🗑️</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>OVR: <span class="font-medium">${p.overall || '-'}</span></div>
                            <div>POT: <span class="font-medium">${p.potential || '-'}</span></div>
                            <div>Age: <span class="font-medium">${p.age || '-'}</span></div>
                            <div>Contract: <span class="font-medium">${p.contractEnd || '-'}</span></div>
                            <div>Skills: ${renderStars(p.skills)}</div>
                            <div>Weak Foot: ${renderStars(p.weakFoot)}</div>
                            <div>Value: <span class="font-medium">${currency}${formatNumber(p.value)}</span></div>
                            <div>Wage: <span class="font-medium">${currency}${formatNumber(p.wage)}</span></div>
                        </div>
                    </div>
                `;
            });
        }
        html += '</div>';
        return html;
    }

    let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
    html += renderList('Players For Sale', 'forSale');
    html += renderList('Players Sold', 'sold');
    html += renderList('Players Released', 'released');
    html += renderList('Players To Buy (Club)', 'toBuyClub');
    html += renderList('Players To Buy (Released)', 'toBuyReleased');
    html += '</div>';

    container.innerHTML = html;
}

/**
 * Render season tabs
 */
function renderSeasonTabs() {
    const container = document.getElementById('seasonTabs');
    container.innerHTML = '';

    currentSeasons.forEach(season => {
        const tab = document.createElement('div');
        tab.className = `season-tab ${season.id === currentSeasonId ? 'active' : ''}`;
        tab.innerHTML = `
            <span>${season.name}</span>
            <button class="delete-btn" onclick="deleteSeason('${season.id}')" title="Delete Season">×</button>
        `;
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                switchSeason(season.id);
            }
        });
        container.appendChild(tab);
    });
}

/**
 * Switch to different season
 */
function switchSeason(seasonId) {
    currentSeasonId = seasonId;
    renderSeasonTabs();
    renderPlayers();
    hideCharts();
}

/**
 * Switch squad type
 */
function switchSquad(squad) {
    currentSquad = squad;
    
    // Update tab styles
    document.querySelectorAll('.squad-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('border-transparent', 'text-gray-500');
        tab.classList.remove('border-black', 'text-black');
    });
    
    const activeTab = squad === 'main_squad' ? 'mainSquadTab' : 'youthAcademyTab';
    const activeTabEl = document.getElementById(activeTab);
    activeTabEl.classList.add('active', 'border-black', 'text-black');
    activeTabEl.classList.remove('border-transparent', 'text-gray-500');
    
    // Update squad title
    document.getElementById('squadTitle').textContent = squad === 'main_squad' ? 'Main Squad' : 'Youth Academy';
    
    renderPlayers();
    hideCharts();
}

/**
 * Render players table/cards
 */
function renderPlayers() {
    const container = document.getElementById('playersContainer');
    const players = getCurrentPlayers();
    const playersArray = Object.values(players);
    
    if (playersArray.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No players found</h3>
                <p>Add your first player to get started</p>
                <button onclick="openPlayerModal()" class="mt-4 bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                    Add Player
                </button>
            </div>
        `;
    // still render transfers section even if no players
    renderTransfers();
    return;
    }

    // Group players by position
    const groupedPlayers = {};
    Object.entries(POSITION_GROUPS).forEach(([groupName, positions]) => {
        groupedPlayers[groupName] = playersArray.filter(player => positions.includes(player.role));
    });

    // Desktop table view
    const tableHTML = renderPlayersTable(groupedPlayers);
    
    // Mobile cards view
    const cardsHTML = renderPlayersCards(groupedPlayers);
    
    container.innerHTML = `
        <div class="players-table-container">
            ${tableHTML}
        </div>
        <div class="mobile-cards">
            ${cardsHTML}
        </div>
    `;

    setupDragAndDrop();
    // If charts panel is visible, refresh charts to reflect current roster
    if (document.getElementById('chartsPanel') && !document.getElementById('chartsPanel').classList.contains('hidden')) {
        renderCharts();
    }
}

/**
 * Render players table for desktop
 */
function renderPlayersTable(groupedPlayers) {
    const season = getCurrentSeason();
    const currency = season ? CURRENCY_SYMBOLS[season.currency] || '$' : '$';
    
    let html = `
        <table class="players-table">
            <thead>
                <tr>
                    <th>Player</th>
                    <th>Role</th>
                    <th>OVR</th>
                    <th>POT</th>
                    <th>Age</th>
                    <th>Contract</th>
                    <th>Skills</th>
                    <th>WF</th>
                    <th>Foot</th>
                    <th>Value</th>
                    <th>Wage</th>
                    <th>Apps</th>
                    <th>Goals</th>
                    <th>Assists</th>
                    <th>Rating</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    Object.entries(groupedPlayers).forEach(([groupName, players]) => {
        if (players.length > 0) {
            const groupClass = 'group-' + groupName.toLowerCase().replace(/\s+/g, '-');
            html += `
                <tr class="position-group-row ${groupClass}">
                    <td colspan="16" class="position-group-header">${groupName}</td>
                </tr>
            `;
            
            players.forEach(player => {
                const isForSale = season && season.transfers && Array.isArray(season.transfers.forSale) && season.transfers.forSale.some(item => item.id && item.id.toString() === player.id.toString());
                html += `
                    <tr draggable="true" data-player-id="${player.id}" data-position-group="${groupName}" class="player-row ${groupClass} ${isForSale ? 'for-sale' : ''}">
                        <td>
                            <div class="font-medium">${player.firstName} ${player.lastName}</div>
                            <div class="text-sm text-gray-500">${player.nationality || 'Unknown'}</div>
                        </td>
                        <td><span class="font-mono text-sm">${player.role}</span></td>
                        <td>${player.overall || '-'}</td>
                        <td>${player.potential || '-'}</td>
                        <td>${player.age || '-'}</td>
                        <td>${player.contractEnd || '-'}</td>
                        <td>${renderStars(player.skills)}</td>
                        <td>${renderStars(player.weakFoot)}</td>
                        <td>${player.foot || '-'}</td>
                        <td class="currency" data-currency="${currency}">${formatNumber(player.value)}</td>
                        <td class="currency" data-currency="${currency}">${formatNumber(player.wage)}</td>
                        <td>${player.appearances || 0}</td>
                        <td>${player.goals || 0}</td>
                        <td>${player.assists || 0}</td>
                        <td>${player.avgRating || '-'}</td>
                        <td>
                            <div class="flex space-x-1">
                                <button onclick="editPlayer('${player.id}')" class="text-blue-600 hover:text-blue-800" title="Edit">✏️</button>
                                <button onclick="deletePlayer('${player.id}')" class="text-red-600 hover:text-red-800" title="Delete">🗑️</button>
                                ${currentSquad === 'youth_academy' ? 
                                    `<button onclick="promotePlayer('${player.id}')" class="promote-btn bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 px-2 py-1 rounded text-xs font-medium border border-green-300" title="Promote to Main Squad">
                                        <span class="promote-icon">🚀</span> Promote
                                    </button>` : 
                                    ''
                                }
                                <button onclick="movePlayerUp('${player.id}')" class="text-gray-600 hover:text-gray-800" title="Move Up">↑</button>
                                <button onclick="movePlayerDown('${player.id}')" class="text-gray-600 hover:text-gray-800" title="Move Down">↓</button>
                                <button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.forSale}')" class="text-yellow-600" title="Mark For Sale">💰</button>
                                <button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.sold}')" class="text-green-700" title="Mark Sold">🏷️</button>
                                <button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.released}')" class="text-red-600" title="Release">🚫</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    });

    html += '</tbody></table>';
    return html;
}

/**
 * Render players cards for mobile
 */
function renderPlayersCards(groupedPlayers) {
    const season = getCurrentSeason();
    const currency = season ? CURRENCY_SYMBOLS[season.currency] || '$' : '$';
    
    let html = '';

    Object.entries(groupedPlayers).forEach(([groupName, players]) => {
        if (players.length > 0) {
            const groupClass = 'group-' + groupName.toLowerCase().replace(/\s+/g, '-');
            html += `<div class="position-group ${groupClass}">`;
            html += `<div class="position-group-header">${groupName}</div>`;
            
            players.forEach(player => {
                const isForSale = season && season.transfers && Array.isArray(season.transfers.forSale) && season.transfers.forSale.some(item => item.id && item.id.toString() === player.id.toString());
                html += `
                    <div class="player-card ${groupClass} ${isForSale ? 'for-sale' : ''}" draggable="true" data-player-id="${player.id}" data-position-group="${groupName}">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="font-semibold">${player.firstName} ${player.lastName}</div>
                                <div class="text-sm text-gray-500">${player.nationality || 'Unknown'} • ${player.role}</div>
                            </div>
                            <div class="flex space-x-1 items-center">
                                <button onclick="editPlayer('${player.id}')" class="text-blue-600" title="Edit">✏️</button>
                                <button onclick="deletePlayer('${player.id}')" class="text-red-600" title="Delete">🗑️</button>
                                ${currentSquad === 'youth_academy' ? 
                                    `<button onclick="promotePlayer('${player.id}')" class="promote-btn-mobile bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium border border-green-300" title="Promote to Main Squad">
                                        <span class="promote-icon">🚀</span>
                                    </button>` : 
                                    ''
                                }
                                <!-- Add move up/down buttons for mobile view -->
                                <button onclick="movePlayerUp('${player.id}')" class="text-gray-600 hover:text-gray-800 px-2 py-1 rounded" title="Move Up">↑</button>
                                <button onclick="movePlayerDown('${player.id}')" class="text-gray-600 hover:text-gray-800 px-2 py-1 rounded" title="Move Down">↓</button>
                                <button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.forSale}')" class="text-yellow-600 px-2" title="Mark For Sale">💰</button>
                                <button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.sold}')" class="text-green-700 px-2" title="Mark Sold">🏷️</button>
                                <button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.released}')" class="text-red-600 px-2" title="Release">🚫</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>OVR: <span class="font-medium">${player.overall || '-'}</span></div>
                            <div>POT: <span class="font-medium">${player.potential || '-'}</span></div>
                            <div>Age: <span class="font-medium">${player.age || '-'}</span></div>
                            <div>Contract: <span class="font-medium">${player.contractEnd || '-'}</span></div>
                            <div>Skills: ${renderStars(player.skills)}</div>
                            <div>Weak Foot: ${renderStars(player.weakFoot)}</div>
                            <div>Value: <span class="font-medium">${currency}${formatNumber(player.value)}</span></div>
                            <div>Wage: <span class="font-medium">${currency}${formatNumber(player.wage)}</span></div>
                        </div>
                        <div class="mt-2 pt-2 border-t text-xs text-gray-600">
                            Apps: ${player.appearances || 0} | Goals: ${player.goals || 0} | Assists: ${player.assists || 0} | Rating: ${player.avgRating || '-'}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        }
    });

    return html;
}

/**
 * Render star rating
 */
function renderStars(rating) {
    if (!rating) return '-';
    
    let html = '<div class="stars">';
    for (let i = 1; i <= 5; i++) {
        html += `<div class="star ${i <= rating ? 'filled' : ''}"></div>`;
    }
    html += '</div>';
    return html;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Setup drag and drop functionality
 */
function setupDragAndDrop() {
    const draggableElements = document.querySelectorAll('[draggable="true"]');
    
    draggableElements.forEach(element => {
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('drop', handleDrop);
    });
}

/**
 * Handle drag start
 */
function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

/**
 * Handle drop
 */
function handleDrop(e) {
    e.preventDefault();
    
    if (!draggedElement) return;
    
    const dropTarget = e.target.closest('[data-player-id]');
    if (!dropTarget || dropTarget === draggedElement) return;
    
    const draggedId = draggedElement.getAttribute('data-player-id');
    const targetId = dropTarget.getAttribute('data-player-id');
    const draggedGroup = draggedElement.getAttribute('data-position-group');
    const targetGroup = dropTarget.getAttribute('data-position-group');
    
    // Only allow reordering within same position group
    if (draggedGroup !== targetGroup) {
        alert('Players can only be reordered within the same position group');
        return;
    }
    
    reorderPlayers(draggedId, targetId);
}

/**
 * Reorder players in the data
 */
function reorderPlayers(draggedId, targetId) {
    const season = getCurrentSeason();
    if (!season) return;
    
    const players = season.roster[currentSquad].players;
    const playersArray = Object.values(players);
    
    const draggedIndex = playersArray.findIndex(p => p.id === draggedId);
    const targetIndex = playersArray.findIndex(p => p.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Remove dragged player and insert at target position
    const [draggedPlayer] = playersArray.splice(draggedIndex, 1);
    playersArray.splice(targetIndex, 0, draggedPlayer);
    
    // Rebuild players object maintaining order
    const newPlayers = {};
    playersArray.forEach(player => {
        newPlayers[player.id] = player;
    });
    
    season.roster[currentSquad].players = newPlayers;
    saveToStorage();
    renderPlayers();
    // Refresh charts if visible
    if (document.getElementById('chartsPanel') && !document.getElementById('chartsPanel').classList.contains('hidden')) {
        renderCharts();
    }
}

/**
 * Move player up in order
 */
function movePlayerUp(playerId) {
    const season = getCurrentSeason();
    if (!season) return;
    
    const players = Object.values(season.roster[currentSquad].players);
    const currentIndex = players.findIndex(p => p.id === playerId);
    
    if (currentIndex > 0) {
        // Find previous player in same position group
        const currentPlayer = players[currentIndex];
        const currentGroup = getPositionGroup(currentPlayer.role);
        
        for (let i = currentIndex - 1; i >= 0; i--) {
            if (getPositionGroup(players[i].role) === currentGroup) {
                reorderPlayers(playerId, players[i].id);
                break;
            }
        }
    // charts refreshed in reorderPlayers
    }
}

/**
 * Move player down in order
 */
function movePlayerDown(playerId) {
    const season = getCurrentSeason();
    if (!season) return;
    
    const players = Object.values(season.roster[currentSquad].players);
    const currentIndex = players.findIndex(p => p.id === playerId);
    
    if (currentIndex < players.length - 1) {
        // Find next player in same position group
        const currentPlayer = players[currentIndex];
        const currentGroup = getPositionGroup(currentPlayer.role);
        
        for (let i = currentIndex + 1; i < players.length; i++) {
            if (getPositionGroup(players[i].role) === currentGroup) {
                reorderPlayers(players[i].id, playerId);
                break;
            }
        }
    // charts refreshed in reorderPlayers
    }
}

/**
 * Get position group for a role
 */
function getPositionGroup(role) {
    for (const [groupName, positions] of Object.entries(POSITION_GROUPS)) {
        if (positions.includes(role)) {
            return groupName;
        }
    }
    return 'Unknown';
}

/**
 * Normalize player object insertion order by position groups.
 * This rebuilds the players object so Object.values(players) returns a
 * predictable order (grouped by position groups) which makes index-based
 * reordering (move up/down and drag/drop) consistent after role edits.
 */
function normalizePlayerOrder(season, squad) {
    if (!season || !season.roster || !season.roster[squad] || !season.roster[squad].players) return;

    const playersObj = season.roster[squad].players;
    const playersArray = Object.values(playersObj);

    const ordered = [];

    // Append players in order of POSITION_GROUPS, preserving original relative order
    Object.keys(POSITION_GROUPS).forEach(groupName => {
        playersArray.forEach(p => {
            if (POSITION_GROUPS[groupName].includes(p.role)) {
                ordered.push(p);
            }
        });
    });

    // Add any players that didn't match any group (Unknown roles) preserving order
    playersArray.forEach(p => {
        if (!ordered.includes(p)) ordered.push(p);
    });

    // Rebuild object with the new ordering
    const newPlayers = {};
    ordered.forEach(p => {
        newPlayers[p.id] = p;
    });

    season.roster[squad].players = newPlayers;
}

/**
 * Open season modal
 */
function openSeasonModal(seasonId = null) {
    editingSeasonId = seasonId;
    const modal = document.getElementById('seasonModal');
    const title = document.getElementById('seasonModalTitle');
    const form = document.getElementById('seasonForm');
    
    if (seasonId) {
        const season = currentSeasons.find(s => s.id === seasonId);
        title.textContent = 'Edit Season';
        document.getElementById('seasonName').value = season.name;
        document.getElementById('seasonCurrency').value = season.currency;
    } else {
        title.textContent = 'Add Season';
        form.reset();
    }
    
    modal.classList.remove('hidden');
}

/**
 * Close season modal
 */
function closeSeasonModal() {
    document.getElementById('seasonModal').classList.add('hidden');
    document.getElementById('seasonForm').reset();
    editingSeasonId = null;
    clearSeasonErrors();
}

/**
 * Save season
 */
function saveSeason() {
    const name = document.getElementById('seasonName').value.trim();
    const currency = document.getElementById('seasonCurrency').value;
    
    clearSeasonErrors();
    
    // Validation
    let isValid = true;
    if (!name) {
        showSeasonError('seasonName', 'Season name is required');
        isValid = false;
    }
    if (!currency) {
        showSeasonError('seasonCurrency', 'Currency is required');
        isValid = false;
    }
    
    if (!isValid) return;
    
    if (editingSeasonId) {
        // Edit existing season
        const season = currentSeasons.find(s => s.id === editingSeasonId);
        season.name = name;
        season.currency = currency;
    } else {
        // Add new season
        const newSeason = {
            id: generateId(),
            name: name,
            currency: currency,
            roster: {
                main_squad: { players: {} },
                youth_academy: { players: {} }
            }
        };
    newSeason.transfers = { forSale: [], sold: [], released: [], toBuyClub: [], toBuyReleased: [] };
        currentSeasons.push(newSeason);
        currentSeasonId = newSeason.id;
    }
    
    saveToStorage();
    renderSeasonTabs();
    renderPlayers();
    closeSeasonModal();

    if (document.getElementById('chartsPanel') && !document.getElementById('chartsPanel').classList.contains('hidden')) {
        renderCharts();
    }
}

/**
 * Delete season
 */
function deleteSeason(seasonId) {
    if (currentSeasons.length <= 1) {
        alert('Cannot delete the last season');
        return;
    }
    
    if (confirm('Are you sure you want to delete this season? This cannot be undone.')) {
        currentSeasons = currentSeasons.filter(s => s.id !== seasonId);
        
        if (currentSeasonId === seasonId) {
            currentSeasonId = currentSeasons[0].id;
        }
        
        saveToStorage();
        renderSeasonTabs();
        renderPlayers();
        if (document.getElementById('chartsPanel') && !document.getElementById('chartsPanel').classList.contains('hidden')) {
            renderCharts();
        }
    }
}

/**
 * Show season validation error
 */
function showSeasonError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

/**
 * Clear season validation errors
 */
function clearSeasonErrors() {
    document.querySelectorAll('#seasonForm .text-red-500').forEach(el => {
        el.classList.add('hidden');
    });
}

/**
 * Open player modal
 */
function openPlayerModal(playerId = null) {
    editingPlayerId = playerId;
    const modal = document.getElementById('playerModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('playerForm');
    
    if (playerId) {
        const player = getCurrentPlayers()[playerId];
        title.textContent = 'Edit Player';
        populatePlayerForm(player);
    } else {
        title.textContent = 'Add Player';
        form.reset();
    }
    
    modal.classList.remove('hidden');
}

/**
 * Open player modal in 'transfer-only' mode. When saved, the player will be
 * added as a snapshot to the specified transfer list (without adding to any squad).
 */
function openTransferPlayerModal(listKey) {
    // Clear any editing player id and set transfer key
    editingPlayerId = null;
    editingTransferKey = listKey;
    const modal = document.getElementById('playerModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('playerForm');

    title.textContent = 'Add Player (To Buy)';
    form.reset();
    modal.classList.remove('hidden');
}

/**
 * Populate player form with data
 */
function populatePlayerForm(player) {
    document.getElementById('firstName').value = player.firstName || '';
    document.getElementById('lastName').value = player.lastName || '';
    document.getElementById('nationality').value = player.nationality || '';
    document.getElementById('role').value = player.role || '';
    document.getElementById('overall').value = player.overall || '';
    document.getElementById('potential').value = player.potential || '';
    document.getElementById('age').value = player.age || '';
    document.getElementById('contractEnd').value = player.contractEnd || '';
    document.getElementById('skills').value = player.skills || '';
    document.getElementById('weakFoot').value = player.weakFoot || '';
    document.getElementById('foot').value = player.foot || '';
    document.getElementById('totalStats').value = player.totalStats || '';
    document.getElementById('value').value = player.value || '';
    document.getElementById('wage').value = player.wage || '';
    document.getElementById('appearances').value = player.appearances || '';
    document.getElementById('goals').value = player.goals || '';
    document.getElementById('assists').value = player.assists || '';
    document.getElementById('cleanSheets').value = player.cleanSheets || '';
    document.getElementById('yellowCards').value = player.yellowCards || '';
    document.getElementById('redCards').value = player.redCards || '';
    document.getElementById('avgRating').value = player.avgRating || '';
}

/**
 * Close player modal
 */
function closePlayerModal() {
    document.getElementById('playerModal').classList.add('hidden');
    document.getElementById('playerForm').reset();
    editingPlayerId = null;
    editingTransferKey = null;
    clearPlayerErrors();
}

/**
 * Save player
 */
function savePlayer() {
    const formData = getPlayerFormData();
    
    clearPlayerErrors();
    
    // Validation
    if (!validatePlayerForm(formData)) {
        return;
    }
    
    const season = getCurrentSeason();
    if (!season) return;
    // If editingTransferKey is set, create a snapshot and add to that transfer list
    if (editingTransferKey) {
        const transfers = getSeasonTransfers(season);
        const snapshot = Object.assign({ id: generateId() }, formData);
        // prevent duplicate snapshot ids (should be unique since generated)
        if (!transfers[editingTransferKey].some(item => item.id && item.id.toString() === snapshot.id.toString())) {
            transfers[editingTransferKey].push(snapshot);
        }
        saveToStorage();
        renderTransfers();
        editingTransferKey = null;
        closePlayerModal();
        return;
    }

    if (editingPlayerId) {
        // Edit existing player
        const player = season.roster[currentSquad].players[editingPlayerId];
        Object.assign(player, formData);
    } else {
        // Add new player
        const newPlayer = {
            id: generateId(),
            squad: currentSquad === 'main_squad' ? 'Main Squad' : 'Youth Academy',
            ...formData
        };
        season.roster[currentSquad].players[newPlayer.id] = newPlayer;
    }
    // Normalize object insertion order so grouping and index-based reordering
    // behave consistently after role changes.
    normalizePlayerOrder(season, currentSquad);
    
    saveToStorage();
    renderPlayers();
    // If charts panel is visible, refresh charts to reflect changes
    if (document.getElementById('chartsPanel') && !document.getElementById('chartsPanel').classList.contains('hidden')) {
        renderCharts();
    }
    closePlayerModal();
}

/**
 * Get form data as object
 */
function getPlayerFormData() {
    return {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        nationality: document.getElementById('nationality').value.trim(),
        role: document.getElementById('role').value,
        overall: parseInt(document.getElementById('overall').value) || 0,
        potential: parseInt(document.getElementById('potential').value) || 0,
        age: parseInt(document.getElementById('age').value) || 0,
        contractEnd: document.getElementById('contractEnd').value,
        skills: parseInt(document.getElementById('skills').value) || 0,
        weakFoot: parseInt(document.getElementById('weakFoot').value) || 0,
        foot: document.getElementById('foot').value,
        totalStats: parseInt(document.getElementById('totalStats').value) || 0,
        value: parseInt(document.getElementById('value').value) || 0,
        wage: parseInt(document.getElementById('wage').value) || 0,
        appearances: parseInt(document.getElementById('appearances').value) || 0,
        goals: parseInt(document.getElementById('goals').value) || 0,
        assists: parseInt(document.getElementById('assists').value) || 0,
        cleanSheets: parseInt(document.getElementById('cleanSheets').value) || 0,
        yellowCards: parseInt(document.getElementById('yellowCards').value) || 0,
        redCards: parseInt(document.getElementById('redCards').value) || 0,
        avgRating: parseFloat(document.getElementById('avgRating').value) || 0
    };
}

/**
 * Validate player form
 */
function validatePlayerForm(data) {
    let isValid = true;
    
    if (!data.firstName) {
        showPlayerError('firstName', 'First name is required');
        isValid = false;
    }
    
    if (!data.lastName) {
        showPlayerError('lastName', 'Last name is required');
        isValid = false;
    }
    
    if (!data.role) {
        showPlayerError('role', 'Role is required');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Show player validation error
 */
function showPlayerError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

/**
 * Clear player validation errors
 */
function clearPlayerErrors() {
    document.querySelectorAll('#playerForm .text-red-500').forEach(el => {
        el.classList.add('hidden');
    });
}

/**
 * Edit player
 */
function editPlayer(playerId) {
    openPlayerModal(playerId);
}

/**
 * Delete player
 */
function deletePlayer(playerId) {
    if (confirm('Are you sure you want to delete this player?')) {
        const season = getCurrentSeason();
        if (season) {
            delete season.roster[currentSquad].players[playerId];
            saveToStorage();
            renderPlayers();
        }
    }
}

/**
 * Promote player from youth academy to main squad
 */
function promotePlayer(playerId) {
    if (currentSquad !== 'youth_academy') {
        alert('This action is only available for youth academy players.');
        return;
    }
    
    const season = getCurrentSeason();
    if (!season) {
        alert('No season selected.');
        return;
    }
    
    const player = season.roster.youth_academy.players[playerId];
    if (!player) {
        alert('Player not found.');
        return;
    }
    
    if (confirm(`Are you sure you want to promote ${player.firstName} ${player.lastName} to the main squad?\n\nThis player will be moved from Youth Academy to Main Squad.`)) {
        // Add to main squad
        season.roster.main_squad.players[playerId] = player;
        // Remove from youth academy
        delete season.roster.youth_academy.players[playerId];
    // Normalize ordering in both squads so the moved player is placed
    // consistently within the main squad grouping
    normalizePlayerOrder(season, 'main_squad');
    normalizePlayerOrder(season, 'youth_academy');
        saveToStorage();
        renderPlayers();
        if (document.getElementById('chartsPanel') && !document.getElementById('chartsPanel').classList.contains('hidden')) {
            renderCharts();
        }
        
    // Show success message
    alert(`${player.firstName} ${player.lastName} has been promoted to the main squad.`);
    }
}

/**
 * Show charts panel
 */
function showCharts() {
    document.getElementById('chartsPanel').classList.remove('hidden');
    renderCharts();
}

/**
 * Hide charts panel
 */
function hideCharts() {
    document.getElementById('chartsPanel').classList.add('hidden');
    destroyCharts();
}

/**
 * Show transfers panel
 */
function showTransfers() {
    document.getElementById('transfersPanel').classList.remove('hidden');
    renderTransfers();
}

/**
 * Hide transfers panel
 */
function hideTransfers() {
    document.getElementById('transfersPanel').classList.add('hidden');
}

/**
 * Render charts
 */
function renderCharts() {
    const players = getCurrentPlayers();
    const playersArray = Object.values(players);
    
    if (playersArray.length === 0) {
        return;
    }
    
    renderAgeChart(playersArray);
    renderRoleChart(playersArray);
    // Position stat chart
    renderPositionStatChart(playersArray);
}

/**
 * Render average of selected stat by position (role code)
 */
function renderPositionStatChart(players) {
    const select = document.getElementById('statSelect');
    const stat = select ? select.value : 'overall';
    const ctxEl = document.getElementById('positionStatChart');
    if (!ctxEl) return;
    const ctx = ctxEl.getContext('2d');

    // destroy existing chart
    if (charts.positionStatChart) charts.positionStatChart.destroy();

    // compute averages per position
    // compute group averages for position groups
    const averages = computeGroupAverages(players.reduce((acc, p) => { acc[p.id || generateId()] = p; return acc; }, {}));
    // Use POSITION_GROUPS order for labels so charts match other chart ordering
    const labels = Object.keys(POSITION_GROUPS).filter(g => averages[g]);
    // include any extra groups at the end
    const extra = Object.keys(averages).filter(k => !labels.includes(k)).sort();
    labels.push(...extra);
    const data = [];
    const bg = [];

    labels.forEach(pos => {
        const a = averages[pos];
        let value = 0;
        if (stat === 'nationality') {
            value = a.nationalityCount || 0;
        } else if (stat === 'foot') {
            value = a.footCount || 0;
        } else if (stat === 'contractEnd') {
            // convert contractEnd avg to year number if available
            value = a.contractEnd ? Number(a.contractEnd.split('-')[0]) : 0;
        } else {
            value = Number(a[stat]) || 0;
        }

    data.push(value);
    // color by position group using GROUP_COLORS mapping
    const color = GROUP_COLORS[pos] ? GROUP_COLORS[pos].color : '#9CA3AF';
    bg.push(color);
    });

    charts.positionStatChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: `Average ${stat} by Position Group`,
                data,
                backgroundColor: bg,
                borderColor: bg,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

/**
 * Render average age by position chart
 */
function renderAgeChart(players) {
    const ctx = document.getElementById('ageChart').getContext('2d');
    
    // Destroy existing chart
    if (charts.ageChart) {
        charts.ageChart.destroy();
    }
    
    // Calculate average age by position group
    const ageData = {};
    Object.entries(POSITION_GROUPS).forEach(([groupName, positions]) => {
        const groupPlayers = players.filter(p => positions.includes(p.role));
        if (groupPlayers.length > 0) {
            const avgAge = groupPlayers.reduce((sum, p) => sum + (p.age || 0), 0) / groupPlayers.length;
            ageData[groupName] = Math.round(avgAge * 10) / 10;
        }
    });
    
    charts.ageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ageData),
            datasets: [{
                label: 'Average Age',
                data: Object.values(ageData),
                backgroundColor: Object.keys(ageData).map(g => (GROUP_COLORS[g] ? GROUP_COLORS[g].color : '#9CA3AF')),
                borderColor: Object.keys(ageData).map(g => (GROUP_COLORS[g] ? GROUP_COLORS[g].color : '#6B7280')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Age'
                    }
                }
            }
        }
    });
}

/**
 * Render role distribution chart
 */
function renderRoleChart(players) {
    const ctx = document.getElementById('roleChart').getContext('2d');
    
    // Destroy existing chart
    if (charts.roleChart) {
        charts.roleChart.destroy();
    }
    
    // Count players by role
    const roleCounts = {};
    players.forEach(player => {
        const role = player.role || 'Unknown';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    
    charts.roleChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(roleCounts),
            datasets: [{
                data: Object.values(roleCounts),
                // Map each role to its position group color, fallback to gray
                backgroundColor: Object.keys(roleCounts).map(role => {
                    // find which group contains this role
                    for (const [groupName, positions] of Object.entries(POSITION_GROUPS)) {
                        if (positions.includes(role)) return GROUP_COLORS[groupName].color;
                    }
                    return '#9CA3AF';
                }),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

/**
 * Destroy all charts
 */
function destroyCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
}

/**
 * Show storage information modal
 */
function showStorageInfo() {
    const modal = document.getElementById('storageModal');
    const infoContainer = document.getElementById('storageInfo');
    
    // Calculate storage usage
    const storageUsage = calculateStorageUsage();
    
    infoContainer.innerHTML = `
        <div class="text-sm space-y-2">
            <div class="flex justify-between">
                <span>Current data size:</span>
                <span class="font-medium">${storageUsage.currentSize}</span>
            </div>
            <div class="flex justify-between">
                <span>Estimated storage used:</span>
                <span class="font-medium">${storageUsage.totalUsed}</span>
            </div>
            <div class="flex justify-between">
                <span>Number of seasons:</span>
                <span class="font-medium">${currentSeasons.length}</span>
            </div>
            <div class="flex justify-between">
                <span>Total players:</span>
                <span class="font-medium">${storageUsage.totalPlayers}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div class="bg-${storageUsage.warningLevel === 'high' ? 'red' : storageUsage.warningLevel === 'medium' ? 'yellow' : 'green'}-600 h-2 rounded-full" 
                     style="width: ${storageUsage.percentage}%"></div>
            </div>
            <div class="text-xs text-gray-600 text-center">
                ${storageUsage.percentage}% of estimated localStorage capacity
            </div>
            ${storageUsage.warningLevel === 'high' ? 
                '<div class="text-red-600 text-sm mt-2">⚠️ Storage is nearly full. Consider exporting data and removing old seasons.</div>' : 
                storageUsage.warningLevel === 'medium' ? 
                '<div class="text-yellow-600 text-sm mt-2">⚠️ Storage usage is moderate. Consider regular backups.</div>' : 
                '<div class="text-green-600 text-sm mt-2">✅ Storage usage is healthy.</div>'
            }
        </div>
    `;
    
    modal.classList.remove('hidden');
}

/**
 * Close storage modal
 */
function closeStorageModal() {
    document.getElementById('storageModal').classList.add('hidden');
}

/**
 * Clear all storage data
 */
function clearStorage() {
    if (confirm('This will permanently delete ALL your data including all seasons and players. This cannot be undone.\n\nAre you sure you want to continue?')) {
        if (confirm('Last chance! This will erase everything. Export your data first if you want to keep it.')) {
            localStorage.removeItem('cmutils_data');
            currentSeasons = [];
            currentSeasonId = null;
            currentSquad = 'main_squad';
            
            renderSeasonTabs();
            renderPlayers();
            closeStorageModal();
            
            alert('All data has been cleared. You can now start fresh or import a backup.');
        }
    }
}

/**
 * Calculate storage usage statistics
 */
function calculateStorageUsage() {
    try {
        const dataString = JSON.stringify({ seasons: currentSeasons });
        const currentSizeBytes = new Blob([dataString]).size;
        
        // Estimate total localStorage usage
        let totalUsedBytes = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalUsedBytes += localStorage[key].length + key.length;
            }
        }
        
        // Count total players
        let totalPlayers = 0;
        currentSeasons.forEach(season => {
            if (season.roster) {
                ['main_squad', 'youth_academy'].forEach(squadType => {
                    if (season.roster[squadType] && season.roster[squadType].players) {
                        totalPlayers += Object.keys(season.roster[squadType].players).length;
                    }
                });
            }
        });
        
        // Estimate localStorage limit (typically 5-10MB, we'll use 5MB as conservative estimate)
        const estimatedLimit = 5 * 1024 * 1024; // 5MB
        const percentage = Math.round((totalUsedBytes / estimatedLimit) * 100);
        
        let warningLevel = 'low';
        if (percentage >= 80) warningLevel = 'high';
        else if (percentage >= 50) warningLevel = 'medium';
        
        return {
            currentSize: formatBytes(currentSizeBytes),
            totalUsed: formatBytes(totalUsedBytes),
            percentage: Math.min(percentage, 100),
            warningLevel,
            totalPlayers
        };
    } catch (error) {
        return {
            currentSize: 'Unknown',
            totalUsed: 'Unknown',
            percentage: 0,
            warningLevel: 'low',
            totalPlayers: 0
        };
    }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Export data as JSON
 */
function exportData() {
    const data = { seasons: currentSeasons };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cmutils_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

/**
 * Import data from JSON file
 */
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.seasons && Array.isArray(data.seasons)) {
                if (confirm('This will replace all current data. Are you sure?')) {
                    currentSeasons = data.seasons;
                    currentSeasonId = currentSeasons.length > 0 ? currentSeasons[0].id : null;
                    currentSquad = 'main_squad';
                    
                    saveToStorage();
                    renderSeasonTabs();
                    renderPlayers();
                    hideCharts();
                    
                    alert('Data imported successfully!');
                }
            } else {
                alert('Invalid file format. Please select a valid CMutils export file.');
            }
        } catch (error) {
            alert('Error reading file. Please make sure it\'s a valid JSON file.');
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Make functions available globally for onclick handlers
window.editPlayer = editPlayer;
window.deletePlayer = deletePlayer;
window.promotePlayer = promotePlayer;
window.movePlayerUp = movePlayerUp;
window.movePlayerDown = movePlayerDown;
window.deleteSeason = deleteSeason;
window.openPlayerModal = openPlayerModal;
window.showStorageInfo = showStorageInfo;
window.addPlayerToTransferList = addPlayerToTransferList;
window.addPlayerCopyToBuyList = addPlayerCopyToBuyList;
window.removeFromTransferList = removeFromTransferList;
window.clearTransferList = clearTransferList;
window.openTransferPlayerModal = openTransferPlayerModal;
window.showTransferInPlayers = showTransferInPlayers;
// promotion modal removed; no global close function
