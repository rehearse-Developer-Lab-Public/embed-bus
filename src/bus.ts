/*
  Bus that uses postMessage infrastructure.
*/
export default class Bus {
  private listeners: Record<string, ListenerCallback> = {}

  constructor() {
    window.addEventListener("message", (event) => {
      if (event.data?.event) {
        this.listeners[event.data.event]?.(event.data.message)
      }
    })
  }

  emit(event: string, message: any) {
    if (window.top) {
      window.top.postMessage({ event, message }, "*")
    }
  }

  listen(event: string, callback: ListenerCallback) {
    this.listeners[event] = callback
  }

  unregister(event: string) {
    delete this.listeners[event]
  }
}

type ListenerCallback = (message: any) => void
