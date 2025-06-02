# ogfetch

Stands for Open Graph fetch. A micro app to fetch basic open graph data from a website.

## Usage 

Make an HTTP request to request:
```shell
curl 'https://ogfetch.deno.dev' -XPOST -d'{"url":"https://example.com"}'
```

And get a structured JSON data of og meta tags:
```json
{
  "title": "og title",
  "image": "https://url.to.the/image.jpg",
  "description": "Open Graph is awesome!"
}
```

## Notes

- The app supports cookie verification and redirects
- Pretends to be a Chromium browser

## To be done

- More antibot workarounds
