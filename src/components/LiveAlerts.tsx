'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, MapPin, ExternalLink, AlertTriangle,
  Newspaper, Clock, Radio,
} from 'lucide-react';
import { BUILTIN_FEEDS, buildLiveAlertRecords } from '@/lib/osiris-alerts';

interface LiveAlertsProps {
  data: any;
  onLocate: (lat: number, lng: number) => void;
  onWatchFeed?: (url: string, name: string) => void;
}

const RISK_COLORS: Record<string, string> = {
  HIGH: '#FF3D3D',
  CRITICAL: '#FF1744',
  ELEVATED: '#FF9500',
  MODERATE: '#FFD700',
  LOW: '#00E676',
};

export default function LiveAlerts({ data, onLocate, onWatchFeed }: LiveAlertsProps) {
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState<'all' | 'news' | 'quakes' | 'feeds'>('all');

  const alerts = buildLiveAlertRecords(data, { includeFeeds: true, quakeLimit: 5 });

  const filtered = filter === 'all' ? alerts :
    filter === 'news' ? alerts.filter(a => a.type === 'news') :
    filter === 'quakes' ? alerts.filter(a => a.type === 'quake') :
    alerts.filter(a => a.type === 'feed');

  const getIcon = (type: string) => {
    switch (type) {
      case 'news': return Newspaper;
      case 'quake': return AlertTriangle;
      case 'feed': return Radio;
      default: return Newspaper;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="glass-panel flex flex-col overflow-hidden pointer-events-auto"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-3 py-2 hover:bg-[var(--hover-accent)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#FF4081]" />
          <span className="hud-text text-[10px] text-[var(--text-primary)]">LIVE ALERTS</span>
          <span className="gotham-tag gotham-tag--high" style={{ fontSize: '7px', padding: '1px 5px' }}>{alerts.filter(a => a.type === 'news' || a.type === 'quake').length}</span>
          <span className="gotham-tag gotham-tag--info" style={{ fontSize: '7px', padding: '1px 4px' }}>{BUILTIN_FEEDS.length} FEEDS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF4081] animate-osiris-pulse" />
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
