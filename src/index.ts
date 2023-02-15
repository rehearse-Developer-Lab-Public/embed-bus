import Hook from "console-feed/lib/Hook"
import Bus from "./bus"

const bus = new Bus()

// Pong.
bus.listen("ping", () => bus.emit("pong", null))

// Navigation helpers.
bus.listen("history.back", () => window.history.back())
bus.listen("history.forward", () => window.history.forward())
bus.listen("location.reload", () => window.location.reload())

// Console proxy.
Hook(window.console, (log) => {
    alert("Sorry")
    bus.emit("console-feed.message", log)
})

setInterval(() => {
    bus.emit("tick", null)
}, 2500)
