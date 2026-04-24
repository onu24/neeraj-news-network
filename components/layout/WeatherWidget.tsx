'use client';

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Wind, Thermometer, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

export function WeatherWidget() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const lat = 22.0797;
        const lon = 82.1391;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`);
        const json = await res.json();
        const current = json.current;
        setData({
          temp: Math.round(current.temperature_2m),
          humidity: current.relative_humidity_2m,
          wind: current.wind_speed_10m,
          condition: decodeWeatherCode(current.weather_code),
          city: 'BILASPUR, CG'
        });
      } catch (e) {
        console.error('Weather fetch error', e);
      }
    }
    fetchWeather();
  }, []);

  if (!data) return (
    <div className="flex items-center gap-2 opacity-50 text-[10px] uppercase font-black">
      <Sun className="h-4 w-4 animate-pulse" />
      <span>Loading Weather...</span>
    </div>
  );

  const Icon = getWeatherIcon(data.condition);

  return (
    <div className="flex flex-col gap-6 w-full group/weather">
      {/* Primary Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: data.condition === 'Sunny' ? 360 : 0,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className={`p-3 rounded-2xl ${
                data.condition === 'Sunny' ? 'bg-amber-100/50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 
                'bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              }`}
            >
              <Icon className="h-7 w-7" />
            </motion.div>
            {data.condition === 'Sunny' && (
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-amber-400 blur-xl rounded-full -z-10"
              />
            )}
          </div>
          
          <div className="flex flex-col">
            <h4 className="text-[2.2rem] font-black leading-none tracking-tighter text-foreground group-hover/weather:text-primary transition-colors duration-500">
              {data.temp}°<span className="text-xl font-bold align-top mt-1 inline-block opacity-60">C</span>
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{data.city}</span>
              <span className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-tight">{data.condition}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-all hover:bg-white dark:hover:bg-zinc-900 hover:shadow-sm">
           <div className="flex items-center gap-2 text-muted-foreground">
              <Droplets className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Humidity</span>
           </div>
           <span className="text-sm font-black text-foreground">{data.humidity}%</span>
        </div>
        
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-all hover:bg-white dark:hover:bg-zinc-900 hover:shadow-sm">
           <div className="flex items-center gap-2 text-muted-foreground">
              <Wind className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Wind Flow</span>
           </div>
           <span className="text-sm font-black text-foreground">{data.wind}<span className="text-[10px] ml-1 opacity-60">KM/H</span></span>
        </div>
      </div>
    </div>
  );
}

function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes('sunny') || c.includes('clear')) return Sun;
  if (c.includes('cloud')) return Cloud;
  if (c.includes('rain')) return CloudRain;
  if (c.includes('thunder')) return CloudLightning;
  return Sun;
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
