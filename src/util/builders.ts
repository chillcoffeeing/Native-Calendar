import { DateState, DropdownBuilderObject, InputBoxBuilderObject, LocaleOptions, DOMState } from '../types'

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
        attrs: { class: 'ndp-input-element ndp-input-date', value: 'dd', 'data-type': 'date' },
    })

    const $inputMonth = builder({
        tag: 'input',
        attrs: { class: 'ndp-input-element ndp-input-month', value: 'mm', 'data-type': 'month' },
    })

    const $inputYear = builder({
        tag: 'input',
        attrs: { class: 'ndp-input-element ndp-input-year', value: 'yyyy', 'data-type': 'year' },
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

    const $datesContainer = builder({
        tag: 'div',
        attrs: { class: 'ndp-dates-container' },
        innerContent: datesCellsBuilder({
            current: states.current,
            next: states.next,
            prev: states.prev,
            dom: states.dom,
        }),
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

    const now = new Date()

    const currentDates = []

    while (i <= states.current.daysCount) {
        const hash = `${states.current.year}/${states.current.month}/${i}`

        const today =
            i === now.getDate() &&
            states.current.month === now.getMonth() + 1 &&
            states.current.year === now.getFullYear()

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

export const prevMonthDatesCellsBuilder = (currentState: DateState, state: DateState): HTMLLIElement[] => {
    const dates = []

    let firstDayOfCurrentMonth = currentState.firstDayToWeekDayNum

    let totalDaysOfPrevMonth = state.daysCount

    while (firstDayOfCurrentMonth > 0) {
        state.initialDate.setDate(totalDaysOfPrevMonth)

        const hash = `${state.initialDate.getFullYear()}/${
            state.initialDate.getMonth() + 1
        }/${state.initialDate.getDate()}`

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

    const nextInitialDate = nextState.initialDate

    let nextDayOfNextMonth = 1

    let lastDayOfCurrentMonth = currentState.lastDayToWeekDayNum

    const weekDays = 6

    while (lastDayOfCurrentMonth < weekDays) {
        nextInitialDate.setDate(nextDayOfNextMonth)

        const hash = `${nextInitialDate.getFullYear()}/${nextInitialDate.getMonth() + 1}/${nextInitialDate.getDate()}`

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
