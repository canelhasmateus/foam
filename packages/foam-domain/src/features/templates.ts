import { brand, From, Sourced } from "../types";
import { Absolute } from "./files";
import { NoteCreationResult } from "./note";

// Base
export type TemplateId = { [ brand ]: "TemplateId" }
export type Unresolved = { [ brand ]: "Unresolved" }

export interface Template {
	id: TemplateId
	location: Absolute
	content: Unresolved
	metadata: TemplateMetadata,
}

// Metadata
type KnownAttributes = {
	name: Unresolved,
	description: Unresolved,
	filepath: Unresolved
}
type Attribute<K> = From<KnownAttributes, K, string>

export interface TemplateMetadata {
	get: <K extends keyof KnownAttributes | string>( key: K ) => Attribute<K>
}


// Actions
export type  CreationFromTemplateResult = NoteCreationResult & Sourced<Template>

export interface CreateNoteFromTemplate {
	createNoteFromTemplate: () => CreationFromTemplateResult
}


