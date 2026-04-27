"use client";

import { useState } from "react";

type Props = {
  sportLabel: string;
  typeLabel: string;
  tournamentCategoryLabel: string;
  tournamentTierLabel: string;
  noneLabel: string;
  sports: Array<{ value: string; label: string }>;
  types: Array<{ value: string; label: string }>;
  tennisCategories: Array<{ value: string; label: string }>;
  tournamentTiers: Array<{ value: string; label: string }>;
  defaultSport?: string;
  defaultType?: string;
  defaultTennisCategory?: string;
  defaultTournamentTier?: string;
};

export function MatchdayTypeFields({
  sportLabel,
  typeLabel,
  tournamentCategoryLabel,
  tournamentTierLabel,
  noneLabel,
  sports,
  types,
  tennisCategories,
  tournamentTiers,
  defaultSport = "",
  defaultType = "LEAGUE",
  defaultTennisCategory = "",
  defaultTournamentTier = "STANDARD",
}: Props) {
  const [sport, setSport] = useState(defaultSport);
  const [type, setType] = useState(defaultType);

  const isTournament = type === "TOURNAMENT";

  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        <span>{sportLabel}</span>
        <select
          name="sport"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          <option value="">{noneLabel}</option>
          {sports.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{typeLabel}</span>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          {types.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {isTournament ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>{tournamentCategoryLabel}</span>
            <select
              name="tennisCategory"
              defaultValue={defaultTennisCategory}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              <option value="">{noneLabel}</option>
              {tennisCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>{tournamentTierLabel}</span>
            <select
              name="tournamentTier"
              defaultValue={defaultTournamentTier}
              className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
            >
              {tournamentTiers.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </>
  );
}
