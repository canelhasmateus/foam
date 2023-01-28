import { commands, ExtensionContext, QuickPickItem, window } from 'vscode';
import { Absolute, availableTemplates, CreationContext, NoteTemplate, Optional, TemplateId } from "../../services/new-templates";
import { URI } from "../../core/model/uri";
import { FoamFeature } from "../../types";


type MyPick = QuickPickItem & { templateId: TemplateId }
type Note = {}

interface MyWorkspace {
	resolve: ( path: URI ) => Absolute;
	newFile: ( destination: Absolute, content: String ) => Promise<Note>
	saveFile: ( file: Note ) => Promise<Note>
	focus: ( file: Note ) => Promise<void>
}

class Templater {
	private window;
	private workspace: MyWorkspace;

	constructor( window, workspace ) {
		this.window    = window
		this.workspace = workspace
	}

	async createNote() {

		const templateContext = await availableTemplates( this.workspace )
			.then( this.choose )
			.then( this.resolve )

		await this.workspace.newFile( templateContext.destination, templateContext.content )
			.then( this.workspace.saveFile )
			.then( this.workspace.focus )

	}

	private resolve( template: NoteTemplate ): CreationContext {
		const unresolved  = template.destination() as unknown as URI;
		const destination = this.workspace.resolve( unresolved );
		return {} as CreationContext
	}

	private async choose( templates: NoteTemplate[] ): Promise<Optional<NoteTemplate>> {

		let choices: MyPick[] = templates.map( t => {
			return {
				templateId:  t.id,
				label:       t.name(),
				description: t.location.toString(),
				detail:      t.description()
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

		const templater = new Templater( window, {} );

		context.subscriptions.push( commands.registerCommand(
			'foam-vscode.create-note-from-template',
			templater.createNote
		) );
	}
};

export default feature;
