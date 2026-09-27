# amd-chipset-notifier

A Cloudflare Worker that checks the AMD driver download page once per hour and sends a Discord notification when a new chipset driver is released.

## How it works

The Worker checks one or more configured AMD pages (targets), extracts the version number, release date and a changelog summary via regex, and compares them against the last known state stored in Cloudflare KV. If a newer version is found for a target, it posts a message to that target's Discord webhook(s).

The changelog comes from the "Release Notes" page linked from the driver's own entry, not the download page itself, that page only has version/date/file size. Its "Release Highlights" section is usually a one- or two-line summary rather than a detailed list; if AMD ever ships a release notes page without that heading, or drops the link entirely, the changelog is simply left out of the notification rather than failing the whole check.

## Requirements

- A Cloudflare account with Workers and KV enabled

## Setup

**1. Configure targets**

Targets are defined in `src/config.js` as a plain array:

```js
const TARGETS = [
  {
    id: "x870e",
    amdPageUrl: "https://www.amd.com/en/support/downloads/drivers.html/chipsets/am5/x870e.html",
    productName: "AMD Chipset Drivers"
  }
];
```

Add one object per AMD page you want to watch, e.g. one per chipset/motherboard, so the Discord message always links to the correct page even though the underlying driver is the same across a socket generation. Each target needs a unique `id`, used both for its KV key and its webhook secret name.

**2. Create a KV namespace**

```
Cloudflare Dashboard -> Storage & databases -> Worker KV -> Create Instance
```

Copy the Namespace ID into `wrangler.jsonc` under `kv_namespaces`.


**3. Connect the repository to Cloudflare**

```
Cloudflare Dashboard -> Compute (Workers) -> Workers & Pages -> Create -> Connect to Git
Authorize the Cloudflare GitHub app, select this repository and the branch to deploy from (e.g. main)
```

Cloudflare will build and deploy the Worker automatically on every push to that branch. No local `wrangler deploy` needed.

**4. Set a Discord webhook secret per target**

```
Cloudflare Dashboard -> Compute -> Workers & Pages -> Click your worker
Click on Settings -> Variables and Secrets -> Add
"Variable name": DISCORD_WEBHOOK_URL_<ID>
"Value": Your Webhook-URL
"Type": Secret
```

`<ID>` is the target's `id` from `config.js`, uppercased, e.g. `id: "x870e"` needs a variable named `DISCORD_WEBHOOK_URL_X870E`. To notify multiple Discord servers for the same target, provide a comma-separated list of webhook URLs in that one value.

> [!WARNING]
> Make sure the Type is set to Secret, not the default text type, before saving. A plain text variable is readable in the dashboard and via the API, a webhook URL set as a secret is not. Select Deploy afterwards to apply it.

## Endpoints

| Path           | Description                                              |
|----------------|----------------------------------------------------------|
| /run           | Runs a check manually, notifies only if version changed  |
| /state         | Returns the current state from KV as JSON                |
| /notify-test   | Runs a check and always sends a Discord notification     |

#### Blogpost
I wrote a small [Blogpost](https://knng.de/blog/amd-chipset-notifier/) about this. Feel free to check it out! :)

## License

MIT
