import es from '../locale/locale-es'

import { FirstWeekDay, DateState, LocaleOptions, InstanceOptions } from '../types'

import { calcMonthDate, calcMonthTotalDays, calcWeekDayNum } from '../util/resolvers'

export default abstract class NativeCalendarData {
    protected firstDayOfWeek: FirstWeekDay

    protected locale: LocaleOptions

    protected coreState: {
        current: DateState
        next: DateState
        prev: DateState
    }

    constructor(options?: InstanceOptions) {
        this.firstDayOfWeek = options?.firstWeekDay || 'sunday'

        this.locale = options?.locale || es

        this.coreState = {
            current: this.generateDateState(),
            next: this.generateDateState(calcMonthDate(new Date(), true)),
            prev: this.generateDateState(calcMonthDate(new Date(), false))
        }
    }

    set updateCoreState(date: Date) {
        this.coreState = {
            current: this.generateDateState(date),
            next: this.generateDateState(calcMonthDate(date, true)),
            prev: this.generateDateState(calcMonthDate(date, false))
        }
    }

    protected generateDateState(date?: string | number | Date): DateState {
        const dateInit = date ? new Date(date) : new Date()

        const firstDay = new Date(new Date(dateInit).setDate(1))

        const lastDay = new Date(new Date(dateInit).setDate(calcMonthTotalDays(dateInit)))

        return {
            initialDate: dateInit,

            monthDay: dateInit.getDate(),

            month: dateInit.getMonth(),

            year: dateInit.getFullYear(),

            daysCount: calcMonthTotalDays(dateInit),

            firstDayToWeekDayNum: calcWeekDayNum(this.firstDayOfWeek, firstDay.getDay()),

            lastDayToWeekDayNum: calcWeekDayNum(this.firstDayOfWeek, lastDay.getDay())
        }
    }
}
