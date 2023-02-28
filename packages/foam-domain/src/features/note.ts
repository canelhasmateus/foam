import { Absolute } from "./files";
import { FoamResourceProvider } from "../components";
import { Failure, Success } from "../types";

export type FoamNote = {
  location: Absolute,
  content: string
}

// Actions
export type CreateNoteResult =
  Success<{ note: FoamNote }> |
  Failure<{ destinations: Absolute[], content: string }> // todo add more things?
export async function createNote(fileSystem: FoamResourceProvider,
                                 possibleDestination: Absolute[],
                                 content: string): Promise<CreateNoteResult> {

  for (let destination of possibleDestination) {
    const res = await fileSystem.write(destination, content)

    if (res.success) {
      return {
        success: true,
        note: {
          location: destination,
          content: content
        }
      }
    }
  }

  return {
    success: false,
    destinations: possibleDestination,
    content: content
  }
}
