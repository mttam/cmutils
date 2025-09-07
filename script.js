
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
        const natHtml = renderNationalityHTML(a.nationality, 16);
        html += `<tr class="border-t"><td class="px-2 py-1">${pos}</td><td class="px-2 py-1">${natHtml} <span class="text-xs text-gray-500">(${a.nationalityCount})</span></td><td class="px-2 py-1">${a.overall}</td><td class="px-2 py-1">${a.potential}</td><td class="px-2 py-1">${a.contractEnd || 'N/A'}</td><td class="px-2 py-1">${a.skills}</td><td class="px-2 py-1">${a.weakFoot}</td><td class="px-2 py-1">${a.foot}</td><td class="px-2 py-1">${a.totalStats}</td><td class="px-2 py-1">${formatNumber(a.value)}</td><td class="px-2 py-1">${formatNumber(a.wage)}</td><td class="px-2 py-1">${a.appearances}</td><td class="px-2 py-1">${a.goals}</td><td class="px-2 py-1">${a.assists}</td><td class="px-2 py-1">${a.cleanSheets}</td><td class="px-2 py-1">${a.yellowCards}</td><td class="px-2 py-1">${a.redCards}</td><td class="px-2 py-1">${a.avgRating}</td></tr>`;
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

// Country mapping: code -> { name, flagFile }
// This maps common 3-letter codes used in sample data to flag filenames and English names.
const COUNTRY_MAP = Object.assign({}, {
    'AFG': { name: 'Afghanistan', flag: 'AF' },
    'ALB': { name: 'Albania', flag: 'AL' },
    'DZA': { name: 'Algeria', flag: 'DZ' },
    'ASM': { name: 'American Samoa', flag: 'AS' },
    'AND': { name: 'Andorra', flag: 'AD' },
    'AGO': { name: 'Angola', flag: 'AO' },
    'AIA': { name: 'Anguilla', flag: 'AI' },
    'ATA': { name: 'Antarctica', flag: 'AQ' },
    'ATG': { name: 'Antigua and Barbuda', flag: 'AG' },
    'ARG': { name: 'Argentina', flag: 'AR' },
    'ARM': { name: 'Armenia', flag: 'AM' },
    'ABW': { name: 'Aruba', flag: 'AW' },
    'AUS': { name: 'Australia', flag: 'AU' },
    'AUT': { name: 'Austria', flag: 'AT' },
    'AZE': { name: 'Azerbaijan', flag: 'AZ' },
    'BHS': { name: 'Bahamas', flag: 'BS' },
    'BHR': { name: 'Bahrain', flag: 'BH' },
    'BGD': { name: 'Bangladesh', flag: 'BD' },
    'BRB': { name: 'Barbados', flag: 'BB' },
    'BLR': { name: 'Belarus', flag: 'BY' },
    'BEL': { name: 'Belgium', flag: 'BE' },
    'BLZ': { name: 'Belize', flag: 'BZ' },
    'BEN': { name: 'Benin', flag: 'BJ' },
    'BMU': { name: 'Bermuda', flag: 'BM' },
    'BTN': { name: 'Bhutan', flag: 'BT' },
    'BOL': { name: 'Bolivia', flag: 'BO' },
    'BES': { name: 'Bonaire, Sint Eustatius and Saba', flag: 'BQ' },
    'BIH': { name: 'Bosnia and Herzegovina', flag: 'BA' },
    'BWA': { name: 'Botswana', flag: 'BW' },
    'BVT': { name: 'Bouvet Island', flag: 'BV' },
    'BRA': { name: 'Brazil', flag: 'BR' },
    'IOT': { name: 'British Indian Ocean Territory', flag: 'IO' },
    'VGB': { name: 'British Virgin Islands', flag: 'VG' },
    'BRN': { name: 'Brunei Darussalam', flag: 'BN' },
    'BGR': { name: 'Bulgaria', flag: 'BG' },
    'BFA': { name: 'Burkina Faso', flag: 'BF' },
    'BDI': { name: 'Burundi', flag: 'BI' },
    'CPV': { name: 'Cabo Verde', flag: 'CV' },
    'KHM': { name: 'Cambodia', flag: 'KH' },
    'CMR': { name: 'Cameroon', flag: 'CM' },
    'CAN': { name: 'Canada', flag: 'CA' },
    'CYM': { name: 'Cayman Islands', flag: 'KY' },
    'CAF': { name: 'Central African Republic', flag: 'CF' },
    'TCD': { name: 'Chad', flag: 'TD' },
    'CHL': { name: 'Chile', flag: 'CL' },
    'CHN': { name: 'China', flag: 'CN' },
    'CXR': { name: 'Christmas Island', flag: 'CX' },
    'CCK': { name: 'Cocos (Keeling) Islands', flag: 'CC' },
    'COL': { name: 'Colombia', flag: 'CO' },
    'COM': { name: 'Comoros', flag: 'KM' },
    'COD': { name: 'Congo, The Democratic Republic of the', flag: 'CD' },
    'COG': { name: 'Congo', flag: 'CG' },
    'COK': { name: 'Cook Islands', flag: 'CK' },
    'CRI': { name: 'Costa Rica', flag: 'CR' },
    'CIV': { name: 'Côte d\'Ivoire', flag: 'CI' },
    'HRV': { name: 'Croatia', flag: 'HR' },
    'CUB': { name: 'Cuba', flag: 'CU' },
    'CUW': { name: 'Curaçao', flag: 'CW' },
    'CYP': { name: 'Cyprus', flag: 'CY' },
    'CZE': { name: 'Czechia', flag: 'CZ' },
    'DNK': { name: 'Denmark', flag: 'DK' },
    'DJI': { name: 'Djibouti', flag: 'DJ' },
    'DMA': { name: 'Dominica', flag: 'DM' },
    'DOM': { name: 'Dominican Republic', flag: 'DO' },
    'ECU': { name: 'Ecuador', flag: 'EC' },
    'EGY': { name: 'Egypt', flag: 'EG' },
    'SLV': { name: 'El Salvador', flag: 'SV' },
    'GNQ': { name: 'Equatorial Guinea', flag: 'GQ' },
    'ERI': { name: 'Eritrea', flag: 'ER' },
    'EST': { name: 'Estonia', flag: 'EE' },
    'SWZ': { name: 'Eswatini', flag: 'SZ' },
    'ETH': { name: 'Ethiopia', flag: 'ET' },
    'FLK': { name: 'Falkland Islands (Malvinas)', flag: 'FK' },
    'FRO': { name: 'Faroe Islands', flag: 'FO' },
    'FJI': { name: 'Fiji', flag: 'FJ' },
    'FIN': { name: 'Finland', flag: 'FI' },
    'FRA': { name: 'France', flag: 'FR' },
    'GUF': { name: 'French Guiana', flag: 'GF' },
    'PYF': { name: 'French Polynesia', flag: 'PF' },
    'ATF': { name: 'French Southern Territories', flag: 'TF' },
    'GAB': { name: 'Gabon', flag: 'GA' },
    'GMB': { name: 'Gambia', flag: 'GM' },
    'GEO': { name: 'Georgia', flag: 'GE' },
    'DEU': { name: 'Germany', flag: 'DE' },
    'GHA': { name: 'Ghana', flag: 'GH' },
    'GIB': { name: 'Gibraltar', flag: 'GI' },
    'GRC': { name: 'Greece', flag: 'GR' },
    'GRL': { name: 'Greenland', flag: 'GL' },
    'GRD': { name: 'Grenada', flag: 'GD' },
    'GLP': { name: 'Guadeloupe', flag: 'GP' },
    'GUM': { name: 'Guam', flag: 'GU' },
    'GTM': { name: 'Guatemala', flag: 'GT' },
    'GGY': { name: 'Guernsey', flag: 'GG' },
    'GIN': { name: 'Guinea', flag: 'GN' },
    'GNB': { name: 'Guinea-Bissau', flag: 'GW' },
    'GUY': { name: 'Guyana', flag: 'GY' },
    'HTI': { name: 'Haiti', flag: 'HT' },
    'HMD': { name: 'Heard Island and McDonald Islands', flag: 'HM' },
    'VAT': { name: 'Holy See (Vatican City State)', flag: 'VA' },
    'HND': { name: 'Honduras', flag: 'HN' },
    'HKG': { name: 'Hong Kong', flag: 'HK' },
    'HUN': { name: 'Hungary', flag: 'HU' },
    'ISL': { name: 'Iceland', flag: 'IS' },
    'IND': { name: 'India', flag: 'IN' },
    'IDN': { name: 'Indonesia', flag: 'ID' },
    'IRN': { name: 'Iran', flag: 'IR' },
    'IRQ': { name: 'Iraq', flag: 'IQ' },
    'IRL': { name: 'Ireland', flag: 'IE' },
    'IMN': { name: 'Isle of Man', flag: 'IM' },
    'ISR': { name: 'Israel', flag: 'IL' },
    'ITA': { name: 'Italy', flag: 'IT' },
    'JAM': { name: 'Jamaica', flag: 'JM' },
    'JPN': { name: 'Japan', flag: 'JP' },
    'JEY': { name: 'Jersey', flag: 'JE' },
    'JOR': { name: 'Jordan', flag: 'JO' },
    'KAZ': { name: 'Kazakhstan', flag: 'KZ' },
    'KEN': { name: 'Kenya', flag: 'KE' },
    'KIR': { name: 'Kiribati', flag: 'KI' },
    'KOR': { name: 'Korea (Republic of)', flag: 'KR' },
    'PRK': { name: 'Korea (Democratic People\'s Republic of)', flag: 'KP' },
    'XKS': { name: 'Kosovo', flag: 'XK' },
    'KWT': { name: 'Kuwait', flag: 'KW' },
    'KGZ': { name: 'Kyrgyzstan', flag: 'KG' },
    'LAO': { name: 'Laos', flag: 'LA' },
    'LVA': { name: 'Latvia', flag: 'LV' },
    'LBN': { name: 'Lebanon', flag: 'LB' },
    'LSO': { name: 'Lesotho', flag: 'LS' },
    'LBR': { name: 'Liberia', flag: 'LR' },
    'LBY': { name: 'Libya', flag: 'LY' },
    'LIE': { name: 'Liechtenstein', flag: 'LI' },
    'LTU': { name: 'Lithuania', flag: 'LT' },
    'LUX': { name: 'Luxembourg', flag: 'LU' },
    'MAC': { name: 'Macao', flag: 'MO' },
    'MDG': { name: 'Madagascar', flag: 'MG' },
    'MWI': { name: 'Malawi', flag: 'MW' },
    'MYS': { name: 'Malaysia', flag: 'MY' },
    'MDV': { name: 'Maldives', flag: 'MV' },
    'MLI': { name: 'Mali', flag: 'ML' },
    'MLT': { name: 'Malta', flag: 'MT' },
    'MHL': { name: 'Marshall Islands', flag: 'MH' },
    'MTQ': { name: 'Martinique', flag: 'MQ' },
    'MRT': { name: 'Mauritania', flag: 'MR' },
    'MUS': { name: 'Mauritius', flag: 'MU' },
    'MYT': { name: 'Mayotte', flag: 'YT' },
    'MEX': { name: 'Mexico', flag: 'MX' },
    'FSM': { name: 'Micronesia', flag: 'FM' },
    'MDA': { name: 'Moldova', flag: 'MD' },
    'MCO': { name: 'Monaco', flag: 'MC' },
    'MNG': { name: 'Mongolia', flag: 'MN' },
    'MNE': { name: 'Montenegro', flag: 'ME' },
    'MSR': { name: 'Montserrat', flag: 'MS' },
    'MAR': { name: 'Morocco', flag: 'MA' },
    'MOZ': { name: 'Mozambique', flag: 'MZ' },
    'MMR': { name: 'Myanmar', flag: 'MM' },
    'NAM': { name: 'Namibia', flag: 'NA' },
    'NRU': { name: 'Nauru', flag: 'NR' },
    'NPL': { name: 'Nepal', flag: 'NP' },
    'NLD': { name: 'Netherlands', flag: 'NL' },
    'NCL': { name: 'New Caledonia', flag: 'NC' },
    'NZL': { name: 'New Zealand', flag: 'NZ' },
    'NIC': { name: 'Nicaragua', flag: 'NI' },
    'NER': { name: 'Niger', flag: 'NE' },
    'NGA': { name: 'Nigeria', flag: 'NG' },
    'NIU': { name: 'Niue', flag: 'NU' },
    'NFK': { name: 'Norfolk Island', flag: 'NF' },
    'MKD': { name: 'North Macedonia', flag: 'MK' },
    'MNP': { name: 'Northern Mariana Islands', flag: 'MP' },
    'NOR': { name: 'Norway', flag: 'NO' },
    'OMN': { name: 'Oman', flag: 'OM' },
    'PAK': { name: 'Pakistan', flag: 'PK' },
    'PLW': { name: 'Palau', flag: 'PW' },
    'PSE': { name: 'Palestine', flag: 'PS' },
    'PAN': { name: 'Panama', flag: 'PA' },
    'PNG': { name: 'Papua New Guinea', flag: 'PG' },
    'PRY': { name: 'Paraguay', flag: 'PY' },
    'PER': { name: 'Peru', flag: 'PE' },
    'PHL': { name: 'Philippines', flag: 'PH' },
    'PCN': { name: 'Pitcairn', flag: 'PN' },
    'POL': { name: 'Poland', flag: 'PL' },
    'PRT': { name: 'Portugal', flag: 'PT' },
    'PRI': { name: 'Puerto Rico', flag: 'PR' },
    'QAT': { name: 'Qatar', flag: 'QA' },
    'REU': { name: 'Réunion', flag: 'RE' },
    'ROU': { name: 'Romania', flag: 'RO' },
    'RUS': { name: 'Russia', flag: 'RU' },
    'RWA': { name: 'Rwanda', flag: 'RW' },
    'BLM': { name: 'Saint Barthélemy', flag: 'BL' },
    'SHN': { name: 'Saint Helena', flag: 'SH' },
    'KNA': { name: 'Saint Kitts and Nevis', flag: 'KN' },
    'LCA': { name: 'Saint Lucia', flag: 'LC' },
    'MAF': { name: 'Saint Martin (French part)', flag: 'MF' },
    'SPM': { name: 'Saint Pierre and Miquelon', flag: 'PM' },
    'VCT': { name: 'Saint Vincent and the Grenadines', flag: 'VC' },
    'WSM': { name: 'Samoa', flag: 'WS' },
    'SMR': { name: 'San Marino', flag: 'SM' },
    'STP': { name: 'Sao Tome and Principe', flag: 'ST' },
    'SAU': { name: 'Saudi Arabia', flag: 'SA' },
    'SEN': { name: 'Senegal', flag: 'SN' },
    'SRB': { name: 'Serbia', flag: 'RS' },
    'SYC': { name: 'Seychelles', flag: 'SC' },
    'SLE': { name: 'Sierra Leone', flag: 'SL' },
    'SGP': { name: 'Singapore', flag: 'SG' },
    'SXM': { name: 'Sint Maarten (Dutch part)', flag: 'SX' },
    'SVK': { name: 'Slovakia', flag: 'SK' },
    'SVN': { name: 'Slovenia', flag: 'SI' },
    'SLB': { name: 'Solomon Islands', flag: 'SB' },
    'SOM': { name: 'Somalia', flag: 'SO' },
    'ZAF': { name: 'South Africa', flag: 'ZA' },
    'SGS': { name: 'South Georgia and the South Sandwich Islands', flag: 'GS' },
    'SSD': { name: 'South Sudan', flag: 'SS' },
    'ESP': { name: 'Spain', flag: 'ES' },
    'LKA': { name: 'Sri Lanka', flag: 'LK' },
    'SDN': { name: 'Sudan', flag: 'SD' },
    'SUR': { name: 'Suriname', flag: 'SR' },
    'SJM': { name: 'Svalbard and Jan Mayen', flag: 'SJ' },
    'SWE': { name: 'Sweden', flag: 'SE' },
    'CHE': { name: 'Switzerland', flag: 'CH' },
    'SYR': { name: 'Syria', flag: 'SY' },
    'TWN': { name: 'Taiwan', flag: 'TW' },
    'TJK': { name: 'Tajikistan', flag: 'TJ' },
    'TZA': { name: 'Tanzania', flag: 'TZ' },
    'THA': { name: 'Thailand', flag: 'TH' },
    'TLS': { name: 'Timor-Leste', flag: 'TL' },
    'TGO': { name: 'Togo', flag: 'TG' },
    'TKL': { name: 'Tokelau', flag: 'TK' },
    'TON': { name: 'Tonga', flag: 'TO' },
    'TTO': { name: 'Trinidad and Tobago', flag: 'TT' },
    'TUN': { name: 'Tunisia', flag: 'TN' },
    'TUR': { name: 'Turkey', flag: 'TR' },
    'TKM': { name: 'Turkmenistan', flag: 'TM' },
    'TCA': { name: 'Turks and Caicos Islands', flag: 'TC' },
    'TUV': { name: 'Tuvalu', flag: 'TV' },
    'UGA': { name: 'Uganda', flag: 'UG' },
    'UKR': { name: 'Ukraine', flag: 'UA' },
    'ARE': { name: 'United Arab Emirates', flag: 'AE' },
    'GBR': { name: 'United Kingdom', flag: 'GB' },
    'USA': { name: 'United States', flag: 'US' },
    'UMI': { name: 'United States Minor Outlying Islands', flag: 'UM' },
    'VIR': { name: 'United States Virgin Islands', flag: 'VI' },
    'URY': { name: 'Uruguay', flag: 'UY' },
    'UZB': { name: 'Uzbekistan', flag: 'UZ' },
    'VUT': { name: 'Vanuatu', flag: 'VU' },
    'VEN': { name: 'Venezuela', flag: 'VE' },
    'VNM': { name: 'Vietnam', flag: 'VN' },
    'WLF': { name: 'Wallis and Futuna', flag: 'WF' },
    'ESH': { name: 'Western Sahara', flag: 'EH' },
    'YEM': { name: 'Yemen', flag: 'YE' },
    'ZMB': { name: 'Zambia', flag: 'ZM' },
    'ZWE': { name: 'Zimbabwe', flag: 'ZW' },
    'ENG': { name: 'England', flag: 'GB-ENG' },
    'SCT': { name: 'Scotland', flag: 'GB-SCT' },
    'WLS': { name: 'Wales', flag: 'GB-WLS' },
    'NIR': { name: 'Northern Ireland', flag: 'GB-NIR' },
    'GB': { name: 'United Kingdom', flag: 'GB' },
    'GER': { name: 'Germany', flag: 'DE' },
    'IRE': { name: 'Ireland', flag: 'IE' },
    'POR': { name: 'Portugal', flag: 'PT' },
    'UK': { name: 'United Kingdom', flag: 'GB' }
});

