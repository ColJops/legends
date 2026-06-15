import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { getCategoryLabel, getRegionLabel } from "../data/legendOptions";

export default function StatsCharts({ stats }) {
    if (!stats) return null;

    const categoryData = Object.entries(stats.byCategory || {}).map(
        ([category, count]) => ({
            name: getCategoryLabel(category),
            count,
        })
    );

    const regionData = Object.entries(stats.byRegion || {}).map(
        ([region, count]) => ({
            name: getRegionLabel(region),
            count,
        })
    );

    return (
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
                <h2 className="mb-4 text-xl font-bold">
                    Legendy według kategorii
                </h2>

                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                            <XAxis
                                dataKey="name"
                                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                            />
                            <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#18181b",
                                    border: "1px solid #3f3f46",
                                    borderRadius: "12px",
                                    color: "#fff",
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#4f46e5"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
                <h2 className="mb-4 text-xl font-bold">
                    Legendy według regionów
                </h2>

                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionData}>
                            <XAxis
                                dataKey="name"
                                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                                interval={0}
                                angle={-25}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#18181b",
                                    border: "1px solid #3f3f46",
                                    borderRadius: "12px",
                                    color: "#fff",
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#7c3aed"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}