import fetch from 'node-fetch';
import * as cheerio from 'cheerio'; 
import type { Meet } from '@/types/Meet';


interface geoResponse {
    lat: string,
    lon: string,
}


export const stateCoords: Record<string, { lat: number; lon: number }> = {
  "AL": { lat: 32.806671, lon: -86.791130 },
  "AK": { lat: 61.370716, lon: -152.404419 },
  "AZ": { lat: 33.729759, lon: -111.431221 },
  "AR": { lat: 34.969704, lon: -92.373123 },
  "CA": { lat: 36.116203, lon: -119.681564 },
  "CO": { lat: 39.059811, lon: -105.311104 },
  "CT": { lat: 41.597782, lon: -72.755371 },
  "DE": { lat: 39.318523, lon: -75.507141 },
  "FL": { lat: 27.766279, lon: -81.686783 },
  "GA": { lat: 33.040619, lon: -83.643074 },
  "HI": { lat: 21.094318, lon: -157.498337 },
  "ID": { lat: 44.240459, lon: -114.478828 },
  "IL": { lat: 40.349457, lon: -88.986137 },
  "IN": { lat: 39.849426, lon: -86.258278 },
  "IA": { lat: 42.011539, lon: -93.210526 },
  "KS": { lat: 38.526600, lon: -96.726486 },
  "KY": { lat: 37.668140, lon: -84.670067 },
  "LA": { lat: 31.169546, lon: -91.867805 },
  "ME": { lat: 44.693947, lon: -69.381927 },
  "MD": { lat: 39.063946, lon: -76.802101 },
  "MA": { lat: 42.230171, lon: -71.530106 },
  "MI": { lat: 43.326618, lon: -84.536095 },
  "MN": { lat: 45.694454, lon: -93.900192 },
  "MS": { lat: 32.741646, lon: -89.678696 },
  "MO": { lat: 38.456085, lon: -92.288368 },
  "MT": { lat: 46.921925, lon: -110.454353 },
  "NE": { lat: 41.125370, lon: -98.268082 },
  "NV": { lat: 38.313515, lon: -117.055374 },
  "NH": { lat: 43.452492, lon: -71.563896 },
  "NJ": { lat: 40.298904, lon: -74.521011 },
  "NM": { lat: 34.840515, lon: -106.248482 },
  "NY": { lat: 42.165726, lon: -74.948051 },
  "NC": { lat: 35.630066, lon: -79.806419 },
  "ND": { lat: 47.528912, lon: -99.784012 },
  "OH": { lat: 40.388783, lon: -82.764915 },
  "OK": { lat: 35.565342, lon: -96.928917 },
  "OR": { lat: 44.572021, lon: -122.070938 },
  "PA": { lat: 40.590752, lon: -77.209755 },
  "RI": { lat: 41.680893, lon: -71.511780 },
  "SC": { lat: 33.856892, lon: -80.945007 },
  "SD": { lat: 44.299782, lon: -99.438828 },
  "TN": { lat: 35.747845, lon: -86.692345 },
  "TX": { lat: 31.054487, lon: -97.563461 },
  "UT": { lat: 40.150032, lon: -111.862434 },
  "VT": { lat: 44.045876, lon: -72.710686 },
  "VA": { lat: 37.769337, lon: -78.169968 },
  "WA": { lat: 47.400902, lon: -121.490494 },
  "WV": { lat: 38.491226, lon: -80.954453 },
  "WI": { lat: 44.268543, lon: -89.616508 },
  "WY": { lat: 42.755966, lon: -107.302490 }
};

function getCoords(stateCode: string) {
  return stateCoords[stateCode.toUpperCase()] || { lat: 0, lon: 0 };
}

function parseStartDate(dateStr: string): string {
  const startPart = dateStr.split('-')[0].trim(); 
  const date = new Date(startPart);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}


async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,{
 headers: {
      'User-Agent': 'PL-Connect/1.0 (wespalanca@gmail.com)'
    }
  });
  const data = (await res.json()) as geoResponse[];
  if (data && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }
  return null;
}

export async function scrapeMeets(): Promise<Meet[]> {
    console.log("Scraping meets from usapl")
    const url = 'https://www.usapowerlifting.com/calendar/';
    const response = await fetch(url);
    if (!response.ok){
        throw new Error('Network response was not ok');
    }
    const html = await response.text();

    const $ = cheerio.load(html);
    const meets: Meet[] = [];

    const elements =  $('.vc_tta-title-text').toArray();

     for (const element of elements){
        const name = $(element).find('.event-name').text().trim();
        const location = $(element).find('.event-state').text().trim();
        const date = $(element).find('.event-date').text().trim();
        const info = $(element).find('.event-info').text().trim();
        const { lat, lon } = getCoords(location);
        const parsedDate = parseStartDate(date);
        meets.push({ name, location, date: parsedDate, info, lat, lon});
     }


       return meets;



}


