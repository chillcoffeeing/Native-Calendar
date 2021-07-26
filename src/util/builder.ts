export default function createElement<T extends HTMLElement >(ElementOptions: { tag: keyof HTMLElementTagNameMap, attrs?: { [key: string]: string }, innerContent?: string | Element | Element[] }): T {
  const $element = document.createElement(ElementOptions.tag) as T

  if (ElementOptions.attrs) {
    const attrs = ElementOptions.attrs
    Object.keys(attrs).forEach(attr => {
      $element.setAttribute(attr, attrs[attr])
    })
  }

  if (!!Array.isArray(ElementOptions.innerContent)) {
    ElementOptions.innerContent.forEach(element => $element.insertAdjacentElement("beforeend", element))
  } else if (typeof ElementOptions.innerContent === "string") {
    $element.textContent = ElementOptions.innerContent
  } else if(ElementOptions.innerContent)  {
    $element.insertAdjacentElement("beforeend", ElementOptions.innerContent)
  }

  return $element;
}