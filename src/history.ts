import type Bus from "./bus"

// Patch the window.history object track calls to pushState into a local
// array. This allows for back() and forward() to work without impacting
// the parent frame.
export default class LocalHistory {
  private history: HistoryItem[] = []
  private position = -1

  private originalHistory = Object.getPrototypeOf(window.history)
  private disableHashChange = false

  constructor(private bus: Bus) {}

  // Notify the parent that the location changed.
  private notify(path?: string) {
    this.bus.emit("location.changed", {
      path,
    })
  }

  // Save location to history.
  private push(url: string, state: unknown) {
    this.history.splice(this.position + 1)
    this.history.push({ url, state })
    this.position = this.history.length - 1
  }

  // Builds a path from location.
  private path(location: Location) {
    return `${location.pathname}${location.hash}`
  }

  patch() {
    Object.assign(window.history, {
      go: (delta: number) => {
        const position = this.position + delta
        if (position >= 0 && position <= this.history.length - 1) {
          this.position = position

          const { url, state, unused } = this.history[this.position]
          const oldHref = document.location.href
          // The actual navigation will always call replaceState to prevent iframe from
          // having its own state.
          this.originalHistory.replaceState.call(window.history, state, unused ?? "", url)
          this.notify(this.path(location))
          const newHref = document.location.href

          window.dispatchEvent(new PopStateEvent("popstate", { state }))
          if (newHref.indexOf('#') !== -1) {
            this.disableHashChange = true
            window.dispatchEvent(new HashChangeEvent("hashchange", {
              oldURL: oldHref,
              newURL: newHref,
            }))
          }
        }
      },

      back: () => {
        window.history.go(-1);
      },

      forward: () => {
        window.history.go(1);
      },

      pushState: (state: unknown, unused: string | undefined, url: string) => {
        this.originalHistory.replaceState.call(window.history, state, unused, url)
        this.push(url, state)
        this.notify(this.path(location))
      },

      replaceState: (state: unknown, unused: string | undefined, url: string) => {
        this.originalHistory.replaceState.call(window.history, state, unused, url)
        this.history[this.position] = { state, unused, url }
        this.notify(this.path(location))
      },
    })

    // Because history is tracked locally, certain values need to be updated.
    Object.defineProperties(window.history, {
      length: {
        get: () => {
          return this.history.length
        },
      },

      state: {
        get: () => {
          return this.history[this.position].state
        },
      },
    })

    // Support hash based navigation.
    window.addEventListener("hashchange", () => {
      if (!this.disableHashChange) {
        const url = this.path(document.location)
        this.push(url, null)
        this.notify(url)
      } else {
        this.disableHashChange = false
      }
    })

    // Load in the initial location.
    const url = this.path(document.location)
    this.push(url, null)
    setTimeout(() => this.notify(url))
  }
}

interface HistoryItem {
  state: unknown
  url?: string
  unused?: string
}
