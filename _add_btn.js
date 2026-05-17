const fs = require('fs');

function addResetButton(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  if (c.includes('onClick={resetFilters}')) {
    console.log('Already has button: ' + filePath.split('/').pop());
    return;
  }

  const buttonJSX = `        <button
          onClick={resetFilters}
          className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-300 hover:border-red-300 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
          title="Restablecer filtros"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Limpiar
        </button>`;

  // Strategy: find the filter grid container, and insert button before its closing </div>
  // The filter grid container starts with: grid grid-cols-2 md:grid-cols-
  // and ends with a </div> followed by a <div for the stats cards

  // Find each dashboard module's filter section and add button
  // Pattern: last FilterInput /> before </div> then <div className="grid grid-cols-1 md:grid-cols-3
  
  c = c.replace(
    /(\s*<\/div>\r?\n\s*<div className="grid grid-cols-1 md:grid-cols-3 gap-4">)/g,
    function(match, group1, offset) {
      // Only replace the first occurrence (DashboardModule filter grid)
      // Check if we're inside a filter grid by looking backwards
      const before = c.substring(Math.max(0, offset - 200), offset);
      if (before.includes('FilterInput')) {
        return '\n' + buttonJSX + '\n' + group1;
      }
      return match;
    }
  );

  fs.writeFileSync(filePath, c);
  console.log('Button added: ' + filePath.split('/').pop());
}

addResetButton('d:/Proyecto PyP Colsanitas react V2/src/screens/DirectorDashboard.jsx');
addResetButton('d:/Proyecto PyP Colsanitas react V2/src/screens/CoordinatorDashboard.jsx');
addResetButton('d:/Proyecto PyP Colsanitas react V2/src/screens/LeaderDashboard.jsx');

// Cleanup
fs.unlinkSync('d:/Proyecto PyP Colsanitas react V2/_add_reset.js');

console.log('Done!');
