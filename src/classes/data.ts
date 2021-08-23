import NativeCalendarEvents from "./events";

import es from "../locale/locale-es";

import {
  FirstWeekDay,
  DateState,
  LocaleOptions,
  InstanceOptions
} from "../types";

export default abstract class NativeCalendarData extends NativeCalendarEvents {
  protected firstDayOfWeek: FirstWeekDay;

  protected mainDateState: DateState;

  protected locale: LocaleOptions;

  constructor(options?: InstanceOptions) {
    super();

    this.firstDayOfWeek = options?.firstWeekDay || "monday";

    this.locale = options?.locale || es;

    this.mainDateState = this.generateDateState();
  }

  private resolveLeapYear(): Boolean {
    return (
      new Date(new Date(this.mainDateState.year).setMonth(1, 29)).getMonth() ===
      1
    );
  }

  private resolveWeekDayNum(nativeWeekDayNumber: number): number {
    return this.firstDayOfWeek === "monday"
      ? nativeWeekDayNumber !== 6
        ? nativeWeekDayNumber !== 0
          ? nativeWeekDayNumber - 1
          : 6
        : 5
      : nativeWeekDayNumber;
  }

  private resolveTotalDaysCount(month: number): number {
    return month === 1
      ? this.resolveLeapYear()
        ? 29
        : 28
      : month === 0 ||
        month === 2 ||
        month === 4 ||
        month === 6 ||
        month === 7 ||
        month === 9 ||
        month === 11
        ? 31
        : 30;
  }

  protected refreshDateState(updatedDate: string | number | Date): void {
    this.mainDateState = this.generateDateState(updatedDate);
  }

  protected generateDateState(date?: string | number | Date): DateState {
    const dateInit = date
      ? date instanceof Date
        ? date
        : new Date(date)
      : new Date();

    return {
      initialDate: dateInit,

      weekDay: this.resolveWeekDayNum(dateInit.getDay()),

      monthDay: dateInit.getDate(),

      month: dateInit.getMonth(),

      year: dateInit.getFullYear(),

      daysCount: this.resolveTotalDaysCount(dateInit.getMonth()),

      firstDayToWeek: this.resolveWeekDayNum(
        new Date(new Date(dateInit).setDate(1)).getDay()
      ),

      lastDayToWeek: this.resolveWeekDayNum(
        new Date(
          new Date(dateInit).setDate(
            this.resolveTotalDaysCount(dateInit.getMonth())
          )
        ).getDay()
      ),
    };
  }
}
