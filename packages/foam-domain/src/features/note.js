"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNote = void 0;
async function createNote(fileSystem, possibleDestination, content) {
    for (let destination of possibleDestination) {
        const res = await fileSystem.write(destination, content);
        if (res.success) {
            return {
                success: true,
                note: {
                    location: destination,
                    content: content
                }
            };
        }
    }
    return {
        success: false,
        destinations: possibleDestination,
        content: content
    };
}
exports.createNote = createNote;
//# sourceMappingURL=note.js.map