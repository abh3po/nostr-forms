import { AnswerSettings, AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { IQuestion } from "../typeDefs";
import { makeTag } from "../../../utils/utility";

type Field = [string, string, string, string, string[][] | null, string];
export const generateQuestion = (
  primitive: string = "text",
  label: string | null = null,
  choices?: Array<Array<string>>,
  answerSettings?: AnswerSettings
): Field => {
  return [
    "field",
    makeTag(6),
    primitive,
    label || "Click here to edit",
    choices || null,
    JSON.stringify(answerSettings),
  ];
};

export const websocketUrlPattern =
  /^(wss?:\/\/)([^:@/]+(?::[^@/]+)?@)?([^:/]+)(?::(\d+))?(\/.*)?$/;

export function isValidWebSocketUrl(url: string): boolean {
  const match = url.match(websocketUrlPattern);
  if (!match) {
    return false;
  }
  const [, scheme, , , port] = match;

  if (!scheme || (scheme !== "ws://" && scheme !== "wss://")) {
    return false;
  }
  if (port !== undefined) {
    const portNumber = parseInt(port, 10);
    if (!(0 <= portNumber && portNumber <= 65535)) {
      return false;
    }
  }

  return true;
}

export const areArraysSame = (arr1: Array<string>, arr2: Array<string>) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((element, index) => element === arr2[index]);
};

export const isGreaterThanOrEqual = (val: number, compareVal: number) =>
  val >= compareVal;

export const isLessThanOrEqual = (val: number, compareVal: number) =>
  val <= compareVal;

export const getNumValue = (val: string | number): number => {
  let newVal = val;
  if (typeof newVal === "string") {
    newVal = newVal.length;
  }
  return newVal;
};
