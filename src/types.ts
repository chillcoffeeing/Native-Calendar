export type EventKey = 'onChange' | 'onSelect' | 'onEdit' | 'onCreated' | 'onMount' | 'onUnmount' | 'onContextChange'

export type UpdateMonthParam = number | boolean

export type FirstWeekDay = 'sunday' | 'monday'

export type ListenersMap = Map<EventKey, Set<HookCallback> | undefined>

export type HookCallback = (data?: DateState | DomState['currentSelected']) => void

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
    $navigationEl: HTMLDivElement
    $controlsEl: HTMLDivElement
    $prevMonthEl: HTMLButtonElement
    $nextMonthEl: HTMLButtonElement
    $inputYear: HTMLButtonElement
    $inputMonth: HTMLButtonElement
    $pickerBoxEl: HTMLDivElement
}

export type InputBoxBuilderObject = {
    $inputBox: HTMLDivElement
    $inputDate: HTMLInputElement
    $inputMonth: HTMLInputElement
    $inputYear: HTMLInputElement
    $dropdownToggle: HTMLButtonElement
}

export type InstanceOptions = {
    firstWeekDay?: FirstWeekDay
    locale?: LocaleOptions
    type?: DomState['currentPicker']
}

export type DateState = {
    initialDate: Date
    year: number
    month: number
    monthDay: number
    firstDayToWeekDayNum: number
    lastDayToWeekDayNum: number
    daysCount: number
}

export type DomState = {
    currentPicker: 'months' | 'years' | 'days' | 'time'
    picker: {
        date?: HTMLDivElement
        month?: HTMLDivElement
        time?: HTMLDivElement
        years?: HTMLDivElement
    }
    currentSelected: {
        date: Date
        hash: string
    }
}
