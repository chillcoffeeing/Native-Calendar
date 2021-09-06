import { FirstWeekDay, UpdateMonthParam } from '../types'

export const calcMonthDate = (date: Date, factor: UpdateMonthParam): Date => {
    let updatedDate: Date

    if (typeof factor === 'number') {
        updatedDate = new Date(new Date(date).setMonth(factor))
    } else {
        updatedDate = new Date(new Date(date).setMonth(date.getMonth() + (factor ? 1 : -1)))
    }

    return updatedDate
}

export const isLeapYear = (date: Date): boolean => {
    return new Date(new Date(date.getFullYear(), 1).setDate(29)).getMonth() === 1
}

export const calcWeekDayNum = (firstDayOfWeek: FirstWeekDay, jsDayNum: number): number => {
    return firstDayOfWeek === 'monday' ? (jsDayNum !== 6 ? (jsDayNum !== 0 ? jsDayNum - 1 : 6) : 5) : jsDayNum
}

export const calcMonthTotalDays = (date: Date): number => {
    const month = date.getMonth()

    return month === 1
        ? isLeapYear(date)
            ? 29
            : 28
        : month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11
        ? 31
        : 30
}