/**
 * Render nationality as HTML: flag SVG + English name (falls back to code or 'Unknown')
 * Accepts codes like 'ENG', 'IT', 'GB-ENG' and returns an HTML string.
 */
function renderNationalityHTML(code, imgSize = 18) {
    const c = (code || '').toString().trim();
    if (!c) return '<span class="text-sm text-gray-500">Unknown</span>';

    // Determine mapping
    const mapping = COUNTRY_MAP[c] || COUNTRY_MAP[c.toUpperCase()];
    let name = c;
    let flagFile = c;
    if (mapping) {
        name = mapping.name || c;
        flagFile = mapping.flag || c;
    } else {
        // If it's a 3-letter not in map, try using first 2 letters as flag filename
        if (c.length === 3) {
            flagFile = c.substring(0,2).toUpperCase();
        }
    }

    const imgSrc = `flags/${flagFile}.svg`;
    // Return an inline HTML snippet. img has onerror to hide itself if file missing.
    return `
        <span class="inline-flex items-center gap-2">
            <img src="${imgSrc}" alt="${name}" style="width:${imgSize}px;height:${Math.round(imgSize*0.64)}px;" onerror="this.style.display='none'" />
            <span class="text-sm text-gray-700">${escapeHtml(name)}</span>
        </span>
    `;
}

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
    // initialize flag picker UI
    try { setupFlagPicker(); } catch (e) { console.warn('Flag picker init failed', e); }
});

