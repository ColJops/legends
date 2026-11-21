import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getRegionLabel } from "../../data/legendOptions";

const WIDTH = 620;
const HEIGHT = 560;
const PADDING = 22;
const LONGITUDE_SCALE = Math.cos((52 * Math.PI) / 180);

export default function PolandMap({ counts = {}, category = "", onSelectRegion, activeRegion = "" }) {
    const [features, setFeatures] = useState([]);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        let active = true;
        fetch("/data/poland-voivodeships.geojson")
            .then((response) => {
                if (!response.ok) throw new Error("Map data unavailable");
                return response.json();
            })
            .then((geojson) => {
                if (active) setFeatures(geojson.features || []);
            })
            .catch(() => {
                if (active) setLoadError(true);
            });
        return () => {
            active = false;
        };
    }, []);

    const mapShapes = useMemo(() => {
        if (!features.length) return [];
        const source = features.map((feature) => ({
            feature,
            key: normalizeRegion(feature.properties?.nazwa),
            rings: getOuterRings(feature.geometry),
        }));
        const points = source.flatMap(({ rings }) => rings.flat());
        const bounds = points.reduce(
            (result, [longitude, latitude]) => ({
                minLon: Math.min(result.minLon, longitude),
                maxLon: Math.max(result.maxLon, longitude),
                minLat: Math.min(result.minLat, latitude),
                maxLat: Math.max(result.maxLat, latitude),
            }),
            { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity }
        );
        const projectedWidth = (bounds.maxLon - bounds.minLon) * LONGITUDE_SCALE;
        const projectedHeight = bounds.maxLat - bounds.minLat;
        const scale = Math.min(
            (WIDTH - PADDING * 2) / projectedWidth,
            (HEIGHT - PADDING * 2) / projectedHeight
        );
        const drawnWidth = projectedWidth * scale;
        const drawnHeight = projectedHeight * scale;
        const offsetX = (WIDTH - drawnWidth) / 2;
        const offsetY = (HEIGHT - drawnHeight) / 2;
        const project = ([longitude, latitude]) => [
            offsetX + (longitude - bounds.minLon) * LONGITUDE_SCALE * scale,
            offsetY + (bounds.maxLat - latitude) * scale,
        ];

        return source.map(({ key, rings }) => {
            const path = rings
                .map((ring) => ring.map(project))
                .map((ring) => ring.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + " Z")
                .join(" ");
            return {
                key,
                path,
                name: getRegionLabel(key),
                count: counts[key] || 0,
            };
        });
    }, [features, counts]);

    const maximum = Math.max(1, ...mapShapes.map((shape) => shape.count));

    if (loadError) {
        return (
            <div className="flex min-h-80 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-400">
                Nie udało się wczytać mapy. Lista województw pozostaje dostępna obok.
            </div>
        );
    }

    return (
        <div className="map-grid-bg relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 p-3 sm:p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(124,58,237,0.14),transparent_65%)]" />
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                role="img"
                aria-label="Interaktywna mapa województw Polski; wybierz województwo, aby zobaczyć legendy"
                className="relative mx-auto block max-h-[650px] w-full max-w-[680px]"
            >
                <defs>
                    <filter id="region-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.32" />
                    </filter>
                </defs>
                {!mapShapes.length && (
                    <text x="50%" y="50%" fill="#a1a1aa" textAnchor="middle">Wczytywanie mapy…</text>
                )}
                {mapShapes.map((shape) => {
                    const intensity = shape.count ? 0.2 + (shape.count / maximum) * 0.68 : 0.08;
                    const selected = shape.key === activeRegion;
                    return (
                        <Link
                            key={shape.key}
                            to={`/region/${shape.key}${category ? `?category=${category}` : ""}`}
                            onClick={(event) => {
                                if (onSelectRegion) {
                                    event.preventDefault();
                                    onSelectRegion(shape.key);
                                }
                            }}
                            aria-label={`${shape.name}: ${shape.count} ${shape.count === 1 ? "legenda" : "legend"}`}
                            className="outline-none"
                        >
                            <path
                                d={shape.path}
                                fill={shape.count ? `rgba(139, 92, 246, ${intensity})` : "rgba(63, 63, 70, 0.35)"}
                                stroke={selected ? "#f5d0fe" : "#a78bfa"}
                                strokeWidth={selected ? 2.5 : 1.35}
                                vectorEffect="non-scaling-stroke"
                                filter={selected ? "url(#region-shadow)" : undefined}
                                className="cursor-pointer transition-[fill,stroke] duration-200 hover:fill-violet-400/70 focus:fill-violet-400/70"
                            >
                                <title>{`${shape.name}: ${shape.count} legend`}</title>
                            </path>
                        </Link>
                    );
                })}
            </svg>
            <div className="relative flex items-center justify-between px-2 pb-1 text-xs text-zinc-400">
                <span>Kolor pokazuje liczbę opublikowanych legend</span>
                <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-violet-500/30" /> mniej <i className="ml-2 h-2.5 w-2.5 rounded-sm bg-violet-400" /> więcej</span>
            </div>
        </div>
    );
}

function getOuterRings(geometry) {
    if (!geometry?.coordinates) return [];
    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    return polygons
        .map((polygon) => polygon?.[0])
        .filter((ring) => Array.isArray(ring) && ring.length > 2);
}

function normalizeRegion(value = "") {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
}
