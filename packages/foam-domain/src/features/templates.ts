import { brand, From, Optional, Sourced } from "../types";
import { Absolute } from "./files";
import { createNote, CreateNoteResult } from "./note";
import { FoamResourceProvider } from "../components";

export type Unresolved = { [brand]: "Unresolved" }

export type VariableExpansor = {
  resolve: (value: Unresolved) => Promise<string>;

}

export async function resolveDestinations(resolver: VariableExpansor,
                                          template: NoteTemplate): Promise<string[]> {
  const destinations: string[] = []

  const filepath = template.metadata.get("filepath");
  if (filepath) {
    const dest = await resolver.resolve(filepath)
    destinations.push(dest)
  }

  return destinations;
}

export async function resolveContent(resolver: VariableExpansor,
                                     template: NoteTemplate): Promise<string> {
  return await resolver.resolve(template.content);
}

// Templates
export type NoteTemplate = {
  location: Absolute
  content: Unresolved
  metadata: TemplateMetadata,
}
export type TemplateMetadata = {
  get: <K extends keyof KnownAttributes | string>(key: K) => Optional<From<KnownAttributes, K, string>>
}
type KnownAttributes = {
  name: Unresolved,
  description: Unresolved,
  filepath: Unresolved
}

// Actions
function parseMetadata(content: string) {
  return [new Map(), ""]
}

export async function readTemplate(fileSystem: FoamResourceProvider, location: Absolute): Promise<NoteTemplate> {

  return fileSystem.read(location).then(s => {
    const [attributes, content] = parseMetadata(location)
    return {
      // todo
      content: content as unknown as Unresolved,
      location: location as unknown as Absolute,
      metadata: attributes as unknown as TemplateMetadata
    }
  })
}

export async function listTemplates(fileSystem: FoamResourceProvider): Promise<NoteTemplate[]> {
  return fileSystem.find('.foam/templates/**.md').then(locations => {
    return Promise.all(
      locations.map(loc => readTemplate(fileSystem, loc))
    )
  });
}


export type CreateFromTemplateResult = CreateNoteResult & Sourced<NoteTemplate>

export async function createNoteFromTemplate(fileSystem: FoamResourceProvider,
                                             source: NoteTemplate,
                                             possibleDestinations: Absolute[],
                                             content: string): Promise<CreateFromTemplateResult> {

  const result = await createNote(fileSystem, possibleDestinations, content)
  return {
    source: source,
    ...result
  }
}