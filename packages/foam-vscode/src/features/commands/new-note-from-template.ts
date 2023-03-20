import { FoamResourceProvider, } from "foam-domain";
import { commands, ExtensionContext, QuickPickItem, Uri, window, workspace } from "vscode";
import { FoamFeature } from "../../types";
import { createNoteFromTemplate, listTemplates, NoteTemplate, resolveContent, resolveDestinations, Unresolved, VariableExpansor } from "foam-domain";
import { Optional } from "foam-domain";
import { TextDecoder, TextEncoder } from "util";
import { Absolute, Glob, ReadResult, WriteResult } from "foam-domain";

const decoder = new TextDecoder('utf-8');
const encoder = new TextEncoder();

class VsFileSystem implements FoamResourceProvider {

  find(include: Glob, exclude: Glob | undefined): Promise<Absolute[]> {
    return workspace.findFiles(include, exclude)
      .then(all => {
        return all.map(el => this.normalize(el.toString()));
      }) as unknown as Promise<Absolute[]>; // todo
  }

  read(location: Absolute): Promise<ReadResult> {
    return workspace.fs.readFile(Uri.parse(location.toString()))
      .then(array => {
        return {
          success: true,
          content: decoder.decode(array)
        }
      }
      ) as unknown as Promise<ReadResult> // todo
  }

  root(): Absolute {
    return undefined;
  }

  normalize(path: string): Absolute {
    return path; // todo
  }

  async write(location: Absolute, content: string): Promise<WriteResult> {
    const uri = Uri.parse(location);
    await workspace.fs.writeFile(uri, encoder.encode(content))
    return Promise.resolve({
      success: true,
      location: location
    });
  }

}

const fileSystem = new VsFileSystem()
const resolver: VariableExpansor = {
  resolve(value: Unresolved): Promise<string> {
    return Promise.resolve(value.toString()); // todo
  }
}

async function chooseTemplate(templates: NoteTemplate[]): Promise<Optional<NoteTemplate>> {
  type Item = QuickPickItem & { location: Absolute }

  let choices = templates.map(t => {
    return {
      location: t.location,
      description: t.location?.toString() || "",
      label: t.metadata.get("name")?.toString() || "",
      detail: t.metadata.get("description")?.toString() || ""
    } satisfies Item
  });

  const selected = await window.showQuickPick(choices, {
    placeHolder: 'Select a template to use.',
  });

  if (selected) {
    return templates.find(t => t.location == selected.location);
  }

}

const feature: FoamFeature = {
  activate(context: ExtensionContext) {
    context.subscriptions.push(
      commands.registerCommand('foam-vscode.create-note-from-template', async () => {

        const all = await listTemplates(fileSystem);
        if (all.length === 0) {
          return;
        }

        const chosen = await chooseTemplate(all)
        if (!chosen) {
          return
        }

        let destinations = await resolveDestinations(resolver, chosen)
        while (!destinations || destinations.length == 0) {
          let choice = await window.showInputBox({
            prompt: `No possible destination found. Enter the path for the new note`,
            value: "",
          })
          destinations = [choice]
        }

        const contents = await resolveContent(resolver, chosen)
        return await createNoteFromTemplate(fileSystem, chosen, destinations, contents)
      }

      ));
  }
};
export default feature;
