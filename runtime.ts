import type { SixtySecondsPluginRuntime } from "./shared";
import {
  getPluginRuntimeState,
  resetPluginRuntimeState,
  setPluginRuntimeState,
} from "../../src";

export interface SixtySecondsRuntimeState {
  runtime?: SixtySecondsPluginRuntime;
}

const PLUGIN_NAME = "60s";

export function setSixtySecondsRuntimeState(
  nextState: SixtySecondsRuntimeState,
): SixtySecondsRuntimeState {
  return setPluginRuntimeState<SixtySecondsRuntimeState>(PLUGIN_NAME, nextState);
}

export function getSixtySecondsRuntimeState(): SixtySecondsRuntimeState {
  return getPluginRuntimeState<SixtySecondsRuntimeState>(PLUGIN_NAME);
}

export function resetSixtySecondsRuntimeState(): void {
  resetPluginRuntimeState(PLUGIN_NAME);
}
