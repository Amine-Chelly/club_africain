"use client";

import { useRef, useState } from "react";

type PlayerOption = {
  id: string;
  name: string;
  teamName: string;
};

type Row = {
  id: string;
  playerId: string;
  count: string;
};

type Props = {
  title: string;
  helpText: string;
  playerLabel: string;
  countLabel: string;
  addLabel: string;
  removeLabel: string;
  emptyText: string;
  players: PlayerOption[];
  defaultRows?: Array<{ playerId: string; count: number }>;
};

function createRow(index: number, initial?: { playerId: string; count: number }): Row {
  return {
    id: `row-${index}`,
    playerId: initial?.playerId ?? "",
    count: initial ? String(initial.count) : "0",
  };
}

export function FixturePlayerStatsEditor({
  title,
  helpText,
  playerLabel,
  countLabel,
  addLabel,
  removeLabel,
  emptyText,
  players,
  defaultRows = [],
}: Props) {
  const nextRowIndex = useRef(defaultRows.length);
  const [rows, setRows] = useState<Row[]>(() =>
    defaultRows.length > 0 ? defaultRows.map((row, index) => createRow(index, row)) : [createRow(0)],
  );

  return (
    <section className="border-border bg-card rounded-2xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-foreground text-base font-semibold">{title}</h3>
          <p className="text-muted mt-1 text-xs leading-relaxed">{helpText}</p>
        </div>
        <button
          type="button"
          onClick={() =>
            setRows((current) => [...current, createRow(nextRowIndex.current++, undefined)])
          }
          className="border-border bg-background text-foreground hover:border-primary rounded-lg border px-3 py-2 text-sm font-medium"
        >
          {addLabel}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_auto] md:items-end">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">
                {playerLabel} {index + 1}
              </span>
              <select
                name="playerStatPlayerId"
                value={row.playerId}
                onChange={(event) =>
                  setRows((current) => current.map((item) => (item.id === row.id ? { ...item, playerId: event.target.value } : item)))
                }
                className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
              >
                <option value="">{emptyText}</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} - {player.teamName}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{countLabel}</span>
              <input
                name="playerStatCount"
                type="number"
                min={0}
                step={1}
                value={row.count}
                onChange={(event) =>
                  setRows((current) => current.map((item) => (item.id === row.id ? { ...item, count: event.target.value } : item)))
                }
                className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
              />
            </label>

            <button
              type="button"
              onClick={() =>
                setRows((current) => (current.length > 1 ? current.filter((item) => item.id !== row.id) : current))
              }
              className="text-primary rounded-md px-2 py-2 text-sm font-medium underline underline-offset-4"
            >
              {removeLabel}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
