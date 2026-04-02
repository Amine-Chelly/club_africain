"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

type AthleteItem = {
  id: string;
  name: string;
  teamName: string;
  sport: string;
  sportLabel: string;
  category: string;
  categoryLabel: string;
  sex: string;
  sexLabel: string;
  position: string;
  number: number | null;
  appearances: number;
  goals: number;
  singlesRanking: number | null;
  doublesRanking: number | null;
  ranking: number | null;
  imageSrc: string;
};

type AthletesFiltersLabels = {
  searchPlaceholder: string;
  searchLabel: string;
  categoryLabel: string;
  sportLabel: string;
  sexLabel: string;
  allCategories: string;
  allSports: string;
  allSexes: string;
  empty: string;
  ranking: string;
  singlesRanking: string;
  doublesRanking: string;
  apps: string;
  goals: string;
};

type Props = {
  athletes: AthleteItem[];
  labels: AthletesFiltersLabels;
};

export function AthletesDirectory({ athletes, labels }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sport, setSport] = useState("ALL");
  const [sex, setSex] = useState("ALL");

  const categoryOptions = useMemo(() => {
    const source = sport === "ALL" ? athletes : athletes.filter((item) => item.sport === sport);
    return Array.from(new Map(source.map((item) => [item.category, item.categoryLabel])).entries()).map(
      ([value, label]) => ({ value, label }),
    );
  }, [athletes, sport]);

  const sportOptions = useMemo(() => {
    const source = category === "ALL" ? athletes : athletes.filter((item) => item.category === category);
    return Array.from(new Map(source.map((item) => [item.sport, item.sportLabel])).entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [athletes, category]);

  const sportsByCategory = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const item of athletes) {
      const existing = map.get(item.category) ?? new Set<string>();
      existing.add(item.sport);
      map.set(item.category, existing);
    }
    return map;
  }, [athletes]);

  const categoriesBySport = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const item of athletes) {
      const existing = map.get(item.sport) ?? new Set<string>();
      existing.add(item.category);
      map.set(item.sport, existing);
    }
    return map;
  }, [athletes]);

  const sexOptions = useMemo(
    () => Array.from(new Map(athletes.map((item) => [item.sex, item.sexLabel])).entries()).map(([value, label]) => ({ value, label })),
    [athletes],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      athletes.filter((item) => {
        if (category !== "ALL" && item.category !== category) return false;
        if (sport !== "ALL" && item.sport !== sport) return false;
        if (sex !== "ALL" && item.sex !== sex) return false;

        if (!normalizedQuery) return true;

        const haystack = [item.name, item.teamName, item.sportLabel, item.categoryLabel, item.sexLabel].join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      }),
    [athletes, category, normalizedQuery, sex, sport],
  );

  return (
    <>
      <section className="border-border bg-card mt-8 grid gap-3 rounded-2xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{labels.searchLabel}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchLabel}
            className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{labels.categoryLabel}</span>
          <select
            value={category}
            onChange={(event) => {
              const nextCategory = event.target.value;
              setCategory(nextCategory);
              if (sport === "ALL" || nextCategory === "ALL") return;
              const validSports = sportsByCategory.get(nextCategory);
              if (!validSports?.has(sport)) {
                setSport("ALL");
              }
            }}
            aria-label={labels.categoryLabel}
            className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          >
            <option value="ALL">{labels.allCategories}</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{labels.sportLabel}</span>
          <select
            value={sport}
            onChange={(event) => {
              const nextSport = event.target.value;
              setSport(nextSport);
              if (category === "ALL" || nextSport === "ALL") return;
              const validCategories = categoriesBySport.get(nextSport);
              if (!validCategories?.has(category)) {
                setCategory("ALL");
              }
            }}
            aria-label={labels.sportLabel}
            className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          >
            <option value="ALL">{labels.allSports}</option>
            {sportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">{labels.sexLabel}</span>
          <select
            value={sex}
            onChange={(event) => setSex(event.target.value)}
            aria-label={labels.sexLabel}
            className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          >
            <option value="ALL">{labels.allSexes}</option>
            {sexOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((athlete) => (
          <li key={athlete.id}>
            <Link href={`/athletes/${athlete.id}`} className="border-border bg-card hover:border-primary/50 block rounded-2xl border p-4 transition-colors">
              <div className="flex items-start gap-3">
                <Image
                  src={athlete.imageSrc}
                  alt={athlete.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="text-foreground truncate font-semibold">{athlete.name}</p>
                  <p className="text-muted mt-1 text-sm">
                    {athlete.sportLabel} - {athlete.teamName} - {athlete.categoryLabel}
                  </p>
                  <p className="text-muted mt-1 text-xs">
                    {athlete.sport === "TENNIS" ? "-" : athlete.position}
                    {athlete.number != null ? ` - #${athlete.number}` : ""}
                  </p>
                  <p className="text-muted mt-2 text-xs">
                    {athlete.appearances} {labels.apps} - {athlete.goals} {labels.goals}
                    {athlete.sport === "TENNIS"
                      ? ` - ${labels.singlesRanking} ${athlete.singlesRanking != null ? `#${athlete.singlesRanking}` : "-"} - ${labels.doublesRanking} ${athlete.doublesRanking != null ? `#${athlete.doublesRanking}` : "-"}`
                      : athlete.ranking != null
                        ? ` - ${labels.ranking} #${athlete.ranking}`
                        : ""}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && <p className="text-muted mt-8">{labels.empty}</p>}
    </>
  );
}
