"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactApexChart from "react-apexcharts";

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

export default function Home() {
  const [activeRange, setActiveRange] = useState<keyof typeof DATA_FALLBACK>("daily");
  const [showToast, setShowToast] = useState(false);
  const [minLoading, setMinLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // React Query for fetching API data
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ["commodities", activeRange],
    queryFn: async () => {
      if (activeRange !== "monthly" && activeRange !== "yearly") {
        return null;
      }
      const resp = await fetch(`${backendUrl}/api/commodities?interval=monthly`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json();
    },
    enabled: activeRange === "monthly" || activeRange === "yearly",
  });

  // Determine active data based on filter
  const activeData = useMemo(() => {
    if (activeRange === "daily") {
      return DATA_FALLBACK[activeRange];
    }
    
    if (activeRange === "monthly" && apiData?.data) {
      return apiData.data;
    }
    
    if (activeRange === "yearly" && apiData?.data) {
      // Calculate yearly average from monthly data
      const monthlyData = apiData.data;
      if (monthlyData && monthlyData.values && monthlyData.values.length > 0) {
        // Group by year and calculate averages
        const yearlyGroups: { [key: string]: number[] } = {};
        const labels = monthlyData.labels || [];
        const values = monthlyData.values || [];
        
        labels.forEach((label: string, index: number) => {
          const year = label.substring(0, 4); // Extract year from label
          if (!yearlyGroups[year]) {
            yearlyGroups[year] = [];
          }
          yearlyGroups[year].push(values[index]);
        });
        
        // Calculate averages for each year
        const yearlyLabels = Object.keys(yearlyGroups).sort();
        const yearlyValues = yearlyLabels.map(year => {
          const yearValues = yearlyGroups[year];
          const avg = yearValues.reduce((sum, val) => sum + val, 0) / yearValues.length;
          return avg;
        });
        
        return {
          label: "Yearly",
          labels: yearlyLabels,
          values: yearlyValues,
        };
      }
    }
    
    // Return empty data while loading for monthly/yearly
    if (activeRange === "monthly" || activeRange === "yearly") {
      return { label: activeRange === "monthly" ? "Monthly" : "Yearly", labels: [], values: [] };
    }
    
    return DATA_FALLBACK[activeRange];
  }, [activeRange, apiData]);

  const users = useMemo(() => {
    if ((activeRange === "monthly" || activeRange === "yearly") && apiData?.users) {
      return apiData.users;
    }
    return TABLE_DATA;
  }, [activeRange, apiData]);

  const analytics = useMemo(() => {
    if ((activeRange === "monthly" || activeRange === "yearly") && apiData?.analytics) {
      return apiData.analytics;
    }
    return null;
  }, [activeRange, apiData]);

  // Show toast when filter changes
  useEffect(() => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    
    // Set minimum loading time for monthly/yearly
    if (activeRange === "monthly" || activeRange === "yearly") {
      setMinLoading(true);
      const timer = setTimeout(() => {
        setMinLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activeRange]);

  // ApexCharts configuration
  const chartOptions: any = useMemo(() => ({
    chart: {
      type: "area" as const,
      height: 260,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout" as const,
        speed: 800,
      },
    },
    series: [{
      name: "Value",
      data: activeData.values || [],
    }],
    xaxis: {
      categories: activeData.labels || [],
      labels: {
        style: {
          fontSize: "10px",
          fontWeight: 600,
          colors: "#5c759c",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "11px",
          fontWeight: 500,
          colors: "#5c759c",
        },
      },
    },
    colors: ["#00abc2"],
    fill: {
      type: "gradient" as const,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: "straight",
      width: 3,
    },
    grid: {
      row: {
        colors: ["transparent"],
        opacity: 0.5,
      },
      column: {
        colors: ["transparent"],
        opacity: 0.5,
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "light" as const,
      style: {
        fontSize: "12px",
      },
    },
  }), [activeData]);

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

        <div className="mt-4 flex items-center justify-between">
          <div className="text-black ml-[1rem] font-bold text-1xl">
            Dashboard
          </div>
          <button className="rounded-2xl bg-[#0075ff] px-6 py-2 text-lg font-bold text-white shadow-[0_10px_20px_rgba(0,117,255,0.18)]">
            Contact Us
          </button>
        </div>

        <section className="mt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#08131e]"></h1>
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

          <div className="mt-8 px-6 py-6">
            <div className="relative overflow-hidden rounded-[20px] border border-[#dbeafe] bg-white px-6 py-8">
              <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(180deg,rgba(2,214,255,0.1),transparent)]" />
              <div className="relative">
                {(isLoading || minLoading) && (activeRange === "monthly" || activeRange === "yearly") ? (
                  <div className="flex h-60 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0075ff] border-t-transparent"></div>
                      <span className="text-sm font-medium text-[#5c759c]">Loading data...</span>
                    </div>
                  </div>
                ) : (
                  <ReactApexChart
                    options={chartOptions}
                    series={chartOptions.series}
                    type="area"
                    height={260}
                  />
                )}
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
        <div className={`fixed top-4 right-4 z-50 rounded-lg px-6 py-4 text-white shadow-lg ${activeRange === "monthly" || activeRange === "yearly" ? "bg-[#027a48]" : "bg-[#0075ff]"}`}>
          <div className="flex items-center gap-3">
            {activeRange === "monthly" || activeRange === "yearly" ? (
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
                : activeRange === "yearly"
                ? "Yearly average from Alpha Vantage API data"
                : `Static data for ${activeRange} filter`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
