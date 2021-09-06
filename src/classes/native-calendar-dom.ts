import { inputBuilder, dropdownBuilder, datesCellsBuilder, refreshActiveCell } from '../util/builders'

import { calcMonthDate } from '../util/resolvers'

import NativeCalendarData from './native-calendar-data'

import {
    ListenersMap,
    EventKey,
    DateState,
    DOMState,
    HookCallback,
    InstanceOptions,
    UpdateMonthParam,
    DropdownBuilderObject,
    InputBoxBuilderObject,
} from '../types'

export default class NativeCalendar extends NativeCalendarData {
    private Listeners: ListenersMap = new Map()

    private root: {
        $el: HTMLElement
        content: {
            field: InputBoxBuilderObject
            dropdown: DropdownBuilderObject
        }
    }

    private DOMState: DOMState

    private fieldsState: {
        year: string | null
        month: string | null
        date: string | null
    } = {
        year: null,
        month: null,
        date: null,
    }

    constructor(root: HTMLElement | string, options?: InstanceOptions) {
        super(options)

        this.DOMState = {
            currentPicker: 'days',

            currentSelected: {
                date: this.coreState.current.initialDate,
                hash: `${this.coreState.current.year}/${this.coreState.current.month}/${this.coreState.current.monthDay}`,
            },
        }

        const rootElm = typeof root === 'string' ? (document.querySelector(root) as HTMLElement) : root

        this.root = {
            $el: rootElm,
            content: {
                field: inputBuilder(),
                dropdown: dropdownBuilder({ ...this.coreState, dom: this.DOMState }, this.locale),
            },
        }

        this.fields.$year.addEventListener('focus', function () {
            this.select()
        })

        this.fields.$month.addEventListener('focus', function () {
            this.select()
        })

        this.fields.$date.addEventListener('focus', function () {
            this.select()
        })

        this.fields.$date.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.fields.$month.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.fields.$year.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.fields.$date.addEventListener('keydown', (e: KeyboardEvent) => this.fieldsArrowsHandler(e))

        this.fields.$month.addEventListener('keydown', (e: KeyboardEvent) => this.fieldsArrowsHandler(e))

        this.fields.$year.addEventListener('keydown', (e: KeyboardEvent) => this.fieldsArrowsHandler(e))

        this.controls.$next.addEventListener('click', () => this.navigationHandler(true))

        this.controls.$prev.addEventListener('click', () => this.navigationHandler(false))

        this.controls.$toggle.addEventListener('click', () => this.toggleDropdown())

        this.datesContainer.addEventListener('click', (e) => this.selectHandler(e))

        this.root.$el.appendChild(this.root.content.field.$el)
    }

    private get controls() {
        return {
            $next: this.root.content.dropdown.content.navigation.content.controls.content.next.$el,
            $prev: this.root.content.dropdown.content.navigation.content.controls.content.prev.$el,
            $month: this.root.content.dropdown.content.navigation.content.controls.content.monthButton.$el,
            $year: this.root.content.dropdown.content.navigation.content.controls.content.yearButton.$el,
            $toggle: this.root.content.field.content.toggle.$el,
        }
    }

    private get fields() {
        return {
            $month: this.root.content.field.content.month.$el,
            $date: this.root.content.field.content.date.$el,
            $year: this.root.content.field.content.year.$el,
        }
    }

    private set updateFieldsState(state: { year?: string; date?: string; month?: string }) {
        if (state.year || state.month || state.date) {
            if (state.year) {
                this.fieldsState.year = state.year
                this.fields.$year.value = state.year
                this.calendarBaseDate = new Date(this.calendarBaseDate.setFullYear(Number(state.year)))
            }
            if (state.month && Number(state.month) > 0 && Number(state.month) <= 12) {
                this.fieldsState.month = state.month
                this.fields.$month.value = state.month
                this.calendarBaseDate = new Date(this.calendarBaseDate.setMonth(Number(state.month) - 1))
            }
            if (state.date && Number(state.date) > 0 && Number(state.date) <= 31) {
                this.fieldsState.date = state.date
                this.fields.$date.value = state.date
                this.calendarBaseDate = new Date(this.calendarBaseDate.setDate(Number(state.date)))
            }
            this.DOMState.currentSelected.hash =
                this.coreState.current.year.toString() +
                '/' +
                this.coreState.current.month.toString() +
                '/' +
                this.coreState.current.monthDay.toString()

            this.refreshUI()
        }
    }

    private get datesContainer() {
        return this.root.content.dropdown.content.dates.$el
    }

