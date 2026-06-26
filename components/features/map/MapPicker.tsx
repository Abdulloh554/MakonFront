"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

interface MapPickerProps {
  onSelect: (lat: number, lng: number) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPicker({
  onSelect,
  onClose,
  initialLat = 41.3111,
  initialLng = 69.2797,
}: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const position: [number, number] = [initialLat, initialLng];
    const map = L.map(containerRef.current, {
      center: position,
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: "",
      html: `
        <div style="position: relative; width: 34px; height: 46px; display: flex; align-items: flex-end; justify-content: center;">
          <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 26px; height: 26px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 10px 22px rgba(239,68,68,0.25);"></div>
          <div style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%); width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
          <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%) rotate(45deg); width: 20px; height: 20px; background: #ef4444; border-radius: 4px 0 0 0; box-shadow: 0 4px 12px rgba(239,68,68,0.18);"></div>
        </div>
      `,
      iconSize: [34, 46],
      iconAnchor: [17, 46],
    });

    const marker = L.marker(position, {
      draggable: true,
      icon: markerIcon,
    }).addTo(map);
    markerRef.current = marker;

    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
    });

    marker.on("dragend", () => {
      // marker position updates automatically
    });

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [initialLat, initialLng]);

  function handleConfirm() {
    const pos = markerRef.current?.getLatLng();
    if (pos) {
      onSelect(pos.lat, pos.lng);
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">
            Xaritadan joy tanlang
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Bekor qilish
          </button>
        </div>

        <div ref={containerRef} className="w-full h-[50dvh]" />

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 mr-auto">
            Xaritada joyni bosing yoki markerni sudrab ko&apos;chiring
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Tanlash
          </button>
        </div>
      </motion.div>
    </div>
  );
}
