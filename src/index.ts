import { Decode } from "console-feed/lib/Transform"
import Hook from "console-feed/lib/Hook"
import Bus from "./bus"

const bus = new Bus()

// Pong.
bus.listen("ping", () => bus.emit("pong", null))

// Navigation helpers.
bus.listen("history.back", () => window.history.back())
bus.listen("history.forward", () => window.history.forward())
bus.listen("location.reload", () => {
    console.log("relodaing....")
    window.location.reload()
})

// Console proxy.
// Hook(window.console, (log) => bus.emit("console-feed.message", Decode(log)))
