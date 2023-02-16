import Hook from "console-feed/lib/Hook"
import Bus from "./bus"
import LocalHistory from "./history"

const main = () => {
  // Communication channel.
  const bus = new Bus()

  // Set up navigation infrastructure.
  const localHistory = new LocalHistory(bus)
  localHistory.patch()

  // Pong.
  bus.listen("ping", () => bus.emit("pong", null))

  // Navigation helpers.
  bus.listen("history.back", () => window.history.back())
  bus.listen("history.forward", () => window.history.forward())
  bus.listen("location.reload", () => window.location.reload())

  // Console proxy.
  Hook(window.console, (log) => bus.emit("console-feed.message", log))
}

main()
