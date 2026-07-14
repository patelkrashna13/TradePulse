"use client";

import { useEffect, useMemo, useState } from "react";

type CommodityPoint = {
  name: string;
  date: string;
  value: string;
};

type CommodityPayload = {
  data?: CommodityPoint[];
};

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [data, setData] = useState<CommodityPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/commodities`);
        if (!response.ok) {
          throw new Error("Failed to load commodity data");
        }

        const payload: CommodityPayload = await response.json();
        const commodities = payload.data ?? [];
        setData(commodities);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const highestValue = useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => Number(b.value) - Number(a.value))[0];
  }, [data]);

  const chartPoints = useMemo(() => {
    if (!data.length) return [];

    const points = data.slice(0, 8).map((item) => Number(item.value) || 0);
    const maxValue = Math.max(...points, 1);
    const width = 320;
    const height = 180;
    const padding = 24;

    return points.map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      return { x, y, value };
    });
  }, [data]);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">TradeX</p>
          <h1 className="mt-2 text-3xl font-semibold">Commodity market overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            This page fetches commodity data from the FastAPI backend and renders it for the frontend chart experience.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Latest commodities</h2>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                {loading ? "Loading…" : `${data.length} records`}
              </span>
            </div>

            {loading ? (
              <p className="text-sm text-zinc-400">Fetching data from the API…</p>
            ) : error ? (
              <p className="text-sm text-rose-400">{error}</p>
            ) : (
              <>
                <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <svg viewBox="0 0 320 180" className="h-48 w-full">
                    <line x1="24" y1="156" x2="296" y2="156" stroke="#3f3f46" strokeWidth="1" />
                    <line x1="24" y1="24" x2="24" y2="156" stroke="#3f3f46" strokeWidth="1" />
                    <polyline
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="3"
                      points={chartPoints.map((point) => `${point.x},${point.y}`).join(" ")}
                    />
                    {chartPoints.map((point) => (
                      <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="4" fill="#67e8f9" />
                    ))}
                  </svg>
                </div>
                <div className="overflow-hidden rounded-xl border border-zinc-800">
                  <table className="min-w-full divide-y divide-zinc-800 text-sm">
                    <thead className="bg-zinc-800/70 text-left text-zinc-300">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                      {data.slice(0, 10).map((item, index) => (
                        <tr key={`${item.name}-${item.date}-${index}`} className="hover:bg-zinc-800/70">
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 text-zinc-400">{item.date}</td>
                          <td className="px-4 py-3 font-medium text-cyan-300">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
            <h2 className="text-xl font-semibold">Highlights</h2>
            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
                <p className="text-zinc-500">Backend status</p>
                <p className="mt-1 text-lg font-semibold text-emerald-400">Connected</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
