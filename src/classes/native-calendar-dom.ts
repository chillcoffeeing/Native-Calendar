import { inputBuilder, dropdownBuilder, datesCellsBuilder, refreshActiveCell } from '../util/builders'

import NativeCalendarData from './native-calendar-data'

import {
    ListenersMap,
    EventKey,
    DateState,
    DOMState,
    HookCallback,
    InstanceOptions,
    DropdownBuilderObject,
    InputBoxBuilderObject,
} from '../types'
import { parseHash } from '../util/resolvers'

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
                hash: `${this.coreState.current.year}/${this.coreState.current.month + 1}/${
                    this.coreState.current.monthDay
                }`,
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

        this.fields.$date.addEventListener('keydown', (e) => this.keyboardHandler(e))

        this.fields.$month.addEventListener('keydown', (e) => this.keyboardHandler(e))

        this.fields.$year.addEventListener('keydown', (e) => this.keyboardHandler(e))

        this.fields.$date.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.fields.$month.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.fields.$year.addEventListener('input', (e) => this.fieldsHandler(e as InputEvent))

        this.controls.$next.addEventListener('click', () => (this.navigationHandler(true), this.refreshUI()))

        this.controls.$prev.addEventListener('click', () => (this.navigationHandler(false), this.refreshUI()))

        this.controls.$toggle.addEventListener('click', () => this.toggleHandler())

        this.dates.$container.addEventListener('click', (e) => this.selectHandler(e))

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

    private get dates() {
        return {
            $container: this.root.content.dropdown.content.dates.$el,
        }
    }

    private set updateFieldsState(state: { year?: string; date?: string; month?: string }) {
        if (typeof state.year === 'string' && (/^\d{1,4}\/\d{1,2}\/\d{1,2}$/.test(state.year) || state.year === '')) {
            this.fieldsState.year = state.year
            this.fields.$year.value = state.year
        }

        if (
            typeof state.month === 'string' &&
            ((Number(state.month) > 0 && Number(state.month) <= 12 && /^\d{1,2}$/.test(state.month)) ||
                state.month === '')
        ) {
            this.fieldsState.month = state.month
            this.fields.$month.value = state.month
        }

        if (
            typeof state.date === 'string' &&
            ((Number(state.date) > 0 && Number(state.date) <= 31 && /^\d{1,2}$/.test(state.date)) || state.date === '')
        ) {
            this.fieldsState.date = state.date
            this.fields.$date.value = state.date
        }

        const currentHash = parseHash(this.DOMState.currentSelected.hash)

        const newHash =
            (state.year || currentHash.data.year) +
            '/' +
            (state.month || currentHash.data.month) +
            '/' +
            (state.date || currentHash.data.date)

        if (/^\d{1,4}\/\d{1,2}\/\d{1,2}$/.test(newHash)) {
            this.DOMState.currentSelected.hash = newHash
        }
    }

    private refreshUI(): void {
        if (this.DOMState.currentPicker === 'days') {
            this.controls.$month.textContent = this.locale.months[this.coreState.current.month].large

            this.controls.$year.textContent = this.coreState.current.year.toString()

            const dates = datesCellsBuilder({ ...this.coreState, dom: this.DOMState })

            this.dates.$container.firstChild?.replaceWith(dates)
        }
    }

    private toggleHandler(): void {
        if (this.root?.$el) {
            if (!this.root.$el.contains(this.root.content.dropdown.$el))
                this.root.$el.appendChild(this.root.content.dropdown.$el)
            else this.root.$el.removeChild(this.root.content.dropdown.$el)
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
                    [field]: newValue,
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
                    isDate && this.fields.$month.focus()
                    isMonth && this.fields.$year.focus()
                }
            } else if (field === 'year') {
                this.updateFieldsState = {
                    [field]: ref.value,
                }
                this.updateCoreState = new Date(
                    new Date(this.coreState.current.initialDate).setFullYear(Number(ref.value))
                )
            }
            if (field === 'date') {
                refreshActiveCell(this.dates.$container.firstChild as HTMLUListElement, this.DOMState)
            } else {
                this.refreshUI()
            }
        } else {
            this.updateFieldsState = { [field]: '' }
        }
    }

    private selectHandler(e: MouseEvent) {
        const target = e?.target as HTMLElement

        const info = !!target.dataset?.info && parseHash(target.dataset.info)

        if (info) {
            this.DOMState.currentSelected.hash = info.hash

            if (/next-date/.test(target.className)) this.navigationHandler(true)
            else if (/prev-date/.test(target.className)) this.navigationHandler(false)
            else refreshActiveCell(this.dates.$container.firstChild as HTMLUListElement, this.DOMState)

            this.updateFieldsState = info.data

            this.refreshUI()

            this.eventTrigger('onSelect', this.DOMState.currentSelected)
        }
    }

    private eventTrigger(event: EventKey, data: DateState | DOMState['currentSelected']) {
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
