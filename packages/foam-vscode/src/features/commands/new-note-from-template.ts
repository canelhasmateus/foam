import {
	CreationFailure,
	CreationSuccess,
	Document,
	FoamEditor,
	FoamFileSystem,
	FoamNote,
	NoteCreation,
	NoteCreationResult,
	NoteTemplate,
	Optional, safely,
	TemplateId,
	TemplateMetadata
} from "foam-domain/components";
import { commands, ExtensionContext, QuickPickItem, Uri, window, workspace } from "vscode";
import { Resolver } from "../../services/variable-resolver";
import { extractFoamTemplateFrontmatterMetadata } from "../../utils/template-frontmatter-parser";
import { FoamFeature } from "../../types";
import CreateNoteFromTemplate from "./create-note-from-template";

export interface TemplateEngine {
	ids: () => Promise<TemplateId[]>
	getTemplate: ( id: TemplateId ) => Promise<NoteTemplate>
}

function wikilink( document: Document ): string {
	return `[[${ document.title }]]`;
}

async function choose( templates: NoteTemplate[] ): Promise<Optional<NoteTemplate>> {

	let choices: QuickPickItem[] = templates.map( t => {
		return {
			templateId:  t.id,
			label:       t.name() || "",
			description: t.location?.toString() || "",
			detail:      t.description() || ""
		}
	} );

	const selected: QuickPickItem = await window.showQuickPick( choices, {
		placeHolder: 'Select a template to use.',
	} );

	if ( selected ) {
		return templates.find( t => t.id == selected.templateId );
	}

}

export async function templateIds(): Promise<TemplateId[]> {
	return workspace.findFiles( '.foam/templates/**.md' )
		.then( v => v as unknown as TemplateId[] );
}

export async function availableTemplates(): Promise<NoteTemplate[]> {
	return templateIds().then( async ids => await Promise.all( ids.map( hydrate ) ) )
}

export async function hydrate( id: TemplateId ): Promise<NoteTemplate> {
	const location                = id
	const [ attributes, content ] = await workspace.fs
		.readFile( Uri.parse( location ) )
		.then( extractFoamTemplateFrontmatterMetadata )

	return new NoteTemplate( id, content,
							 new TemplateMetadata( attributes ),
							 location )
}

export class NoteFactory {

	constructor( private fileSystem: FoamFileSystem ) {
	}

	createNote = async ( context: NoteCreation ): Promise<NoteCreationResult> => {

		const failures = []

		for ( let destination of context.possibleDestination ) {

			// Todo: This can be made better.
			let content = !context.editingContext.active
						  ? context.content
						  : context.content + "\n" + wikilink( context.editingContext.active.document )

			const res = await this.fileSystem.write( destination, content )

			if ( res ) {
				return new CreationSuccess( context, new FoamNote( destination, content ) );
			}

			failures.push( res )

		}

		return new CreationFailure( context, "Ran out of destinations to try" )
	}
}

export class CreateNoteFromTemplateFeature implements CreateNoteFromTemplate{

}

export class BaseNoteEngine {

	constructor(
		private fileSystem: FoamFileSystem,
		private editor: FoamEditor,
		private resolver: Resolver,
	) {
	}

	createNoteFromTemplate = async () => {
		const chosen = await availableTemplates().then( choose )
		if ( chosen ) {
			await this.resolve( chosen )
				.then( this.createNote )
				.then( async res => {
					res instanceof CreationSuccess
					? await this.editor.focus( res.note )
					: await this.editor.warn( res.message )
				} )
		}
	}


	resolve = async ( template: NoteTemplate ): Promise<NoteCreation> => {

		const resolve = safely( new Resolver( new Map(), new Date() ).resolveText )

		const destination = await resolve( template.destination() as unknown as string ) || "./test.md"
		const content     = await resolve( template.content as unknown as string );

		return {
			possibleDestination: [ this.fileSystem.absolutize( destination ) ],
			content:             content,
			source:              template,
			editingContext:      this.editor.editingContext()
		}
	}
}

const feature: FoamFeature = {
	activate( context: ExtensionContext ) {

		context.subscriptions.push( commands.registerCommand(
			'foam-vscode.create-note-from-template',
			templater.createNote
		) );
	}
};

export default feature;
