# Morpheus Inspector / Verifier Service

A simplistic inspector/verifier service for Morpheus.

## Table of Contents <!-- omit in toc -->

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [List Scenarios](#list-scenarios)
  - [Download Public Blob](#download-public-blob)
  - [Upload Presentation](#upload-presentation)
  - [Getting After Proof](#getting-after-proof)
  - [Validate Signature with Before-After Proof](#validate-signature-with-before-after-proof)

## Installation

Run in the root of the `morpheus-ts` project.

```bash
npm install
npm run build
```

## Usage

```bash
npm run serve
```

## API

### List Scenarios

Returns all inspection [scenarios](https://developer.iop.global/#/glossary?id=scenario) available at this inspector.

Note: It's possible that process will not be objects but only a [content id](https://iop-stack.iop.rocks/dids-and-claims/specification/#/glossary?id=content-id). In that case, use the [blob storage endpoint](#Download-Public-Blob) to download the process itself.

```http
GET /scenarios
```

#### Parameters <!-- omit in toc -->

Nothing.

#### Example <!-- omit in toc -->

```bash
curl http://127.0.0.1:8081/scenarios
```

#### Response <!-- omit in toc -->

<details>
<summary>
Click here to expand
</summary>

```json
{
  "scenarios": [
    "cjuFURvWkcd-82J83erY_dEUhlRf9Yn8OiWWl7SxVpBvf4"
  ]
}
```

</details>

### Download Public Blob

Any public content hosted on this service can be downloaded by their ContentId.

```http
GET /blob/:contentId
```

### Upload Presentation

Users can share a Signed [Presentations](https://iop-stack.iop.rocks/dids-and-claims/specification/#/glossary?id=claim-presentation) with the inspector service anytime before they want to get an inspection. They could host it anywhere and present a URL on their servers, but most users will not have the self-hosted infrastructure.

```http
POST /presentation
```

### Getting After Proof

Whenever a user wants to wrap their Presentation in an [AfterEnvelop](https://iop-stack.iop.rocks/dids-and-claims/specification/#/glossary?id=after-envelope), they can query the latest block height and id from this endpoint.

```http
GET /after-proof
```

### Validate Signature with Before-After Proof

TBD

```http
POST /validate
```
