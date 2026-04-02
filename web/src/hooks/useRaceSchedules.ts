import { useState, useEffect, useCallback } from "react";
import type { RaceImportEntry } from "@/constants/raceSchedule.constant";

export function useRaceSchedules() {
  const [scheduleNames, setScheduleNames] = useState<string[]>([]);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/race-schedules");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setScheduleNames(Array.isArray(data?.schedules) ? data.schedules : []);
    } catch (err) {
      console.error("Failed to fetch race schedules:", err);
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  /** Fetch the raw import-format entries for a named schedule. */
  const fetchSchedule = useCallback(async (name: string): Promise<RaceImportEntry[]> => {
    const res = await fetch(`/race-schedules/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.entries as RaceImportEntry[];
  }, []);

  /** Save (create or overwrite) a schedule with raw import-format entries. */
  const saveSchedule = useCallback(async (name: string, entries: RaceImportEntry[]) => {
    const res = await fetch(`/race-schedules/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchList();
  }, [fetchList]);

  /** Delete a named schedule. */
  const deleteSchedule = useCallback(async (name: string) => {
    const res = await fetch(`/race-schedules/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setScheduleNames((prev) => prev.filter((n) => n !== name));
  }, []);

  return { scheduleNames, fetchSchedule, saveSchedule, deleteSchedule, refetch: fetchList };
}
