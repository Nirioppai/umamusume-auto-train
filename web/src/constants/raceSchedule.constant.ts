/**
 * Race Schedule utility — the single middleman between the stored import
 * format and the RaceScheduleType consumed by the config / Python bot.
 *
 * Stored format  (constants/races/*.json):
 *   { raceName, grade, year, turn, position }
 *
 * Consumed format (config.race_schedule / RaceScheduleType):
 *   { name, year, date }
 *
 * All format conversions live here so nothing else needs to change when
 * the stored format evolves.
 */

import type { RaceScheduleType } from "@/types/race.type";

// ── Types ────────────────────────────────────────────────────────────────────

/** Shape of each entry in a stored race schedule file. */
export type RaceImportEntry = {
  raceName: string;
  grade: string;
  year: string;
  /** MM_PP — month (01-12) + period (01 = Early, 02 = Late) */
  turn: string;
  position: number;
};

// ── Internal helpers ─────────────────────────────────────────────────────────

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

type Month = typeof MONTHS[number];

/**
 * Normalize year labels from alternate naming conventions to the canonical
 * names expected by the bot ("Junior Year" / "Classic Year" / "Senior Year").
 * Add more aliases here if other export tools use different names.
 */
const YEAR_ALIASES: Record<string, string> = {
  "First Year":  "Junior Year",
  "Second Year": "Classic Year",
  "Third Year":  "Senior Year",
};

function normalizeYear(year: string): string {
  return YEAR_ALIASES[year] ?? year;
}

// ── Public converters ─────────────────────────────────────────────────────────

/**
 * Convert a turn string to a calendar date string.
 * @example turnToDate("11_02") → "Late Nov"
 * @example turnToDate("03_01") → "Early Mar"
 */
export function turnToDate(turn: string): string {
  const [monthStr, periodStr] = turn.split("_");
  const monthIndex = parseInt(monthStr, 10) - 1;
  const month: Month = MONTHS[monthIndex] ?? "Jan";
  const period = periodStr === "01" ? "Early" : "Late";
  return `${period} ${month}`;
}

/**
 * Convert a calendar date string back to a turn string.
 * @example dateToTurn("Late Nov") → "11_02"
 * @example dateToTurn("Early Mar") → "03_01"
 */
export function dateToTurn(date: string): string {
  const [period, month] = date.split(" ");
  const monthIndex = MONTHS.indexOf(month as Month);
  const monthNum = String(monthIndex + 1).padStart(2, "0");
  const periodNum = period === "Early" ? "01" : "02";
  return `${monthNum}_${periodNum}`;
}

// ── Parser (stored → consumed) ────────────────────────────────────────────────

/**
 * Parse a raw schedule file into RaceScheduleType[] for use in config.
 * This is the only place that knows about the stored import format.
 * `grade` and `position` fields are informational and dropped here.
 */
export function parseRaceSchedule(entries: RaceImportEntry[]): RaceScheduleType[] {
  return entries.map((entry) => ({
    name: entry.raceName,
    year: normalizeYear(entry.year),
    date: turnToDate(entry.turn),
  }));
}

// ── Serialiser (consumed → stored) ───────────────────────────────────────────

/**
 * Convert a RaceScheduleType[] (from the current config) back to the stored
 * import format so a UI-built schedule can be saved as a reusable file.
 * `grade` defaults to "" and `position` to 1 — they are not used by the parser.
 */
export function toExportFormat(races: RaceScheduleType[]): RaceImportEntry[] {
  return races.map((race) => ({
    raceName: race.name,
    grade: "",
    year: race.year,
    turn: dateToTurn(race.date),
    position: 1,
  }));
}
