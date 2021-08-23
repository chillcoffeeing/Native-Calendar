import builder from "../util/builder";
import NativeCalendarData from "./data";
import {
  UIControls,
  UIState,
  InstanceOptions, UpdateMonthParam,
  BuilderObject
} from "../types";
export default class NativeCalendar extends NativeCalendarData {
  private rootElement: Element;

  private controlsPanel: UIControls;

  private datesContainer: HTMLDivElement;

  private mainUIState: UIState;

  constructor(rootElement: Element | string, options?: InstanceOptions) {
    super(options);

    this.rootElement =
      typeof rootElement === "string"
        ? (document.querySelector(rootElement) as Element)
        : rootElement;

    this.mainUIState = {
      currentPicker: "days",
      currentSelected: {
        date: this.mainDateState.initialDate,
        hash: `${this.mainDateState.year}/${this.mainDateState.month}/${this.mainDateState.monthDay}`,
      },
    };

    const { $datesContainer, $controls } = this.Builder();

    this.datesContainer = $datesContainer;
    this.controlsPanel = $controls;
  }

  private refreshMonth(factor: UpdateMonthParam): void {
    let updatedDate: Date;

    if (typeof factor === "number") {
      updatedDate = new Date(
        new Date(this.mainDateState.initialDate).setMonth(factor)
      );
    } else {
      updatedDate = new Date(
        new Date(this.mainDateState.initialDate).setMonth(
          this.mainDateState.month + (factor ? 1 : -1)
        )
      );
    }

    this.refreshDateState(updatedDate);

    this.controlsPanel.$monthButton.textContent =
      this.locale.months[this.mainDateState.month].large;
    this.controlsPanel.$yearButton.textContent =
      this.mainDateState.year.toString();

    this.refreshDates();

    this.eventTrigger("onChange", this.mainDateState);
  }

  private refreshDates(): void {
    this.datesContainer.firstChild?.replaceWith(this.datesCells);
  }

  private refreshActiveCell(datesList: HTMLUListElement): void {
    const $children = datesList.childNodes;

    $children?.forEach((children) => {
      const li = children as HTMLLIElement;

      if (li.dataset?.info === this.mainUIState.currentSelected.hash) {
        li.classList.add("ndp-date-active");
      } else {
        li.classList.remove("ndp-date-active");
      }
    });
  }

  private Builder(): BuilderObject {
    const $prev = builder<HTMLButtonElement>({ tag: "button", attrs: { class: "ndp-prev-month-button" } });
    const $next = builder<HTMLButtonElement>({ tag: "button", attrs: { class: "ndp-next-month-button" } });
    const $monthButton = builder<HTMLButtonElement>({ tag: "button", attrs: { class: "ndp-month-button" }, innerContent: this.locale.months[this.mainDateState.month].large });
    const $yearButton = builder<HTMLButtonElement>({ tag: "button", attrs: { class: "ndp-year-button" }, innerContent: this.mainDateState.year.toString() });
    const $editDateButton = builder<HTMLButtonElement>({ tag: "button", attrs: { class: "ndp-edit-button" } });
    const $dropdownToggle = builder<HTMLButtonElement>({ tag: "button", attrs: { class: "ndp-toggle-button" } });
    const $datesContainer = builder<HTMLDivElement>({ tag: "div", attrs: { class: "ndp-dates-container" }, innerContent: this.datesCells });
    const $controlsContainer = builder<HTMLDivElement>({ tag: "div", attrs: { class: "ndp-controls-container" }, innerContent: [$prev, $yearButton, $monthButton, $editDateButton, $next] });
    const $daysContainer = builder<HTMLDivElement>({ tag: "div", attrs: { class: "ndp-days-container" }, innerContent: this.daysCells });
    const $navigationPanel = builder<HTMLDivElement>({ tag: "div", attrs: { class: "ndp-navigation-container" }, innerContent: [$controlsContainer, $daysContainer] });
    const $dropdown = builder<HTMLDivElement>({tag: "div", attrs: { class: "ndp-dropdown" }, innerContent: [$navigationPanel, $datesContainer]})
    const $inputBox = builder<HTMLInputElement>({ tag: "div", attrs: { class: "ndp-input-box" }, innerContent: [
      builder<HTMLSpanElement>({tag:"span", attrs: { class: "ndp-input-wrapper" }, innerContent: builder<HTMLInputElement>({tag:"input", attrs: { class: "ndp-input-element ndp-input-date" , placeholder: "00" } }) }),
      builder<HTMLSpanElement>({tag:"span", attrs: { class: "ndp-input-wrapper" }, innerContent: builder<HTMLInputElement>({tag:"input", attrs: { class: "ndp-input-element ndp-input-month" , placeholder: "00" } }) }),
      builder<HTMLSpanElement>({tag:"span", attrs: { class: "ndp-input-wrapper" }, innerContent: builder<HTMLInputElement>({tag:"input", attrs: { class: "ndp-input-element ndp-input-year" , placeholder: "0000" } }) }),
      $dropdownToggle
    ] });

    $prev.addEventListener("click", () => this.refreshMonth(false));
    $next.addEventListener("click", () => this.refreshMonth(true));
    $monthButton.addEventListener("click", () => console.log("MonthButton"));
    $yearButton.addEventListener("click", () => console.log("YearButton"));
    $editDateButton.addEventListener("click", () => console.log("EditDateButton"))
    $datesContainer.addEventListener("click", (e) => this.selectHandler(e));
    $dropdownToggle.addEventListener("click", () => {
      $dropdown.classList.toggle("ndp-show-dropdown");
    });

    this.rootElement.className = "ndp-root-container";
    this.rootElement.insertAdjacentElement("afterbegin", $inputBox);
    this.rootElement.insertAdjacentElement("beforeend", $dropdown);

    return {
      $controls: {
        $yearButton,
        $prev,
        $monthButton,
        $editDateButton,
        $next,
      },
      $datesContainer,
    };
  }

