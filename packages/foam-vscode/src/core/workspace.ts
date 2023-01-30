import { FoamFileSystem, Absolute, System, Glob, FoamEditor, Document, WriteResult, ReadResult } from "foam-domain/components";
import { TextDecoder, TextEncoder } from "util";
import { Uri, ViewColumn, window, workspace } from "vscode";

class VscFileSystem implements FoamFileSystem {

	system: System.File;

	private decoder = new TextDecoder()
	private encoder = new TextEncoder()

	root(): Absolute {
		return workspace.rootPath as unknown as Absolute
	}

	absolutize( path: string ): Absolute {
		return `file://${ workspace.rootPath }/${ workspace.asRelativePath( path ) }` as unknown as Absolute
	}

	find( include: Glob, exclude: Glob | undefined ): Promise<Absolute[]> {
		return workspace
			.findFiles( include, exclude ) as unknown as Promise<Absolute[]>
	}

	read( location: Absolute ): Promise<ReadResult> {
		return workspace.fs
			.readFile( Uri.parse( location ) )
			.then( c => this.decoder.decode( c ) ) as unknown as Promise<string>
	}

	write( location: Absolute, content: string ): Promise<WriteResult> {
		return workspace.fs
			.writeFile( Uri.parse( location ), this.encoder.encode( content ) ) as unknown as Promise<boolean>
	}

}

class VsEditor implements FoamEditor {

	system = System.Editor;

	focus = async ( file: Document ): Promise<void> => {
		const document = await workspace.openTextDocument( Uri.parse( file.location as unknown as string ) );
		return window.showTextDocument( document, ViewColumn.Active )
			.then();
	}

	// editingContext = (): EditingContext => {
	// 	const activeTextEditor = window.activeTextEditor;
	// 	if ( !activeTextEditor ) {
	// 		return {
	// 			active: null
	// 		}
	// 	}
	//
	// 	const location = activeTextEditor.document.uri as unknown as Absolute;
	//
	// 	return {
	// 		active: {
	// 			document: {
	// 				selections: [],
	// 				location:   location,
	// 				content:    activeTextEditor.document.getText()
	// 			}
	// 		}
	// 	};
	// }

}
