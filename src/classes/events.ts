import {
  ListenersMap,
  EventKey,
  DateState,
  UIState,
  HookCallback
} from "../types";
export default abstract class NativeCalendarEvents {
  protected Listeners: ListenersMap = new Map()

  protected eventTrigger(
    event: EventKey,
    data: DateState | UIState["currentSelected"]
  ) {
    this.Listeners.get(event)?.forEach((callback) => callback(data));
  }

  public addListener(event: EventKey, callback: HookCallback | HookCallback[]) {
    let EVENT_CALLBACKS: Set<HookCallback> | undefined;

    const callbacks = this.Listeners.get(event);

    if (typeof callback === "function") {
      EVENT_CALLBACKS = callbacks
        ? callbacks.add(callback)
        : new Set<HookCallback>().add(callback);
    } else if (callback instanceof Array) {
      EVENT_CALLBACKS = callback.reduce(
        (set, callback) => set.add(callback),
        new Set<HookCallback>()
      );
    }

    this.Listeners.set(event, EVENT_CALLBACKS as Set<HookCallback>);
  }
}
