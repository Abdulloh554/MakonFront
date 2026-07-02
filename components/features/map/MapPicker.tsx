"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { useI18n } from '@/lib/i18n/I18nContext';

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
  const { t } = useI18n();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "" };
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 3500);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(() => {
      mapRef.current?.invalidateSize()
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

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

  function handleLocate() {
    if (!navigator.geolocation) {
      setError(t('map_picker.location_not_supported'))
      return
    }
    setLocating(true)
    setError("")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const map = mapRef.current
        if (map) {
          map.flyTo([latitude, longitude], 17, { duration: 1 })
        }
        const marker = markerRef.current
        if (marker) {
          marker.setLatLng([latitude, longitude])
        }
        setLocating(false)
      },
      () => {
        setError(t('map_picker.location_error'))
        setLocating(false)
      },
      { enableHighAccuracy: true },
    )
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4">
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
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">
            {t('map_picker.title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>

        <div className="relative">
          <div ref={containerRef} className="w-full h-[55dvh]" />

          {error && (
            <div className="absolute top-3 left-3 right-3 z-[1001] flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-sm font-medium text-red-700">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto p-0.5 hover:bg-red-100 rounded-md transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleLocate}
            disabled={locating}
            className="absolute bottom-4 right-4 z-[1000] w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
            title={t('map_picker.my_location')}
          >
            <Navigation className={`w-4 h-4 text-blue-600 ${locating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 mr-auto">
            {t('map_picker.hint')}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {t('map_picker.select')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
