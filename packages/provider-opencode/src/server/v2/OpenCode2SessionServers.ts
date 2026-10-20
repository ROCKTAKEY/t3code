import * as Context from "effect/Context";
import * as Crypto from "effect/Crypto";
import * as Effect from "effect/Effect";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";
import type * as Scope from "effect/Scope";

import * as OpenCodeRuntime from "../OpenCodeRuntime.ts";
import * as OpenCode2Client from "./OpenCode2Client.ts";
import * as OpenCode2Server from "./OpenCode2Server.ts";

export class OpenCode2SessionServers extends Context.Service<
  OpenCode2SessionServers,
  {
    readonly get: (
      mode:
        | { readonly _tag: "Shared" }
        | { readonly _tag: "Dedicated"; readonly cwd: string | null },
    ) => Effect.Effect<
      OpenCode2Server.OpenCode2Server["Service"],
      OpenCodeRuntime.OpenCodeRuntimeError,
      Scope.Scope
    >;
  }
>()("@t3tools/provider-opencode/server/v2/OpenCode2SessionServers") {}

export const make = Effect.fn("OpenCode2SessionServers.make")(function* (
  input: Parameters<typeof OpenCode2Server.make>[0],
) {
  const shared = yield* OpenCode2Server.OpenCode2Server;
  const runtime = yield* OpenCodeRuntime.OpenCodeRuntime;
  const client = yield* OpenCode2Client.OpenCode2Client;
  const crypto = yield* Crypto.Crypto;
  const path = yield* Path.Path;
  const decodeDirectory = Schema.decodeUnknownEffect(
    Schema.String.check(Schema.makeFilter(path.isAbsolute)).pipe(
      Schema.brand("OpenCodeWorkspaceCwd"),
    ),
  );
  return OpenCode2SessionServers.of({
    get: (mode) =>
      mode._tag === "Shared"
        ? Effect.succeed(shared)
        : Effect.gen(function* () {
            const directory = yield* decodeDirectory(mode.cwd).pipe(
              Effect.mapError(
                (cause) =>
                  new OpenCodeRuntime.OpenCodeRuntimeError({
                    operation: "sessionDirectory",
                    detail:
                      "A dedicated OpenCode session requires an absolute workspace directory.",
                    cause,
                  }),
              ),
            );
            return yield* OpenCode2Server.make({ ...input, directory });
          }).pipe(
            Effect.provideService(OpenCodeRuntime.OpenCodeRuntime, runtime),
            Effect.provideService(OpenCode2Client.OpenCode2Client, client),
            Effect.provideService(Crypto.Crypto, crypto),
          ),
  });
});
