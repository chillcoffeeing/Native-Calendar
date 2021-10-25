import {
    DateState,
    DropdownBuilderObject,
    InputBoxBuilderObject,
    LocaleOptions,
    DomState,
    FirstWeekDay,
    DatepickerControlsBuilderObject,
    YearPickerControlsBuilderObject,
    MonthPickerControlsBuilderObject
} from '../types'
import { isToday, parseHash, serializeHash } from './resolvers'

const builder = <T extends keyof HTMLElementTagNameMap>(ElementOptions: {
    tag: T
    attrs?: { [key: string]: string }
    innerContent?: string | Element | Element[]
}): HTMLElementTagNameMap[T] => {
    const $element = document.createElement(ElementOptions.tag)

    if (ElementOptions.attrs) {
        const attrs = ElementOptions.attrs

        Object.keys(attrs).forEach((attr) => $element.setAttribute(attr, attrs[attr]))
    }

    if (ElementOptions.innerContent) {
        if (ElementOptions.innerContent instanceof Array) {
            ElementOptions.innerContent.forEach((element) => {
                $element.insertAdjacentElement('beforeend', element)
            })
        } else if (typeof ElementOptions.innerContent === 'string') {
            $element.insertAdjacentText('beforeend', ElementOptions.innerContent)
        } else {
            $element.insertAdjacentElement('beforeend', ElementOptions.innerContent)
        }
    }

    return $element
}

export const fieldsBoxBuilder = (): InputBoxBuilderObject => {
    const $dropdownToggle = builder({ tag: 'button', attrs: { class: 'nc-fields-box__toggle-button' } })

    const $inputDate = builder({
        tag: 'input',
        attrs: {
            class: 'nc-field nc-field--date',
            type: 'text',
            placeholder: 'dd',
            maxlength: '2',
            inputmode: 'numeric',
            'data-type': 'date'
        }
    })

    const $inputMonth = builder({
        tag: 'input',
        attrs: {
            class: 'nc-field nc-field--month',
            type: 'text',
            placeholder: 'mm',
            maxlength: '2',
            inputmode: 'numeric',
            'data-type': 'month'
        }
    })

    const $inputYear = builder({
        tag: 'input',
        attrs: {
            class: 'nc-field nc-field--year',
            type: 'text',
            placeholder: 'aaaa',
            maxlength: '4',
            inputmode: 'numeric',
            'data-type': 'year'
        }
    })

    const $inputBox = builder({
        tag: 'div',
        attrs: { class: 'nc-fields-box' },
        innerContent: [
            builder({ tag: 'span', attrs: { class: 'nc-fields-box__field-wrapper' }, innerContent: $inputDate }),
            builder({ tag: 'span', attrs: { class: 'nc-fields-box__field-wrapper' }, innerContent: $inputMonth }),
            builder({ tag: 'span', attrs: { class: 'nc-fields-box__field-wrapper' }, innerContent: $inputYear }),
            $dropdownToggle
        ]
    })

    return {
        $inputBox,
        $inputDate,
        $inputMonth,
        $inputYear,
        $dropdownToggle
    }
}

export const datePickerControlsBuilder = (
    states: { current: DateState; next: DateState; prev: DateState; dom: DomState },
    locale: LocaleOptions
): DatepickerControlsBuilderObject => {
    const $prev = builder({ tag: 'button', attrs: { class: 'nc-prev-month-button nc-clickable' } })

    const $next = builder({ tag: 'button', attrs: { class: 'nc-next-month-button nc-clickable' } })

    const $monthButton = builder({
        tag: 'button',
        attrs: { class: 'nc-month-button nc-clickable' },
        innerContent: locale.months[states.current.month].large
    })

    const $yearButton = builder({
        tag: 'button',
        attrs: { class: 'nc-year-button nc-clickable' },
        innerContent: states.current.year.toString()
    })

    const $controlsContainer = builder({
        tag: 'div',
        attrs: { class: 'nc-controls-container' },
        innerContent: [$prev, $yearButton, $monthButton, $next]
    })

    return {
        $el: $controlsContainer,
        $prev,
        $next,
        $monthButton,
        $yearButton
    }
}

