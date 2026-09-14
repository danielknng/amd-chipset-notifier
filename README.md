# amd-chipset-notifier

A Cloudflare Worker that checks the AMD driver download page once per hour and sends a Discord notification when a new chipset driver is released.

## How it works

The Worker checks one or more configured AMD pages (targets), extracts the version number and release date via regex, and compares them against the last known state stored in Cloudflare KV. If a newer version is found for a target, it posts a message to that target's Discord webhook(s).

## Requirements

- A Cloudflare account with Workers and KV enabled

## Setup

**1. Configure targets**

Targets are defined in `src/config.js` as a plain array, not as `wrangler.jsonc` vars:

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

Copy the ID into `wrangler.jsonc` under `kv_namespaces`.


**3. Set a Discord webhook secret per target**

```
Cloudflare Dashboard -> Compute -> Workers & Pages -> Click your existing worker or create a new one 
Click on Settings -> Variables and Secrets -> Add -> "Type": Secret -> "Variable name": DISCORD_WEBHOOK_URL_<ID> -> "Value": Your Webhook-URL
```

`<ID>` is the target's `id` from `config.js`, uppercased, e.g. `id: "x870e"` needs a secret named `DISCORD_WEBHOOK_URL_X870E`. To notify multiple Discord servers for the same target, provide a comma-separated list of webhook URLs in that one secret.

**4. Deploy**  

All that's left is to deploy/re-deploy your worker.  
You can verify the endpoints on your worker domain afterwards.

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
