'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Newspaper,
  Clock,
  Radio,
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

function displayTime(value?: string | number) {
  if (!value) return '';

  if (typeof value === 'number') {
    const ms = value > 10_000_000_000 ? value : value * 1000;
    return new Date(ms).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) {
    return new Date(parsed).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return String(value);
}

function getAlertColor(severity?: string) {
  return RISK_COLORS[String(severity || '').toUpperCase()] || RISK_COLORS.LOW;
}

export default function LiveAlerts({ data, onLocate, onWatchFeed }: LiveAlertsProps) {
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState<'all' | 'news' | 'quakes' | 'feeds'>('all');

  const alerts = buildLiveAlertRecords(data, { includeFeeds: true, quakeLimit: 5 });

  const filtered =
    filter === 'all'
      ? alerts
      : filter === 'news'
        ? alerts.filter((a) => a.type === 'news')
        : filter === 'quakes'
          ? alerts.filter((a) => a.type === 'quake')
          : alerts.filter((a) => a.type === 'feed');

  const getIcon = (type: string) => {
    switch (type) {
      case 'news':
        return Newspaper;
      case 'quake':
        return AlertTriangle;
      case 'feed':
        return Radio;
      default:
        return Newspaper;
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
          <span className="hud-text text-[10px] text-[var(--text-primary)]">
            LIVE ALERTS
          </span>
          <span
            className="gotham-tag gotham-tag--high"
            style={{ fontSize: '7px', padding: '1px 5px' }}
          >
            {alerts.filter((a) => a.type === 'news' || a.type === 'quake').length}
          </span>
          <span
            className="gotham-tag gotham-tag--info"
            style={{ fontSize: '7px', padding: '1px 4px' }}
          >
            {BUILTIN_FEEDS.length} FEEDS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF4081] animate-osiris-pulse" />
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-1 border-y border-[var(--border-primary)]/35 bg-black/20 px-2 py-1.5">
              {(['all', 'news', 'quakes', 'feeds'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em] transition-colors ${
                    filter === item
                      ? 'bg-[#FF4081]/20 text-[#FF4081]'
                      : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="max-h-[420px] overflow-y-auto styled-scrollbar">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    No alerts for this filter
                  </p>
                </div>
              ) : (
                filtered.map((alert, index) => {
                  const Icon = getIcon(alert.type);
                  const color = getAlertColor(alert.severity);
                  const isFeed = alert.type === 'feed';
                  const time = displayTime(alert.time);
                  const sourceUrl = alert.url || alert.feedUrl;

                  return (
                    <motion.div
                      key={`${alert.type}-${alert.title}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.015, 0.2) }}
                      className="group border-b border-[var(--border-primary)]/25 px-3 py-2.5 hover:bg-white/[0.035] transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border"
                          style={{
                            borderColor: `${color}55`,
                            backgroundColor: `${color}12`,
                            color,
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="line-clamp-2 text-[11px] font-semibold leading-snug text-[var(--text-heading)]">
                              {alert.title}
                            </h4>
                            <span
                              className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.14em]"
                              style={{
                                borderColor: `${color}45`,
                                color,
                              }}
                            >
                              {alert.severity || alert.type}
                            </span>
                          </div>

                          {alert.description && (
                            <p className="mt-1 line-clamp-3 text-[9px] leading-relaxed text-[var(--text-muted)]">
                              {alert.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            {alert.source && (
                              <span className="truncate">{alert.source}</span>
                            )}

                            {time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {time}
                              </span>
                            )}

                            {Number.isFinite(alert.lat) && Number.isFinite(alert.lng) && (
                              <button
                                onClick={() => onLocate(Number(alert.lat), Number(alert.lng))}
                                className="flex items-center gap-1 text-[var(--cyan-primary)] hover:text-[var(--text-heading)]"
                              >
                                <MapPin className="h-2.5 w-2.5" />
                                locate
                              </button>
                            )}

                            {isFeed && alert.feedUrl && onWatchFeed && (
                              <button
                                onClick={() => onWatchFeed(alert.feedUrl!, alert.title)}
                                className="flex items-center gap-1 text-[#FF4081] hover:text-[var(--text-heading)]"
                              >
                                <Radio className="h-2.5 w-2.5" />
                                watch
                              </button>
                            )}

                            {sourceUrl && !isFeed && (
                              <button
                                onClick={() =>
                                  window.open(sourceUrl, '_blank', 'noopener,noreferrer')
                                }
                                className="flex items-center gap-1 text-[var(--gold-primary)] hover:text-[var(--text-heading)]"
                              >
                                <ExternalLink className="h-2.5 w-2.5" />
                                source
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