export const yearPickerControlsBuilder = (state: DateState): YearPickerControlsBuilderObject => {
    const prevYearsButton = builder({
        tag: 'button',
        attrs: {
            class: 'nc-prev-years-button nc-clickable'
        },
        innerContent: (state.year - 16).toString() + ' - ' + (state.year - 1).toString()
    })
    const nextYearsButton = builder({
        tag: 'button',
        attrs: {
            class: 'nc-next-years-button nc-clickable'
        },
        innerContent: (state.year + 16).toString() + ' - ' + (state.year + 31).toString()
    })
    const closeButton = builder({
        tag: 'button',
        attrs: {
            class: 'nc-close-button nc-clickable'
        }
    })

    const controlsContainer = builder({
        tag: 'div',
        attrs: {
            class: 'nc-controls-container'
        },
        innerContent: [prevYearsButton, nextYearsButton, closeButton]
    })

    return {
        $el: controlsContainer,
        $prev: prevYearsButton,
        $next: nextYearsButton,
        $close: closeButton
    }
}

export const monthPickerControlsBuilder = (): MonthPickerControlsBuilderObject => {
    const closeButton = builder({
        tag: 'button',
        attrs: {
            class: 'nc-close-button nc-clickable',
            type: 'button'
        }
    })

    return {
        $el: builder({
            tag: 'div',
            attrs: {
                class: 'nc-controls-container'
            },
            innerContent: [closeButton]
        }),
        $close: closeButton
    }
}

export const dropdownBuilder = (): DropdownBuilderObject => {
    const $navigationPanel = builder({
        tag: 'div',
        attrs: { class: 'nc-navigation-container' }
    })

    const $pickerBox = builder({
        tag: 'div',
        attrs: { class: 'nc-dates-container' }
    })

    const $dropdown = builder({
        tag: 'div',
        attrs: { class: 'nc-dropdown' },
        innerContent: [$navigationPanel, $pickerBox]
    })

    return {
        $el: $dropdown,
        $navigationBoxEl: $navigationPanel,
        $pickerBoxEl: $pickerBox
    }
}

export const daysBuilder = (locale: LocaleOptions, firstWeekDay: FirstWeekDay): HTMLUListElement => {
    const days = locale.days.map((day) => {
        return builder({ tag: 'li', attrs: { class: 'nc-cell' }, innerContent: day.short })
    })

    const sunday = days.shift()

    days[firstWeekDay === 'sunday' ? 'unshift' : 'push'](sunday as HTMLLIElement)

    return builder({
        tag: 'ul',
        attrs: { class: 'nc-list' },
        innerContent: days
    })
}

export const datesBuilder = (states: {
    current: DateState
    next: DateState
    prev: DateState
    dom: DomState
}): HTMLUListElement => {
    let i = 1

    const currentDates = []

    const currentDate = new Date(states.current.initialDate)

    while (i <= states.current.daysCount) {
        const hash = serializeHash(currentDate.setDate(i))

        const today = isToday(currentDate)

        currentDates.push(
            builder({
                tag: 'li',
                attrs: {
                    'data-info': hash,
                    title: hash,
                    class: 'nc-cell nc-clickable' + (today ? ' nc-today-date' : '')
                },
                innerContent: i.toString()
            })
        )

        i++
    }

    const prevDates = prevDatesBuilder(states.current, states.prev)

    const nextDates = nextDatesBuilder(states.current, states.next)

    const $dates = builder({
        tag: 'ul',
        attrs: {
            class: 'nc-list'
        },
        innerContent: [...prevDates, ...currentDates, ...nextDates]
    })

    refreshActiveDate($dates, states.dom)

    return $dates
}

export const prevDatesBuilder = (currentState: DateState, prevState: DateState): HTMLLIElement[] => {
    const dates = []

    const prevStateDate = new Date(prevState.initialDate)

    let firstDayOfCurrentMonth = currentState.firstDayToWeekDayNum

    let totalDaysOfPrevMonth = prevState.daysCount

    while (firstDayOfCurrentMonth > 0) {
        prevStateDate.setDate(totalDaysOfPrevMonth)

        const hash = serializeHash(prevStateDate)

        dates.push(
            builder({
                tag: 'li',
                attrs: {
                    'data-info': hash,
                    title: hash,
                    class: 'nc-cell nc-clickable prev-date'
                },
                innerContent: totalDaysOfPrevMonth.toString()
            })
        )

        firstDayOfCurrentMonth--, totalDaysOfPrevMonth--
    }

    return dates.reverse()
}