// Initialize flag picker after DOM is ready
function setupFlagPicker() {
    const picker = document.getElementById('flagPicker');
    const selectedImg = document.getElementById('selectedFlag');
    const selectedText = document.getElementById('selectedFlagText');
    const nationalityInput = document.getElementById('nationality');
    const selectedFlagBtn = document.getElementById('selectedFlagBtn');
    if (!picker || !selectedImg || !selectedText || !nationalityInput) return;

    // Create searchable country list from COUNTRY_MAP
    const searchableCountries = [];
    
    // Add countries from COUNTRY_MAP with their names and codes
    Object.entries(COUNTRY_MAP).forEach(([code, data]) => {
        searchableCountries.push({
            code: code,
            name: data.name,
            flag: data.flag,
            searchText: `${data.name.toLowerCase()} ${code.toLowerCase()}`
        });
    });

    // Known flag codes (files exist in ./flags) - fallback for codes not in COUNTRY_MAP
    const flagCodes = [
        'AD','AE','AF','AG','AI','AL','AM','AO','AR','AT','AU','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BR','BS','BT','BW','BY','BZ','CA','CH','CL','CN','CO','CR','CU','CY','CZ','DE','DJ','DK','DO','DZ','EC','EE','EG','ES','ET','FI','FJ','FK','FM','FR','GB','GB-ENG','GB-SCT','GB-WLS','GB-NIR','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GT','GU','GW','GY','HK','HN','HR','HT','HU','ID','IE','IL','IM','IN','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WS','YE','YT','ZA','ZM','ZW'
    ];

    // Add any remaining flag codes not in COUNTRY_MAP
    flagCodes.forEach(code => {
        if (!searchableCountries.find(c => c.code === code || c.flag === code)) {
            searchableCountries.push({
                code: code,
                name: code,
                flag: code,
                searchText: code.toLowerCase()
            });
        }
    });

    // Sort countries alphabetically by name
    searchableCountries.sort((a, b) => a.name.localeCompare(b.name));

    function renderCountries(countries = searchableCountries) {
        picker.innerHTML = '';
        
        // Add search input at the top
        const searchContainer = document.createElement('div');
        searchContainer.className = 'p-2 border-b border-gray-200';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search countries...';
        searchInput.className = 'w-full px-2 py-1 border border-gray-300 rounded text-sm';
        searchContainer.appendChild(searchInput);
        picker.appendChild(searchContainer);

        // Add countries container
        const countriesContainer = document.createElement('div');
        countriesContainer.className = 'max-h-32 overflow-auto';
        picker.appendChild(countriesContainer);

        countries.forEach(country => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'flag-btn flex items-center w-full p-2 m-0 border-b border-gray-100 hover:bg-gray-50 text-left';
            btn.dataset.code = country.code;
            btn.dataset.flag = country.flag;
            
            const img = document.createElement('img');
            img.src = `flags/${country.flag}.svg`;
            img.alt = country.name;
            img.style.width = '24px';
            img.style.height = '16px';
            img.className = 'mr-2 flex-shrink-0';
            img.onerror = function() { btn.style.display = 'none'; };
            
            const textSpan = document.createElement('span');
            textSpan.className = 'text-sm';
            textSpan.textContent = `${country.name} (${country.code})`;
            
            btn.appendChild(img);
            btn.appendChild(textSpan);
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedImg.src = `flags/${country.flag}.svg`;
                selectedImg.style.display = '';
                selectedText.textContent = country.name;
                nationalityInput.value = country.code;
                picker.classList.add('hidden');
            });
            
            countriesContainer.appendChild(btn);
        });

        // Handle search input
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredCountries = searchableCountries.filter(country => 
                country.searchText.includes(searchTerm)
            );
            
            // Re-render only the countries container
            countriesContainer.innerHTML = '';
            filteredCountries.forEach(country => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'flag-btn flex items-center w-full p-2 m-0 border-b border-gray-100 hover:bg-gray-50 text-left';
                btn.dataset.code = country.code;
                btn.dataset.flag = country.flag;
                
                const img = document.createElement('img');
                img.src = `flags/${country.flag}.svg`;
                img.alt = country.name;
                img.style.width = '24px';
                img.style.height = '16px';
                img.className = 'mr-2 flex-shrink-0';
                img.onerror = function() { btn.style.display = 'none'; };
                
                const textSpan = document.createElement('span');
                textSpan.className = 'text-sm';
                textSpan.textContent = `${country.name} (${country.code})`;
                
                btn.appendChild(img);
                btn.appendChild(textSpan);
                
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedImg.src = `flags/${country.flag}.svg`;
                    selectedImg.style.display = '';
                    selectedText.textContent = country.name;
                    nationalityInput.value = country.code;
                    picker.classList.add('hidden');
                });
                
                countriesContainer.appendChild(btn);
            });
        });

        // Focus search input when picker opens
        setTimeout(() => searchInput.focus(), 50);
    }

    // Initial render
    renderCountries();

    // Toggle picker visibility
    if (selectedFlagBtn) {
        selectedFlagBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            picker.classList.toggle('hidden');
            if (!picker.classList.contains('hidden')) {
                renderCountries(); // Re-render to reset search
            }
        });
    }

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!picker.contains(e.target) && !selectedFlagBtn.contains(e.target)) {
            picker.classList.add('hidden');
        }
    });

    // Sync input -> selected flag when user types a value
    nationalityInput.addEventListener('input', () => {
        const v = nationalityInput.value.trim();
        if (!v) {
            selectedImg.style.display = 'none';
            selectedText.textContent = 'Select nationality';
            return;
        }

        // Try to find matching country by code or name
        const country = searchableCountries.find(c => 
            c.code.toLowerCase() === v.toLowerCase() || 
            c.name.toLowerCase() === v.toLowerCase()
        );

        if (country) {
            selectedImg.src = `flags/${country.flag}.svg`;
            selectedImg.style.display = '';
            selectedText.textContent = country.name;
        } else {
            // Fallback to using input value as flag code
            selectedImg.src = `flags/${v.toUpperCase()}.svg`;
            selectedImg.style.display = '';
            selectedText.textContent = v.toUpperCase();
        }
    });

    nationalityInput.addEventListener('change', () => {
        const v = nationalityInput.value.trim();
        if (!v) {
            selectedImg.style.display = 'none';
            selectedText.textContent = 'Select nationality';
            return;
        }

        // Try to find matching country by code or name
        const country = searchableCountries.find(c => 
            c.code.toLowerCase() === v.toLowerCase() || 
            c.name.toLowerCase() === v.toLowerCase()
        );

        if (country) {
            selectedImg.src = `flags/${country.flag}.svg`;
            selectedImg.style.display = '';
            selectedText.textContent = country.name;
            nationalityInput.value = country.code; // Store the code
        } else {
            // Fallback to using input value as flag code
            selectedImg.src = `flags/${v.toUpperCase()}.svg`;
            selectedImg.style.display = '';
            selectedText.textContent = v.toUpperCase();
        }
    });
}
    // Transfer list keys used in season.roster.transfers
    const TRANSFER_KEYS = {
        forSale: 'forSale',
        sold: 'sold',
        released: 'released',
        retired: 'retired',
        loan: 'loan',
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
    const notesTab = document.getElementById('notesTab');
    if (notesTab) notesTab.addEventListener('click', () => switchToNotes());
    document.getElementById('mainSquadTab').addEventListener('click', () => switchSquad('main_squad'));
    document.getElementById('youthAcademyTab').addEventListener('click', () => switchSquad('youth_academy'));

    // Player management
    document.getElementById('addPlayerBtn').addEventListener('click', () => openPlayerModal());
    const nextSeasonBtn = document.getElementById('nextSeasonBtn');
    if (nextSeasonBtn) nextSeasonBtn.addEventListener('click', () => nextSeason());
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
    // Season Stats panel wiring
    const showSeasonStatsBtn = document.getElementById('showSeasonStatsBtn');
    if (showSeasonStatsBtn) showSeasonStatsBtn.addEventListener('click', showSeasonStats);
    const hideSeasonStatsBtn = document.getElementById('hideSeasonStatsBtn');
    if (hideSeasonStatsBtn) hideSeasonStatsBtn.addEventListener('click', hideSeasonStats);
    const editSeasonStatsBtn = document.getElementById('editSeasonStatsBtn');
    if (editSeasonStatsBtn) editSeasonStatsBtn.addEventListener('click', openSeasonStatsEditModal);
    const cancelSeasonStatsEditBtn = document.getElementById('cancelSeasonStatsEditBtn');
    if (cancelSeasonStatsEditBtn) cancelSeasonStatsEditBtn.addEventListener('click', closeSeasonStatsEditModal);
    const addTrophyBtn = document.getElementById('addTrophyBtn');
    if (addTrophyBtn) addTrophyBtn.addEventListener('click', () => {
        const c = document.getElementById('trophiesContainer'); if (c) addTrophyRow(c);
    });
    const addAwardBtn = document.getElementById('addAwardBtn');
    if (addAwardBtn) addAwardBtn.addEventListener('click', () => {
        const c = document.getElementById('awardsContainer'); if (c) addAwardRow(c);
    });
    const saveSeasonStatsSaveBtn = document.getElementById('saveSeasonStatsSaveBtn');
    if (saveSeasonStatsSaveBtn) saveSeasonStatsSaveBtn.addEventListener('click', saveSeasonStatsEdits);
    const saveSeasonStatsEditsBtn = document.getElementById('saveSeasonStatsEditsBtn');
    if (saveSeasonStatsEditsBtn) saveSeasonStatsEditsBtn.addEventListener('click', closeSeasonStatsEditModal);
    const exportSeasonStatsCSVBtn = document.getElementById('exportSeasonStatsCSV');
    if (exportSeasonStatsCSVBtn) exportSeasonStatsCSVBtn.addEventListener('click', exportSeasonStatsCSV);
    const exportSeasonStatsJSONBtn = document.getElementById('exportSeasonStatsJSON');
    if (exportSeasonStatsJSONBtn) exportSeasonStatsJSONBtn.addEventListener('click', exportSeasonStatsJSON);
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
    const generalStatSelect = document.getElementById('generalStatSelect');
    if (generalStatSelect) {
        generalStatSelect.addEventListener('change', () => {
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

    // Notes UI
    const addNoteBtn = document.getElementById('addNoteBtn');
    if (addNoteBtn) addNoteBtn.addEventListener('click', () => openNoteModal());
    const closeNoteModalBtn = document.getElementById('closeNoteModalBtn');
    if (closeNoteModalBtn) closeNoteModalBtn.addEventListener('click', closeNoteModal);
    const cancelNoteBtn = document.getElementById('cancelNoteBtn');
    if (cancelNoteBtn) cancelNoteBtn.addEventListener('click', closeNoteModal);
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveNote);
    document.getElementById('noteModal') && document.getElementById('noteModal').addEventListener('click', (e) => {
        if (e.target.id === 'noteModal') closeNoteModal();
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
    try { renderSeasonStatsPanel(getCurrentSeason()); } catch (e) { /* no-op */ }
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
                retired: [],
                loan: [],
                toBuyClub: [],
                toBuyReleased: []
            };
        }
    // Ensure notes structure exists
    if (!season.notes) season.notes = [];
        
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
 * Notes management
 */
function getSeasonNotes() {
    const season = getCurrentSeason();
    if (!season) return [];
    if (!Array.isArray(season.notes)) season.notes = [];
    return season.notes;
}

function renderNotes() {
    const notesContainer = document.getElementById('notesContainer');
    const notesList = document.getElementById('notesList');
    if (!notesContainer || !notesList) return;

    const notes = getSeasonNotes();

    if (notes.length === 0) {
        notesList.innerHTML = `<div class="empty-state"><h3>No notes yet</h3><p>Create a new note to get started.</p></div>`;
        return;
    }

    const html = notes.map(n => {
        const title = n.title || 'Untitled';
        const content = (n.content || '').replace(/\n/g, '<br>');
        return `
            <div class="note-card p-4" data-note-id="${n.id}">
                <div class="flex justify-between items-start mb-2">
                    <div class="font-semibold">${escapeHtml(title)}</div>
                    <div class="space-x-2">
                        <button onclick="editNote('${n.id}')" class="text-blue-600 text-sm">✏️</button>
                        <button onclick="deleteNote('${n.id}')" class="text-red-600 text-sm">🗑️</button>
                    </div>
                </div>
                <div class="text-sm text-gray-700 note-content">${content}</div>
            </div>
        `;
    }).join('');

    notesList.innerHTML = html;
}

let editingNoteId = null;

function openNoteModal(note = null) {
    const modal = document.getElementById('noteModal');
    const titleEl = document.getElementById('noteModalTitle');
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');

    if (note) {
        editingNoteId = note.id;
        titleEl.textContent = 'Edit Note';
        titleInput.value = note.title || '';
        contentInput.value = note.content || '';
    } else {
        editingNoteId = null;
        titleEl.textContent = 'Add Note';
        titleInput.value = '';
        contentInput.value = '';
    }

    modal.classList.remove('hidden');
    setTimeout(() => titleInput.focus(), 50);
}

function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    modal.classList.add('hidden');
    editingNoteId = null;
}

function saveNote() {
    const titleInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');
    const season = getCurrentSeason();
    if (!season) return;

    const notes = getSeasonNotes();

    if (editingNoteId) {
        const note = notes.find(n => n.id === editingNoteId);
        if (note) {
            note.title = titleInput.value.trim();
            note.content = contentInput.value.trim();
            note.updatedAt = new Date().toISOString();
        }
    } else {
        const newNote = {
            id: generateId(),
            title: titleInput.value.trim(),
            content: contentInput.value.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.unshift(newNote);
    }

    season.notes = notes;
    saveToStorage();
    renderNotes();
    closeNoteModal();
}

function editNote(noteId) {
    const notes = getSeasonNotes();
    const note = notes.find(n => n.id === noteId);
    if (!note) return alert('Note not found');
    openNoteModal(note);
}

function deleteNote(noteId) {
    if (!confirm('Delete this note?')) return;
    const season = getCurrentSeason();
    if (!season) return;
    season.notes = (season.notes || []).filter(n => n.id !== noteId);
    saveToStorage();
    renderNotes();
}

function switchToNotes() {
    // update tab classes
    document.querySelectorAll('.squad-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('border-transparent', 'text-gray-500');
        tab.classList.remove('border-black', 'text-black');
    });
    const notesTab = document.getElementById('notesTab');
    notesTab.classList.add('active', 'border-black', 'text-black');
    notesTab.classList.remove('border-transparent', 'text-gray-500');

    // show notes, hide players
    document.getElementById('playersContainer').classList.add('hidden');
    document.getElementById('notesContainer').classList.remove('hidden');
    document.getElementById('squadTitle').textContent = 'Your Notes';
    renderNotes();
}

// When switching squad, ensure notes panel is hidden
const _origSwitchSquad = switchSquad;
switchSquad = function(squad) {
    _origSwitchSquad && _origSwitchSquad(squad);
    // hide notes UI when switching back to squads
    const notesContainer = document.getElementById('notesContainer');
    if (notesContainer) notesContainer.classList.add('hidden');
    const playersContainer = document.getElementById('playersContainer');
    if (playersContainer) playersContainer.classList.remove('hidden');
    // ensure Notes tab not active
    const notesTab = document.getElementById('notesTab');
    if (notesTab) notesTab.classList.remove('active');
};

/**
 * Transfer helper functions
 */
function getSeasonTransfers(season) {
    if (!season) return null;
    if (!season.transfers) season.transfers = { forSale: [], sold: [], released: [], retired: [], loan: [], toBuyClub: [], toBuyReleased: [] };
    return season.transfers;
}

function addPlayerToTransferList(playerId, key) {
    const season = getCurrentSeason();
    if (!season) return;
    const players = Object.assign({}, season.roster.main_squad.players, season.roster.youth_academy.players);
    const player = players[playerId];
    if (!player) return alert('Player not found');

    const transfers = getSeasonTransfers(season);

    // Ensure the target transfer list exists
    if (!Array.isArray(transfers[key])) transfers[key] = [];

    // snapshot of player
    const snapshot = Object.assign({}, player);

    // Handle one-way permanent actions explicitly
    if (key === TRANSFER_KEYS.retired) {
        // Confirm retire action with the user
        if (!confirm(`Are you sure you want to retire ${player.firstName} ${player.lastName}? This will remove them from your squads.`)) return;
        // mark snapshot as retired for clarity
        snapshot.retired = true;
        snapshot.retiredAt = new Date().toISOString().split('T')[0];
        // remove from all squads for permanent changes
        delete season.roster.main_squad.players[playerId];
        delete season.roster.youth_academy.players[playerId];
    } else if (key === TRANSFER_KEYS.sold || key === TRANSFER_KEYS.released) {
        // remove from all squads for permanent changes (sold/released)
        delete season.roster.main_squad.players[playerId];
        delete season.roster.youth_academy.players[playerId];
    }

    // Toggle behavior for 'forSale' list: if already present, remove it (and update UI), otherwise add.
    if (key === TRANSFER_KEYS.forSale) {
        if (!Array.isArray(transfers.forSale)) transfers.forSale = [];
        const exists = transfers.forSale.some(item => item.id && item.id.toString() === snapshot.id.toString());
        if (exists) {
            transfers.forSale = transfers.forSale.filter(item => !(item.id && item.id.toString() === snapshot.id.toString()));
            saveToStorage();
            renderPlayers();
            renderTransfers();
            return;
        }
    }
    // Toggle behavior for 'loan' list: add if missing, remove if present
    if (key === TRANSFER_KEYS.loan) {
        if (!Array.isArray(transfers.loan)) transfers.loan = [];
        const existsLoan = transfers.loan.some(item => item.id && item.id.toString() === snapshot.id.toString());
        if (existsLoan) {
            transfers.loan = transfers.loan.filter(item => !(item.id && item.id.toString() === snapshot.id.toString()));
            saveToStorage();
            renderPlayers();
            renderTransfers();
            return;
        }
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
                html += `<div class="p-4 text-sm text-gray-600">No players available</div>`;
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
                                <div class="text-sm text-gray-500">${renderNationalityHTML(p.nationality)} • ${p.role || '-'}</div>
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
    html += renderList('Players Retired', 'retired');
    html += renderList('Players On Loan', 'loan');
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

        // Single click: switch season (only on single clicks, not the first click of a double-click)
        tab.addEventListener('click', (e) => {
            if (e.detail === 2) return; // ignore the first click of a double-click
            if (!e.target.classList.contains('delete-btn')) {
                switchSeason(season.id);
            }
        });

        // Double click: open season modal to edit the season (rename, change currency)
        tab.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            openSeasonModal(season.id);
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
        try { renderSeasonStatsPanel(getCurrentSeason()); } catch (e) { /* no-op */ }
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
                const isOnLoan = season && season.transfers && Array.isArray(season.transfers.loan) && season.transfers.loan.some(item => item.id && item.id.toString() === player.id.toString());
                html += `
                    <tr draggable="true" data-player-id="${player.id}" data-position-group="${groupName}" class="player-row ${groupClass} ${isForSale ? 'for-sale' : ''}${isOnLoan ? ' on-loan' : ''}">
                        <td>
                            <div class="font-medium">${player.firstName} ${player.lastName} ${isOnLoan ? `<span class="on-loan-badge" onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.loan}')" title="Toggle Loan">Loan</span>` : ''} ${isForSale ? `<span class="for-sale-badge" onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.forSale}')" title="Toggle For Sale">For Sale</span>` : ''}</div>
                            <div class="text-sm text-gray-500">${renderNationalityHTML(player.nationality)}</div>
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
                                ${player.age >= 32 ? `<button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.retired}')" class="text-pink-600" title="Retire">🏁</button>` : ''}
                                <button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.loan}')" class="text-indigo-600" title="Loan">🔁</button>
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
                const isOnLoan = season && season.transfers && Array.isArray(season.transfers.loan) && season.transfers.loan.some(item => item.id && item.id.toString() === player.id.toString());
                html += `
                    <div class="player-card ${groupClass} ${isForSale ? 'for-sale' : ''}${isOnLoan ? ' on-loan' : ''}" draggable="true" data-player-id="${player.id}" data-position-group="${groupName}">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <div class="font-semibold">${player.firstName} ${player.lastName} ${isOnLoan ? `<span class="on-loan-badge" onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.loan}')" title="Toggle Loan">Loan</span>` : ''} ${isForSale ? `<span class="for-sale-badge" onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.forSale}')" title="Toggle For Sale">For Sale</span>` : ''}</div>
                                <div class="text-sm text-gray-500">${renderNationalityHTML(player.nationality)} • ${player.role}</div>
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
                                ${player.age >= 32 ? `<button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.retired}')" class="text-pink-600 px-2" title="Retire">🏁</button>` : ''}
                                <button onclick="addPlayerToTransferList('${player.id}','${TRANSFER_KEYS.loan}')" class="text-indigo-600 px-2" title="Loan">🔁</button>
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
    // Focus the season name input for quicker renaming when editing
    setTimeout(() => {
        const nameInput = document.getElementById('seasonName');
        if (nameInput) {
            nameInput.focus();
            nameInput.select && nameInput.select();
        }
    }, 50);
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
    newSeason.transfers = { forSale: [], sold: [], released: [], retired: [], loan: [], toBuyClub: [], toBuyReleased: [] };
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
 * Create a new season by copying the current one, advancing players by one year.
 * - increments numeric ages by 1
 * - advances contractEnd date by one year when parseable
 * - creates a progressive season name based on current season.name, using suffix (2), (3), ...
 */
