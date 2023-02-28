import { Absolute, Glob, ReadResult, WriteResult } from "./features/files";

export interface FoamSettings {
}

export interface FoamResourceProvider {
  normalize: (path: string) => Absolute
  root: () => Absolute
  find: (include: Glob, exclude?: Glob) => Promise<Absolute[]>
  read: (location: Absolute) => Promise<ReadResult>
  write: (location: Absolute, content: string) => Promise<WriteResult>
}

export type FoamSystem = {
  settings: FoamSettings
  resourceProviders: FoamResourceProvider

}