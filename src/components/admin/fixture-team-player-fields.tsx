"use client";

import { useMemo, useState } from "react";
import { FixturePlayerStatsEditor } from "@/components/admin/fixture-player-stats-editor";

type TeamOption = {
  id: string;
  label: string;
  sport: string;
};

type PlayerOption = {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
};

type Props = {
  teamLabel: string;
  playerEditorTitle: string;
  playerEditorHelpText: string;
  playerLabel: string;
  countLabel: string;
  addLabel: string;
  removeLabel: string;
  emptyText: string;
  teams: TeamOption[];
  players: PlayerOption[];
  defaultTeamId?: string;
  defaultRows?: Array<{ playerId: string; count: number }>;
};

export function FixtureTeamPlayerFields({
  teamLabel,
  playerEditorTitle,
  playerEditorHelpText,
  playerLabel,
  countLabel,
  addLabel,
  removeLabel,
  emptyText,
  teams,
  players,
  defaultTeamId,
  defaultRows,
}: Props) {
  const initialTeamId = defaultTeamId ?? teams[0]?.id ?? "";
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId);

  const filteredPlayers = useMemo(
    () => players.filter((player) => player.teamId === selectedTeamId),
    [players, selectedTeamId],
  );
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        <span>{teamLabel}</span>
        <select
          name="teamId"
          required
          value={selectedTeamId}
          onChange={(event) => {
            setSelectedTeamId(event.target.value);
          }}
          className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.label}
            </option>
          ))}
        </select>
      </label>

      <FixturePlayerStatsEditor
          key={selectedTeamId}
          title={playerEditorTitle}
          helpText={playerEditorHelpText}
          playerLabel={playerLabel}
          countLabel={countLabel}
          addLabel={addLabel}
          removeLabel={removeLabel}
          emptyText={emptyText}
          players={filteredPlayers}
          defaultRows={defaultRows}
        />
    </>
  );
}
