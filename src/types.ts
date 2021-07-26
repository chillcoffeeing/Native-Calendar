export type EventKey = "onChange" | "onSelect";

export type UpdateMonthParam =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | boolean;

export type FirstWeekDay = "sunday" | "monday";

export type ListenersMap = Map<EventKey, Set<HookCallback>>;

export type HookCallback = (
  data?: DateState | UIState["currentSelected"]
) => void;

export type LocaleOptions = {
  months: {
    short: string,
    large: string
  }[]
  days: {
    short: string,
    large: string
  }[]
}

export type BuilderObject = {
  $controls: UIControls
  $datesContainer: HTMLDivElement
}

export interface InstanceOptions {
  firstWeekDay?: FirstWeekDay;
  locale?: LocaleOptions;
}

export interface DateState {
  initialDate: Date;
  year: number;
  month: number;
  weekDay: number;
  monthDay: number;
  firstDayToWeek: number;
  lastDayToWeek: number;
  daysCount: number;
}

export interface UIState {
  currentSelected: {
    date: Date;
    hash: string;
  };
  currentPicker: "months" | "years" | "days";
}

export interface UIControls {
  $prev: HTMLButtonElement;
  $yearButton: HTMLButtonElement;
  $monthButton: HTMLButtonElement;
  $editDateButton: HTMLButtonElement;
  $next: HTMLButtonElement;
}
