export type EventKey = 'onChange' | 'onSelect' | 'onEdit' | 'onCreated' | 'onMount' | 'onUnmount' | 'onContextChange'

export type UpdateMonthParam = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | boolean

export type FirstWeekDay = 'sunday' | 'monday'

export type ListenersMap = Map<EventKey, Set<HookCallback> | undefined>

export type HookCallback = (data?: DateState | DOMState['currentSelected']) => void

export type LocaleOptions = {
    months: {
        short: string
        large: string
    }[]
    days: {
        short: string
        large: string
    }[]
}

export type DropdownBuilderObject = {
    $el: HTMLDivElement
    content: {
        navigation: {
            $el: HTMLDivElement
            content: {
                controls: {
                    $el: HTMLDivElement
                    content: {
                        prev: {
                            $el: HTMLButtonElement
                        }
                        yearButton: {
                            $el: HTMLButtonElement
                        }
                        monthButton: {
                            $el: HTMLButtonElement
                        }
                        next: {
                            $el: HTMLButtonElement
                        }
                    }
                }
                days: {
                    $el: HTMLDivElement
                }
            }
        }
        dates: {
            $el: HTMLDivElement
        }
    }
}

export type InputBoxBuilderObject = {
    $el: HTMLDivElement
    content: {
        date: {
            $el: HTMLInputElement
        }
        month: {
            $el: HTMLInputElement
        }
        year: {
            $el: HTMLInputElement
        }
        toggle: {
            $el: HTMLButtonElement
        }
    }
}

export interface InstanceOptions {
    firstWeekDay?: FirstWeekDay
    locale?: LocaleOptions
    type?: DOMState['currentPicker']
}

export interface DateState {
    initialDate: Date
    year: number
    month: number
    weekDay: number
    monthDay: number
    firstDayToWeekDayNum: number
    lastDayToWeekDayNum: number
    daysCount: number
}

export interface DOMState {
    currentPicker: 'months' | 'years' | 'days'
    currentSelected: {
        date: Date
        hash: string
    }
}
