import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { Flame, Footprints, Map, Pause, Play, ShieldCheck, Square, Timer, X } from 'lucide-react';
import StatPill from '../components/ui/StatPill';

const DEFAULT_CENTER = [28.6139, 77.2090];
const STEPS_PER_KM = 1312;
const CALORIES_PER_KM = 60;

const haversineDistance = (coord1, coord2) => {
  const R = 6371;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours > 0) return `${hours}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${remMins}:${String(secs).padStart(2, '0')}`;
};

const FollowUser = ({ position, enabled }) => {
  const map = useMap();

  useEffect(() => {
    if (enabled && position) {
      map.setView(position, Math.max(map.getZoom(), 16), { animate: true });
    }
  }, [enabled, map, position]);

  return null;
};

const Walk = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [summary, setSummary] = useState(null);
  const [locationError, setLocationError] = useState('');
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const lastRecordedRef = useRef(0);
  const startTimeRef = useRef(null);

  const currentPosition = routeCoordinates[routeCoordinates.length - 1] || null;
  const estimatedSteps = Math.round(totalDistance * STEPS_PER_KM);
  const estimatedCalories = Math.round(totalDistance * CALORIES_PER_KM);

  const stats = useMemo(() => ([
    { label: 'Distance', value: `${totalDistance.toFixed(2)} km`, icon: <Map size={18} className="text-[var(--color-primary)]" /> },
    { label: 'Duration', value: formatDuration(elapsedTime), icon: <Timer size={18} className="text-blue-400" /> },
    { label: 'Steps', value: `~${estimatedSteps.toLocaleString()}`, icon: <Footprints size={18} className="text-purple-400" /> },
    { label: 'kcal', value: `~${estimatedCalories}`, icon: <Flame size={18} className="text-[var(--color-calories)]" /> },
  ]), [elapsedTime, estimatedCalories, estimatedSteps, totalDistance]);

  useEffect(() => () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const resetWalk = () => {
    setRouteCoordinates([]);
    setTotalDistance(0);
    setElapsedTime(0);
    setIsPaused(false);
    setLocationError('');
    lastRecordedRef.current = 0;
    startTimeRef.current = null;
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime((value) => value + 1);
    }, 1000);
  };

  const startWalk = () => {
    if (!navigator.geolocation) {
      setLocationError('Location access is not available in this browser.');
      return;
    }

    resetWalk();
    startTimeRef.current = new Date();
    setIsTracking(true);
    startTimer();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.accuracy > 50) return;
        const now = Date.now();
        if (lastRecordedRef.current && now - lastRecordedRef.current < 5000) return;
        lastRecordedRef.current = now;

        const nextCoord = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setRouteCoordinates((coords) => {
          const lastCoord = coords[coords.length - 1];
          if (lastCoord) {
            setTotalDistance((distance) => distance + haversineDistance(lastCoord, nextCoord));
          }
          return [...coords, nextCoord];
        });
      },
      () => {
        setLocationError('Location access needed for walk tracking. Please enable it in browser settings.');
        setIsTracking(false);
        if (timerRef.current) clearInterval(timerRef.current);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const pauseWalk = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeWalk = () => {
    setIsPaused(false);
    startTimer();
  };

  const stopWalk = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    watchIdRef.current = null;
    timerRef.current = null;
    setIsTracking(false);
    setIsPaused(false);
    setSummary({
      distance: totalDistance,
      duration: elapsedTime,
      steps: estimatedSteps,
      calories: estimatedCalories,
      routeCoordinates,
      startTime: startTimeRef.current,
      endTime: new Date(),
    });
  };

  const saveWalk = async () => {
    if (!summary) return;
    try {
      await axios.post('/log/walk', {
        distance: summary.distance,
        duration: summary.duration,
        steps: summary.steps,
        calories: summary.calories,
        routeCoordinates: summary.routeCoordinates.map(({ lat, lng }) => [lat, lng]),
        startTime: summary.startTime,
        endTime: summary.endTime,
      });
      toast.success('Walk saved to today log');
      setSummary(null);
      resetWalk();
    } catch {
      toast.error('Could not save walk');
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Today's Walk</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
            <ShieldCheck size={16} className="text-[var(--color-primary)]" />
            Your route data is stored only on your device/account and never shared.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs">{stat.icon}<span>{stat.label}</span></div>
            <p className="mt-1 text-lg font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {locationError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {locationError}
        </div>
      )}

      <div className="relative h-[60vh] min-h-[360px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        <div className="absolute left-3 top-3 z-[500] flex flex-wrap gap-2">
          <StatPill value={`${totalDistance.toFixed(2)} km`} label="" color="teal" />
          <StatPill value={formatDuration(elapsedTime)} label="" color="blue" />
          <StatPill value={`~${estimatedSteps.toLocaleString()} steps`} label="" color="purple" />
          <StatPill value={`~${estimatedCalories} kcal`} label="" color="rose" />
        </div>
        <MapContainer center={currentPosition || DEFAULT_CENTER} zoom={15} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FollowUser position={currentPosition} enabled={isTracking && !isPaused} />
          {routeCoordinates.length > 0 && (
            <>
              <Polyline positions={routeCoordinates} pathOptions={{ color: '#00d4aa', weight: 5 }} />
              <Marker position={routeCoordinates[0]} />
              {!isTracking && <Marker position={routeCoordinates[routeCoordinates.length - 1]} />}
              <CircleMarker
                center={routeCoordinates[routeCoordinates.length - 1]}
                radius={10}
                className="pulse-dot"
                pathOptions={{ color: '#00d4aa', fillColor: '#00d4aa', fillOpacity: 0.9 }}
              />
            </>
          )}
        </MapContainer>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        {!isTracking ? (
          <button onClick={startWalk} className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2 walk-pulse">
            <Play size={22} />
            <span>Start Walk</span>
          </button>
        ) : (
          <>
            <button
              onClick={isPaused ? resumeWalk : pauseWalk}
              className="flex-1 rounded-lg bg-[#2a2a2a] py-4 font-semibold hover:bg-[#333] flex items-center justify-center gap-2"
            >
              {isPaused ? <Play size={22} /> : <Pause size={22} />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={stopWalk}
              className="flex-1 rounded-lg bg-red-500/15 py-4 font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/20 flex items-center justify-center gap-2"
            >
              <Square size={20} />
              <span>Stop & Save</span>
            </button>
          </>
        )}
      </div>

      {isPaused && <p className="text-center text-sm text-gray-400">Paused - tap Resume to continue</p>}

      {summary && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="glass-card w-full max-w-lg p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-primary)]">Walk Complete!</h2>
                <p className="text-sm text-gray-400">Nice work. Save this route to your daily log?</p>
              </div>
              <button onClick={() => setSummary(null)} className="rounded-lg bg-[#2a2a2a] p-2 hover:bg-[#333]">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 my-5">
              <p>Distance: <span className="font-bold">{summary.distance.toFixed(2)} km</span></p>
              <p>Duration: <span className="font-bold">{formatDuration(summary.duration)}</span></p>
              <p>Steps: <span className="font-bold">~{summary.steps.toLocaleString()}</span></p>
              <p>Calories: <span className="font-bold">~{summary.calories} kcal</span></p>
            </div>
            <div className="h-48 overflow-hidden rounded-lg border border-[#333]">
              <MapContainer center={summary.routeCoordinates[0] || DEFAULT_CENTER} zoom={14} className="h-full w-full" dragging={false} scrollWheelZoom={false}>
                <TileLayer attribution="" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Polyline positions={summary.routeCoordinates} pathOptions={{ color: '#00d4aa', weight: 5 }} />
              </MapContainer>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={saveWalk} className="btn-primary flex-1 py-3">Save to Log</button>
              <button onClick={() => setSummary(null)} className="flex-1 rounded-lg bg-[#2a2a2a] py-3 hover:bg-[#333]">Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Walk;
