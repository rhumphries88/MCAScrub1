/* eslint-disable @typescript-eslint/no-explicit-any */
// Format analysis data into HTML
export const formatAnalysisData = (data: any): string => {
  // Handle case where data might be undefined or null
  if (!data) {
    return '<div class="p-4 text-gray-500">No analysis data available.</div>';
  }
  
  // If data is already HTML-like, return it
  if (typeof data === 'string' && data.trim().startsWith('<')) {
    return data;
  }
  
  // If we have a rawResponse property and it's a string, try to parse it as JSON
  if (data.rawResponse && typeof data.rawResponse === 'string') {
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data.rawResponse);
      return formatDataToHTML(jsonData);
    } catch {
      // If it's not valid JSON, check if it looks like markdown
      if (data.rawResponse.includes('#') || data.rawResponse.includes('|')) {
        return convertMarkdownToHTML(data.rawResponse);
      }
      // Otherwise return as is
      return `<div class="analysis-report"><pre class="whitespace-pre-wrap bg-gray-50 p-4 rounded-md font-mono text-sm">${data.rawResponse}</pre></div>`;
    }
  }
  
  // If data is a string, check if it's JSON or markdown
  if (typeof data === 'string') {
    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      return formatDataToHTML(jsonData);
    } catch {
      // If it's not valid JSON, check if it looks like markdown
      if (data.includes('#') || data.includes('|')) {
        return convertMarkdownToHTML(data);
      }
      // Otherwise return as is
      return `<div class="analysis-report"><pre class="whitespace-pre-wrap bg-gray-50 p-4 rounded-md font-mono text-sm">${data}</pre></div>`;
    }
  }
  
  // If data is an object, format it to HTML
  return formatDataToHTML(data);
};

// Helper: parse currency/number-like strings to number
const parseAmount = (val: unknown): number => {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return NaN;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned.replace(/,/g, ''));
  return isNaN(parsed) ? NaN : parsed;
};

// Helper: format number as USD currency
const formatCurrency = (num: number): string => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  } catch {
    // Fallback
    return `$${num.toFixed(2)}`;
  }
};

