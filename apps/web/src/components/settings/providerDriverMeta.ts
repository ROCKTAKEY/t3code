import { CodexSettings } from "@t3tools/contracts";
import * as Schema from "effect/Schema";

export { providerClients } from "@t3tools/client-runtime/provider-clients";

export const codexManagedRuntimeSettings = {
  settingsSchema: Schema.Struct({ shareAppServer: CodexSettings.fields.shareAppServer }),
};
