# OpenCode

Run OpenCode **1.14.19+** or **OpenCode 2.0.18+** in T3 Code. Install and authenticate OpenCode on the server machine, then enable it in **Settings → Providers** (see [provider setup](./install.md#providers)).

## OpenCode 1.x vs. 2.x

T3 Code detects your installed version automatically. OpenCode 1.x has **Limited support**.

- OpenCode 2 ships as a separate package (`@opencode/cli`, e.g. `npm install -g @opencode/cli`). T3 Code's update button upgrades your installed package without switching 1.x to 2.x.
- Do not run 1.x and 2.x side by side on the same machine—OpenCode 2 converts the shared database on first run. Existing 1.x threads continue on 2.x.

## Local or external server

- **Managed local server** (default): Leave **Server URL** empty. Uses your configured password, `OPENCODE_SERVER_PASSWORD`, or a generated password.
- **External server**: Set **Server URL** and password in provider settings (does not forward local `OPENCODE_SERVER_PASSWORD`).
- **Updating a local service**: When **Server URL** points to a local OpenCode background service (using its exact host/port—`127.0.0.1` for `0.0.0.0`, `[::1]` for `[::]`, not `localhost`), T3 Code upgrades the CLI and restarts the service (interrupting active turns; configure service env vars with `opencode service set env <name> <value>`). Other external servers must be restarted manually.

## Compaction, approvals, and catalog refresh

- **Compaction**: Send `/compact` manually, or configure `compaction` (`auto`, `buffer`, `keep.tokens`) in `opencode.json` on OpenCode 2.
- **Approvals**: Follows [permission modes](./permission-modes.md); **Auto** behaves like **Supervised**. Reading `.env` / `.env.local` asks for approval in restricted modes (`.env.example` is allowed). **Allow for workspace** applies across all OpenCode sessions sharing that workspace—use **Allow once** on shared servers.
- **Refreshing config**: Click **Refresh provider status** (web/desktop) or **Refresh models** (mobile) after auth/config changes. Local helper caches clear after 30 seconds of inactivity; external servers may need a restart. Project-specific models in `opencode.json` load when opening that project's model picker.

## Run each thread in a separate process

In **Settings > Providers** on web or desktop, turn off **Share server between
threads** for your OpenCode instance. New OpenCode 2 threads start a dedicated
local server from their project or worktree directory. This also applies to
threads used from mobile and remote clients. OpenCode 1 already uses dedicated
conversation processes.

Set **Binary path** to your container wrapper to control which directories it
mounts. Process separation alone does not restrict filesystem access. Provider
discovery and text-generation helpers start from an empty temporary directory.
OpenCode's on-disk history and credentials still use its configured storage.

Existing threads retain their sharing mode after changing the setting or
restarting T3 Code. Start a new thread to use the new mode. Changing a dedicated
thread's worktree closes its process; the next turn resumes the conversation from
the new directory. Turn sharing back on to share servers for new threads.

With an external **Server URL**, this setting separates T3's session handling;
the external server's process remains managed by its owner.
