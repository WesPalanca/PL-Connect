import fs from 'fs';
import { scrapeMeets } from './scraper';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to convert array of objects to CSV string
function arrayToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(fieldName => {
        const val = row[fieldName];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

async function main() {
  try {
    const meets = await scrapeMeets();

    const csv = arrayToCSV(meets);

    const outputPath = path.resolve(__dirname, 'meets.csv');
    fs.writeFileSync(outputPath, csv, 'utf-8');

    console.log(`CSV file created at: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