// Function to format data object to HTML
const formatDataToHTML = (data: any): string => {
  // Default template
  let html = '<div class="analysis-report space-y-6">';
  
  // Try to identify if this is MCA data with monthly overview
  if (data.monthlyOverview || data.monthly_overview) {
    const overview = data.monthlyOverview || data.monthly_overview;
    html += `
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span class="mr-2">ðŸ“Š</span> Monthly Overview
        </h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <caption class="sr-only">Monthly financial summary</caption>
            <thead class="bg-gray-50">
              <tr>
    `;
    
    // Add table headers
    const headers = Object.keys(overview[0] || {});
    headers.forEach(header => {
      const formattedHeader = header
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      html += `<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${formattedHeader}</th>`;
    });
    html += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
    
    // Add table rows
    let revenueTotal = 0;
    let revenueCount = 0;

    // Try to detect the Monthly Revenue key from headers
    const monthlyRevenueKey = headers.find(h => {
      const lower = String(h).toLowerCase();
      return lower === 'monthly_revenue' || lower === 'monthlyrevenue' || (lower.includes('monthly') && lower.includes('revenue'));
    });

    overview.forEach((row: any, index: number) => {
      html += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">`;
      headers.forEach(key => {
        html += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row[key] || ''}</td>`;
      });
      html += `</tr>`;

      // accumulate revenue
      if (monthlyRevenueKey) {
        const val = row[monthlyRevenueKey];
        const num = parseAmount(val);
        if (!isNaN(num)) {
          revenueTotal += num;
          revenueCount += 1;
        }
      }
    });

    // Append Total Average row for Monthly Revenue
    if (monthlyRevenueKey && revenueCount > 0) {
      const avg = revenueTotal / revenueCount;
      html += `<tr class="bg-blue-50">`;
      headers.forEach(key => {
        if (key === monthlyRevenueKey) {
          html += `<td class="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-700">Total Average: ${formatCurrency(avg)}</td>`;
        } else {
          html += `<td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500"></td>`;
        }
      });
      html += `</tr>`;
    }

    html += `</tbody></table></div></div>`;
  }
  
  // Add MCA indicators section if available
  if (data.mcaIndicators || data.mca_indicators) {
    const indicators = data.mcaIndicators || data.mca_indicators;
    html += `
      <div class="pt-4">
        <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span class="mr-2">ðŸ’¡</span> Indicators of MCA Funding
        </h2>
    `;
    
    // Process each indicator
    if (Array.isArray(indicators)) {
      indicators.forEach((indicator, index) => {
        html += `
          <div class="mb-6">
            <h3 class="text-lg font-medium text-gray-800 mb-2">${index + 1}. ${indicator.title || 'Indicator'}</h3>
        `;
        
        if (indicator.description) {
          html += `<p class="text-gray-600 mb-3">${indicator.description}</p>`;
        }
        
        if (indicator.items && Array.isArray(indicator.items)) {
          html += `<ul class="space-y-2 list-disc pl-5">`;
          indicator.items.forEach((item: string) => {
            html += `<li class="text-gray-600">${item}</li>`;
          });
          html += `</ul>`;
        }
        
        html += `</div>`;
      });
    } else if (typeof indicators === 'object') {
      // If it's a single object with properties
      Object.keys(indicators).forEach(key => {
        html += `<div class="mb-6"><h3 class="text-lg font-medium text-gray-800 mb-2">${key}</h3>`;
        
        if (typeof indicators[key] === 'string') {
          html += `<p class="text-gray-600">${indicators[key]}</p>`;
        } else if (Array.isArray(indicators[key])) {
          html += `<ul class="space-y-2 list-disc pl-5">`;
          indicators[key].forEach((item: string) => {
            html += `<li class="text-gray-600">${item}</li>`;
          });
          html += `</ul>`;
        }
        
        html += `</div>`;
      });
    }
    
    html += `</div>`;
  }
  
  // Add funding sources if available
  if (data.fundingSources || data.funding_sources) {
    const sources = data.fundingSources || data.funding_sources;
    html += `
      <div class="pt-4">
        <h3 class="text-lg font-medium text-gray-800 mb-3">Large/Unusual Deposits and Repayments</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <caption class="sr-only">Funding sources and repayment patterns</caption>
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funder / Source</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
    `;
    
    sources.forEach((source: any, index: number) => {
      html += `
        <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${source.name || source.funder || ''}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${source.amount || ''}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${source.frequency || ''}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${source.notes || ''}</td>
        </tr>
      `;
    });
    
    html += `</tbody></table></div></div>`;
  }
  
  // Add payment patterns if available
  if (data.paymentPatterns || data.payment_patterns) {
    const patterns = data.paymentPatterns || data.payment_patterns;
    html += `
      <div class="pt-4">
        <h3 class="text-lg font-medium text-gray-800 mb-3">MCA Payment Patterns:</h3>
        <ul class="space-y-2 list-disc pl-5">
    `;
    
    if (Array.isArray(patterns)) {
      patterns.forEach((pattern: string) => {
        html += `<li class="text-gray-600">${pattern}</li>`;
      });
    } else if (typeof patterns === 'string') {
      html += `<li class="text-gray-600">${patterns}</li>`;
    }
    
    html += `</ul></div>`;
  }
  
  // If we couldn't identify a specific structure, just display the JSON
  if (html === '<div class="analysis-report space-y-6">') {
    html += `<pre class="whitespace-pre-wrap bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>`;
  }
  
  html += '</div>';
  
  // Add global styles
  html = `
    <style>
      .analysis-report h2 {
        position: relative;
        padding-bottom: 0.5rem;
      }
      .analysis-report h2::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        width: 40px;
        background-color: #3b82f6;
      }
      .analysis-report table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
        margin: 1rem 0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border-radius: 0.5rem;
        overflow: hidden;
      }
      .analysis-report th {
        position: sticky;
        top: 0;
        z-index: 10;
      }
    </style>
  ` + html;
  
  return html;
};