function nextSeason() {
    const season = getCurrentSeason();
    if (!season) return alert('No active season to copy');

    // Deep clone the season
    const cloned = JSON.parse(JSON.stringify(season));
    // Assign new id and reset transfers
    cloned.id = generateId();
    cloned.transfers = { forSale: [], sold: [], released: [], retired: [], loan: [], toBuyClub: [], toBuyReleased: [] };

    // Update players in both squads
    ['main_squad', 'youth_academy'].forEach(sq => {
        if (!cloned.roster) cloned.roster = { main_squad: { players: {} }, youth_academy: { players: {} } };
        if (!cloned.roster[sq]) cloned.roster[sq] = { players: {} };
        const players = cloned.roster[sq].players || {};
        Object.keys(players).forEach(pid => {
            const p = players[pid];
            // increment age if numeric
            if (p.age !== undefined && p.age !== null) {
                const n = Number(p.age);
                if (!isNaN(n)) p.age = n + 1;
            }
        });
    });

    // Determine progressive name: strip any trailing (N) from the current season name
    // then find the highest existing numeric suffix and add 1.
    const baseName = (season.name || '').replace(/\s*\(\d+\)\s*$/, '').trim();
    let maxSuffix = 1; // treat the base name as '1'
    // escape baseName for regex
    const escBase = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('^' + escBase + '\\s*\\((\\d+)\\)\\s*$');
    currentSeasons.forEach(s => {
        if (!s.name) return;
        const name = s.name.trim();
        if (name === baseName) {
            maxSuffix = Math.max(maxSuffix, 1);
            return;
        }
        const m = name.match(re);
        if (m && m[1]) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n)) maxSuffix = Math.max(maxSuffix, n);
        }
    });
    const suffix = maxSuffix + 1;
    cloned.name = `${baseName} (${suffix})`;

    // push and switch
    currentSeasons.push(cloned);
    currentSeasonId = cloned.id;
    // normalize order for squads
    normalizePlayerOrder(cloned, 'main_squad');
    normalizePlayerOrder(cloned, 'youth_academy');
    saveToStorage();
    renderSeasonTabs();
    renderPlayers();
    if (document.getElementById('chartsPanel') && !document.getElementById('chartsPanel').classList.contains('hidden')) {
        renderCharts();
    }
    alert(`Created new season: ${cloned.name}`);
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

    // Show selected flag if available
    const selectedImg = document.getElementById('selectedFlag');
    const selectedText = document.getElementById('selectedFlagText');
    if (selectedImg && selectedText) {
        const nat = (player.nationality || '').trim();
        if (nat) {
            selectedImg.src = `flags/${nat}.svg`;
            selectedImg.style.display = '';
            selectedText.textContent = nat;
        } else {
            selectedImg.style.display = 'none';
            selectedText.textContent = 'Select nationality';
        }
    }
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

    // Reset flag picker display
    const selectedImg = document.getElementById('selectedFlag');
    const selectedText = document.getElementById('selectedFlagText');
    if (selectedImg && selectedText) {
        selectedImg.style.display = 'none';
        selectedText.textContent = 'Select nationality';
    }
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
 * Show season stats panel
 */
