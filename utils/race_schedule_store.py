import json
import re
from pathlib import Path

RACES_DIR = Path(__file__).resolve().parent.parent / "constants" / "races"


def _validate_name(name: str) -> str:
  """Strip and reject names with filesystem-dangerous characters."""
  name = name.strip()
  if not name:
    raise ValueError("Schedule name cannot be empty")
  # Reject characters invalid on Windows filesystems
  if re.search(r'[\\/:*?"<>|]', name):
    raise ValueError("Schedule name contains invalid characters (\\/:*?\"<>|)")
  return name


def _path(name: str) -> Path:
  """Return the resolved path and guard against directory traversal."""
  path = (RACES_DIR / f"{name}.json").resolve()
  if not path.is_relative_to(RACES_DIR.resolve()):
    raise ValueError("Invalid schedule name")
  return path


def list_race_schedules() -> list[str]:
  """Return sorted list of schedule names (filenames without extension)."""
  if not RACES_DIR.exists():
    return []
  return [f.stem for f in sorted(RACES_DIR.glob("*.json"))]


def load_race_schedule(name: str) -> list:
  """Load raw import-format entries from a named schedule file."""
  safe = _validate_name(name)
  path = _path(safe)
  if not path.exists():
    raise FileNotFoundError(f"Schedule '{name}' not found")
  try:
    with open(path, "r", encoding="utf-8") as f:
      return json.load(f)
  except (json.JSONDecodeError, OSError):
    return []


def save_race_schedule(name: str, entries: list):
  """Save raw import-format entries to a named schedule file (overwrites if exists)."""
  safe = _validate_name(name)
  RACES_DIR.mkdir(parents=True, exist_ok=True)
  with open(_path(safe), "w", encoding="utf-8") as f:
    json.dump(entries, f, indent=2, ensure_ascii=False)


def delete_race_schedule(name: str):
  """Delete a named schedule file."""
  safe = _validate_name(name)
  path = _path(safe)
  if not path.exists():
    raise FileNotFoundError(f"Schedule '{name}' not found")
  path.unlink()
