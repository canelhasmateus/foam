import { fromVsCodeUri } from "../utils/vsc-utils";
import { brand } from "../../../foam-domain/out/src";
import { URI } from "../core/model/uri";

export type Optional<T> = T | null | undefined
export type Choose<T> = ( it: T[] ) => Optional<T>
export type Absolute = URI & { [ brand ]: "Absolute" }

export type TemplateId = { [ brand ]: "TemplateId" }
export type Unresolved<T> = { [ brand ]: "Unresolved" }

export class NoteTemplate {
	id: TemplateId;
	content: Unresolved<String>;

	location?: URI;
	frontMatter?: TemplateMetadata;
	name        = () => this.frontMatter.name()
	description = () => this.frontMatter.description()
	destination = () => this.frontMatter.destination()
}

export class TemplateMetadata {
	content: Map<any, any>

	name        = () => this.content.get( "name" ) as Optional<string>;
	description = () => this.content.get( "description" ) as Optional<string>;
	destination = () => this.content.get( "filePath" ) as Optional<Unresolved<string>>;
}


export async function templateIds( workspace ): Promise<TemplateId[]> {
	return workspace
		.findFiles( '.foam/templates/**.md', null )
		.then( v => v.map( uri => fromVsCodeUri( uri ) as unknown as TemplateId ) );
}

export async function availableTemplates( workspace ): Promise<NoteTemplate[]> {
	return templateIds( workspace ).then( hydrateAll )
}

export function hydrate( id: TemplateId ): Promise<NoteTemplate> {
	return new Promise( () => {
		return {} as NoteTemplate
	} )

}

export function hydrateAll( templates: TemplateId[] ): Promise<NoteTemplate[]> {
	return Promise.all( templates.map( hydrate ) )
}

export class TemplateEngine {

	private workspace

	constructor( workspace ) {
		this.workspace = workspace
	}

	async templates(): Promise<NoteTemplate[]> {
		return availableTemplates( this.workspace )
	}

	async ids(): Promise<TemplateId[]> {
		return templateIds( this.workspace )
	}

	async createNote() {


	}

}

export type CreationResult = "ok" | "exists"

export type CreationContext = {
	destination: Absolute,
	content: String
	source?: NoteTemplate,
}

export type NoteCreation = {
	result: CreationResult,
	context: CreationContext
}

export interface NoteEngine {

	create( location: Absolute, content: string ): Promise<NoteCreation>
}