export const nextDatesBuilder = (currentState: DateState, nextState: DateState): HTMLLIElement[] => {
    const dates = []

    const nextInitialDate = new Date(nextState.initialDate)

    let nextDayOfNextMonth = 1

    let lastDayOfCurrentMonth = currentState.lastDayToWeekDayNum

    const weekDays = 6

    while (lastDayOfCurrentMonth < weekDays) {
        nextInitialDate.setDate(nextDayOfNextMonth)

        const hash = serializeHash(nextInitialDate)

        dates.push(
            builder({
                tag: 'li',
                attrs: {
                    'data-info': hash,
                    title: hash,
                    class: 'nc-cell nc-clickable next-date'
                },
                innerContent: nextDayOfNextMonth.toString()
            })
        )

        lastDayOfCurrentMonth++, nextDayOfNextMonth++
    }

    return dates
}

export const refreshActiveDate = (datesList: HTMLUListElement, DOMState: DomState): void => {
    datesList.childNodes?.forEach((children) => {
        const li = children as HTMLLIElement
        if (li.dataset?.info === DOMState.currentSelected.hash) li.classList.add('nc-date-active')
        else li.classList.remove('nc-date-active')
    })
}

export const refreshActiveMonth = (datesList: HTMLUListElement, state: DomState): void => {
    const {
        data: { month: currentMonth }
    } = parseHash(state.currentSelected.hash)

    datesList.childNodes?.forEach((children) => {
        const li = children as HTMLLIElement

        if (li.dataset?.info === (Number(currentMonth) - 1).toString()) {
            li.classList.add('nc-month-active')
        } else {
            li.classList.remove('nc-month-active')
        }
    })
}

export const refreshActiveYear = (datesList: HTMLUListElement, state: DomState): void => {
    const {
        data: { year: currentYear }
    } = parseHash(state.currentSelected.hash)

    datesList.childNodes?.forEach((children) => {
        const li = children as HTMLLIElement

        if (li.dataset?.info === currentYear.toString()) {
            li.classList.add('nc-year-active')
        } else {
            li.classList.remove('nc-year-active')
        }
    })
}

export const datePicker = (
    states: { current: DateState; next: DateState; prev: DateState; dom: DomState },
    locale: LocaleOptions,
    firstWeekDay: FirstWeekDay
): HTMLDivElement => {
    const $daysContainer = builder({
        tag: 'div',
        attrs: { class: 'nc-days-container' },
        innerContent: daysBuilder(locale, firstWeekDay)
    })

    const $dates = datesBuilder({
        current: states.current,
        next: states.next,
        prev: states.prev,
        dom: states.dom
    })

    return builder({
        tag: 'div',
        attrs: {
            class: 'nc-date-picker-wrapper'
        },
        innerContent: [$daysContainer, $dates]
    })
}

export const monthsPicker = (locale: LocaleOptions, state: DomState): HTMLDivElement => {
    const monthPicker = builder({
        tag: 'div',
        attrs: {
            class: 'nc-month-picker-wrapper'
        },
        innerContent: builder({
            tag: 'ul',
            attrs: {
                class: 'nc-month-list'
            },
            innerContent: locale.months.map((month, index) => {
                return builder({
                    tag: 'li',
                    attrs: {
                        class: 'nc-month-cell nc-clickable',
                        'data-info': index.toString()
                    },
                    innerContent: month.large
                })
            })
        })
    })

    refreshActiveMonth(monthPicker.querySelector('.nc-month-list') as HTMLUListElement, state)

    return monthPicker
}

export const yearPicker = (year: number, domState: DomState): HTMLDivElement => {
    const years: number[] = []

    for (let i = year; i < year + 16; i++) {
        years.push(i)
    }

    const yearPicker = builder({
        tag: 'div',
        attrs: {
            class: 'nc-year-picker-wrapper'
        },
        innerContent: builder({
            tag: 'ul',
            attrs: {
                class: 'nc-year-list'
            },
            innerContent: years.map((y) =>
                builder({
                    tag: 'li',
                    attrs: {
                        class: 'nc-year-cell nc-clickable',
                        'data-info': y.toString()
                    },
                    innerContent: y.toString()
                })
            )
        })
    })

    refreshActiveYear(yearPicker.querySelector('.nc-year-list') as HTMLUListElement, domState)

    return yearPicker
}

export default builder
