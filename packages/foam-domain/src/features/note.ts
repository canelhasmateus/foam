import { Absolute } from "./files";

export class FoamNote {
	constructor( public location: Absolute, public content: string ) {
	}
}

export type NoteCreation = {
	possibleDestination: Absolute[]
	content: string
}

export interface NoteEngine {
	createNote: ( context: NoteCreation ) => Promise<NoteCreationResult>
}

export type CreationSuccess = {
	context: NoteCreation
	note: FoamNote
}

export type CreationFailure = {
	context: NoteCreation,
	message: string
}

export type NoteCreationResult = CreationSuccess | CreationFailure