    private refreshUI(): void {
        if (this.DOMState.currentPicker === 'days') {
            this.controls.$month.textContent = this.locale.months[this.coreState.current.month - 1].large

            this.controls.$year.textContent = this.coreState.current.year.toString()

            this.datesContainer.firstChild?.replaceWith(datesCellsBuilder({ ...this.coreState, dom: this.DOMState }))
        }
    }

    private toggleDropdown(): void {
        if (this.root?.$el) {
            if (!this.root.$el.contains(this.root.content.dropdown.$el)) {
                this.root.$el.appendChild(this.root.content.dropdown.$el)
            } else {
                this.root.$el.removeChild(this.root.content.dropdown.$el)
            }
        }
    }

    private fieldsArrowsHandler(e: KeyboardEvent) {
        const { code } = e

        if (code === 'ArrowLeft') {
            e.preventDefault()
        }
    }

    private fieldsHandler(e: InputEvent): void {
        const { inputType, target } = e

        const ref = target as HTMLInputElement

        const field = (ref.dataset as DOMStringMap).type as 'year' | 'month' | 'date'

        if (inputType === 'insertText') {
            const isDate = field === 'date'

            const isMonth = field === 'month'

            const char = !!e.data?.trim() && Number(e.data.trim())

            if (typeof char === 'number' && !isNaN(char)) {
                if (ref.value.length === 1) {
                    this.updateFieldsState = {
                        [field]: (ref.defaultValue.length > 2 ? '000' : '0') + char.toString(),
                    }
                    if (isDate && Number(ref.value + '1') > 31) {
                        this.fields.$month.focus()
                    } else if (isMonth && Number(ref.value + '1') > 12) {
                        this.fields.$year.focus()
                    }
                } else {
                    if (ref.value.charAt(0) === '0') {
                        if (isDate || isMonth) {
                            const inputValue = Number(ref.value.slice(1))

                            const maxValue = Number(isDate ? '31' : '12')

                            this.updateFieldsState = {
                                [field]: inputValue < maxValue ? inputValue : maxValue,
                            }

                            if (isDate) this.fields.$month.select()

                            if (isMonth) this.fields.$year.select()
                        } else {
                            this.updateFieldsState = {
                                [field]: (ref.value.slice(1, ref.defaultValue.length) as string) + char,
                            }

                            this.fieldsState[field]?.charAt(0) !== '0' && ref.blur()
                        }
                    }
                }
            }
        } else {
            this.fieldsState[field] = null
        }
        if (this.fieldsState[field]) {
            ref.value = this.fieldsState[field] as string
        } else {
            ref.value = ref.defaultValue
            ref.select()
        }
    }

    private navigationHandler(factor: UpdateMonthParam): void {
        this.calendarBaseDate = calcMonthDate(this.coreState.current.initialDate, factor)

        this.refreshUI()

        this.eventTrigger('onChange', this.coreState.current)
    }

    private eventTrigger(event: EventKey, data: DateState | DOMState['currentSelected']) {
        this.Listeners.get(event)?.forEach((callback) => callback(data))
    }

    public addListener(event: EventKey, callback: HookCallback | HookCallback[]): void {
        let EVENT_CALLBACKS: Set<HookCallback> | undefined

        const callbacks = this.Listeners.get(event)

        if (typeof callback === 'function') {
            EVENT_CALLBACKS = callbacks ? callbacks.add(callback) : new Set<HookCallback>().add(callback)
        } else if (callback instanceof Array) {
            EVENT_CALLBACKS = callback.reduce((set, callback) => set.add(callback), new Set<HookCallback>())
        }

        this.Listeners.set(event, EVENT_CALLBACKS)
    }

    private selectHandler(e: Event | undefined) {
        const target = (e?.target && (e.target as HTMLElement)) || undefined

        if (target?.dataset?.info && /^\d{4}\/\d{1,2}\/\d{1,2}/.test(target.dataset.info)) {
            this.DOMState.currentSelected.hash = target.dataset.info

            const [year, month, date] = target.dataset.info.split('/')

            this.updateFieldsState = {
                year,
                month: month.length < 2 ? '0' + month : month,
                date: date.length < 2 ? '0' + date : date,
            }

            if (target.classList.contains('prev-date')) this.navigationHandler(false)
            else if (target.classList.contains('next-date')) this.navigationHandler(true)
            else refreshActiveCell(target.parentElement as HTMLUListElement, this.DOMState)

            this.eventTrigger('onSelect', this.DOMState.currentSelected)
        }
    }
}
