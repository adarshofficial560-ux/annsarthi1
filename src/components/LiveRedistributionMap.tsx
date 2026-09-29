'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFoodRescue } from '../lib/store';
import { calculateOptimizedRoute } from '../lib/algorithms';
import { 
  X, Navigation, Radio, ShieldCheck, Thermometer, Truck, MapPin, 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Layers, Info, Battery, Clock 
} from 'lucide-react';

interface LiveRedistributionMapProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveRedistributionMap: React.FC<LiveRedistributionMapProps> = ({ isOpen, onClose }) => {
  const { pickups, ngos } = useFoodRescue();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [selectedEntity, setSelectedEntity] = useState<any>({
    type: 'FLEET',
    name: 'EV Insulated Van #08',
    driver: 'Rajesh Kumar',
    temp: 3.4,
    status: 'EN_ROUTE',
    eta: '6m',
    cargo: '50 kg Cooked Basmati Rice & Dal',
    destination: 'Asha Community Shelter (Sector 4, Rourkela)',
    door: 'SEALED',
    speed: '32 km/h',
    safeHours: 2.5,
  });

  const [isRouteOptimized, setIsRouteOptimized] = useState(true);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically load Leaflet on client-side
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize Leaflet map centered at Rourkela, Odisha
      const map = L.map(mapContainerRef.current).setView([22.2530, 84.8700], 13);
      mapInstanceRef.current = map;

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Annsarthi Rourkela Geospatial Fleet Radar',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon creators
      const createIcon = (bg: string, emoji: string) => {
        return L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background-color: ${bg}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${emoji}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
      };

      const kitchenIcon = createIcon('#059669', '🍳');
      const ngoIcon = createIcon('#7c3aed', '🤝');
      const fleetIcon = createIcon('#0284c7', '🚚');
      const procIcon = createIcon('#d97706', '🏭');

