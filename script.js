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
let draggedElement = null;
let charts = {};

// Position groups for drag-and-drop ordering
const POSITION_GROUPS = {
    'Goalkeepers': ['GK'],
    'Defenders': ['LB', 'CB', 'RB'],
    'Midfielders': ['CDM', 'LM', 'CM', 'RM', 'CAM'],
    'Forwards': ['LW', 'ST', 'RW']
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
                html += `
                    <tr draggable="true" data-player-id="${player.id}" data-position-group="${groupName}" class="player-row ${groupClass}">
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
                html += `
                    <div class="player-card ${groupClass}" draggable="true" data-player-id="${player.id}" data-position-group="${groupName}">
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
        currentSeasons.push(newSeason);
        currentSeasonId = newSeason.id;
    }
    
    saveToStorage();
    renderSeasonTabs();
    renderPlayers();
    closeSeasonModal();
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
                backgroundColor: '#000000',
                borderColor: '#666666',
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
                backgroundColor: [
                    '#000000', '#333333', '#666666', '#999999', '#cccccc',
                    '#444444', '#777777', '#aaaaaa', '#dddddd', '#555555',
                    '#888888', '#bbbbbb'
                ],
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
// promotion modal removed; no global close function
