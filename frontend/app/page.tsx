"use client";

import { useMemo, useState, useEffect } from "react";

const CHART_CONFIG = {
  yLabels: ["40 k", "30 k", "20 k", "10 k", "0 k", "-10 k", "-20 k", "-30 k", "-40 k"],
};

const CHART_WIDTH = 1120;
const CHART_HEIGHT = 236;

const DATA_FALLBACK = {
  daily: {
    label: "Daily",
    labels: [
      "Dec 1",
      "Dec 2",
      "Dec 3",
      "Dec 4",
      "Dec 5",
      "Dec 6",
      "Dec 7",
      "Dec 8",
      "Dec 9",
      "Dec 10",
      "Dec 11",
      "Dec 12",
      "Dec 13",
      "Dec 14",
      "Dec 15",
      "Dec 16",
      "Dec 17",
      "Dec 18",
      "Dec 19",
      "Dec 20",
      "Dec 21",
    ],
    values: [12, 28, 22, 30, 25, 18, 23, 19, 10, 16, 20, 12, 22, 18, 14, 30, 26, 20, 32, 24, 28],
  },
  monthly: {
    label: "Monthly",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [8, 14, 18, 23, 28, 24, 33, 29, 26, 32, 27, 30],
  },
  yearly: {
    label: "Yearly",
    labels: [
      "2001",
      "2002",
      "2003",
      "2004",
      "2005",
      "2006",
      "2007",
      "2008",
      "2009",
      "2010",
      "2011",
      "2012",
      "2013",
      "2014",
      "2015",
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
      "2021",
    ],
    values: [4, 10, 22, 16, 28, 10, 18, 14, 6, 20, 34, 26, 30, 24, 28, 22, 32, 36, 30, 34, 38],
  },
};

const NAV_ITEMS = ["Dashboard", "Products", "Services", "Contact Us"];

const TABLE_DATA = [
  {
    broker: "Zerodha (DU000004)",
    positions: "1",
    available: "₹ 1.54 Cr",
    deployed: "3",
    active: "1",
    status: "Active",
    pnl: "₹ 50.02 K",
  },
  {
    broker: "Angel One (MNBN1026)",
    positions: "2",
    available: "₹ 2.50 K",
    deployed: "2",
    active: "2",
    status: "Active",
    pnl: "₹ 60.02 K",
  },
  {
    broker: "Finvasia (FA189009)",
    positions: "0",
    available: "₹ 50.02 K",
    deployed: "0",
    active: "0",
    status: "Pending",
    pnl: "₹ 0.00",
  },
];

function buildPath(values: number[], width: number, height: number) {
  if (!values || values.length === 0) {
    return "";
  }
  const max = Math.max(...values, 40);
  const min = Math.min(...values, -40);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  const points = values.map((value, index) => {
    const x = index * step;
    const normalized = (value - min) / range;
    const y = height - normalized * height;
    return [x, y];
  });

  const path = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const lastPoint = points[points.length - 1];
  return `${path} L ${lastPoint[0].toFixed(2)} ${height.toFixed(2)} L 0 ${height.toFixed(2)} Z`;
}

