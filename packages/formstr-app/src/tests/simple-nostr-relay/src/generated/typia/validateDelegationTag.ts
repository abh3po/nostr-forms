import type { DelegationTag } from "@/types/nip26";
import typia from "typia";
export const validateDelegationTag = (input: any): typia.IValidation<DelegationTag> => {
    const errors = [] as any[];
    const __is = (input: any): input is DelegationTag => {
        return Array.isArray(input) && (input.length === 4 && "delegation" === input[0] && "string" === typeof input[1] && "string" === typeof input[2] && "string" === typeof input[3]);
    };
    if (false === __is(input)) {
        const $report = (typia.createValidate as any).report(errors);
        ((input: any, _path: string, _exceptionable: boolean = true): input is DelegationTag => {
            return (Array.isArray(input) || $report(true, {
                path: _path + "",
                expected: "DelegationTag",
                value: input
            })) && ((input.length === 4 || $report(true, {
                path: _path + "",
                expected: "[\"delegation\", string, string, string]",
                value: input
            })) && [
                "delegation" === input[0] || $report(true, {
                    path: _path + "[0]",
                    expected: "\"delegation\"",
                    value: input[0]
                }),
                "string" === typeof input[1] || $report(true, {
                    path: _path + "[1]",
                    expected: "string",
                    value: input[1]
                }),
                "string" === typeof input[2] || $report(true, {
                    path: _path + "[2]",
                    expected: "string",
                    value: input[2]
                }),
                "string" === typeof input[3] || $report(true, {
                    path: _path + "[3]",
                    expected: "string",
                    value: input[3]
                })
            ].every((flag: boolean) => flag)) || $report(true, {
                path: _path + "",
                expected: "DelegationTag",
                value: input
            });
        })(input, "$input", true);
    }
    const success = 0 === errors.length;
    return {
        success,
        errors,
        data: success ? input : undefined
    } as any;
};
