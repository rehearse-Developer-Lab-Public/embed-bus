import { Decode } from "console-feed/lib/Transform"
import Hook from "console-feed/lib/Hook"
import Bus from "./bus"

const bus = new Bus()

// Go back in history.
bus.listen("history.back", () => {
  window.history.back()
})

// Go forward in history.
bus.listen("history.forward", () => {
  window.history.forward()
})

// Reload the current location.
bus.listen("location.reload", () => {
  window.location.reload()
})

// Relay all console messages.
Hook(window.console, (log) => {
  bus.emit("console-feed.message", Decode(log))
})
