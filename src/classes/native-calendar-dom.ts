import {
    fieldsBoxBuilder,
    dropdownBuilder,
    datesBuilder,
    refreshActiveDate,
    monthsPicker,
    datePicker,
    refreshActiveMonth
} from '../util/builders'

import NativeCalendarData from './native-calendar-data'

import {
    ListenersMap,
    EventKey,
    DateState,
    DomState,
    HookCallback,
    InstanceOptions,
    DropdownBuilderObject,
    InputBoxBuilderObject
} from '../types'
import { calcMonthDate, parseHash } from '../util/resolvers'

export default class NativeCalendar extends NativeCalendarData {
    private Listeners: ListenersMap = new Map()

    private root: {
        $el: HTMLElement
        field: InputBoxBuilderObject
        dropdown: DropdownBuilderObject
    }

    private domState: DomState

    private fieldsState: {
        year: string | null
        month: string | null
        date: string | null
    } = {
        year: null,
        month: null,
        date: null
    }

    constructor(root: HTMLElement | string, options?: InstanceOptions) {
        super(options)

        this.domState = {
            currentPicker: 'days',
            picker: {},
            currentSelected: {
                date: this.coreState.current.initialDate,
                hash: `${this.coreState.current.year}/${this.coreState.current.month + 1}/${
                    this.coreState.current.monthDay
                }`
            }
        }

        const rootElm = typeof root === 'string' ? (document.querySelector(root) as HTMLElement) : root

        this.root = {
            $el: rootElm,
            field: fieldsBoxBuilder(),
            dropdown: dropdownBuilder({ ...this.coreState, dom: this.domState }, this.locale)
        }

        this.root.field.$inputDate.addEventListener('keydown', (e) => this.keyboardHandler(e))

        this.root.field.$inputMonth.addEventListener('keydown', (e) => this.keyboardHandler(e))

        this.root.field.$inputYear.addEventListener('keydown', (e) => this.keyboardHandler(e))

        this.root.field.$inputDate.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.root.field.$inputMonth.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.root.field.$inputYear.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.root.dropdown.$nextMonthEl.addEventListener(
            'click',
            () => (this.navigationHandler(true), this.refreshUI())
        )

        this.root.dropdown.$prevMonthEl.addEventListener(
            'click',
            () => (this.navigationHandler(false), this.refreshUI())
        )

        this.root.field.$dropdownToggle.addEventListener('click', () => this.toggleHandler())

        this.root.dropdown.$inputMonth.addEventListener('click', () => {
            if (this.domState.currentPicker !== 'months') {
                this.changePicker('months')
            }
        })

        this.root.dropdown.$pickerBoxEl.addEventListener('click', (e) => this.selectHandler(e))

        this.root.$el.appendChild(this.root.field.$inputBox)

        if (!options?.type) {
            this.domState.picker.date = datePicker(
                { ...this.coreState, dom: this.domState },
                this.locale,
                this.firstDayOfWeek
            )

            this.domState.picker.month = monthsPicker(this.locale, this.domState)

            this.root.dropdown.$pickerBoxEl.appendChild(this.domState.picker.date)
        }
    }

    private set updateFieldsState(values: { year?: string; date?: string; month?: string }) {
        if ((typeof values.year === 'string' && /^\d{1,4}$/.test(values.year)) || values.year === '') {
            this.fieldsState.year = values.year
            this.root.field.$inputYear.value = values.year
        }

        if (
            typeof values.month === 'string' &&
            ((Number(values.month) > 0 && Number(values.month) <= 12 && /^\d{1,2}$/.test(values.month)) ||
                values.month === '')
        ) {
            this.fieldsState.month = values.month
            this.root.field.$inputMonth.value = values.month
        }

        if (
            typeof values.date === 'string' &&
            ((Number(values.date) > 0 && Number(values.date) <= 31 && /^\d{1,2}$/.test(values.date)) ||
                values.date === '')
        ) {
            this.fieldsState.date = values.date
            this.root.field.$inputDate.value = values.date
        }

        const currentHash = parseHash(this.domState.currentSelected.hash)

        const newHash =
            (values.year || currentHash.data.year) +
            '/' +
            (values.month || currentHash.data.month) +
            '/' +
            (values.date || currentHash.data.date)

        if (/^\d{1,4}\/\d{1,2}\/\d{1,2}$/.test(newHash)) {
            this.domState.currentSelected.hash = newHash
        }
    }

    private refreshUI(): void {
        if (this.domState.currentPicker === 'days') {
            this.root.dropdown.$inputMonth.textContent = this.locale.months[this.coreState.current.month].large

            this.root.dropdown.$inputYear.textContent = this.coreState.current.year.toString()

            const dates = datesBuilder({ ...this.coreState, dom: this.domState })

            this.domState.picker.date?.lastChild?.replaceWith(dates)
        }
    }

    private toggleHandler(): void {
        if (this.root?.$el) {
            if (!this.root.$el.contains(this.root.dropdown.$el)) this.root.$el.appendChild(this.root.dropdown.$el)
            else this.root.$el.removeChild(this.root.dropdown.$el)
        }
    }