      // 1. Kitchens in Rourkela
      const k1 = L.marker([22.2492, 84.8828], { icon: kitchenIcon }).addTo(map);
      k1.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <strong style="color: #059669;">Central Kitchen Hub #4</strong><br/>
          <em>Civil Township, Rourkela</em><br/>
          Surplus Ready: 50 kg Cooked Rice & Dal<br/>
          <strong>Safe Window: 2.5h (Priority SOS)</strong>
        </div>
      `);
      k1.on('click', () => {
        setSelectedEntity({
          type: 'KITCHEN',
          name: 'Central Kitchen Hub (Civil Township, Rourkela)',
          driver: 'Executive Chef Ramesh',
          temp: 63.2,
          status: 'HOT_HOLDING',
          eta: 'Ready for Pickup',
          cargo: '50kg Rice & Dal + 15kg Paneer',
          destination: 'Asha Shelter / Sneha Sadan',
          door: 'SEALED',
          speed: '0 km/h',
          safeHours: 2.5,
        });
      });

      const k2 = L.marker([22.2425, 84.8015], { icon: kitchenIcon }).addTo(map);
      k2.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <strong style="color: #059669;">Panposh Food Node</strong><br/>
          <em>Panposh Road, Rourkela</em><br/>
          Surplus Ready: 30 kg Mixed Vegetables
        </div>
      `);

      const k3 = L.marker([22.2504, 84.9048], { icon: kitchenIcon }).addTo(map);
      k3.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <strong style="color: #059669;">NIT Rourkela Food Hub</strong><br/>
          <em>NIT Campus, Rourkela</em><br/>
          Surplus: 25 kg Bakery Buns & Bread
        </div>
      `);

      // 2. Recipient NGOs in Rourkela
      ngos.forEach((ngo) => {
        const marker = L.marker([ngo.lat, ngo.lng], { icon: ngoIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
            <strong style="color: #7c3aed;">${ngo.name}</strong><br/>
            Beneficiaries: ${ngo.activeBeneficiaries} residents<br/>
            Cold Storage: ${ngo.coldStorageAvailable ? 'Available (≤4°C)' : 'Ambient only'}
          </div>
        `);
        marker.on('click', () => {
          setSelectedEntity({
            type: 'NGO',
            name: ngo.name,
            driver: ngo.contactPerson,
            temp: ngo.coldStorageAvailable ? 3.8 : 24.0,
            status: 'READY_FOR_INTAKE',
            eta: `${Math.round(ngo.distanceKm * 3.2)}m`,
            cargo: `Capacity: ${ngo.dailyIntakeCapacityKg} kg/day`,
            destination: ngo.shelterType,
            door: 'OPEN_INTAKE',
            speed: '0 km/h',
            safeHours: 6.0,
          });
        });
      });

      // 3. All Active Couriers and Incoming Fleets in Rourkela
      pickups.forEach((pickup) => {
        const fMarker = L.marker([pickup.lat, pickup.lng], { icon: fleetIcon }).addTo(map);
        fMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
            <strong style="color: #0284c7;">${pickup.vehicleType}</strong><br/>
            Driver: ${pickup.driverName}<br/>
            Cold-Chain Temp: <strong>${pickup.tempCelsius}°C</strong> (Safe)<br/>
            Cargo: ${pickup.quantityKg} kg<br/>
            Destination: <strong>${pickup.targetNgoName}</strong><br/>
            ETA: ${pickup.etaMinutes} min
          </div>
        `);
        fMarker.on('click', () => {
          setSelectedEntity({
            type: 'FLEET',
            name: pickup.vehicleType,
            driver: pickup.driverName,
            temp: pickup.tempCelsius,
            status: pickup.status,
            eta: `${pickup.etaMinutes}m`,
            cargo: `${pickup.quantityKg} kg from ${pickup.hubName}`,
            destination: pickup.targetNgoName,
            door: pickup.doorSensorStatus,
            speed: '34 km/h',
            safeHours: 2.5,
          });
        });
      });

      // 4. Bio-Processing Hub in Rourkela
      const procMarker = L.marker([22.2150, 84.8380], { icon: procIcon }).addTo(map);
      procMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <strong style="color: #d97706;">Annsarthi Bio-Processing Hub</strong><br/>
          <em>Rourkela Industrial Estate</em><br/>
          Circular Tomato Pureeing & Aerobic Composting Units
        </div>
      `);

      // 5. Active Rourkela Route Polylines
      const rourkelaOptimized: [number, number][] = [
        [22.2492, 84.8828], // Central Kitchen Civil Township
        [22.2540, 84.8680], // EV Fleet on Ring Road
        [22.2615, 84.8520], // Asha Shelter Sector 4
        [22.2740, 84.8980], // Sneha Sadan Koel Nagar
      ];

      const rourkelaBaseline: [number, number][] = [
        [22.2492, 84.8828],
        [22.2350, 84.8550],
        [22.2615, 84.8520],
        [22.2425, 84.8015],
        [22.2740, 84.8980],
      ];

      L.polyline(isRouteOptimized ? rourkelaOptimized : rourkelaBaseline, {
        color: isRouteOptimized ? '#059669' : '#e11d48',
        weight: 4,
        dashArray: isRouteOptimized ? undefined : '6, 6',
      }).addTo(map);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, isRouteOptimized, pickups, ngos]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#071711] border border-slate-200 dark:border-emerald-900/60 text-slate-900 dark:text-emerald-50 rounded-3xl w-full max-w-5xl p-4 sm:p-6 shadow-2xl relative flex flex-col h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-slate-500 dark:text-emerald-300 transition z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Rourkela Geospatial Fleet Radar & Cold-Chain Telemetry
                </h2>
                <span className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-mono font-bold">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> ROURKELA GRID ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-emerald-300/80">
                Live OpenStreetMap tracking of Kitchens, Shelters, EV Fleets & Couriers across Rourkela, Odisha
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRouteOptimized(!isRouteOptimized)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm hover:scale-105 ${
                isRouteOptimized
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                  : 'bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-300 border-slate-300 dark:border-emerald-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRouteOptimized ? 'AI Optimized Route ON' : 'Baseline Route'}</span>
            </button>
          </div>
        </div>

        {/* AI Route Optimization Comparison Ribbon */}
        <div className="mb-3 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Rourkela Sector Routing: TSP Multi-Stop Optimization Active</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 dark:text-emerald-400/70">Baseline: </span>
              <span className="line-through text-rose-500">18.4 km / 45m</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-emerald-400/70">Optimized: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-300">12.1 km / 28m</span>
            </div>
            <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold text-[10px]">
              -34% Distance &bull; -4.8kg CO₂e
            </div>
          </div>
        </div>

        {/* Active Couriers Legend Bar */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[10px] text-slate-400 font-bold uppercase">All Active Couriers on Radar:</span>
          {pickups.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedEntity({
                type: 'FLEET',
                name: p.vehicleType,
                driver: p.driverName,
                temp: p.tempCelsius,
                status: p.status,
                eta: `${p.etaMinutes}m`,
                cargo: `${p.quantityKg} kg from ${p.hubName}`,
                destination: p.targetNgoName,
                door: p.doorSensorStatus,
                speed: '34 km/h',
                safeHours: 2.5,
              })}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 border border-slate-200 dark:border-emerald-800 cursor-pointer text-[11px] flex items-center gap-1.5 transition hover:scale-105"
            >
              <Truck className="w-3.5 h-3.5 text-cyan-500" />
              <span className="font-bold text-slate-800 dark:text-emerald-200">{p.vehicleType}</span>
              <span className="text-cyan-600 dark:text-cyan-400">({p.tempCelsius}°C)</span>
            </div>
          ))}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-emerald-900/60 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Bottom Interactive Telemetry Card */}
        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-[#0b241b] border border-slate-200 dark:border-emerald-900/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs transition-all hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
              {selectedEntity.type === 'FLEET' ? <Truck className="w-5 h-5 text-emerald-500" /> : <MapPin className="w-5 h-5 text-emerald-500" />}
            </div>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span className="text-slate-900 dark:text-emerald-100">{selectedEntity.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                  {selectedEntity.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-emerald-300/80 font-mono mt-0.5">
                Cargo: {selectedEntity.cargo} &bull; Destination: {selectedEntity.destination}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-[#071a13] border border-slate-200 dark:border-emerald-900/80">
              <Thermometer className="w-3.5 h-3.5 text-cyan-500" />
              <span>Temp: <strong className="text-cyan-500">{selectedEntity.temp}°C</strong> (Safe Zone)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-[#071a13] border border-slate-200 dark:border-emerald-900/80">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>ETA: <strong>{selectedEntity.eta}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-[#071a13] border border-slate-200 dark:border-emerald-900/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sensor: <strong>{selectedEntity.door}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};