import { commands, ExtensionContext, GlobPattern, QuickPickItem, Uri, ViewColumn, window, workspace } from 'vscode';
import { FoamFeature } from "../../types";
import { TextDecoder, TextEncoder } from "util";
import { Resolver } from "../../services/variable-resolver";


export enum System {
	Settings,
	Editor,
	FileSystem,
	UI
}

export interface FoamComponent<T extends System> {
	system: System
}

namespace Settings {

	export interface FoamSettings extends FoamComponent<System.Settings> {
	}

}

namespace FileSystem {
	type Glob = String

	export interface FoamFileSystem extends FoamComponent<System.FileSystem> {
		absolutize: ( s: string ) => Absolute
		root: () => Promise<Absolute>
		find: ( include: Glob, exclude?: Glob ) => Promise<Absolute[]>
		read: ( location: Absolute ) => Promise<string>
		create: ( location: Absolute, content: string ) => Promise<boolean>
		write: ( location: Absolute, content: string ) => Promise<boolean>
		exists: ( location: Absolute ) => Promise<boolean>
	}
}

namespace UI {

	export interface FoamUI extends FoamComponent<System.UI> {
		focus: ( file: Document ) => Promise<void>
	}

}

namespace Notes {

	export type NoteCreationResult = CreationSuccess | CreationFailure

	export interface NoteEngine {
		createNote: ( context: NoteCreation ) => Promise<NoteCreationResult>
	}

	export interface NoteEngine {

		create( location: Absolute, content: string ): Promise<NoteCreationResult>
	}

	export class CreationFailure {
		public status = CreationStatus.FAILURE;

		constructor( public context: NoteCreation,
					 public message: string ) {
		}

	}

	export class FoamNote {

		constructor( public location: Absolute, public content: string ) {

		}
	}

	export type NoteCreation = {
		editingContext: EditingContext
		possibleDestination: Absolute[]
		content: string
		source?: NoteTemplate
	}

	export enum CreationStatus {
		OK,
		FAILURE
	}

	export class CreationSuccess {
		public status = CreationStatus.OK;

		constructor( public context: NoteCreation,
					 public note: FoamNote ) {
		}

	}


}

namespace Editor {
	export class Selection {
	}

	export type Document = {
		location: Absolute,
		selections: Selection[],
		content: string
	}

	export type EditingWindow = {
		document: Document
	}

	export type EditingContext = {
		active: Optional<EditingWindow>
	}

	export interface FoamEditor extends FoamComponent<System.Editor> {
		editingContext: () => EditingContext
	}

}

namespace Templates {
	export interface TemplateEngine {
		ids: () => Promise<TemplateId[]>
		getTemplate: ( id: TemplateId ) => Promise<NoteTemplate>
	}

	type MyPick = QuickPickItem & { templateId: TemplateId }
	type Fn<K, V> = ( k: K ) => V

	export type Optional<T> = T | null | undefined

	export function safely<K, V>( fn: Fn<K, V> ): Fn<Optional<K>, Optional<V>> {
		return ( k: K ) => {
			if ( !k ) return null
			return fn( k )
		}
	}

	export function either<K, V>( o: Optional<K>, e: V ): K | V {
		if ( o ) {
			return o
		}
		return e
	}

	export type Choose<T> = ( it: T[] ) => Optional<T>
	export type Absolute = URI & { [ brand ]: "Absolute" }

	export type TemplateId = { [ brand ]: "TemplateId" }
	export type Unresolved<T> = { [ brand ]: "Unresolved" }


	export class NoteTemplate {

		constructor(
			public id: TemplateId,
			public content: Unresolved<String>,
			public frontMatter: TemplateMetadata,
			public location?: Absolute
		) {
		}


		name        = () => this.frontMatter.name()
		description = () => this.frontMatter.description()
		destination = () => this.frontMatter.destination()
	}

	export class TemplateMetadata {
		constructor( public content: Map<any, any> ) {
		}

		name        = () => this.content.get( "name" ) as Optional<string>;
		description = () => this.content.get( "description" ) as Optional<string>;
		destination = () => {
			return this.content.get( "filepath" ) as Optional<Unresolved<string>>;
		}
	}

	function toAbsolute( id: TemplateId ): Absolute {
		return id as unknown as Absolute
	}

	function toUnresolved( s: string ): Unresolved<string> {
		return s as unknown as Unresolved<string>
	}

	function toId( abs: Absolute ): TemplateId {
		return abs as unknown as TemplateId
	}

	export async function templateIds( workspace: MyWorkspace ): Promise<TemplateId[]> {
		return workspace.fileSystem
			.find( '.foam/templates/**.md' )
			.then( v => v as unknown as TemplateId[] );
	}

