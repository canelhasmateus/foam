import { Absolute } from "./files";
import { FoamResourceProvider } from "../components";
import { Failure, Success } from "../types";
export type FoamNote = {
    location: Absolute;
    content: string;
};
export type CreateNoteResult = Success<{
    note: FoamNote;
}> | Failure<{
    destinations: Absolute[];
    content: string;
}>;
export declare function createNote(fileSystem: FoamResourceProvider, possibleDestination: Absolute[], content: string): Promise<CreateNoteResult>;
//# sourceMappingURL=note.d.ts.map