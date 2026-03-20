import json
from pathlib import Path

SCENARIOS_PATH = Path(__file__).resolve().parent.parent / "constants" / "scenarios.json"
AVAILABLE_SCENARIOS = ["mant", "unity", "ura"]

def _ensure_file():
  SCENARIOS_PATH.parent.mkdir(parents=True, exist_ok=True)
  if not SCENARIOS_PATH.exists():
    _write({"available": AVAILABLE_SCENARIOS, "selected": ""})

def _read() -> dict:
  _ensure_file()
  try:
    with open(SCENARIOS_PATH, "r") as f:
      return json.load(f)
  except (json.JSONDecodeError, OSError):
    return {}

def _write(data: dict):
  SCENARIOS_PATH.parent.mkdir(parents=True, exist_ok=True)
  with open(SCENARIOS_PATH, "w") as f:
    json.dump(data, f, indent=2)

def load_scenarios() -> dict:
  data = _read()
  return {
    "available": AVAILABLE_SCENARIOS,
    "selected": data.get("selected", ""),
  }

def load_selected_scenario() -> str:
  return _read().get("selected", "")

def save_selected_scenario(scenario: str):
  data = _read()
  data["selected"] = scenario
  _write(data)
