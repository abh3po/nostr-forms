import type { DeletionEvent } from "@/types/nip9";
import typia from "typia";
export const validateDeletionEvent = (input: any): typia.IValidation<DeletionEvent> => {
    const errors = [] as any[];
    const __is = (input: any): input is DeletionEvent => {
        const $ip0 = (input: any) => {
            const array = input;
            const tuplePredicators = [
                [
                    (top: any[]): any => top.length === 3 && "a" === top[0] && ("string" === typeof top[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?:(.*):(.*)/).test(top[1])) && "string" === typeof top[2],
                    (entire: any[]): any => entire.length === 3 && "a" === entire[0] && ("string" === typeof entire[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?:(.*):(.*)/).test(entire[1])) && "string" === typeof entire[2]
                ] as const,
                [
                    (top: any[]): any => top.length === 3 && "e" === top[0] && "string" === typeof top[1] && "string" === typeof top[2],
                    (entire: any[]): any => entire.length === 3 && "e" === entire[0] && "string" === typeof entire[1] && "string" === typeof entire[2]
                ] as const,
                [
                    (top: any[]): any => top.length === 2 && "k" === top[0] && ("string" === typeof top[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/).test(top[1])),
                    (entire: any[]): any => entire.length === 2 && "k" === entire[0] && ("string" === typeof entire[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/).test(entire[1]))
                ] as const,
                [
                    (top: any[]): any => top.length === 2 && "a" === top[0] && ("string" === typeof top[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?:(.*):(.*)/).test(top[1])),
                    (entire: any[]): any => entire.length === 2 && "a" === entire[0] && ("string" === typeof entire[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?:(.*):(.*)/).test(entire[1]))
                ] as const,
                [
                    (top: any[]): any => top.length === 2 && "e" === top[0] && "string" === typeof top[1],
                    (entire: any[]): any => entire.length === 2 && "e" === entire[0] && "string" === typeof entire[1]
                ] as const,
                [
                    (top: any[]): any => "string" === typeof top[0] && (Array.isArray(top.slice(1)) && top.slice(1).every((elem: any) => "string" === typeof elem)),
                    (entire: any[]): any => "string" === typeof entire[0] && (Array.isArray(entire.slice(1)) && entire.slice(1).every((elem: any) => "string" === typeof elem))
                ] as const
            ];
            for (const pred of tuplePredicators)
                if (pred[0](array))
                    return pred[1](array);
            return false;
        };
        const $io0 = (input: any): boolean => 5 === input.kind && (Array.isArray(input.tags) && input.tags.every((elem: any) => Array.isArray(elem) && ($ip0(elem) || false))) && "string" === typeof input.content && ("string" === typeof input.id && RegExp(/^[0-9a-f]{64}$/).test(input.id)) && ("string" === typeof input.pubkey && RegExp(/^[0-9a-f]{64}$/).test(input.pubkey)) && "number" === typeof input.created_at && ("string" === typeof input.sig && RegExp(/^[0-9a-f]{128}$/).test(input.sig));
        return "object" === typeof input && null !== input && $io0(input);
    };
    if (false === __is(input)) {
        const $report = (typia.createValidate as any).report(errors);
        ((input: any, _path: string, _exceptionable: boolean = true): input is DeletionEvent => {
            const $vp0 = (input: any, _path: string, _exceptionable: boolean = true) => {
                const array = input;
                const tuplePredicators = [
                    [
                        (top: any[]): any => top.length === 3 && [
                            "a" === top[0],
                            "string" === typeof top[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?:(.*):(.*)/).test(top[1]),
                            "string" === typeof top[2]
                        ].every((flag: boolean) => flag),
                        (entire: any[]): any => (entire.length === 3 || $report(_exceptionable, {
                            path: _path,
                            expected: "[\"a\", `${number}:${string}:${string}`, string]",
                            value: entire
                        })) && [
                            "a" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"a\"",
                                value: entire[0]
                            }),
                            "string" === typeof entire[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?:(.*):(.*)/).test(entire[1]) || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "`${number}:${string}:${string}`",
                                value: entire[1]
                            }),
                            "string" === typeof entire[2] || $report(_exceptionable, {
                                path: _path + "[2]",
                                expected: "string",
                                value: entire[2]
                            })
                        ].every((flag: boolean) => flag)
                    ] as const,
                    [
                        (top: any[]): any => top.length === 3 && [
                            "e" === top[0],
                            "string" === typeof top[1],
                            "string" === typeof top[2]
                        ].every((flag: boolean) => flag),
                        (entire: any[]): any => (entire.length === 3 || $report(_exceptionable, {
                            path: _path,
                            expected: "[\"e\", string, string]",
                            value: entire
                        })) && [
                            "e" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"e\"",
                                value: entire[0]
                            }),
                            "string" === typeof entire[1] || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "string",
                                value: entire[1]
                            }),
                            "string" === typeof entire[2] || $report(_exceptionable, {
                                path: _path + "[2]",
                                expected: "string",
                                value: entire[2]
                            })
                        ].every((flag: boolean) => flag)
                    ] as const,
                    [
                        (top: any[]): any => top.length === 2 && [
                            "k" === top[0],
                            "string" === typeof top[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/).test(top[1])
                        ].every((flag: boolean) => flag),
                        (entire: any[]): any => (entire.length === 2 || $report(_exceptionable, {
                            path: _path,
                            expected: "[\"k\", `${number}`]",
                            value: entire
                        })) && [
                            "k" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"k\"",
                                value: entire[0]
                            }),
                            "string" === typeof entire[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/).test(entire[1]) || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "`${number}`",
                                value: entire[1]
                            })
                        ].every((flag: boolean) => flag)
                    ] as const,
                    [
                        (top: any[]): any => top.length === 2 && [
                            "a" === top[0],
                            "string" === typeof top[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?:(.*):(.*)/).test(top[1])
                        ].every((flag: boolean) => flag),
                        (entire: any[]): any => (entire.length === 2 || $report(_exceptionable, {
                            path: _path,
                            expected: "[\"a\", `${number}:${string}:${string}`]",
                            value: entire
                        })) && [
                            "a" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"a\"",
                                value: entire[0]
                            }),
                            "string" === typeof entire[1] && RegExp(/^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?:(.*):(.*)/).test(entire[1]) || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "`${number}:${string}:${string}`",
                                value: entire[1]
                            })
                        ].every((flag: boolean) => flag)
                    ] as const,
                    [
                        (top: any[]): any => top.length === 2 && [
                            "e" === top[0],
                            "string" === typeof top[1]
                        ].every((flag: boolean) => flag),
                        (entire: any[]): any => (entire.length === 2 || $report(_exceptionable, {
                            path: _path,
                            expected: "[\"e\", string]",
                            value: entire
                        })) && [
                            "e" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"e\"",
                                value: entire[0]
                            }),
                            "string" === typeof entire[1] || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "string",
                                value: entire[1]
                            })
                        ].every((flag: boolean) => flag)
                    ] as const,
                    [
                        (top: any[]): any => [
                            "string" === typeof top[0]
                        ].every((flag: boolean) => flag) && (Array.isArray(top.slice(1)) && top.slice(1).map((elem: any, _index4: number) => "string" === typeof elem).every((flag: boolean) => flag)),
                        (entire: any[]): any => [
                            "string" === typeof entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "string",
                                value: entire[0]
                            })
                        ].every((flag: boolean) => flag) && ((Array.isArray(entire.slice(1)) || $report(_exceptionable, {
                            path: _path,
                            expected: "...string",
                            value: entire.slice(1)
                        })) && entire.slice(1).map((elem: any, _index5: number) => "string" === typeof elem || $report(_exceptionable, {
                            path: _path + "[" + (1 + _index5) + "]",
                            expected: "string",
                            value: elem
                        })).every((flag: boolean) => flag) || $report(_exceptionable, {
                            path: _path,
                            expected: "...string",
                            value: entire.slice(1)
                        }))
                    ] as const
                ];
                for (const pred of tuplePredicators)
                    if (pred[0](array))
                        return pred[1](array);
                return $report(_exceptionable, {
                    path: _path,
                    expected: "([\"a\", `${number}:${string}:${string}`, recommendedRelayUrl: string] | [\"e\", eventId: string, recommendedRelayUrl: string] | [\"k\", value: `${number}`] | [\"a\", `${number}:${string}:${string}`] | [\"e\", eventId: string] | [string, ...string[]])",
                    value: input
                });
            };
            const $vo0 = (input: any, _path: string, _exceptionable: boolean = true): boolean => [5 === input.kind || $report(_exceptionable, {
                    path: _path + ".kind",
                    expected: "5",
                    value: input.kind
                }), (Array.isArray(input.tags) || $report(_exceptionable, {
                    path: _path + ".tags",
                    expected: "Array<[string, ...string[]] | WithRecommendedRelayUrl<[\"e\", eventId: string]> | WithRecommendedRelayUrl<[\"a\", `${number}:${string}:${string}`]> | [...]>",
                    value: input.tags
                })) && input.tags.map((elem: any, _index1: number) => (Array.isArray(elem) || $report(_exceptionable, {
                    path: _path + ".tags[" + _index1 + "]",
                    expected: "([\"a\", `${number}:${string}:${string}`, recommendedRelayUrl: string] | [\"a\", `${number}:${string}:${string}`] | [\"e\", eventId: string, recommendedRelayUrl: string] | [\"e\", eventId: string] | [\"k\", value: `${number}`] | [string, ...string[]])",
                    value: elem
                })) && ($vp0(elem, _path + ".tags[" + _index1 + "]", true && _exceptionable) || $report(_exceptionable, {
                    path: _path + ".tags[" + _index1 + "]",
                    expected: "[\"a\", `${number}:${string}:${string}`, recommendedRelayUrl: string] | [\"e\", eventId: string, recommendedRelayUrl: string] | [\"k\", value: `${number}`] | [\"a\", `${number}:${string}:${string}`] | [\"e\", eventId: string] | [string, ...string[]]",
                    value: elem
                })) || $report(_exceptionable, {
                    path: _path + ".tags[" + _index1 + "]",
                    expected: "([\"a\", `${number}:${string}:${string}`, recommendedRelayUrl: string] | [\"a\", `${number}:${string}:${string}`] | [\"e\", eventId: string, recommendedRelayUrl: string] | [\"e\", eventId: string] | [\"k\", value: `${number}`] | [string, ...string[]])",
                    value: elem
                })).every((flag: boolean) => flag) || $report(_exceptionable, {
                    path: _path + ".tags",
                    expected: "Array<[string, ...string[]] | WithRecommendedRelayUrl<[\"e\", eventId: string]> | WithRecommendedRelayUrl<[\"a\", `${number}:${string}:${string}`]> | [...]>",
                    value: input.tags
                }), "string" === typeof input.content || $report(_exceptionable, {
                    path: _path + ".content",
                    expected: "string",
                    value: input.content
                }), "string" === typeof input.id && (RegExp(/^[0-9a-f]{64}$/).test(input.id) || $report(_exceptionable, {
                    path: _path + ".id",
                    expected: "string & Pattern<\"^[0-9a-f]{64}$\">",
                    value: input.id
                })) || $report(_exceptionable, {
                    path: _path + ".id",
                    expected: "(string & Pattern<\"^[0-9a-f]{64}$\">)",
                    value: input.id
                }), "string" === typeof input.pubkey && (RegExp(/^[0-9a-f]{64}$/).test(input.pubkey) || $report(_exceptionable, {
                    path: _path + ".pubkey",
                    expected: "string & Pattern<\"^[0-9a-f]{64}$\">",
                    value: input.pubkey
                })) || $report(_exceptionable, {
                    path: _path + ".pubkey",
                    expected: "(string & Pattern<\"^[0-9a-f]{64}$\">)",
                    value: input.pubkey
                }), "number" === typeof input.created_at || $report(_exceptionable, {
                    path: _path + ".created_at",
                    expected: "number",
                    value: input.created_at
                }), "string" === typeof input.sig && (RegExp(/^[0-9a-f]{128}$/).test(input.sig) || $report(_exceptionable, {
                    path: _path + ".sig",
                    expected: "string & Pattern<\"^[0-9a-f]{128}$\">",
                    value: input.sig
                })) || $report(_exceptionable, {
                    path: _path + ".sig",
                    expected: "(string & Pattern<\"^[0-9a-f]{128}$\">)",
                    value: input.sig
                })].every((flag: boolean) => flag);
            return ("object" === typeof input && null !== input || $report(true, {
                path: _path + "",
                expected: "DeletionEvent",
                value: input
            })) && $vo0(input, _path + "", true) || $report(true, {
                path: _path + "",
                expected: "DeletionEvent",
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
