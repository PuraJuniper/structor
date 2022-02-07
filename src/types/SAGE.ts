import { Questionnaire } from './fhir';

export interface SAGESendToStructorEvData {
    questionnaireResource: Questionnaire // Hope this is the same as @types/fhir/r4 which is used by SAGE
}
export const SAGESendToStructorEvName = "SAGESendToStructor";
export type SAGESendToStructorEv = CustomEvent<SAGESendToStructorEvData>;

export interface StructorReadyEvNameData {
    readyType: "start" | "load"
}
export const StructorReadyEvName = "StructorReady";
export type StructorReadyEv = CustomEvent<StructorReadyEvNameData>;

export const SAGETriggerSendEvName = "SAGETriggerSend";
export type SAGETriggerSendEv = CustomEvent<unknown>;

export interface StructorSendToSAGEEvData {
    questionnaireStr: string
}
export const StructorSendToSAGEEvName = "StructorSendToSAGE"
export type StructorSendToSAGEEv = CustomEvent<StructorSendToSAGEEvData>;