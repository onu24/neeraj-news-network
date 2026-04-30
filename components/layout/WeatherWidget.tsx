'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Cloud, Sun, CloudRain, CloudLightning, Wind, Droplets,
  ChevronDown, MapPin, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── City data ───────────────────────────────────────────────────────────────
export const CITIES = [
  // Chhattisgarh
  { name: 'Bilaspur',   state: 'CG', lat: 22.0797, lon: 82.1391 },
  { name: 'Raipur',     state: 'CG', lat: 21.2514, lon: 81.6296 },
  { name: 'Durg',       state: 'CG', lat: 21.1904, lon: 81.2849 },
  { name: 'Korba',      state: 'CG', lat: 22.3595, lon: 82.7501 },
  { name: 'Raigarh',    state: 'CG', lat: 21.8974, lon: 83.3950 },
  { name: 'Jagdalpur',  state: 'CG', lat: 19.0820, lon: 82.0220 },
  { name: 'Ambikapur',  state: 'CG', lat: 23.1183, lon: 83.1963 },
  { name: 'Rajnandgaon',state: 'CG', lat: 21.0974, lon: 81.0374 },
  // Major India
  { name: 'Delhi',      state: 'DL', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai',     state: 'MH', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru',  state: 'KA', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad',  state: 'TS', lat: 17.3850, lon: 78.4867 },
  { name: 'Kolkata',    state: 'WB', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai',    state: 'TN', lat: 13.0827, lon: 80.2707 },
  { name: 'Bhopal',     state: 'MP', lat: 23.2599, lon: 77.4126 },
];

export type CityEntry = (typeof CITIES)[number];

// ─── Component ───────────────────────────────────────────────────────────────
export function WeatherWidget({ onCityChange }: { onCityChange?: (city: CityEntry) => void }) {
  const [selectedCity, setSelectedCity] = useState<CityEntry>(CITIES[0]);
  const [data, setData]                 = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [open, setOpen]                 = useState(false);
  const dropdownRef                     = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch weather whenever city changes
  useEffect(() => {
    setLoading(true);
    setData(null);
    if (onCityChange) onCityChange(selectedCity);
    async function fetchWeather() {
      try {
        const { lat, lon, name, state } = selectedCity;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );
        if (!res.ok) throw new Error('API Response Error');
        const json = await res.json();
        const current = json.current;
        setData({
          temp:      Math.round(current.temperature_2m),
          humidity:  current.relative_humidity_2m,
          wind:      current.wind_speed_10m,
          condition: decodeWeatherCode(current.weather_code),
          city:      `${name.toUpperCase()}, ${state}`,
          error:     false
        });
      } catch (e) {
        console.error('Weather fetch error', e);
        setData({
          temp: '--',
          humidity: 0,
          wind: 0,
          condition: 'Unavailable',
          city: selectedCity.name.toUpperCase(),
          error: true
        });
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [selectedCity]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex flex-col gap-5 w-full animate-pulse">
        {/* City selector skeleton */}
        <div className="h-8 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        {/* Temp row */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-col gap-2">
            <div className="h-8 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );

  const Icon          = getWeatherIcon(data.condition);
  const isSunny       = data.condition === 'Sunny';
  const isRainy       = data.condition.includes('Rain') || data.condition.includes('Shower');
  const conditionBadge = isSunny
    ? 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40'
    : isRainy
    ? 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40'
    : 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40';
  const iconBg = isSunny
    ? 'bg-amber-100/70 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
    : 'bg-blue-100/70 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';

  // CG cities = first 8
  const cgCities    = CITIES.slice(0, 8);
  const otherCities = CITIES.slice(8);

  return (
    <div className="flex flex-col gap-4 w-full group/weather">

      {/* ── City Selector ─────────────────────────────────────────────────── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl
                     bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
                     text-[10px] sm:text-[11px] font-black uppercase tracking-widest
                     text-foreground hover:border-primary/50 hover:shadow-sm
                     transition-all duration-300 group/btn"
          aria-label="Select city"
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
            <span className="truncate">{selectedCity.name}</span>
            <span className="text-muted-foreground/50 font-bold normal-case tracking-normal">
              {selectedCity.state}
            </span>
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          </motion.div>
        </button>

        {/* Dropdown panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 mt-1.5 z-50
                         bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
                         rounded-xl shadow-2xl shadow-black/10 overflow-hidden"
            >
              {/* CG Cities group */}
              <div className="px-2.5 pt-2.5 pb-1">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/60 mb-1.5 px-1">
                  Chhattisgarh
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {cgCities.map((city) => (
                    <CityOption
                      key={city.name}
                      city={city}
                      active={selectedCity.name === city.name}
                      onSelect={() => { setSelectedCity(city); setOpen(false); }}
                    />
                  ))}
                </div>
              </div>

              <div className="mx-2.5 my-1.5 border-t border-zinc-100 dark:border-zinc-800" />

              {/* Other cities group */}
              <div className="px-2.5 pb-2.5">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-1.5 px-1">
                  Other Cities
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {otherCities.map((city) => (
                    <CityOption
                      key={city.name}
                      city={city}
                      active={selectedCity.name === city.name}
                      onSelect={() => { setSelectedCity(city); setOpen(false); }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Primary Row ───────────────────────────────────────────────────── */}
      <motion.div
        key={selectedCity.name}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Icon */}
          <div className="relative flex-shrink-0">
            <motion.div
              animate={{ rotate: isSunny ? 360 : 0, scale: [1, 1.1, 1] }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale:  { duration: 4,  repeat: Infinity, ease: 'easeInOut' },
              }}
              className={`p-2.5 sm:p-3 rounded-2xl ${iconBg}`}
            >
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </motion.div>
            {isSunny && (
              <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-amber-400 blur-xl rounded-full -z-10"
              />
            )}
          </div>

          {/* Temp + labels */}
          <div className="flex flex-col min-w-0">
            <h4 className="text-[1.9rem] sm:text-[2.2rem] font-black leading-none tracking-tighter text-foreground group-hover/weather:text-primary transition-colors duration-500">
              {data.temp}°
              <span className="text-base sm:text-xl font-bold align-top mt-1 inline-block opacity-60">C</span>
            </h4>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 truncate max-w-[90px] sm:max-w-none">
                {data.city}
              </span>
              <span className="w-1 h-1 rounded-full bg-primary/40 flex-shrink-0" />
              <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded-full ${conditionBadge}`}>
                {data.condition}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">

        {/* Humidity */}
        <motion.div
          key={`hum-${selectedCity.name}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2 p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Droplets className="h-3 w-3 flex-shrink-0 text-blue-400" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-70">Humidity</span>
          </div>
          <span className="text-sm sm:text-base font-black text-foreground">{data.humidity}%</span>
          <div className="w-full h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            <motion.div
              key={`hbar-${selectedCity.name}`}
              initial={{ width: 0 }}
              animate={{ width: `${data.humidity}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-blue-400"
            />
          </div>
        </motion.div>

        {/* Wind Flow */}
        <motion.div
          key={`wind-${selectedCity.name}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="flex flex-col gap-2 p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-sm transition-all relative overflow-hidden"
        >
          {/* Drifting streaks */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute h-[1px] rounded-full"
                style={{
                  top: `${15 + i * 16}%`,
                  width: `${30 + (i % 3) * 20}%`,
                  background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.55), transparent)',
                }}
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '220%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.4 + i * 0.3, repeat: Infinity, delay: i * 0.45, ease: 'linear' }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center gap-1.5 text-muted-foreground relative z-10">
            <motion.div animate={{ x: [0, 2, -1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
              <Wind className="h-3 w-3 flex-shrink-0 text-teal-400" />
            </motion.div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-70">Wind Flow</span>
          </div>

          {/* Speed + compass */}
          <div className="flex items-center justify-between relative z-10">
            <span className="text-sm sm:text-base font-black text-foreground">
              {data.wind}<span className="text-[9px] sm:text-[10px] ml-0.5 opacity-60">km/h</span>
            </span>
            <motion.div
              animate={{ rotate: [0, 20, -10, 15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-5"
            >
              <svg viewBox="0 0 20 20" className="w-full h-full">
                <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-300 dark:text-zinc-700" />
                <text x="10" y="5.5" textAnchor="middle" fontSize="3" fontWeight="800" fill="#2dd4bf">N</text>
                <polygon points="10,3.5 11,10 10,11 9,10" fill="#2dd4bf" />
                <polygon points="10,16.5 11,10 10,9 9,10" fill="#94a3b8" />
                <circle cx="10" cy="10" r="1.2" fill="white" stroke="#2dd4bf" strokeWidth="0.5" />
              </svg>
            </motion.div>
          </div>

          {/* Arc gauge */}
          <div className="relative z-10">
            <svg viewBox="0 0 60 34" className="w-full h-auto" style={{ maxHeight: '28px' }}>
              <path d="M 5 30 A 25 25 0 0 1 55 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-zinc-200 dark:text-zinc-700" />
              <motion.path
                key={`arc-${selectedCity.name}`}
                d="M 5 30 A 25 25 0 0 1 55 30"
                fill="none"
                stroke="url(#windGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="78.5"
                initial={{ strokeDashoffset: 78.5 }}
                animate={{ strokeDashoffset: Math.max(0, 78.5 - (Math.min(data.wind, 80) / 80) * 78.5) }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="windGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <text x="3"  y="34" fontSize="5" fill="currentColor" className="fill-muted-foreground/50" fontWeight="700">0</text>
              <text x="49" y="34" fontSize="5" fill="currentColor" className="fill-muted-foreground/50" fontWeight="700">80</text>
            </svg>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// ─── City option button ───────────────────────────────────────────────────────
function CityOption({
  city, active, onSelect,
}: { city: CityEntry; active: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left w-full
                  text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-200
                  ${active
                    ? 'bg-primary text-white shadow-sm'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground'
                  }`}
    >
      <MapPin className={`h-2.5 w-2.5 flex-shrink-0 ${active ? 'text-white' : 'text-primary/60'}`} />
      <span className="truncate">{city.name}</span>
    </button>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes('sunny') || c.includes('clear')) return Sun;
  if (c.includes('cloud')) return Cloud;
  if (c.includes('rain')) return CloudRain;
  if (c.includes('thunder')) return CloudLightning;
  return Sun;
}

function decodeWeatherCode(code: number) {
  if (code === 0)                   return 'Sunny';
  if (code >= 1  && code <= 3)      return 'Partly Cloudy';
  if (code >= 45 && code <= 48)     return 'Foggy';
  if (code >= 51 && code <= 67)     return 'Rainy';
  if (code >= 71 && code <= 77)     return 'Snowy';
  if (code >= 80 && code <= 82)     return 'Showers';
  if (code >= 95)                   return 'Thunderstorm';
  return 'Clear';
}
