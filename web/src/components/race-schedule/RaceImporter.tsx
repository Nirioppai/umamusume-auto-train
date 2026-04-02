'use client';
import { useState, useRef } from "react";
import { Upload, FolderOpen, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  parseRaceSchedule,
  toExportFormat,
  type RaceImportEntry,
} from "@/constants/raceSchedule.constant";
import type { RaceScheduleType } from "@/types/race.type";
import { useRaceSchedules } from "@/hooks/useRaceSchedules";

type Props = {
  currentRaceSchedule: RaceScheduleType[];
  onLoadSchedule: (races: RaceScheduleType[]) => void;
};

export default function RaceImporter({ currentRaceSchedule, onLoadSchedule }: Props) {
  const [pendingEntries, setPendingEntries] = useState<RaceImportEntry[] | null>(null);
  const [importName, setImportName] = useState("");
  const [saveName, setSaveName] = useState("");
  const [showSaveCurrent, setShowSaveCurrent] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scheduleNames, fetchSchedule, saveSchedule, deleteSchedule } = useRaceSchedules();

  // ── File import ────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string) as unknown;
        if (!Array.isArray(json)) throw new Error("Expected a JSON array");
        setPendingEntries(json as RaceImportEntry[]);
        setImportName(file.name.replace(/\.json$/i, ""));
      } catch {
        setError("Invalid file — expected a JSON array of race entries.");
        setPendingEntries(null);
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported if needed
    e.target.value = "";
  };

  const handleSaveImport = async () => {
    if (!pendingEntries || !importName.trim()) return;
    setError("");
    try {
      await saveSchedule(importName.trim(), pendingEntries);
      setPendingEntries(null);
      setImportName("");
    } catch {
      setError("Failed to save schedule.");
    }
  };

  // ── Save current config schedule ───────────────────────────────────────────

  const handleSaveCurrent = async () => {
    if (!saveName.trim() || currentRaceSchedule.length === 0) return;
    setError("");
    try {
      await saveSchedule(saveName.trim(), toExportFormat(currentRaceSchedule));
      setSaveName("");
      setShowSaveCurrent(false);
    } catch {
      setError("Failed to save current schedule.");
    }
  };

  // ── Load saved schedule into config ───────────────────────────────────────

  const handleLoad = async (name: string) => {
    setError("");
    try {
      const entries = await fetchSchedule(name);
      onLoadSchedule(parseRaceSchedule(entries));
    } catch {
      setError(`Failed to load "${name}".`);
    }
  };

  // ── Delete saved schedule ─────────────────────────────────────────────────

  const handleDelete = async (name: string) => {
    setError("");
    try {
      await deleteSchedule(name);
    } catch {
      setError(`Failed to delete "${name}".`);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mt-4 border border-border rounded-xl p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Saved Schedules
        </h3>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} className="mr-1.5" />
            Import JSON
          </Button>
          {currentRaceSchedule.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowSaveCurrent((v) => !v);
                setSaveName("");
              }}
            >
              <Save size={14} className="mr-1.5" />
              Save Current
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Pending import row */}
      {pendingEntries && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
          <span className="text-sm text-muted-foreground shrink-0">
            {pendingEntries.length} races —
          </span>
          <Input
            autoFocus
            className="h-7 text-sm flex-1"
            placeholder="Schedule name..."
            value={importName}
            onChange={(e) => setImportName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleSaveImport(); }}
          />
          <Button
            size="sm"
            className="h-7 shrink-0"
            disabled={!importName.trim()}
            onClick={handleSaveImport}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0"
            onClick={() => { setPendingEntries(null); setImportName(""); }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Save current row */}
      {showSaveCurrent && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
          <span className="text-sm text-muted-foreground shrink-0">
            {currentRaceSchedule.length} races —
          </span>
          <Input
            autoFocus
            className="h-7 text-sm flex-1"
            placeholder="Schedule name..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleSaveCurrent(); }}
          />
          <Button
            size="sm"
            className="h-7 shrink-0"
            disabled={!saveName.trim()}
            onClick={handleSaveCurrent}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0"
            onClick={() => { setShowSaveCurrent(false); setSaveName(""); }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Schedule list */}
      {scheduleNames.length > 0 ? (
        <div className="space-y-1.5">
          {scheduleNames.map((name) => (
            <div
              key={name}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-border bg-muted/10"
            >
              <span className="text-sm font-medium truncate">{name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => void handleLoad(name)}
                >
                  <FolderOpen size={12} className="mr-1" />
                  Load
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => void handleDelete(name)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !pendingEntries && (
          <p className="text-sm text-muted-foreground text-center py-3">
            No saved schedules. Import a JSON file or save the current schedule.
          </p>
        )
      )}
    </div>
  );
}