// Function to convert markdown to HTML
const convertMarkdownToHTML = (markdown: string): string => {
  if (!markdown) return '';
  
  let html = '<div class="analysis-report space-y-4">';
  
  // Split by lines
  const lines = markdown.split('\n');
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Handle headings
    if (line.startsWith('# ')) {
      html += `<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">${line.substring(2)}</h1>`;
    } else if (line.startsWith('## ')) {
      html += `<h2 class="text-xl font-semibold text-gray-900 mt-5 mb-3">${line.substring(3)}</h2>`;
    } else if (line.startsWith('### ')) {
      html += `<h3 class="text-lg font-medium text-gray-800 mt-4 mb-2">${line.substring(4)}</h3>`;
    } else if (line.startsWith('#### ')) {
      html += `<h4 class="text-base font-medium text-gray-800 mt-3 mb-2">${line.substring(5)}</h4>`;
    } else if (line.startsWith('##### ')) {
      html += `<h5 class="text-sm font-medium text-gray-800 mt-3 mb-2">${line.substring(6)}</h5>`;
    } else if (line.startsWith('###### ')) {
      html += `<h6 class="text-xs font-medium text-gray-800 mt-2 mb-1">${line.substring(7)}</h6>`;
    }
    // Handle horizontal rule
    else if (line === '---' || line === '***' || line === '___') {
      html += '<hr class="my-4 border-t border-gray-200">';
    }
    // Handle tables
    else if (line.includes('|')) {
      if (!inTable) {
        inTable = true;
        
        // Extract headers, filtering out empty cells
        tableHeaders = line.split('|')
          .map(header => header.trim())
          .filter(header => header !== '');
        
        // Skip the separator line
        if (i + 1 < lines.length && lines[i + 1].includes('|-')) {
          i++;
        }
      } else if (!line.includes('|-')) {
        tableRows.push(
          line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell !== '')
        );
      }
      
      // Check if this is the last line of the table
      if (i + 1 >= lines.length || !lines[i + 1].includes('|')) {
        html += `
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead class="bg-gray-50">
                <tr>
        `;
        
        tableHeaders.forEach(header => {
          html += `<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${header}</th>`;
        });
        
        html += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
        
        tableRows.forEach((row, rowIndex) => {
          html += `<tr class="${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">`;
          
          row.forEach((cell, cellIndex) => {
            if (cellIndex < tableHeaders.length) {
              html += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cell}</td>`;
            }
          });
          
          html += `</tr>`;
        });

        // If this table contains a MONTHLY REVENUE column, append a Total Average row
        const revenueHeaderIndex = tableHeaders.findIndex(h => {
          const normalized = h.replace(/\s+/g, '').toLowerCase();
          return (normalized.includes('monthly') && normalized.includes('revenue'))
            || normalized === 'monthlyrevenue'
            || normalized === 'monthly_revenue';
        });

        if (revenueHeaderIndex !== -1) {
          let total = 0;
          let count = 0;
          tableRows.forEach(row => {
            const cell = row[revenueHeaderIndex];
            const num = parseAmount(cell);
            if (!isNaN(num)) {
              total += num;
              count += 1;
            }
          });
          if (count > 0) {
            const avg = total / count;
            html += `<tr class="bg-blue-50">`;
            for (let i = 0; i < tableHeaders.length; i++) {
              if (i === revenueHeaderIndex) {
                html += `<td class="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-700">Total Average: ${formatCurrency(avg)}</td>`;
              } else {
                html += `<td class="px-6 py-3 whitespace-nowrap text-sm text-gray-500"></td>`;
              }
            }
            html += `</tr>`;
          }
        }

        html += `</tbody></table></div>`;
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }
    // Handle lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      let j = i;
      html += '<ul class="list-disc pl-5 space-y-2 text-gray-600">';
      
      while (j < lines.length && (lines[j].trim().startsWith('- ') || lines[j].trim().startsWith('* '))) {
        html += `<li>${lines[j].trim().substring(2)}</li>`;
        j++;
      }
      
      html += '</ul>';
      i = j - 1;
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(line)) {
      let j = i;
      html += '<ol class="list-decimal pl-5 space-y-2 text-gray-600">';
      
      while (j < lines.length && /^\d+\.\s/.test(lines[j].trim())) {
        html += `<li>${lines[j].trim().replace(/^\d+\.\s/, '')}</li>`;
        j++;
      }
      
      html += '</ol>';
      i = j - 1;
    }
    // Handle paragraphs
    else if (line !== '') {
      html += `<p class="text-gray-600">${line}</p>`;
    }
  }
  
  html += '</div>';
  return html;
};
