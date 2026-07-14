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
                <image width="44" height="44" preserveAspectRatio="none" xlinkHref="data:image/jpeg;base64,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.."/>
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
