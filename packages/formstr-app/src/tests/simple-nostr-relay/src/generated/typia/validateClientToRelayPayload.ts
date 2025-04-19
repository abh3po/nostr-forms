import type { ClientToRelayPayload } from "@/types/core";
import typia from "typia";
export const validateClientToRelayPayload = (input: any): typia.IValidation<ClientToRelayPayload> => {
    const errors = [] as any[];
    const __is = (input: any): input is ClientToRelayPayload => {
        const $ip0 = (input: any) => {
            const array = input;
            const tuplePredicators = [
                [
                    (top: any[]): any => top.length === 2 && "EVENT" === top[0] && ("object" === typeof top[1] && null !== top[1] && $io0(top[1])),
                    (entire: any[]): any => entire.length === 2 && "EVENT" === entire[0] && ("object" === typeof entire[1] && null !== entire[1] && $io0(entire[1]))
                ] as const,
                [
                    (top: any[]): any => "REQ" === top[0] && "string" === typeof top[1] && (Array.isArray(top.slice(2)) && top.slice(2).every((elem: any) => "object" === typeof elem && null !== elem && false === Array.isArray(elem) && $io1(elem))),
                    (entire: any[]): any => "REQ" === entire[0] && "string" === typeof entire[1] && (Array.isArray(entire.slice(2)) && entire.slice(2).every((elem: any) => "object" === typeof elem && null !== elem && false === Array.isArray(elem) && $io1(elem)))
                ] as const,
                [
                    (top: any[]): any => top.length === 2 && "AUTH" === top[0] && ("object" === typeof top[1] && null !== top[1] && $io0(top[1])),
                    (entire: any[]): any => entire.length === 2 && "AUTH" === entire[0] && ("object" === typeof entire[1] && null !== entire[1] && $io0(entire[1]))
                ] as const,
                [
                    (top: any[]): any => top.length === 2 && "CLOSE" === top[0] && "string" === typeof top[1],
                    (entire: any[]): any => entire.length === 2 && "CLOSE" === entire[0] && "string" === typeof entire[1]
                ] as const,
                [
                    (top: any[]): any => "COUNT" === top[0] && "string" === typeof top[1] && (Array.isArray(top.slice(2)) && top.slice(2).every((elem: any) => "object" === typeof elem && null !== elem && false === Array.isArray(elem) && $io1(elem))),
                    (entire: any[]): any => "COUNT" === entire[0] && "string" === typeof entire[1] && (Array.isArray(entire.slice(2)) && entire.slice(2).every((elem: any) => "object" === typeof elem && null !== elem && false === Array.isArray(elem) && $io1(elem)))
                ] as const
            ];
            for (const pred of tuplePredicators)
                if (pred[0](array))
                    return pred[1](array);
            return false;
        };
        const $io0 = (input: any): boolean => "string" === typeof input.id && RegExp(/^[0-9a-f]{64}$/).test(input.id) && ("string" === typeof input.pubkey && RegExp(/^[0-9a-f]{64}$/).test(input.pubkey)) && "number" === typeof input.created_at && ("number" === typeof input.kind && (0 <= input.kind && input.kind <= 65535)) && (Array.isArray(input.tags) && input.tags.every((elem: any) => Array.isArray(elem) && ("string" === typeof elem[0] && (Array.isArray(elem.slice(1)) && elem.slice(1).every((elem: any) => "string" === typeof elem))))) && "string" === typeof input.content && ("string" === typeof input.sig && RegExp(/^[0-9a-f]{128}$/).test(input.sig));
        const $io1 = (input: any): boolean => (undefined === input.ids || Array.isArray(input.ids) && input.ids.every((elem: any) => "string" === typeof elem)) && (undefined === input.authors || Array.isArray(input.authors) && input.authors.every((elem: any) => "string" === typeof elem)) && (undefined === input.kinds || Array.isArray(input.kinds) && input.kinds.every((elem: any) => "number" === typeof elem)) && (undefined === input.since || "number" === typeof input.since) && (undefined === input.until || "number" === typeof input.until) && (undefined === input.limit || "number" === typeof input.limit) && (undefined === input.search || "string" === typeof input.search) && Object.keys(input).every((key: any) => {
            if (["ids", "authors", "kinds", "since", "until", "limit", "search"].some((prop: any) => key === prop))
                return true;
            const value = input[key];
            if (undefined === value)
                return true;
            if ("string" === typeof key && RegExp(/^#(.*)/).test(key))
                return undefined === value || Array.isArray(value) && value.every((elem: any) => "string" === typeof elem);
            return true;
        });
        return Array.isArray(input) && ($ip0(input) || false);
    };
    if (false === __is(input)) {
        const $report = (typia.createValidate as any).report(errors);
        ((input: any, _path: string, _exceptionable: boolean = true): input is ClientToRelayPayload => {
            const $join = (typia.createValidate as any).join;
            const $vp0 = (input: any, _path: string, _exceptionable: boolean = true) => {
                const array = input;
                const tuplePredicators = [
                    [
                        (top: any[]): any => top.length === 2 && [
                            "EVENT" === top[0],
                            "object" === typeof top[1] && null !== top[1] && $vo0(top[1], _path + "[1]", false && _exceptionable)
                        ].every((flag: boolean) => flag),
                        (entire: any[]): any => (entire.length === 2 || $report(_exceptionable, {
                            path: _path,
                            expected: "[\"EVENT\", Event]",
                            value: entire
                        })) && [
                            "EVENT" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"EVENT\"",
                                value: entire[0]
                            }),
                            ("object" === typeof entire[1] && null !== entire[1] || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "Event",
                                value: entire[1]
                            })) && $vo0(entire[1], _path + "[1]", true && _exceptionable) || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "Event",
                                value: entire[1]
                            })
                        ].every((flag: boolean) => flag)
                    ] as const,
                    [
                        (top: any[]): any => [
                            "REQ" === top[0],
                            "string" === typeof top[1]
                        ].every((flag: boolean) => flag) && (Array.isArray(top.slice(2)) && top.slice(2).map((elem: any, _index5: number) => "object" === typeof elem && null !== elem && false === Array.isArray(elem) && $vo1(elem, _path + "[" + (2 + _index5) + "]", false && _exceptionable)).every((flag: boolean) => flag)),
                        (entire: any[]): any => [
                            "REQ" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"REQ\"",
                                value: entire[0]
                            }),
                            "string" === typeof entire[1] || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "string",
                                value: entire[1]
                            })
                        ].every((flag: boolean) => flag) && ((Array.isArray(entire.slice(2)) || $report(_exceptionable, {
                            path: _path,
                            expected: "...Partial<__type>",
                            value: entire.slice(2)
                        })) && entire.slice(2).map((elem: any, _index6: number) => ("object" === typeof elem && null !== elem && false === Array.isArray(elem) || $report(_exceptionable, {
                            path: _path + "[" + (2 + _index6) + "]",
                            expected: "Partial<__type>",
                            value: elem
                        })) && $vo1(elem, _path + "[" + (2 + _index6) + "]", true && _exceptionable) || $report(_exceptionable, {
                            path: _path + "[" + (2 + _index6) + "]",
                            expected: "Partial<__type>",
                            value: elem
                        })).every((flag: boolean) => flag) || $report(_exceptionable, {
                            path: _path,
                            expected: "...Partial<__type>",
                            value: entire.slice(2)
                        }))
                    ] as const,
                    [
                        (top: any[]): any => top.length === 2 && [
                            "AUTH" === top[0],
                            "object" === typeof top[1] && null !== top[1] && $vo0(top[1], _path + "[1]", false && _exceptionable)
                        ].every((flag: boolean) => flag),
                        (entire: any[]): any => (entire.length === 2 || $report(_exceptionable, {
                            path: _path,
                            expected: "[\"AUTH\", Event]",
                            value: entire
                        })) && [
                            "AUTH" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"AUTH\"",
                                value: entire[0]
                            }),
                            ("object" === typeof entire[1] && null !== entire[1] || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "Event",
                                value: entire[1]
                            })) && $vo0(entire[1], _path + "[1]", true && _exceptionable) || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "Event",
                                value: entire[1]
                            })
                        ].every((flag: boolean) => flag)
                    ] as const,
                    [
                        (top: any[]): any => top.length === 2 && [
                            "CLOSE" === top[0],
                            "string" === typeof top[1]
                        ].every((flag: boolean) => flag),
                        (entire: any[]): any => (entire.length === 2 || $report(_exceptionable, {
                            path: _path,
                            expected: "[\"CLOSE\", string]",
                            value: entire
                        })) && [
                            "CLOSE" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"CLOSE\"",
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
                            "COUNT" === top[0],
                            "string" === typeof top[1]
                        ].every((flag: boolean) => flag) && (Array.isArray(top.slice(2)) && top.slice(2).map((elem: any, _index7: number) => "object" === typeof elem && null !== elem && false === Array.isArray(elem) && $vo1(elem, _path + "[" + (2 + _index7) + "]", false && _exceptionable)).every((flag: boolean) => flag)),
                        (entire: any[]): any => [
                            "COUNT" === entire[0] || $report(_exceptionable, {
                                path: _path + "[0]",
                                expected: "\"COUNT\"",
                                value: entire[0]
                            }),
                            "string" === typeof entire[1] || $report(_exceptionable, {
                                path: _path + "[1]",
                                expected: "string",
                                value: entire[1]
                            })
                        ].every((flag: boolean) => flag) && ((Array.isArray(entire.slice(2)) || $report(_exceptionable, {
                            path: _path,
                            expected: "...Partial<__type>",
                            value: entire.slice(2)
                        })) && entire.slice(2).map((elem: any, _index8: number) => ("object" === typeof elem && null !== elem && false === Array.isArray(elem) || $report(_exceptionable, {
                            path: _path + "[" + (2 + _index8) + "]",
                            expected: "Partial<__type>",
                            value: elem
                        })) && $vo1(elem, _path + "[" + (2 + _index8) + "]", true && _exceptionable) || $report(_exceptionable, {
                            path: _path + "[" + (2 + _index8) + "]",
                            expected: "Partial<__type>",
                            value: elem
                        })).every((flag: boolean) => flag) || $report(_exceptionable, {
                            path: _path,
                            expected: "...Partial<__type>",
                            value: entire.slice(2)
                        }))
                    ] as const
                ];
                for (const pred of tuplePredicators)
                    if (pred[0](array))
                        return pred[1](array);
                return $report(_exceptionable, {
                    path: _path,
                    expected: "([\"EVENT\", event: Event] | [\"REQ\", subscriptionId: string, ...Partial<{ [event: `#${string}`]: string[]; ids: string[]; authors: string[]; kinds: number[]; since: number; until: number; limit: number; search: string; }>[]] | [\"AUTH\", signedChallengeEvent: Event] | [\"CLOSE\", subscriptionId: string] | [\"COUNT\", subscriptionId: string, ...Partial<{ [event: `#${string}`]: string[]; ids: string[]; authors: string[]; kinds: number[]; since: number; until: number; limit: number; search: string; }>[]])",
                    value: input
                });
            };
            const $vo0 = (input: any, _path: string, _exceptionable: boolean = true): boolean => ["string" === typeof input.id && (RegExp(/^[0-9a-f]{64}$/).test(input.id) || $report(_exceptionable, {
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
                }), "number" === typeof input.kind && (0 <= input.kind || $report(_exceptionable, {
                    path: _path + ".kind",
                    expected: "number & Minimum<0>",
                    value: input.kind
                })) && (input.kind <= 65535 || $report(_exceptionable, {
                    path: _path + ".kind",
                    expected: "number & Maximum<65535>",
                    value: input.kind
                })) || $report(_exceptionable, {
                    path: _path + ".kind",
                    expected: "(number & Minimum<0> & Maximum<65535>)",
                    value: input.kind
                }), (Array.isArray(input.tags) || $report(_exceptionable, {
                    path: _path + ".tags",
                    expected: "Array<[string, ...string[]]>",
                    value: input.tags
                })) && input.tags.map((elem: any, _index9: number) => (Array.isArray(elem) || $report(_exceptionable, {
                    path: _path + ".tags[" + _index9 + "]",
                    expected: "[string, ...string[]]",
                    value: elem
                })) && ([
                    "string" === typeof elem[0] || $report(_exceptionable, {
                        path: _path + ".tags[" + _index9 + "][0]",
                        expected: "string",
                        value: elem[0]
                    })
                ].every((flag: boolean) => flag) && ((Array.isArray(elem.slice(1)) || $report(_exceptionable, {
                    path: _path + ".tags[" + _index9 + "]",
                    expected: "...string",
                    value: elem.slice(1)
                })) && elem.slice(1).map((elem: any, _index10: number) => "string" === typeof elem || $report(_exceptionable, {
                    path: _path + ".tags[" + _index9 + "][" + (1 + _index10) + "]",
                    expected: "string",
                    value: elem
                })).every((flag: boolean) => flag) || $report(_exceptionable, {
                    path: _path + ".tags[" + _index9 + "]",
                    expected: "...string",
                    value: elem.slice(1)
                }))) || $report(_exceptionable, {
                    path: _path + ".tags[" + _index9 + "]",
                    expected: "[string, ...string[]]",
                    value: elem
                })).every((flag: boolean) => flag) || $report(_exceptionable, {
                    path: _path + ".tags",
                    expected: "Array<[string, ...string[]]>",
                    value: input.tags
                }), "string" === typeof input.content || $report(_exceptionable, {
                    path: _path + ".content",
                    expected: "string",
                    value: input.content
                }), "string" === typeof input.sig && (RegExp(/^[0-9a-f]{128}$/).test(input.sig) || $report(_exceptionable, {
                    path: _path + ".sig",
                    expected: "string & Pattern<\"^[0-9a-f]{128}$\">",
                    value: input.sig
                })) || $report(_exceptionable, {
                    path: _path + ".sig",
                    expected: "(string & Pattern<\"^[0-9a-f]{128}$\">)",
                    value: input.sig
                })].every((flag: boolean) => flag);
            const $vo1 = (input: any, _path: string, _exceptionable: boolean = true): boolean => [undefined === input.ids || (Array.isArray(input.ids) || $report(_exceptionable, {
                    path: _path + ".ids",
                    expected: "(Array<string> | undefined)",
                    value: input.ids
                })) && input.ids.map((elem: any, _index11: number) => "string" === typeof elem || $report(_exceptionable, {
                    path: _path + ".ids[" + _index11 + "]",
                    expected: "string",
                    value: elem
                })).every((flag: boolean) => flag) || $report(_exceptionable, {
                    path: _path + ".ids",
                    expected: "(Array<string> | undefined)",
                    value: input.ids
                }), undefined === input.authors || (Array.isArray(input.authors) || $report(_exceptionable, {
                    path: _path + ".authors",
                    expected: "(Array<string> | undefined)",
                    value: input.authors
                })) && input.authors.map((elem: any, _index12: number) => "string" === typeof elem || $report(_exceptionable, {
                    path: _path + ".authors[" + _index12 + "]",
                    expected: "string",
                    value: elem
                })).every((flag: boolean) => flag) || $report(_exceptionable, {
                    path: _path + ".authors",
                    expected: "(Array<string> | undefined)",
                    value: input.authors
                }), undefined === input.kinds || (Array.isArray(input.kinds) || $report(_exceptionable, {
                    path: _path + ".kinds",
                    expected: "(Array<number> | undefined)",
                    value: input.kinds
                })) && input.kinds.map((elem: any, _index13: number) => "number" === typeof elem || $report(_exceptionable, {
                    path: _path + ".kinds[" + _index13 + "]",
                    expected: "number",
                    value: elem
                })).every((flag: boolean) => flag) || $report(_exceptionable, {
                    path: _path + ".kinds",
                    expected: "(Array<number> | undefined)",
                    value: input.kinds
                }), undefined === input.since || "number" === typeof input.since || $report(_exceptionable, {
                    path: _path + ".since",
                    expected: "(number | undefined)",
                    value: input.since
                }), undefined === input.until || "number" === typeof input.until || $report(_exceptionable, {
                    path: _path + ".until",
                    expected: "(number | undefined)",
                    value: input.until
                }), undefined === input.limit || "number" === typeof input.limit || $report(_exceptionable, {
                    path: _path + ".limit",
                    expected: "(number | undefined)",
                    value: input.limit
                }), undefined === input.search || "string" === typeof input.search || $report(_exceptionable, {
                    path: _path + ".search",
                    expected: "(string | undefined)",
                    value: input.search
                }), false === _exceptionable || Object.keys(input).map((key: any) => {
                    if (["ids", "authors", "kinds", "since", "until", "limit", "search"].some((prop: any) => key === prop))
                        return true;
                    const value = input[key];
                    if (undefined === value)
                        return true;
                    if ("string" === typeof key && RegExp(/^#(.*)/).test(key))
                        return undefined === value || (Array.isArray(value) || $report(_exceptionable, {
                            path: _path + $join(key),
                            expected: "(Array<string> | undefined)",
                            value: value
                        })) && value.map((elem: any, _index14: number) => "string" === typeof elem || $report(_exceptionable, {
                            path: _path + $join(key) + "[" + _index14 + "]",
                            expected: "string",
                            value: elem
                        })).every((flag: boolean) => flag) || $report(_exceptionable, {
                            path: _path + $join(key),
                            expected: "(Array<string> | undefined)",
                            value: value
                        });
                    return true;
                }).every((flag: boolean) => flag)].every((flag: boolean) => flag);
            return (Array.isArray(input) || $report(true, {
                path: _path + "",
                expected: "([\"AUTH\", signedChallengeEvent: Event] | [\"CLOSE\", subscriptionId: string] | [\"COUNT\", subscriptionId: string, ...Partial<{ [event: `#${string}`]: string[]; ids: string[]; authors: string[]; kinds: number[]; since: number; until: number; limit: number; search: string; }>[]] | [\"EVENT\", event: Event] | [\"REQ\", subscriptionId: string, ...Partial<{ [event: `#${string}`]: string[]; ids: string[]; authors: string[]; kinds: number[]; since: number; until: number; limit: number; search: string; }>[]])",
                value: input
            })) && ($vp0(input, _path + "", true && _exceptionable) || $report(_exceptionable, {
                path: _path + "",
                expected: "[\"EVENT\", event: Event] | [\"REQ\", subscriptionId: string, ...Partial<{ [event: `#${string}`]: string[]; ids: string[]; authors: string[]; kinds: number[]; since: number; until: number; limit: number; search: string; }>[]] | [\"AUTH\", signedChallengeEvent: Event] | [\"CLOSE\", subscriptionId: string] | [\"COUNT\", subscriptionId: string, ...Partial<{ [event: `#${string}`]: string[]; ids: string[]; authors: string[]; kinds: number[]; since: number; until: number; limit: number; search: string; }>[]]",
                value: input
            })) || $report(true, {
                path: _path + "",
                expected: "([\"AUTH\", signedChallengeEvent: Event] | [\"CLOSE\", subscriptionId: string] | [\"COUNT\", subscriptionId: string, ...Partial<{ [event: `#${string}`]: string[]; ids: string[]; authors: string[]; kinds: number[]; since: number; until: number; limit: number; search: string; }>[]] | [\"EVENT\", event: Event] | [\"REQ\", subscriptionId: string, ...Partial<{ [event: `#${string}`]: string[]; ids: string[]; authors: string[]; kinds: number[]; since: number; until: number; limit: number; search: string; }>[]])",
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
