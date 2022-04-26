"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class CommandManager {
    constructor() {
        this._commands = new Map();
    }
    dispose() {
        for (const registration of this._commands.values()) {
            registration.dispose();
        }
        this._commands.clear();
    }
    register(command) {
        this.registerCommand(command.id, command.execute, command);
        return command;
    }
    registerCommand(id, impl, thisArg) {
        if (this._commands.has(id)) {
            return;
        }
        this._commands.set(id, vscode.commands.registerCommand(id, impl, thisArg));
    }
}
exports.CommandManager = CommandManager;
//# sourceMappingURL=commandManager.js.map