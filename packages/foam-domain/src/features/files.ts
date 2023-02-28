import { Failure, Success } from "../types";

export type Glob = string
export type Absolute = string

export type ReadResult = Success<{ content: string }> | Failure<{}>;

export type WriteFailure = Failure<{ location: Absolute }>;
export type WriteSuccess = Success<{ location: Absolute }>;
export type WriteResult = WriteFailure | WriteSuccess;

