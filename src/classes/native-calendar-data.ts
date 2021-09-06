import es from '../locale/locale-es'

import { FirstWeekDay, DateState, LocaleOptions, InstanceOptions } from '../types'

import { calcMonthDate, calcMonthTotalDays, calcWeekDayNum } from '../util/resolvers'

export default abstract class NativeCalendarData {
    protected firstDayOfWeek: FirstWeekDay

    protected locale: LocaleOptions

    protected calendarBaseDate: Date

    constructor(options?: InstanceOptions) {
        this.firstDayOfWeek = options?.firstWeekDay || 'monday'

        this.locale = options?.locale || es

        this.calendarBaseDate = new Date()
    }

    protected get coreState(): {
        current: DateState
        next: DateState
        prev: DateState
    } {
        return {
            current: this.generateDateState(this.calendarBaseDate),
            next: this.generateDateState(calcMonthDate(this.calendarBaseDate, true)),
            prev: this.generateDateState(calcMonthDate(this.calendarBaseDate, false)),
        }
    }

    protected generateDateState(date?: string | number | Date): DateState {
        const dateInit = date ? (date instanceof Date ? date : new Date(date)) : new Date()

        return {
            initialDate: dateInit,

            weekDay: calcWeekDayNum(this.firstDayOfWeek, dateInit.getDay()),

            monthDay: dateInit.getDate(),

            month: dateInit.getMonth() + 1,

            year: dateInit.getFullYear(),

            daysCount: calcMonthTotalDays(dateInit),

            firstDayToWeekDayNum: calcWeekDayNum(this.firstDayOfWeek, new Date(new Date(dateInit).setDate(1)).getDay()),

            lastDayToWeekDayNum: calcWeekDayNum(
                this.firstDayOfWeek,
                new Date(new Date(dateInit).setDate(calcMonthTotalDays(dateInit))).getDay()
            ),
        }
    }
}
