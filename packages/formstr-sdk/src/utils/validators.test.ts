import { getSchema, isValidResponse, isValidSpec } from "./validators";
import fetchedSchema from "../form-schemas/v1/form-spec.json";
import responseSchema from "../form-schemas/v1/response-spec.json";
describe("Form spec Validators", () => {
  it("should fetch the schema correctly", async () => {
    const schema = await getSchema("v1");
    expect(fetchedSchema).toBe(schema);
  });

  it("should validate against the schema correctly", () => {
    const correctSpec = {
      name: "Test name",
      schemaVersion: "v1",
      fields: [
        {
          question: "test question",
          answerType: "shortText",
        },
      ],
    };
    const inCorrectSpec1 = {
      schemaVersion: "v1",
      fields: [
        {
          question: "test question",
          answerType: "shortText",
        },
      ],
    };
    const inCorrectSpec2 = {
      name: "Test name",
      xyz: "323",
      schemaVersion: "v1",
      fields: [
        {
          question: "test question",
        },
      ],
    };
    expect(() => isValidSpec(fetchedSchema, correctSpec)).not.toThrow();
    expect(() => isValidSpec(fetchedSchema, inCorrectSpec1)).toThrow();
    expect(() => isValidSpec(fetchedSchema, inCorrectSpec2)).toThrow();
  });

  describe("Response spec validator", () => {
    it("should validate against schema correctly", () => {
      const correctSpec = {
        questionId: "123456",
        answer: "ABCD",
      };
      const incorrectSpec = {
        questionID: 5,
        answer: 6,
      };
      expect(isValidResponse(responseSchema, correctSpec)).toBe(true);
      expect(isValidResponse(responseSchema, incorrectSpec)).toBe(false);
    });
  });
});