function showSeasonStats() {
    const el = document.getElementById('seasonStatsPanel');
    if (!el) return;
    el.classList.remove('hidden');
    try { renderSeasonStatsPanel(getCurrentSeason()); } catch (e) { console.warn(e); }
}

/**
 * Hide season stats panel
 */
function hideSeasonStats() {
    const el = document.getElementById('seasonStatsPanel');
    if (!el) return;
    el.classList.add('hidden');
}

// Season stats edit modal handlers
function openSeasonStatsEditModal() {
    const season = getCurrentSeason();
    if (!season) return alert('No season selected');
    // Populate structured fields
    document.getElementById('recordWins').value = '';
    document.getElementById('recordDraws').value = '';
    document.getElementById('recordLosses').value = '';
    document.getElementById('recordGF').value = '';
    document.getElementById('recordGA').value = '';

    // If the season has aggregated matches data, use it to fill record fields
    if (season.matches && Array.isArray(season.matches) && season.matches.length > 0) {
        const m0 = season.matches[0];
        if ('wins' in m0 || 'goals_for' in m0) {
            document.getElementById('recordWins').value = m0.wins || m0.won || '';
            document.getElementById('recordDraws').value = m0.draws || m0.spares || m0.spare || '';
            document.getElementById('recordLosses').value = m0.losses || m0.loss || '';
            document.getElementById('recordGF').value = m0.goals_for || m0.goalsFor || '';
            document.getElementById('recordGA').value = m0.goals_against || m0.goalsAgainst || '';
            // populate extended fields
            document.getElementById('totalsGames').value = m0.totals_games || m0.totalsGames || '';
            document.getElementById('totalsGamesHome').value = m0.totals_games_at_home || m0.totals_games_home || '';
            document.getElementById('totalsGamesAway').value = m0.totals_games_away || '';
            document.getElementById('winsHome').value = m0.wins_at_home || m0.winsHome || '';
            document.getElementById('drawsHome').value = m0.spares_at_home || m0.draws_at_home || '';
            document.getElementById('lossesHome').value = m0.loss_at_home || m0.losses_at_home || '';
            document.getElementById('winsAway').value = m0.wins_away || '';
            document.getElementById('drawsAway').value = m0.spares_away || '';
            document.getElementById('lossesAway').value = m0.loss_away || '';
            document.getElementById('goalsForHome').value = m0.goals_for_home || '';
            document.getElementById('goalsAgainstHome').value = m0.goals_against_home || '';
            document.getElementById('goalsForAway').value = m0.goals_for_away || '';
            document.getElementById('goalsAgainstAway').value = m0.goals_against_away || '';
            document.getElementById('cleanSheetsTotal').value = m0.clean_sheets || '';
            document.getElementById('cleanSheetsHome').value = m0.clean_sheets_home || '';
            document.getElementById('cleanSheetsAway').value = m0.clean_sheets_away || '';
            document.getElementById('recordSpares').value = m0.spares || m0.draws || '';
        }
    }

    const trophiesContainer = document.getElementById('trophiesContainer');
    trophiesContainer.innerHTML = '';
    const trophies = season.trophies || [];
    if (Array.isArray(trophies)) {
        trophies.forEach((t, idx) => {
            addTrophyRow(trophiesContainer, t.name || t, t.scope || '', idx === 0);
        });
    } else if (typeof trophies === 'object') {
        // show object as entries
        Object.keys(trophies).forEach(k => {
            const arr = trophies[k] || [];
            arr.forEach((t, idx) => addTrophyRow(trophiesContainer, t.name || t || '', k || '', false));
        });
    }

    const awardsContainer = document.getElementById('awardsContainer');
    awardsContainer.innerHTML = '';
    const awards = season.playerAwards || [];
    (Array.isArray(awards) ? awards : []).forEach(a => addAwardRow(awardsContainer, a));

    document.getElementById('seasonStatsEditModal').classList.remove('hidden');
}

