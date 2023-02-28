import { brand, From, Optional, Sourced } from "../types";
import { Absolute } from "./files";
import { CreateNoteResult } from "./note";
import { FoamResourceProvider } from "../components";
export type Unresolved = {
    [brand]: "Unresolved";
};
export type VariableExpansor = {
    resolve: (value: Unresolved) => Promise<string>;
};
export declare function resolveDestinations(resolver: VariableExpansor, template: NoteTemplate): Promise<string[]>;
export declare function resolveContent(resolver: VariableExpansor, template: NoteTemplate): Promise<string>;
export type NoteTemplate = {
    location: Absolute;
    content: Unresolved;
    metadata: TemplateMetadata;
};
export type TemplateMetadata = {
    get: <K extends keyof KnownAttributes | string>(key: K) => Optional<From<KnownAttributes, K, string>>;
};
type KnownAttributes = {
    name: Unresolved;
    description: Unresolved;
    filepath: Unresolved;
};
export declare function readTemplate(fileSystem: FoamResourceProvider, location: Absolute): Promise<NoteTemplate>;
export declare function listTemplates(fileSystem: FoamResourceProvider): Promise<NoteTemplate[]>;
export type CreateFromTemplateResult = CreateNoteResult & Sourced<NoteTemplate>;
export declare function createNoteFromTemplate(fileSystem: FoamResourceProvider, source: NoteTemplate, possibleDestinations: Absolute[], content: string): Promise<CreateFromTemplateResult>;
export {};
//# sourceMappingURL=templates.d.ts.map