	export async function availableTemplates( workspace: MyWorkspace ): Promise<NoteTemplate[]> {
		return templateIds( workspace )
			.then( async ids => {
					   return await Promise.all(
						   ids.map( id => hydrate( workspace, id ) )
					   )
				   }
			)
	}

	export async function hydrate( workspace: MyWorkspace, id: TemplateId ): Promise<NoteTemplate> {
		const location                = toAbsolute( id )
		const [ attributes, content ] = await workspace.fileSystem.read( location )
			.then( extractFoamTemplateFrontmatterMetadata )

		return new NoteTemplate( id,
								 toUnresolved( content ),
								 new TemplateMetadata( attributes ),
								 location )
	}

}

class VsFileSystem {

	private decoder = new TextDecoder()
	private encoder = new TextEncoder()

	find( include: Glob, exclude: Glob | undefined ): Promise<Absolute[]> {
		return workspace.findFiles(
			include as GlobPattern,
			exclude as GlobPattern ) as unknown as Promise<Absolute[]>
	}

	read( location: Absolute ): Promise<string> {
		return workspace.fs.readFile( location as unknown as Uri )
			.then( c => this.decoder.decode( c ) ) as unknown as Promise<string>

	}

	absolutize = ( path: string ): Absolute => {
		return `file://${ workspace.rootPath }/${ workspace.asRelativePath( path ) }` as unknown as Absolute
	}
}

class VsEditor {

	editingContext = (): EditingContext => {
		const activeTextEditor = window.activeTextEditor;
		if ( !activeTextEditor ) {
			return {
				active: null
			}
		}

		const location = activeTextEditor.document.uri as unknown as Absolute;

		return {
			active: {
				document: {
					selections: [],
					location:   location,
					content:    activeTextEditor.document.getText()
				}
			}
		};
	}
}

class VsUI {
	const
	document = await workspace.openTextDocument( Uri.parse( file.location as unknown as string ) );
	const
	editor   = await window.showTextDocument( document, ViewColumn.Active );

}

export class BaseNoteEngine implements NoteEngine {

	constructor( private fileSystem: FoamFileSystem ) {
	}

	createNote = async ( context: NoteCreation ): Promise<NoteCreationResult> => {

		for ( let destination of context.possibleDestination ) {

			if ( !await this.fileSystem.exists( destination ) ) {

				let content = !context.editingContext.active
							  ? context.content
							  : context.content + "\n" + wikilink( context.editingContext.active.document )

				return await this.fileSystem.create( destination, content )
					.then( res => res
								  ? new CreationSuccess( context, new FoamNote( destination, content ) )
								  : new CreationFailure( context, "An error occurred" ) )
			}

		}

		return new CreationFailure( context, "Ran out of destinations to try" )
	}

}

export class MyWorkspace {

	constructor( public fileSystem: FoamFileSystem,
				 public ui: FoamUI ) {
	}

	resolver = (): Resolver => {
		return new Resolver( new Map(), new Date() )
	}


}


function wikilink( document: Document ): string {
	return `[[${ document.title }]]`;
}

async function resolve( template: NoteTemplate, workspace: MyWorkspace ): Promise<NoteCreation> {

	const resolve = safely( workspace.resolver().resolveText )

	const destination = await resolve( template.destination() as unknown as string ) || "./test.md"
	const content     = await resolve( template.content as unknown as string );

	return {
		possibleDestination: [ workspace.fileSystem.absolutize( destination ) ],
		content:             content,
		source:              template,
		editingContext:      workspace.editingContext()
	}
}

class Templater {
	private window;
	private workspace: MyWorkspace;

	constructor( window, workspace: MyWorkspace ) {
		this.window    = window
		this.workspace = workspace
	}


	createNote = async () => {
		const chosen = await availableTemplates( this.workspace ).then( this.choose )
		if ( chosen ) {
			await resolve( chosen, this.workspace )
				.then( this.workspace.newFile )
				.then( async res => {
					if ( res instanceof CreationSuccess ) {
						await this.workspace.focus( res.note )
					} else {
						await this.window.showWarningMessage( res.message )
					}
				} )
		}

	}


	private choose = async ( templates: NoteTemplate[] ): Promise<Optional<NoteTemplate>> => {

		let choices: MyPick[] = templates.map( t => {
			return {
				templateId:  t.id,
				label:       t.name() || "",
				description: t.location?.toString() || "",
				detail:      t.description() || ""
			}
		} );

		const selected: MyPick = await this.window.showQuickPick( choices, {
			placeHolder: 'Select a template to use.',
		} );

		if ( selected ) {
			return templates.find( t => t.id == selected.templateId );
		}

	}
}

const feature: FoamFeature = {
	activate( context: ExtensionContext ) {

		const templater = new Templater( window, new MyWorkspace() );
		context.subscriptions.push( commands.registerCommand(
			'foam-vscode.create-note-from-template',
			templater.createNote
		) );
	}
};

export default feature;