function closeSeasonStatsEditModal() {
    document.getElementById('seasonStatsEditModal').classList.add('hidden');
}

function saveSeasonStatsEdits() {
    const season = getCurrentSeason();
    if (!season) return alert('No season selected');
    try {
        // record
        const w = parseInt(document.getElementById('recordWins').value) || 0;
        const d = parseInt(document.getElementById('recordDraws').value) || 0;
        const l = parseInt(document.getElementById('recordLosses').value) || 0;
        const gf = parseInt(document.getElementById('recordGF').value) || 0;
        const ga = parseInt(document.getElementById('recordGA').value) || 0;

        // write aggregated summary into season.matches[0] (preserves historical structures)
        if (!season.matches || !Array.isArray(season.matches)) season.matches = [];
        season.matches[0] = Object.assign({}, season.matches[0] || {}, {
            totals_games: (w + d + l),
            wins: w,
            draws: d,
            losses: l,
            goals_for: gf,
            goals_against: ga,
            totals_games_at_home: parseInt(document.getElementById('totalsGamesHome').value) || undefined,
            totals_games_away: parseInt(document.getElementById('totalsGamesAway').value) || undefined,
            wins_at_home: parseInt(document.getElementById('winsHome').value) || undefined,
            spares_at_home: parseInt(document.getElementById('drawsHome').value) || undefined,
            loss_at_home: parseInt(document.getElementById('lossesHome').value) || undefined,
            wins_away: parseInt(document.getElementById('winsAway').value) || undefined,
            spares_away: parseInt(document.getElementById('drawsAway').value) || undefined,
            loss_away: parseInt(document.getElementById('lossesAway').value) || undefined,
            goals_for_home: parseInt(document.getElementById('goalsForHome').value) || undefined,
            goals_against_home: parseInt(document.getElementById('goalsAgainstHome').value) || undefined,
            goals_for_away: parseInt(document.getElementById('goalsForAway').value) || undefined,
            goals_against_away: parseInt(document.getElementById('goalsAgainstAway').value) || undefined,
            clean_sheets: parseInt(document.getElementById('cleanSheetsTotal').value) || undefined,
            clean_sheets_home: parseInt(document.getElementById('cleanSheetsHome').value) || undefined,
            clean_sheets_away: parseInt(document.getElementById('cleanSheetsAway').value) || undefined,
            spares: parseInt(document.getElementById('recordSpares').value) || undefined
        });

        // trophies
        const trophiesContainer = document.getElementById('trophiesContainer');
        const trophyEls = trophiesContainer.querySelectorAll('[data-trophy-row]');
        const newTrophies = [];
        trophyEls.forEach(el => {
            const name = el.querySelector('.trophy-name').value.trim();
            const scope = el.querySelector('.trophy-scope').value.trim();
            if (name) newTrophies.push({ name, scope });
        });
        season.trophies = newTrophies;

        // awards
        const awardsContainer = document.getElementById('awardsContainer');
        const awardEls = awardsContainer.querySelectorAll('[data-award-row]');
        const newAwards = [];
        awardEls.forEach(el => {
            const playerId = el.querySelector('.award-playerId').value.trim();
            const awardName = el.querySelector('.award-name').value.trim();
            const note = el.querySelector('.award-note').value.trim();
            if (awardName) newAwards.push({ playerId: playerId || null, awardName, note: note || '' });
        });
        season.playerAwards = newAwards;

        saveToStorage();
        renderSeasonTabs();
        renderPlayers();
        try { renderSeasonStatsPanel(season); } catch (e) { console.warn(e); }
        closeSeasonStatsEditModal();
    } catch (e) {
        console.warn('saveSeasonStatsEdits error', e);
        alert('Error saving season edits.');
    }
}

// helpers to add/remove trophy and award rows
function addTrophyRow(container, name = '', scope = '') {
    const idx = Math.random().toString(36).slice(2,8);
    const row = document.createElement('div');
    row.setAttribute('data-trophy-row', idx);
    row.className = 'flex gap-2 items-center';
    row.innerHTML = `
        <input class="trophy-name border border-gray-300 rounded px-2 py-1" value="${escapeHtml(name)}" placeholder="Trophy name">
        <input class="trophy-scope border border-gray-300 rounded px-2 py-1" value="${escapeHtml(scope)}" placeholder="scope (league/domestic/international)">
        <button type="button" class="text-red-600 remove-trophy">Remove</button>
    `;
    container.appendChild(row);
    row.querySelector('.remove-trophy').addEventListener('click', () => row.remove());
}

function addAwardRow(container, award = {}) {
    const idx = Math.random().toString(36).slice(2,8);
    const row = document.createElement('div');
    row.setAttribute('data-award-row', idx);
    row.className = 'grid grid-cols-1 md:grid-cols-4 gap-2 items-center';
    // Build player select from current season players
    const season = getCurrentSeason();
    let playerSelectHtml = '';
    if (season && season.roster) {
        const playersObj = Object.assign({}, (season.roster.main_squad && season.roster.main_squad.players) || {}, (season.roster.youth_academy && season.roster.youth_academy.players) || {});
        playerSelectHtml += `<select class="award-playerId border border-gray-300 rounded px-2 py-1"><option value="">-- Select player --</option>`;
        Object.keys(playersObj).forEach(pid => {
            const p = playersObj[pid] || {};
            const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || pid;
            const role = p.role ? ` (${p.role})` : '';
            const selected = String(pid) === String(award.playerId) ? 'selected' : '';
            playerSelectHtml += `<option value="${escapeHtml(pid)}" ${selected}>${escapeHtml(name + role)}</option>`;
        });
        playerSelectHtml += '</select>';
    } else {
        // fallback to text input if no season/players
        playerSelectHtml = `<input class="award-playerId border border-gray-300 rounded px-2 py-1" value="${escapeHtml(award.playerId || '')}" placeholder="playerId">`;
    }

    row.innerHTML = `
        ${playerSelectHtml}
        <input class="award-name border border-gray-300 rounded px-2 py-1" value="${escapeHtml(award.awardName || '')}" placeholder="award name">
        <input class="award-note border border-gray-300 rounded px-2 py-1" value="${escapeHtml(award.note || '')}" placeholder="note">
        <div><button type="button" class="text-red-600 remove-award">Remove</button></div>
    `;
    container.appendChild(row);
    row.querySelector('.remove-award').addEventListener('click', () => row.remove());
}

