# Square-Invoices-CloudFlare-Worker
Simple CloudFlare worker script that fetches the most recent 20 invoices per customer ID and returns them as JSON or as a list of Tailwind CSS Cards.
---
1. Create a CloudFlare Worker
2. Edit your `locationid` and add your APIKEY variable.
3. Ready to go!

## Using This Work
`https://yourworkerurl.com/?html=(true|false)&id=(comma separated list of customer IDS)`

Setting HTML to true will return a list of Tailwind CSS Cards.
