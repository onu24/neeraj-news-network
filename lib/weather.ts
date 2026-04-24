import 'server-only';

export async function getWeatherData() {
  try {
    // Using Open-Meteo (Free API, no key required)
    // Localized to Bilaspur, Chhattisgarh
    const lat = 22.0797;
    const lon = 82.1391;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

    const response = await fetch(url, { next: { revalidate: 1800 } }); // Revalidate every 30 mins
    if (!response.ok) throw new Error('Weather fetch failed');
    
    const data = await response.json();
    const current = data.current;
    
    return {
      temp: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      wind: current.wind_speed_10m,
      condition: decodeWeatherCode(current.weather_code),
      city: 'BILASPUR, CG'
    };
  } catch (error) {
    console.error('Weather error:', error);
    return {
      temp: 32,
      humidity: 45,
      wind: 12,
      condition: 'Sunny',
      city: 'NEW DELHI'
    };
  }
}

function decodeWeatherCode(code: number) {
  if (code === 0) return 'Sunny';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
}
