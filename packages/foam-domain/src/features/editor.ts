import { Absolute } from "./files"
import { Optional } from "../types";

export type Document = {
	location: Absolute,
}
export type EditingWindow = {
	document: Document
}

export type EditingContext = {
	active: Optional<EditingWindow>
}
