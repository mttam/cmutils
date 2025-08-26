# CMutils - FC25 Career Mode Utility

A responsive, minimal black-and-white web application for managing FC25 Career Mode data with drag-and-drop functionality, charts, and data persistence.

## Features

- **Season Management**: Create, rename, and delete seasons with currency selection (USD, EUR, GBP)
- **Squad Management**: Separate views for Main Squad and Youth Academy
- **Player Management**: Complete CRUD operations with inline validation
- **Drag & Drop**: Reorder players within position groups with keyboard fallback
- **Responsive Design**: Table view on desktop, card view on mobile
- **Charts**: Average age by position and player distribution analytics
- **Data Persistence**: Local storage with JSON import/export functionality
- **Accessibility**: High contrast design with keyboard navigation

## Quick Start (Windows PowerShell)

1. **Navigate to the project directory:**
   ```powershell
   cd "C:\Users\pctopcall10\Desktop\cmutils"
   ```

2. **Open the application:**
   ```powershell
   Start-Process "index.html"
   ```
   
   Or alternatively:
   ```powershell
   Invoke-Item "index.html"
   ```

3. **For development with live server (if you have Python installed):**
   ```powershell
   python -m http.server 8000
   ```
   Then open http://localhost:8000 in your browser

## Tech Stack

- **HTML5** with semantic structure
- **Tailwind CSS** via CDN for responsive design
- **Vanilla JavaScript** (ES6+) for application logic
- **Chart.js** via CDN for data visualization
- **Local Storage** for data persistence

## File Structure

```
cmutils/
├── index.html          # Main application structure
├── style.css           # Custom CSS complementing Tailwind
├── script.js           # Complete application logic
├── data/
│   └── sample.json     # Sample data with 2 seasons
└── README.md           # This file
```

## Data Model

### Season Structure
```json
{
  "id": "unique_id",
  "name": "2025/2026",
  "currency": "USD|EUR|GBP",
  "roster": {
    "main_squad": { "players": {} },
    "youth_academy": { "players": {} }
  }
}
```

### Player Structure
```json
{
  "id": "unique_id",
  "firstName": "string",
  "lastName": "string",
  "squad": "Main Squad|Youth Academy",
  "nationality": "string",
  "role": "GK|LB|CB|RB|CDM|LM|CM|RM|CAM|LW|ST|RW",
  "overall": "number",
  "potential": "number",
  "age": "number",
  "contractEnd": "YYYY-MM-DD",
  "skills": "1-5",
  "weakFoot": "1-5",
  "foot": "Left|Right",
  "totalStats": "number",
  "value": "number",
  "wage": "number",
  "appearances": "number",
  "goals": "number",
  "assists": "number",
  "cleanSheets": "number",
  "yellowCards": "number",
  "redCards": "number",
  "avgRating": "number"
}
```

## Position Groups (for Drag & Drop)

Players can only be reordered within their position groups:
- **Goalkeepers**: GK
- **Defenders**: LB, CB, RB  
- **Midfielders**: CDM, LM, CM, RM, CAM
- **Forwards**: LW, ST, RW

## Local Storage

- Data is automatically saved to browser localStorage
- Key: `cmutils_data`
- Data persists between browser sessions
- Use Export/Import for backup and sharing between devices

## Export/Import

- **Export**: Downloads current data as JSON file
- **Import**: Load JSON file to replace current data
- Compatible with the application's data schema

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Responsive design works on mobile and desktop

## Smoke Test Checklist

1. **Data Loading**: Open index.html and verify sample players load correctly
2. **CRUD Operations**: Add a new player, edit existing player, delete player
3. **Export/Import**: Export data as JSON, clear localStorage, import the file back

## Development Notes

- No build process required - pure HTML/CSS/JS
- Tailwind CSS and Chart.js loaded via CDN
- All dependencies are external - no node_modules
- Drag and drop uses HTML5 Drag & Drop API
- Charts use Chart.js with black/white theme
- Form validation provides inline feedback
- Responsive breakpoint at 640px (Tailwind's sm: breakpoint)

## Troubleshooting

- **Sample data not loading**: Ensure `data/sample.json` exists and is valid JSON
- **Charts not displaying**: Check browser console for Chart.js loading errors  
- **Drag & drop not working**: Ensure modern browser with HTML5 support
- **Data not persisting**: Check if localStorage is enabled in browser settings
