import { getSchema, isValidV1Schema } from "./validators";
import fetchedSchema from "../form-schemas/v1/form-spec.json";
describe("Form spec Validators", () => {
  it("should fetch the schema correctly", async () => {
    const schema = await getSchema(1);
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
    const inCorrectSpec3 = {
      name: "Test name",
      schemaVersion: "v1",
    };
    expect(() => isValidV1Schema(fetchedSchema, correctSpec)).not.toThrow();
    expect(() => isValidV1Schema(fetchedSchema, inCorrectSpec1)).toThrow();
    expect(() => isValidV1Schema(fetchedSchema, inCorrectSpec2)).toThrow();
    expect(() => isValidV1Schema(fetchedSchema, inCorrectSpec3)).toThrow();
  });
});
