import {
  makeTag,
  constructFormUrl,
  constructResponseUrl,
  detectFormVersion,
} from "./utils";

describe("makeTag", () => {
  test("should generate a tag with the specified length", () => {
    const length = 10;
    const tag = makeTag(length);
    expect(tag).toHaveLength(length);
  });

  test("should generate a tag containing only alphanumeric characters", () => {
    const length = 20;
    const tag = makeTag(length);
    expect(tag).toMatch(/^[A-Za-z0-9]+$/);
  });

  test("should return an empty string when length is 0", () => {
    const tag = makeTag(0);
    expect(tag).toBe("");
  });

  test("should return an empty string when length is negative", () => {
    const tag = makeTag(-5);
    expect(tag).toBe("");
  });

  test("should return an empty string when length is not a number", () => {
    const tag = makeTag("invalid");
    expect(tag).toBe("");
  });
});

describe("constructFormUrl function", () => {
  test("Construct URL with a valid public key", () => {
    const publicKey = "validPublicKey";
    const expectedURL = `https://formstr.app/v1/fill/${publicKey}`;
    const generatedURL = constructFormUrl(publicKey);
    expect(generatedURL).toBe(expectedURL);
  });

  test("Construct URL with an empty public key throws an error", () => {
    const publicKey = "";
    expect(() => constructFormUrl(publicKey)).toThrow("public key is required");
  });
});

describe("constructResponseUrl function", () => {
  test("Construct URL with a valid private key", () => {
    const privateKey = "validPrivateKey";
    const expectedURL = `https://formstr.app/forms/${privateKey}/responses`;
    const generatedURL = constructResponseUrl(privateKey);
    expect(generatedURL).toBe(expectedURL);
  });

  test("Construct URL with an empty private key throws an error", () => {
    const privateKey = "";
    expect(() => constructResponseUrl(privateKey)).toThrow(
      "public key is required",
    );
  });
});

describe("detectFormVersion", () => {
  it("returns form.schemaVersion if available", () => {
    const formWithSchemaVersion = {
      schemaVersion: "v1",
      otherProperty: "value",
    };
    expect(detectFormVersion(formWithSchemaVersion)).toBe("v1");
  });

  it("returns form.schemaLink if schemaVersion is not available", () => {
    const formWithSchemaLink = { schemaLink: "v2", otherProperty: "value" };
    expect(detectFormVersion(formWithSchemaLink)).toBe("v2");
  });

  it('returns "v0" if both schemaVersion and schemaLink are not available', () => {
    const formWithoutSchemaInfo = { otherProperty: "value" };
    expect(detectFormVersion(formWithoutSchemaInfo)).toBe("v0");
  });
});
