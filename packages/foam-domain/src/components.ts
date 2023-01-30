import { Absolute, Document, Glob, ReadResult, WriteResult } from "./features/files";
import { EditingContext } from "./features/editor";

export enum System {
	Settings,
	Editor,
	File,
}

export interface FoamComponent<T extends System> {
	system: System
}

export interface FoamSettings extends FoamComponent<System.Settings> {
}

export interface FoamFileSystem extends FoamComponent<System.File> {
	absolutize: ( path: string ) => Absolute
	root: () => Absolute
	find: ( include: Glob, exclude?: Glob ) => Promise<Absolute[]>
	read: ( location: Absolute ) => Promise<ReadResult>
	write: ( location: Absolute, content: string ) => Promise<WriteResult>
}

export interface FoamEditor extends FoamComponent<System.Editor> {
	editingContext: () => EditingContext
	focus: ( file: Document ) => Promise<void>
	warn: ( message: string ) => Promise<void>
}
