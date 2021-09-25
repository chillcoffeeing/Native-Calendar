import { DateState, DropdownBuilderObject, InputBoxBuilderObject, LocaleOptions, DOMState } from '../types'
import { isToday, serializeHash } from './resolvers'

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

export const inputBuilder = (): InputBoxBuilderObject => {
    const $dropdownToggle = builder({ tag: 'button', attrs: { class: 'ndp-toggle-button' } })

    const $inputDate = builder({
        tag: 'input',
        attrs: {
            class: 'ndp-input-element ndp-input-date',
            type: 'text',
            placeholder: 'dd',
            maxlength: '2',
            inputmode: 'numeric',
            'data-type': 'date',
        },
    })

    const $inputMonth = builder({
        tag: 'input',
        attrs: {
            class: 'ndp-input-element ndp-input-month',
            type: 'text',
            placeholder: 'mm',
            maxlength: '2',
            inputmode: 'numeric',
            'data-type': 'month',
        },
    })

    const $inputYear = builder({
        tag: 'input',
        attrs: {
            class: 'ndp-input-element ndp-input-year',
            type: 'text',
            placeholder: 'aaaa',
            maxlength: '4',
            inputmode: 'numeric',
            'data-type': 'year',
        },
    })

    const $inputBox = builder({
        tag: 'div',
        attrs: { class: 'ndp-input-box' },
        innerContent: [
            builder({ tag: 'span', attrs: { class: 'ndp-input-wrapper' }, innerContent: $inputDate }),
            builder({ tag: 'span', attrs: { class: 'ndp-input-wrapper' }, innerContent: $inputMonth }),
            builder({ tag: 'span', attrs: { class: 'ndp-input-wrapper' }, innerContent: $inputYear }),
            $dropdownToggle,
        ],
    })

    return {
        $el: $inputBox,
        content: {
            date: {
                $el: $inputDate,
            },
            month: {
                $el: $inputMonth,
            },
            year: {
                $el: $inputYear,
            },
            toggle: {
                $el: $dropdownToggle,
            },
        },
    }
}

export const dropdownBuilder = (
    states: { current: DateState; next: DateState; prev: DateState; dom: DOMState },
    locale: LocaleOptions
): DropdownBuilderObject => {
    const $prev = builder({ tag: 'button', attrs: { class: 'ndp-prev-month-button ndp-clickable' } })

    const $next = builder({ tag: 'button', attrs: { class: 'ndp-next-month-button ndp-clickable' } })

    const $monthButton = builder({
        tag: 'button',
        attrs: { class: 'ndp-month-button ndp-clickable' },
        innerContent: locale.months[states.current.month].large,
    })

    const $yearButton = builder({
        tag: 'button',
        attrs: { class: 'ndp-year-button ndp-clickable' },
        innerContent: states.current.year.toString(),
    })

    const $controlsContainer = builder({
        tag: 'div',
        attrs: { class: 'ndp-controls-container' },
        innerContent: [$prev, $yearButton, $monthButton, $next],
    })

    const $daysContainer = builder({
        tag: 'div',
        attrs: { class: 'ndp-days-container' },
        innerContent: daysCells(locale),
    })

    const $navigationPanel = builder({
        tag: 'div',
        attrs: { class: 'ndp-navigation-container' },
        innerContent: [$controlsContainer, $daysContainer],
    })

    const $dates = datesCellsBuilder({
        current: states.current,
        next: states.next,
        prev: states.prev,
        dom: states.dom,
    })

    const $datesContainer = builder({
        tag: 'div',
        attrs: { class: 'ndp-dates-container' },
        innerContent: $dates,
    })

    const $dropdown = builder({
        tag: 'div',
        attrs: { class: 'ndp-dropdown' },
        innerContent: [$navigationPanel, $datesContainer],
    })

    return {
        $el: $dropdown,
        content: {
            navigation: {
                $el: $navigationPanel,
                content: {
                    controls: {
                        $el: $controlsContainer,
                        content: {
                            prev: {
                                $el: $prev,
                            },
                            yearButton: {
                                $el: $yearButton,
                            },
                            monthButton: {
                                $el: $monthButton,
                            },
                            next: {
                                $el: $next,
                            },
                        },
                    },
                    days: {
                        $el: $daysContainer,
                    },
                },
            },
            dates: {
                $el: $datesContainer,
                content: {
                    list: {
                        $el: $dates,
                    },
                },
            },
        },
    }
}

export const daysCells = (locale: LocaleOptions): HTMLUListElement => {
    return builder({
        tag: 'ul',
        attrs: { class: 'ndp-list' },
        innerContent: locale.days.map((day) => {
            return builder({ tag: 'li', attrs: { class: 'ndp-cell' }, innerContent: day.short })
        }),
    })
}

export const datesCellsBuilder = (states: {
    current: DateState
    next: DateState
    prev: DateState
    dom: DOMState
}): HTMLUListElement => {
    let i = 1

    const currentDates = []

    while (i <= states.current.daysCount) {
        const hash = serializeHash(states.current.initialDate.setDate(i))

        const today = isToday(states.current.initialDate)

        currentDates.push(
            builder({
                tag: 'li',
                attrs: {
                    'data-info': hash,
                    title: hash,
                    class: 'ndp-cell ndp-clickable' + (today ? ' ndp-today-date' : ''),
                },
                innerContent: i.toString(),
            })
        )

        i++
    }

    const prevDates = prevMonthDatesCellsBuilder(states.current, states.prev)

    const nextDates = nextMonthDatesCellsBuilder(states.current, states.next)

    const $dates = builder({
        tag: 'ul',
        attrs: {
            class: 'ndp-list',
        },
        innerContent: [...prevDates, ...currentDates, ...nextDates],
    })

    refreshActiveCell($dates, states.dom)

    return $dates
}

export const prevMonthDatesCellsBuilder = (currentState: DateState, prevState: DateState): HTMLLIElement[] => {
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
                    class: 'ndp-cell ndp-clickable prev-date',
                },
                innerContent: totalDaysOfPrevMonth.toString(),
            })
        )

        firstDayOfCurrentMonth--, totalDaysOfPrevMonth--
    }

    return dates.reverse()
}

export const nextMonthDatesCellsBuilder = (currentState: DateState, nextState: DateState): HTMLLIElement[] => {
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
                    class: 'ndp-cell ndp-clickable next-date',
                },
                innerContent: nextDayOfNextMonth.toString(),
            })
        )

        lastDayOfCurrentMonth++, nextDayOfNextMonth++
    }

    return dates
}

export const refreshActiveCell = (datesList: HTMLUListElement, DOMState: DOMState): void => {
    const $children = datesList.childNodes

    $children?.forEach((children) => {
        const li = children as HTMLLIElement

        if (li.dataset?.info === DOMState.currentSelected.hash) {
            li.classList.add('ndp-date-active')
        } else {
            li.classList.remove('ndp-date-active')
        }
    })
}

export default builder