  private get daysCells(): HTMLUListElement {
    return builder<HTMLUListElement>({
      tag: "ul",
      attrs: { class: "ndp-list" },
      innerContent: this.locale.days.map((day) => {
        return builder<HTMLLIElement>({ tag: "li", attrs: { class: "ndp-cell" }, innerContent: day.short })
      })
    });
  }

  private get datesCells(): HTMLUListElement {
    let i = 1;
    const now = new Date()
    const currentDates = []

    while (i <= this.mainDateState.daysCount) {
      const hash = `${this.mainDateState.year}/${this.mainDateState.month}/${i}`;

      const today = i === now.getDate() && this.mainDateState.month === now.getMonth() && this.mainDateState.year === now.getFullYear();

      currentDates.push(builder<HTMLLIElement>({
        tag: "li",
        attrs: {
          "data-info": hash,
          title: hash,
          class: "ndp-cell ndp-clickable" + (today ? " ndp-today-date" : "")
        },
        innerContent: i.toString()
      }));

      i++;
    }
    const prevDates = this.generatePrevMonthDatesCells;
    const nextDates = this.generateNextMonthDatesCells;

    const $dates = builder<HTMLUListElement>({
      tag: "ul",
      attrs: {
        class: "ndp-list"
      },
      innerContent: [...prevDates, ...currentDates, ...nextDates]
    })

    this.refreshActiveCell($dates);

    return $dates;
  }

  private get generatePrevMonthDatesCells(): HTMLLIElement[] {
    const dates = [];

    const currentStateDate = new Date(this.mainDateState.initialDate);

    const prevDateState = this.generateDateState(
      new Date(currentStateDate.setMonth(currentStateDate.getMonth() - 1))
    );

    let firstDayOfCurrentMonth = this.mainDateState.firstDayToWeek;
    let totalDaysOfPrevMonth = prevDateState.daysCount;

    while (firstDayOfCurrentMonth > 0) {
      prevDateState.initialDate.setDate(totalDaysOfPrevMonth);

      const hash = `${prevDateState.initialDate.getFullYear()}/${prevDateState.initialDate.getMonth()}/${prevDateState.initialDate.getDate()}`;

      dates.push(builder<HTMLLIElement>({
        tag: "li",
        attrs: {
          'data-info': hash,
          title: hash,
          class: "ndp-cell ndp-clickable prev-date"
        },
        innerContent: totalDaysOfPrevMonth.toString()
      }));

      firstDayOfCurrentMonth--, totalDaysOfPrevMonth--;
    }

    return dates.reverse();
  }

  private get generateNextMonthDatesCells(): HTMLLIElement[] {
    const dates = [];

    const currentDate = new Date(this.mainDateState.initialDate);

    const { initialDate: nextInitialDate } = this.generateDateState(
      new Date(currentDate.setMonth(currentDate.getMonth() + 1))
    );

    let nextDayOfNextMonth = 1;
    let lastDayOfCurrentMonth = this.mainDateState.lastDayToWeek;
    const weekDays = 6;

    while (lastDayOfCurrentMonth < weekDays) {
      nextInitialDate.setDate(nextDayOfNextMonth);

      const hash = `${nextInitialDate.getFullYear()}/${nextInitialDate.getMonth()}/${nextInitialDate.getDate()}`;

      dates.push(builder<HTMLLIElement>({
        tag: "li",
        attrs: {
          "data-info": hash,
          title: hash,
          class: "ndp-cell ndp-clickable next-date"
        },
        innerContent: nextDayOfNextMonth.toString()
      }));

      lastDayOfCurrentMonth++, nextDayOfNextMonth++;
    }

    return dates;
  }

  private selectHandler(e: Event) {
    const target = e?.target as HTMLElement;

    if (
      target.dataset?.info &&
      /^\d{4}\/\d{1,2}\/\d{1,2}/.test(target.dataset.info)
    ) {
      this.mainUIState.currentSelected.hash = target.dataset.info;

      if (target.classList.contains("prev-date")) this.refreshMonth(false);
      else if (target.classList.contains("next-date")) this.refreshMonth(true);
      else this.refreshActiveCell(target.parentElement as HTMLUListElement);

      this.eventTrigger("onSelect", this.mainUIState.currentSelected);
    }
  }
}