export default function Home() {
  const [activeRange, setActiveRange] = useState<keyof typeof DATA_FALLBACK>("daily");
  const [activeData, setActiveData] = useState(DATA_FALLBACK.daily);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState(TABLE_DATA);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (activeRange === "monthly") {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setLoading(true);
        setError(null);
        try {
          const resp = await fetch(`${backendUrl}/api/commodities?interval=monthly`);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const payload = await resp.json();
          const data = payload?.data ?? DATA_FALLBACK[activeRange];
          const usersFromApi = payload?.users ?? TABLE_DATA;
          const analyticsFromApi = payload?.analytics ?? data?.analytics ?? null;
          if (mounted) {
            setActiveData(data);
            setUsers(usersFromApi as any);
            setAnalytics(analyticsFromApi);
          }
        } catch (err) {
          if (mounted) {
            setError(err instanceof Error ? err.message : String(err));
            setActiveData(DATA_FALLBACK[activeRange]);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        // Show toast for daily and yearly
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        // Reset to static data for daily and yearly
        if (mounted) {
          setActiveData(DATA_FALLBACK[activeRange]);
          setUsers(TABLE_DATA);
          setAnalytics(null);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [activeRange]);

  const svgPath = useMemo(() => buildPath(activeData.values, CHART_WIDTH, CHART_HEIGHT), [activeData]);

  return (
    <div className="min-h-screen bg-[#f4f8ff] text-[#08131e]">
      <div className="mx-auto max-w-360 px-6 py-6">
        <header className="flex h-12 items-center justify-between border-b border-[#dce7ff] bg-white px-6 shadow-sm shadow-slate-200/20">
          <div className="flex items-center gap-6 text-base font-semibold text-[#05070a]">
            <div>Logo</div>
          </div>
          <div className="ml-30">
            <nav className="flex items-center gap-8 text-sm font-medium text-[#05070a]">
              {NAV_ITEMS.map((item) => (
                <div key={item} className="cursor-pointer transition hover:text-[#0075ff]">
                  {item}
                </div>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dce7ff] bg-white text-[#1f2937] shadow-sm shadow-slate-200/50">
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#e00000]" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C10.343 22 9 20.657 9 19H15C15 20.657 13.657 22 12 22Z" fill="#1f2937" />
                <path d="M18 16H6V11C6 7.686 8.686 5 12 5C15.314 5 18 7.686 18 11V16Z" stroke="#1f2937" strokeWidth="2" />
              </svg>
            </button>
            <div className="h-11 w-11 rounded-full border border-[#dce7ff] bg-[#dbeafe] overflow-hidden">
              {/* Inline avatar SVG provided by user */}
              <svg width="44" height="44" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <circle cx="12.5" cy="12.5" r="12.5" fill="#D9D9D9"/>
              </svg>
          </div>
          </div>
        </header>

        {/* Contact Us button centered directly below navbar */}
        <div className="mt-4 flex justify-end">
          <button className="rounded-2xl bg-[#0075ff] px-8 py-2 text-lg font-bold text-white shadow-[0_10px_20px_rgba(0,117,255,0.18)]">
            Contact Us
          </button>
        </div>

        <section className="mt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#08131e]">Dashboard</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(DATA_FALLBACK) as Array<keyof typeof DATA_FALLBACK>).map((rangeKey) => {
                const key = rangeKey as keyof typeof DATA_FALLBACK;
                const active = key === activeRange;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveRange(key)}
                    className={`inline-flex min-w-[23.5] items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-[#0075ff] bg-[#0075ff] text-white shadow-[0_10px_20px_rgba(0,117,255,0.18)]"
                        : "border-[#dce7ff] bg-white text-[#0075ff] hover:border-[#0075ff]/80 hover:bg-[#eff6ff]"
                    }`}
                  >
                    {DATA_FALLBACK[key].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-[#0075ff] bg-white px-6 py-6">
            <div className="flex items-center justify-between pb-4">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5c759c]">{activeData.label} view</div>
              <div className="text-sm text-right">
                <div className="text-sm text-[#5c759c]">Last value</div>
                <div className="text-lg font-bold text-[#08131e]">{analytics ? String(analytics.last) : "—"}</div>
                <div className={`text-sm font-semibold ${analytics && analytics.pct_change >= 0 ? "text-[#027a48]" : "text-[#b47f0e]"}`}>
                  {analytics ? `${(analytics.pct_change * 100).toFixed(2)}%` : ""}
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[20px] border border-[#dbeafe] bg-[#f8fbff] px-6 py-8">
              <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(180deg,rgba(2,214,255,0.1),transparent)]" />
              <div className="relative">
                <div className="grid h-60 grid-cols-[max-content_1fr] gap-x-4">
                  <div className="flex flex-col justify-between pr-4 text-xs font-medium text-[#5c759c]">
                    {CHART_CONFIG.yLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className="relative h-60 overflow-hidden rounded-[18px] bg-white/80">
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,117,255,0.06)_1px,transparent_1px)] bg-size-[100%_40px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,117,255,0.08)_1px,transparent_1px)] bg-size-[80px_100%]" />
                    <svg viewBox="0 0 1120 236" className="relative h-full w-full">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00abc2" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#00abc2" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={svgPath} fill="url(#areaGradient)" stroke="#00abc2" strokeWidth="3" />
                    </svg>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5c759c]">
                      {activeData.labels?.map((label) => (
                        <span key={label} className="whitespace-nowrap">
                          {label}
                        </span>
                      ))}
                    </div>
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute left-[92%] top-[44%]">
                        <div className="h-4 w-4 rounded-full bg-[#00abc2] shadow-[0_0_0_8px_rgba(0,171,194,0.12)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f2937]">Users</h2>
              <div className="mt-4 overflow-hidden rounded-3xl border border-[#dbeafe] bg-[#f5f9ff] shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-[#18354d]">
                  <thead className="bg-white">
                    <tr>
                      <th className="whitespace-nowrap px-6 py-4 font-semibold">Broker</th>
                      <th className="px-6 py-4 font-semibold">No. of active positions</th>
                      <th className="px-6 py-4 font-semibold">Available Capital</th>
                      <th className="px-6 py-4 font-semibold">Total Deployed Strategies</th>
                      <th className="px-6 py-4 font-semibold">Active Strategies</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((row: any, index: number) => (
                      <tr key={row.broker} className={index % 2 === 1 ? "bg-[#eaf4ff]" : "bg-transparent"}>
                        <td className="px-6 py-4 font-medium text-[#102a43]">{row.broker}</td>
                        <td className="px-6 py-4">{row.positions}</td>
                        <td className="px-6 py-4">{row.available}</td>
                        <td className="px-6 py-4">{row.deployed}</td>
                        <td className="px-6 py-4">{row.active}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${row.status === "Active" ? "bg-[#def7ec] text-[#027a48]" : "bg-[#fff4d8] text-[#b47f0e]"}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#027a48] font-semibold">{typeof row.value === 'number' ? String(row.value) : row.pnl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showToast && (
        <div className={`fixed top-4 right-4 z-50 rounded-lg px-6 py-4 text-white shadow-lg ${activeRange === "monthly" ? "bg-[#027a48]" : "bg-[#0075ff]"}`}>
          <div className="flex items-center gap-3">
            {activeRange === "monthly" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="white"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 17H13V19H11V17ZM11 5H13V15H11V5Z" fill="white"/>
              </svg>
            )}
            <span className="font-semibold">
              {activeRange === "monthly" 
                ? "Alpha Vantage API data is shown on the dashboard value" 
                : `Static data for ${activeRange} filter`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
