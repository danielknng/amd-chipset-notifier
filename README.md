# amd-chipset-notifier

A Cloudflare Worker that checks the AMD driver download page once per hour and sends a Discord notification when a new chipset driver is released.

## How it works

The Worker scrapes the configured AMD page, extracts the version number and release date via regex, and compares them against the last known state stored in Cloudflare KV. If a newer version is found, it posts a message to one or more Discord webhooks.

## Requirements

- A Cloudflare account with Workers and KV enabled

## Setup

**1. Configuration**

All variables are set in `wrangler.jsonc` under `vars`, except for the webhook URL which must be a secret.

| Variable             | Description                              | Default                        |
|----------------------|------------------------------------------|--------------------------------|
| AMD_PAGE_URL         | URL of the AMD driver download page      | X870E chipset page             |
| PRODUCT_NAME         | Product name used to locate the version  | AMD Chipset Drivers            |
| KV_KEY               | Key under which the state is stored in your KV      | amd-chipset-version      |
| DISCORD_WEBHOOK_URL  | Webhook URL(s), comma-separated          | (required, set as secret in Cloudflare)      |


**2. Create a KV namespace**

```
Cloudflare Dashboard -> Storage & databases -> Worker KV -> Create Instance
```

Copy the ID into `wrangler.jsonc` under `kv_namespaces`.


**3. Set the Discord webhook URL as a secret**

```
Cloudflare Dashboard -> Compute -> Workers & Pages -> Click your existing worker or create a new one 
Click on Settings -> Variables and Secrets -> Add -> "Type": Secret -> "Variable name": DISCORD_WEBHOOK_URL -> "Value": Your Webhook-URL
```

To notify multiple Discord servers, provide a comma-separated list of webhook URLs.

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