    private changePicker = (picker: DomState['currentPicker']) => {
        this.domState.currentPicker = picker
        if (picker === 'days') {
            this.root.dropdown.$pickerBoxEl.firstChild?.replaceWith(this.domState.picker.date as HTMLDivElement)
        } else if (picker === 'months') {
            this.root.dropdown.$pickerBoxEl.firstChild?.replaceWith(this.domState.picker.month as HTMLDivElement)
        }
    }

    private navigationHandler(factor: boolean): void {
        this.updateCoreState = factor
            ? new Date(this.coreState.next.initialDate)
            : new Date(this.coreState.prev.initialDate)

        this.eventTrigger('onChange', this.coreState.current)
    }

    private keyboardHandler(e: KeyboardEvent) {
        const { code, target } = e

        const ref = target as HTMLInputElement

        const field = (ref.dataset as DOMStringMap).type as 'year' | 'month' | 'date'

        let newValue: number | string = ''

        switch (code) {
            case 'Up':
            case 'ArrowUp':
                if (!ref.value) newValue = 1
                else newValue = Number(ref.value) + 1
                this.updateFieldsState = { [field]: newValue }
                break
            case 'Down':
            case 'ArrowDown':
                if (Number(ref.value) > 0) {
                    newValue = Number(ref.value) - 1
                    this.updateFieldsState = { [field]: newValue }
                }
                break
        }
    }

    private fieldsHandler(e: InputEvent): void {
        const { data, target } = e

        const ref = target as HTMLInputElement

        const field = (ref.dataset as DOMStringMap).type as 'year' | 'date' | 'month'

        const isMonth = field === 'month'

        const isDate = field === 'date'

        if (data && /^\d$/.test(data) && /(insertCompositionText|insertText)/.test(e.inputType)) {
            if (isMonth || isDate) {
                const maxValue = isDate ? 31 : 12

                const oldValue = this.fieldsState[field] || ''

                const possibleValue = oldValue + data

                const newValue =
                    Number(possibleValue) > maxValue
                        ? Number(oldValue + '0') < maxValue
                            ? maxValue.toString()
                            : data
                        : possibleValue

                this.updateFieldsState = {
                    [field]: newValue
                }
                if (isDate) {
                    this.updateCoreState = new Date(
                        new Date(this.coreState.current.initialDate).setDate(Number(newValue))
                    )
                } else {
                    this.updateCoreState = new Date(
                        new Date(this.coreState.current.initialDate).setMonth(Number(newValue) - 1)
                    )
                }
                if (newValue.length > 1 || Number(newValue + '0') > maxValue) {
                    isDate && this.root.field.$inputMonth.focus()
                    isMonth && this.root.field.$inputYear.focus()
                }
            } else if (field === 'year') {
                this.updateFieldsState = {
                    [field]: ref.value
                }
                this.updateCoreState = new Date(
                    new Date(this.coreState.current.initialDate).setFullYear(Number(ref.value))
                )
            }
            if (field === 'date') {
                refreshActiveDate(
                    this.root.dropdown.$pickerBoxEl.firstChild?.lastChild as HTMLUListElement,
                    this.domState
                )
            } else {
                this.refreshUI()
            }
        } else {
            this.updateFieldsState = { [field]: '' }
        }
    }

    private selectHandler(e: MouseEvent) {
        if (this.domState.currentPicker === 'days') {
            const target = e?.target as HTMLElement

            const info = !!target.dataset?.info && parseHash(target.dataset.info)

            if (info) {
                this.domState.currentSelected.hash = info.hash

                if (/next-date/.test(target.className)) this.navigationHandler(true)
                else if (/prev-date/.test(target.className)) this.navigationHandler(false)
                else refreshActiveDate(this.root.dropdown.$pickerBoxEl.lastChild as HTMLUListElement, this.domState)

                this.updateFieldsState = info.data

                this.toggleHandler()

                this.refreshUI()

                this.eventTrigger('onSelect', this.domState.currentSelected)
            }
        } else if (this.domState.currentPicker === 'months') {
            const target = e.target as HTMLElement

            const info = target.dataset?.info

            if (info) {
                this.updateCoreState = calcMonthDate(this.coreState.current.initialDate, Number(info))

                this.updateFieldsState = {
                    month: (Number(info) + 1).toString()
                }

                refreshActiveMonth(
                    this.domState.picker.month?.querySelector('.nc-month-list') as HTMLUListElement,
                    this.domState
                )

                this.changePicker('days')

                this.refreshUI()
            }
        }
    }

    private eventTrigger(event: EventKey, data: DateState | DomState['currentSelected']) {
        this.Listeners.get(event)?.forEach((callback) => callback(data))
    }

    public addListener(event: EventKey, callback: HookCallback | HookCallback[]): void {
        let EVENT_CALLBACKS: Set<HookCallback> | undefined

        const callbacks = this.Listeners.get(event)

        if (typeof callback === 'function')
            EVENT_CALLBACKS = callbacks ? callbacks.add(callback) : new Set<HookCallback>().add(callback)
        else if (callback instanceof Array)
            EVENT_CALLBACKS = callback.reduce((set, callback) => set.add(callback), new Set<HookCallback>())

        this.Listeners.set(event, EVENT_CALLBACKS)
    }
}
