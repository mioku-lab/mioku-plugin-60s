import type { SixtySecondsPluginRuntime } from "./utils/runtime-core";
import {
  getPluginRuntimeState,
  resetPluginRuntimeState,
  setPluginRuntimeState,
} from "mioku";

export interface SixtySecondsRuntimeState {
  runtime?: SixtySecondsPluginRuntime;
}

const PLUGIN_NAME = "60s";

export function setSixtySecondsRuntimeState(
  nextState: SixtySecondsRuntimeState,
): SixtySecondsRuntimeState {
  return setPluginRuntimeState(
    PLUGIN_NAME,
    nextState,
  );
}

export function getSixtySecondsRuntimeState(): SixtySecondsRuntimeState {
  return getPluginRuntimeState(PLUGIN_NAME);
}

export function resetSixtySecondsRuntimeState(): void {
  resetPluginRuntimeState(PLUGIN_NAME);
}
