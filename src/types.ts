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
    $navigationBoxEl: HTMLDivElement
    $pickerBoxEl: HTMLDivElement
}

export type DatepickerControlsBuilderObject = {
    $el: HTMLDivElement
    $prev: HTMLButtonElement
    $next: HTMLButtonElement
    $yearButton: HTMLButtonElement
    $monthButton: HTMLButtonElement
}

export type YearPickerControlsBuilderObject = {
    $el: HTMLDivElement
    $prev: HTMLButtonElement
    $next: HTMLButtonElement
    $close: HTMLButtonElement
}

export type MonthPickerControlsBuilderObject = {
    $el: HTMLDivElement
    $close: HTMLButtonElement
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
    currentPicker: 'months' | 'year' | 'days' | 'time'
    picker: {
        date?: {
            $el: HTMLDivElement
            $controls: DatepickerControlsBuilderObject
        }
        month?: {
            $el: HTMLDivElement
            $controls: MonthPickerControlsBuilderObject
        }
        time?: HTMLDivElement
        year?: {
            $el: HTMLDivElement
            $controls: YearPickerControlsBuilderObject
            initialYear: number
        }
    }
    currentSelected: {
        date: Date
        hash: string
    }
}
