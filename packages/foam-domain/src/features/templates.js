"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoteFromTemplate = exports.listTemplates = exports.readTemplate = exports.resolveContent = exports.resolveDestinations = void 0;
const types_1 = require("../types");
const note_1 = require("./note");
const template_frontmatter_parser_1 = require("foam-vscode/src/utils/template-frontmatter-parser");
async function resolveDestinations(resolver, template) {
    const destinations = [];
    const filepath = template.metadata.get("filepath");
    if (filepath) {
        const dest = await resolver.resolve(filepath);
        destinations.push(dest);
    }
    return destinations;
}
exports.resolveDestinations = resolveDestinations;
async function resolveContent(resolver, template) {
    return await resolver.resolve(template.content);
}
exports.resolveContent = resolveContent;
// Actions
async function readTemplate(fileSystem, location) {
    return fileSystem.read(location).then(s => {
        const [attributes, content] = (0, template_frontmatter_parser_1.extractFoamTemplateFrontmatterMetadata)(location);
        return {
            // todo
            content: content,
            location: location,
            metadata: attributes
        };
    });
}
exports.readTemplate = readTemplate;
async function listTemplates(fileSystem) {
    return fileSystem.find('.foam/templates/**.md').then(locations => {
        console.log(locations);
        return Promise.all(locations.map(loc => readTemplate(fileSystem, loc)));
    });
}
exports.listTemplates = listTemplates;
async function createNoteFromTemplate(fileSystem, source, possibleDestinations, content) {
    const result = await (0, note_1.createNote)(fileSystem, possibleDestinations, content);
    return {
        source: source,
        ...result
    };
}
exports.createNoteFromTemplate = createNoteFromTemplate;
//# sourceMappingURL=templates.js.map