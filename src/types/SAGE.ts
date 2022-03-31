import { Questionnaire } from './fhir';

export enum SAGEMessageID {
    TriggerSend = "SAGETriggerSend",
    SendToStructor = "SAGESendToStructor",
}
export interface SAGESendToStructorMsg {
    msgId: SAGEMessageID.SendToStructor,
    questionnaireResource: Questionnaire,
}
export interface SAGETriggerSendMsg {
    msgId: SAGEMessageID.TriggerSend,
}

export enum StructorMessageID {
    Ready = "StructorReady",
    SendToSAGE = "StructorSendToSAGE",
}
export interface StructorReadyMsg {
    msgId: StructorMessageID.Ready,
    readyType: "start" | "load",
}
export interface StructorSendToSAGEMsg {
    msgId: StructorMessageID.SendToSAGE,
    questionnaireStr: string,
}