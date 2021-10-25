import {
    fieldsBoxBuilder,
    dropdownBuilder,
    datesBuilder,
    datePicker,
    monthsPicker,
    yearPicker,
    refreshActiveDate,
    refreshActiveMonth /* 
    refreshActiveYear, */,
    datePickerControlsBuilder,
    refreshActiveYear,
    yearPickerControlsBuilder,
    monthPickerControlsBuilder
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
            dropdown: dropdownBuilder()
        }

        this.root.field.$inputDate.addEventListener('keydown', (e) => this.keyboardHandler(e))

        this.root.field.$inputMonth.addEventListener('keydown', (e) => this.keyboardHandler(e))

        this.root.field.$inputYear.addEventListener('keydown', (e) => this.keyboardHandler(e))

        this.root.field.$inputDate.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.root.field.$inputMonth.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.root.field.$inputYear.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.root.field.$dropdownToggle.addEventListener('click', () => this.toggleHandler())

        this.root.dropdown.$pickerBoxEl.addEventListener('click', (e) => this.selectHandler(e))

        this.root.$el.appendChild(this.root.field.$inputBox)

        if (!options?.type) {
            this.domState.picker.date = {
                $el: datePicker({ ...this.coreState, dom: this.domState }, this.locale, this.firstDayOfWeek),
                $controls: datePickerControlsBuilder({ ...this.coreState, dom: this.domState }, this.locale)
            }

            this.domState.picker.date?.$controls.$next.addEventListener(
                'click',
                () => (this.navigationHandler(true), this.refreshUI())
            )

            this.domState.picker.date?.$controls.$prev.addEventListener(
                'click',
                () => (this.navigationHandler(false), this.refreshUI())
            )

            this.domState.picker.date.$controls.$yearButton.addEventListener('click', () => {
                if (this.domState.currentPicker !== 'year') {
                    this.changePicker('year')
                }
            })

            this.domState.picker.date.$controls.$monthButton.addEventListener('click', () => {
                if (this.domState.currentPicker !== 'months') {
                    this.changePicker('months')
                }
            })

            this.domState.picker.month = {
                $el: monthsPicker(this.locale, this.domState),
                $controls: monthPickerControlsBuilder()
            }

            this.domState.picker.month.$controls.$close.addEventListener('click', () => this.changePicker('days'))

            this.domState.picker.year = {
                $el: yearPicker(this.coreState.current.year, this.domState),
                $controls: yearPickerControlsBuilder(this.coreState.current),
                initialYear: this.coreState.current.year
            }

            this.domState.picker.year.$controls.$next.addEventListener('click', () => this.yearRangeHandler(true))

            this.domState.picker.year.$controls.$prev.addEventListener('click', () => this.yearRangeHandler(false))

            this.domState.picker.year.$controls.$close.addEventListener('click', () => this.changePicker('days'))

            this.root.dropdown.$pickerBoxEl.appendChild(this.domState.picker.date.$el)

            this.root.dropdown.$navigationBoxEl.appendChild(this.domState.picker.date.$controls.$el)
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
            if (this.domState.picker.date)
                this.domState.picker.date.$controls.$monthButton.textContent =
                    this.locale.months[this.coreState.current.month].large

            if (this.domState.picker.date)
                this.domState.picker.date.$controls.$yearButton.textContent = this.coreState.current.year.toString()

            const dates = datesBuilder({ ...this.coreState, dom: this.domState })

            this.domState.picker.date?.$el.lastChild?.replaceWith(dates)
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
            this.root.dropdown.$pickerBoxEl.firstChild?.replaceWith(this.domState.picker.date?.$el as HTMLDivElement)

            this.root.dropdown.$navigationBoxEl.firstChild?.replaceWith(
                this.domState.picker.date?.$controls.$el as HTMLDivElement
            )
        } else if (picker === 'months') {
            this.root.dropdown.$pickerBoxEl.firstChild?.replaceWith(this.domState.picker.month?.$el as HTMLDivElement)
            this.root.dropdown.$navigationBoxEl.firstChild?.replaceWith(
                this.domState.picker.month?.$controls.$el as HTMLDivElement
            )
        } else if (picker === 'year') {
            this.root.dropdown.$pickerBoxEl.firstChild?.replaceWith(this.domState.picker.year?.$el as HTMLDivElement)

            this.root.dropdown.$navigationBoxEl.firstChild?.replaceWith(
                this.domState.picker.year?.$controls.$el as HTMLDivElement
            )
        }

        this.domState.currentPicker = picker
    }

    private navigationHandler(factor: boolean): void {
        this.updateCoreState = factor
            ? new Date(this.coreState.next.initialDate)
            : new Date(this.coreState.prev.initialDate)

        this.eventTrigger('onChange', this.coreState.current)
    }

    private yearRangeHandler(after: boolean): void {
        if (this.domState.picker.year) {
            this.domState.picker.year.initialYear = this.domState.picker.year.initialYear + (after ? +16 : -16)

            const newPicker = yearPicker(this.domState.picker.year.initialYear, this.domState)

            this.domState.picker.year.$controls.$prev.textContent =
                (this.domState.picker.year.initialYear - 16).toString() +
                ' - ' +
                (this.domState.picker.year.initialYear - 1).toString()

            this.domState.picker.year.$controls.$next.textContent =
                (this.domState.picker.year.initialYear + 16).toString() +
                ' - ' +
                (this.domState.picker.year.initialYear + 31).toString()

            this.root.dropdown.$pickerBoxEl.firstChild?.replaceWith(newPicker)
        }
    }

    private keyboardHandler(e: KeyboardEvent) {
        const { code, target } = e

        const ref = target as HTMLInputElement

        const field = (ref.dataset as DOMStringMap).type as 'year' | 'month' | 'date'

        if (/(ArrowUp|Up|Down|ArrowDown)/.test(code)) {
            const updating = {
                value: '',
                update: false,
                set setValue(value: string) {
                    this.value = value
                    this.update = true
                }
            }

            e.preventDefault()

            switch (code) {
                case 'Up':
                case 'ArrowUp':
                    updating.setValue = (!ref.value ? 1 : Number(ref.value) + 1).toString()
                    this.updateFieldsState = { [field]: updating.value }
                    break
                case 'Down':
                case 'ArrowDown':
                    updating.setValue = Number(ref.value) > 1 ? (Number(ref.value) - 1).toString() : ''
                    this.updateFieldsState = { [field]: updating.value }
                    break
            }

            if (updating.update) this.refreshUI()
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

                this.updateFieldsState = { [field]: newValue }

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
                this.updateFieldsState = { [field]: ref.value }

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
        const target = e?.target as HTMLElement

        const info =
            this.domState.currentPicker === 'days'
                ? !!target.dataset?.info && parseHash(target.dataset.info)
                : target.dataset?.info

        if (this.domState.currentPicker === 'days') {
            if (info && typeof info !== 'string') {
                this.domState.currentSelected.hash = info.hash

                if (/next-date/.test(target.className)) this.navigationHandler(true), this.refreshUI()
                else if (/prev-date/.test(target.className)) this.navigationHandler(false), this.refreshUI()
                else
                    refreshActiveDate(
                        this.root.dropdown.$pickerBoxEl.firstChild?.lastChild as HTMLUListElement,
                        this.domState
                    )

                this.updateFieldsState = info.data

                this.toggleHandler()

                this.eventTrigger('onSelect', this.domState.currentSelected)
            }
        } else if (this.domState.currentPicker === 'months') {
            const info = target.dataset?.info

            if (info) {
                this.updateCoreState = calcMonthDate(this.coreState.current.initialDate, Number(info))

                this.updateFieldsState = { month: (Number(info) + 1).toString() }

                refreshActiveMonth(
                    this.domState.picker.month?.$el?.querySelector('.nc-month-list') as HTMLUListElement,
                    this.domState
                )

                this.changePicker('days')

                this.refreshUI()
            }
        } else if (this.domState.currentPicker === 'year') {
            const info = target.dataset?.info

            if (info && this.domState.picker.year) {
                this.updateCoreState = new Date(new Date(this.coreState.current.initialDate).setFullYear(Number(info)))

                this.updateFieldsState = { year: Number(info).toString() }

                refreshActiveYear(
                    (this.root.dropdown.$pickerBoxEl.firstChild as HTMLDivElement).querySelector(
                        '.nc-year-list'
                    ) as HTMLUListElement,
                    this.domState
                )

                this.domState.picker.year.$el = this.root.dropdown.$pickerBoxEl.firstChild as HTMLDivElement

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