function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

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
    // General categorical distribution donut (nationality, role, foot, contract year)
    renderGeneralDonutChart(playersArray);
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
 * Render donut chart showing total value (or count fallback) by position group.
 * Uses GROUP_COLORS for slice colors so groups match other visuals.
 */

/**
 * Render a general donut chart for categorical distributions (nationality, role, foot, contract year)
 */
function renderGeneralDonutChart(players) {
    const select = document.getElementById('generalStatSelect');
    const stat = select ? select.value : 'nationality';
    const ctxEl = document.getElementById('generalDonutChart');
    if (!ctxEl) return;
    const ctx = ctxEl.getContext('2d');

    // destroy existing chart
    if (charts.generalDonutChart) charts.generalDonutChart.destroy();

    // build counts
    const counts = {};
    const inc = k => { counts[k] = (counts[k] || 0) + 1; };

    players.forEach(p => {
        // categorical
        if (stat === 'nationality') { inc(p.nationality || 'Unknown'); return; }
        if (stat === 'role') { inc(p.role || 'Unknown'); return; }
        if (stat === 'foot') { inc(p.foot || 'Unknown'); return; }
        if (stat === 'contractEnd') {
            if (p.contractEnd) {
                const t = Date.parse(p.contractEnd);
                inc(isNaN(t) ? 'Unknown' : String(new Date(t).getFullYear()));
            } else inc('Unknown');
            return;
        }

        // numeric: show every single value for overall/potential (e.g. 80,85,90)
        if (stat === 'overall' || stat === 'potential') {
            const val = parseInt(p[stat]);
            if (!val || isNaN(val) || val <= 0) { inc('Unknown'); return; }
            inc(String(val));
            return;
        }

        // skills and weakFoot: treat as exact counts (1-5)
        if (stat === 'skills' || stat === 'weakFoot') {
            const v = p[stat];
            if (v === null || v === undefined || v === '') { inc('Unknown'); return; }
            inc(String(v));
            return;
        }

        // fallback
        inc('Unknown');
    });

    // sort keys by count desc
    const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    // show top 10 and group rest into 'Other'
    const topN = 10;
    const labels = [];
    const data = [];
    let otherSum = 0;
    entries.forEach((e, idx) => {
        if (idx < topN) {
            labels.push(e[0]);
            data.push(e[1]);
        } else {
            otherSum += e[1];
        }
    });
    if (otherSum > 0) { labels.push('Other'); data.push(otherSum); }

    // build colors (reuse GROUP_COLORS when possible, otherwise generate palette)
    const palette = ['#4F46E5','#10B981','#F59E0B','#EF4444','#3B82F6','#8B5CF6','#06B6D4','#F97316','#14B8A6','#6366F1','#9CA3AF'];
    const bg = labels.map((lbl, i) => {
        // try match group color by label (if label matches a POSITION_GROUP name)
        if (GROUP_COLORS[lbl]) return GROUP_COLORS[lbl].color;
        // try to map common values
        if (/^Unknown$/i.test(lbl)) return '#9CA3AF';
        return palette[i % palette.length];
    });

    charts.generalDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: bg,
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' },
                tooltip: {
                    // Disable built-in tooltip when showing nationality so only the custom tooltip appears.
                    // For other stats keep the normal built-in Chart.js tooltip enabled.
                    enabled: (stat !== 'nationality'),
                    external: function(context) {
                        // Only show the rich custom tooltip for nationality stat
                        if (stat !== 'nationality') {
                            // If a custom tooltip element exists from a previous hover, hide it
                            const existing = document.getElementById('chartjs-tooltip-general');
                            if (existing) existing.style.opacity = 0;
                            return;
                        }

                        const tooltipModel = context.tooltip;
                        let tooltipEl = document.getElementById('chartjs-tooltip-general');

                        // Create tooltip element if not present
                        if (!tooltipEl) {
                            tooltipEl = document.createElement('div');
                            tooltipEl.id = 'chartjs-tooltip-general';
                            tooltipEl.style.position = 'absolute';
                            tooltipEl.style.zIndex = 9999;
                            tooltipEl.style.pointerEvents = 'none';
                            tooltipEl.style.transition = 'opacity 0.08s ease';
                            document.body.appendChild(tooltipEl);
                        }

                        // Hide if no tooltip
                        if (tooltipModel.opacity === 0) {
                            tooltipEl.style.opacity = 0;
                            return;
                        }

                        // Use first dataPoint if present
                        const dp = (tooltipModel.dataPoints && tooltipModel.dataPoints[0]) || null;
                        if (!dp) { tooltipEl.style.opacity = 0; return; }

                        const label = dp.label || 'Unknown';
                        const value = Number(dp.parsed || dp.raw || dp.formattedValue || 0);

                        // Compute total for percent
                        const chart = context.chart;
                        const dataset = (chart.data && chart.data.datasets && chart.data.datasets[0]) || null;
                        const total = dataset ? dataset.data.reduce((s, v) => s + Number(v || 0), 0) : 0;
                        const percent = total ? Math.round((value / total) * 100) : 0;

                        // Resolve country mapping to get display name and flag filename
                        let mapping = COUNTRY_MAP[label] || COUNTRY_MAP[label.toUpperCase()];
                        // If not found by code, try matching by English name (case-insensitive)
                        if (!mapping) {
                            const byName = Object.values(COUNTRY_MAP).find(c => (c.name || '').toLowerCase() === String(label || '').toLowerCase());
                            if (byName) mapping = byName;
                        }

                        let displayName = label;
                        let flagFile = label;
                        if (mapping) {
                            displayName = mapping.name || label;
                            flagFile = mapping.flag || label;
                        } else {
                            // fallback heuristics: 3-letter codes -> first 2 letters; 2-letter codes use directly
                            const L = (label || '').toString();
                            if (L.length === 3) flagFile = L.substring(0,2).toUpperCase();
                            else if (L.length === 2) flagFile = L.toUpperCase();
                        }

                        const imgSrc = `flags/${flagFile}.svg`;

                        // Build HTML
                        tooltipEl.innerHTML = `
                            <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:rgba(255,255,255,0.98);border:1px solid rgba(0,0,0,0.08);box-shadow:0 4px 12px rgba(0,0,0,0.12);border-radius:6px;font-family:inherit;font-size:13px;color:#111">
                                <img src="${imgSrc}" alt="${escapeHtml(displayName)}" style="width:22px;height:14px;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'" />
                                <div style="line-height:1">
                                    <div style="font-weight:600">${escapeHtml(displayName)}</div>
                                    <div style="font-size:12px;color:#555">${value} (${percent}%)</div>
                                </div>
                            </div>
                        `;

                        // Position tooltip near the caret
                        const canvasRect = chart.canvas.getBoundingClientRect();
                        const left = canvasRect.left + window.pageXOffset + (tooltipModel.caretX || 0);
                        const top = canvasRect.top + window.pageYOffset + (tooltipModel.caretY || 0);
                        tooltipEl.style.left = (left + 12) + 'px';
                        tooltipEl.style.top = (top + 12) + 'px';
                        tooltipEl.style.opacity = 1;
                    }
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
/**
 * Season Stats Helpers
 */
function computeSeasonRecord(season) {
    try {
        if (!season || !season.matches) return null;

        let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;

        if (Array.isArray(season.matches)) {
            season.matches.forEach(m => {
                if (m == null) return;
                // Aggregated season summary shape (e.g. wins, spares/draws, loss, goals_for, goals_against)
                if ('wins' in m || 'goals_for' in m || 'goals_for' in m) {
                    const w = Number(m.wins || 0);
                    const d = Number(m.draws || m.spares || m.spare || 0);
                    const l = Number(m.losses || m.loss || 0);
                    const gfor = Number(m.goals_for || m.goalsFor || m.goals_for_home || 0);
                    const gag = Number(m.goals_against || m.goalsAgainst || m.goals_against_home || 0);
                    wins += w;
                    draws += d;
                    losses += l;
                    gf += gfor;
                    ga += gag;
                    return;
                }
                if ('result' in m) {
                    const r = (m.result || '').toUpperCase();
                    if (r === 'W') wins++;
                    else if (r === 'D') draws++;
                    else if (r === 'L') losses++;
                    gf += Number(m.goalsFor || m.goals || 0);
                    ga += Number(m.goalsAgainst || m.goalsAgainst || 0) || Number(m.goalsAgainst || 0);
                } else if ('homeGoals' in m || 'awayGoals' in m) {
                    // array form
                    const home = Number(m.homeGoals || 0);
                    const away = Number(m.awayGoals || 0);
                    const our = m.ourTeam ? (home) : (away);
                    const opp = m.ourTeam ? (away) : (home);
                    if (our > opp) wins++;
                    else if (our === opp) draws++;
                    else losses++;
                    gf += our;
                    ga += opp;
                } else {
                    // unknown shape: try to derive from goalsFor/goalsAgainst
                    const gfor = Number(m.goalsFor || m.goals_for || 0);
                    const gagainst = Number(m.goalsAgainst || m.goals_against || 0);
                    if (gfor > gagainst) wins++;
                    else if (gfor === gagainst) draws++;
                    else losses++;
                    gf += gfor;
                    ga += gagainst;
                }
            });
        }

        return { wins, draws, losses, goalsFor: gf, goalsAgainst: ga };
    } catch (e) {
        console.warn('computeSeasonRecord error', e);
        return null;
    }
}

function computeSeasonTrophies(season) {
    const out = { league: [], domestic: [], international: [] };
    try {
        if (!season) return out;
        const t = season.trophies;
        if (!t) return out;

        if (Array.isArray(t)) {
            t.forEach(item => {
                const scope = (item.scope || '').toLowerCase();
                const name = item.name || item.competition || item.competitionName || item.title || 'Unknown';
                if (scope === 'league') out.league.push(name);
                else if (scope === 'international') out.international.push(name);
                else out.domestic.push(name);
            });
        } else if (typeof t === 'object') {
            // Option B shape
            if (Array.isArray(t.local)) {
                t.local.forEach(it => {
                    const n = it.name || it.title || 'Unknown';
                    if (it.type === 'league') out.league.push(n);
                    else out.domestic.push(n);
                });
            }
            if (Array.isArray(t.international)) {
                t.international.forEach(it => { out.international.push(it.name || it.title || 'Unknown'); });
            }
        }

        // dedupe
        out.league = Array.from(new Set(out.league));
        out.domestic = Array.from(new Set(out.domestic));
        out.international = Array.from(new Set(out.international));
        return out;
    } catch (e) {
        console.warn('computeSeasonTrophies', e);
        return out;
    }
}

function computePlayerAwards(season) {
    const out = [];
    try {
        if (!season || !season.playerAwards) return out;
        const playersAll = Object.assign({}, (season.roster && season.roster.main_squad && season.roster.main_squad.players) || {}, (season.roster && season.roster.youth_academy && season.roster.youth_academy.players) || {});

        season.playerAwards.forEach(a => {
            const pid = a.playerId || a.id || null;
            const awardName = a.awardName || a.name || 'Award';
            const note = a.note || a.notes || '';
            let resolvedName = `Unknown player (id:${pid})`;
            let extra = {};
            if (pid && playersAll[pid]) {
                const p = playersAll[pid];
                resolvedName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || resolvedName;
                extra = {
                    appearances: p.appearances || null,
                    goals: p.goals || null,
                    assists: p.assists || null,
                    avgRating: p.avgRating || null,
                    overall: p.overall || null
                };
            }
            out.push(Object.assign({ playerId: pid, name: resolvedName, awardName, note }, extra));
        });

        return out;
    } catch (e) {
        console.warn('computePlayerAwards', e);
        return out;
    }
}

function renderSeasonStatsPanel(season) {
    try {
        const rec = computeSeasonRecord(season);
        const trophies = computeSeasonTrophies(season);
        const awards = computePlayerAwards(season);

        const recEl = document.getElementById('seasonRecord');
        const trophiesLeagueEl = document.getElementById('seasonTrophiesLeague');
        const trophiesDomesticEl = document.getElementById('seasonTrophiesDomestic');
        const trophiesIntlEl = document.getElementById('seasonTrophiesInternational');
        const awardsEl = document.getElementById('playerAwardsList');

        if (recEl) {
            if (!rec) recEl.innerHTML = '<div class="text-sm text-gray-600">No match data</div>';
            else recEl.innerHTML = `<div class="season-stats-grid grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                <div><strong>Wins</strong><div>${rec.wins}</div></div>
                <div><strong>Draws</strong><div>${rec.draws}</div></div>
                <div><strong>Losses</strong><div>${rec.losses}</div></div>
                <div><strong>Goals For</strong><div>${rec.goalsFor}</div></div>
                <div><strong>Goals Against</strong><div>${rec.goalsAgainst}</div></div>
            </div>`;
        }

        // show extended aggregated fields (if present in season.matches[0])
        try {
            const m0 = (season && Array.isArray(season.matches) && season.matches[0]) ? season.matches[0] : null;
            if (m0) {
                const extHtml = `<div class="mt-3 text-sm grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div><strong>Total games</strong><div>${m0.totals_games || m0.totalsGames || '-'}</div></div>
                    <div><strong>Games at home</strong><div>${m0.totals_games_at_home || m0.totals_games_home || '-'}</div></div>
                    <div><strong>Games away</strong><div>${m0.totals_games_away || '-'}</div></div>
                    <div><strong>Wins (home)</strong><div>${m0.wins_at_home || '-'}</div></div>
                    <div><strong>Draws (home)</strong><div>${m0.spares_at_home || m0.draws_at_home || '-'}</div></div>
                    <div><strong>Losses (home)</strong><div>${m0.loss_at_home || m0.losses_at_home || '-'}</div></div>
                    <div><strong>Wins (away)</strong><div>${m0.wins_away || '-'}</div></div>
                    <div><strong>Draws (away)</strong><div>${m0.spares_away || '-'}</div></div>
                    <div><strong>Losses (away)</strong><div>${m0.loss_away || '-'}</div></div>
                    <div><strong>Goals for (home)</strong><div>${m0.goals_for_home || '-'}</div></div>
                    <div><strong>Goals against (home)</strong><div>${m0.goals_against_home || '-'}</div></div>
                    <div><strong>Goals for (away)</strong><div>${m0.goals_for_away || '-'}</div></div>
                    <div><strong>Goals against (away)</strong><div>${m0.goals_against_away || '-'}</div></div>
                    <div><strong>Clean sheets (total)</strong><div>${m0.clean_sheets || '-'}</div></div>
                    <div><strong>Clean sheets (home)</strong><div>${m0.clean_sheets_home || '-'}</div></div>
                    <div><strong>Clean sheets (away)</strong><div>${m0.clean_sheets_away || '-'}</div></div>
                    <div><strong>Spares/Draws</strong><div>${m0.spares || m0.draws || '-'}</div></div>
                </div>`;
                recEl.insertAdjacentHTML('beforeend', extHtml);
            }
        } catch (e) { /* ignore */ }

        function renderList(el, items) {
            if (!el) return;
            if (!items || items.length === 0) { el.innerHTML = '<li class="text-sm text-gray-500">None</li>'; return; }
            el.innerHTML = items.map(i => `<li>${i}</li>`).join('');
        }

        renderList(trophiesLeagueEl, trophies.league);
        renderList(trophiesDomesticEl, trophies.domestic);
        renderList(trophiesIntlEl, trophies.international);

        if (awardsEl) {
            if (!awards || awards.length === 0) awardsEl.innerHTML = '<div class="text-sm text-gray-500">No awards</div>';
            else {
                awardsEl.innerHTML = awards.map(a => {
                    return `<div class="mb-2">` +
                        `<div class="font-medium">${a.name} — ${a.awardName}</div>` +
                        `<div class="text-xs text-gray-600">Apps: ${a.appearances ?? '-'} | Goals: ${a.goals ?? '-'} | Assists: ${a.assists ?? '-'} | Rating: ${a.avgRating ?? '-'} | OVR: ${a.overall ?? '-'}</div>` +
                        (a.note ? `<div class="text-xs text-gray-500">${a.note}</div>` : '') +
                        `</div>`;
                }).join('');
            }
        }

    } catch (e) { console.warn('renderSeasonStatsPanel error', e); }
}

function exportSeasonStatsJSON() {
    try {
        const season = getCurrentSeason();
        if (!season) return alert('No season selected');
        const data = {
            record: computeSeasonRecord(season),
            trophies: computeSeasonTrophies(season),
            playerAwards: computePlayerAwards(season)
        };
        const str = JSON.stringify(data, null, 2);
        const uri = 'data:application/json;charset=utf-8,' + encodeURIComponent(str);
        const a = document.createElement('a');
        a.setAttribute('href', uri);
        a.setAttribute('download', `season_stats_${season.name || season.id || 'export'}.json`);
        a.click();
    } catch (e) { console.warn('exportSeasonStatsJSON', e); }
}

function exportSeasonStatsCSV() {
    try {
        const season = getCurrentSeason();
        if (!season) return alert('No season selected');
        const record = computeSeasonRecord(season) || { wins: '', draws: '', losses: '', goalsFor: '', goalsAgainst: '' };
        const awards = computePlayerAwards(season) || [];

        // season_record.csv
        const recCsv = ['wins,draws,losses,goalsFor,goalsAgainst', `${record.wins},${record.draws},${record.losses},${record.goalsFor},${record.goalsAgainst}`].join('\n');

        // player_awards.csv header
        const hdr = ['playerId,name,awardName,appearances,goals,assists,avgRating,overall,note'];
        const rows = awards.map(a => [a.playerId || '', '"' + (a.name || '') + '"', '"' + (a.awardName || '') + '"', a.appearances ?? '', a.goals ?? '', a.assists ?? '', a.avgRating ?? '', a.overall ?? '', '"' + (a.note || '') + '"'].join(','));
        const awardsCsv = hdr.concat(rows).join('\n');

        // create multi-part download by zipping into a single blob with separators
        const combined = `=== season_record.csv ===\n${recCsv}\n\n=== player_awards.csv ===\n${awardsCsv}`;
        const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(combined);
        const a = document.createElement('a');
        a.setAttribute('href', uri);
        a.setAttribute('download', `season_stats_${season.name || season.id || 'export'}.csv`);
        a.click();
    } catch (e) { console.warn('exportSeasonStatsCSV', e); }
}

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
