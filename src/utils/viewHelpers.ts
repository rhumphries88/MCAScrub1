// Open a full screen view of the content
export const openFullScreenView = (content: string): Window | null => {
  // Create a new window for viewing with popup-friendly options
  const viewWindow = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800');
  if (!viewWindow) {
    return null;
  }
  
  // Create enhanced HTML content with better styling
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Financial Analysis</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --color-primary: #0369a1;
          --color-primary-light: #e0f2fe;
          --color-gray-50: #f9fafb;
          --color-gray-100: #f3f4f6;
          --color-gray-200: #e5e7eb;
          --color-gray-300: #d1d5db;
          --color-gray-700: #374151;
          --color-gray-800: #1f2937;
          --color-gray-900: #111827;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          line-height: 1.6; 
          color: var(--color-gray-800);
          background-color: var(--color-gray-50);
          padding: 1rem;
        }
        
        .container {
          max-width: 1100px;
          margin: 0 auto;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          position: relative;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 1.5rem;
          }
        }
        
        pre {
          background-color: var(--color-gray-100);
          padding: 1rem;
          border-radius: 6px;
          overflow: auto;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 0.875rem;
        }
        
        .controls {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 100;
          background: white;
          padding: 0.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          gap: 0.5rem;
          backdrop-filter: blur(8px);
          background-color: rgba(255, 255, 255, 0.8);
          border: 1px solid var(--color-gray-200);
        }
        
        .control-btn {
          background: var(--color-gray-100);
          border: 1px solid var(--color-gray-200);
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--color-gray-700);
        }
        
        .control-btn:hover {
          background: var(--color-gray-200);
        }
        
        .control-btn.primary {
          background-color: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        
        .control-btn.primary:hover {
          background-color: #0284c7;
          filter: brightness(1.05);
        }
        
        /* Print styles */
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .container {
            box-shadow: none;
            padding: 0;
          }
          
          .controls {
            display: none;
          }
        }

        ${content.includes('style') ? '' : `
          .analysis-report h2 {
            color: var(--color-gray-900);
            border-bottom: 2px solid var(--color-primary);
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }
          
          .analysis-report h3 {
            color: var(--color-gray-800);
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-size: 1.25rem;
          }
          
          .analysis-report table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
            margin: 1.5rem 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-radius: 0.5rem;
            overflow: hidden;
          }
          
          .analysis-report th {
            background-color: var(--color-primary-light);
            font-weight: 600;
            text-align: left;
            padding: 0.75rem 1rem;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-primary);
          }
          
          .analysis-report td {
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            border-top: 1px solid var(--color-gray-200);
          }
          
          .analysis-report tr:nth-child(even) {
            background-color: var(--color-gray-50);
          }
        `}
      </style>
    </head>
    <body>
      <div class="controls">
        <button class="control-btn" id="decreaseFont" title="Decrease font size">A-</button>
        <button class="control-btn" id="increaseFont" title="Increase font size">A+</button>
        <button class="control-btn primary" id="printBtn" title="Print report">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print
        </button>
      </div>
      
      <div class="container" id="contentContainer">
        ${content}
      </div>
      
      <script>
        // Font size control
        let currentFontSize = 16;
        const container = document.getElementById('contentContainer');
        container.style.fontSize = currentFontSize + 'px';
        
        document.getElementById('decreaseFont').addEventListener('click', () => {
          if (currentFontSize > 12) {
            currentFontSize -= 1;
            container.style.fontSize = currentFontSize + 'px';
          }
        });
        
        document.getElementById('increaseFont').addEventListener('click', () => {
          if (currentFontSize < 24) {
            currentFontSize += 1;
            container.style.fontSize = currentFontSize + 'px';
          }
        });
        
        document.getElementById('printBtn').addEventListener('click', () => {
          window.print();
        });
      </script>
    </body>
    </html>
  `;
  
  // Set the content safely using innerHTML
  viewWindow.document.documentElement.innerHTML = htmlContent;
  
  return viewWindow;
}