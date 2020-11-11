# Morpheus Authority Service

A simplistic authority service for Morpheus to receive witness requests and provide an interface to accept or deny requests.

Witness requests all go into a single pool of pending request, from where any clerks can approve or
reject them. Authentication of clerks and pessimistic locking of requests is left out for simplicity,
because we expect that most organizations already have a workflow system where they will integrate
our SDK instead of using a separate workflow system we build for them.

## Table of Contents <!-- omit in toc -->

- [Installation](#installation)
- [Environment](#environment)
- [Usage](#usage)
- [API](#api)
  - [List Processes](#list-processes)
  - [Download Public Blob](#download-public-blob)
  - [Download Private Blob](#download-private-blob)
  - [Post Witness Request](#post-witness-request)
  - [List Witness Requests](#list-witness-requests)
  - [Get Witness Request Status](#get-witness-request-status)
  - [Approve Witness Request](#approve-witness-request)
  - [Reject Witness Request](#reject-witness-request)

## Installation

Run in the root of the `morpheus-ts` project.

```bash
npm install
npm run build
```

## Environment

There are some environment variables read by the service upon startup. Their default values follow:

```bash
# Database file that stores all requests and their status:
export AUTHORITY_DB='./db/authority.sqlite'
# Folder that contains all migration scripts for that database:
export AUTHORITY_MIGRATIONS='./migrations/'
# Processes and their schemas, which will be inserted into the database if they are not in there yet:
export AUTHORITY_PROCESSES='./processes/'
# List of public keys authorized to access REST endpoints only available for clerks
export AUTHORITY_PUBKEYS=''
```

The most important is to configure the public keys of the clerks allowed to list, approve and reject requests in the name
of the authority:

```bash
export AUTHORITY_PUBKEYS='pez2CLkBUjHB8w8G87D3YkREjpRuiqPu6BrRsgHMQy2Pzt6,pezDj6ea4tVfNRUTMyssVDepAAzPW67Fe3yHtuHL6ZNtcfJ'
```

In a docker environment it is easier to pass in environment variables to built images than to rebuild the image every
time a public key needs to be added or removed from that list.

## Usage

```bash
npm run serve
```

## API

### List Processes

Returns all [processes](https://developer.iop.global/glossary?id=process) available at the authority.

Note: It's possible that process will not be objects but only a [content id](https://developer.iop.global/glossary?id=content-id). In that case, use the [blob storage endpoint](#Download-Public-Blob) to download the process itself.

```http
GET /processes
```

#### Parameters <!-- omit in toc -->

Nothing.

#### Example <!-- omit in toc -->

```bash
curl http://127.0.0.1:8080/processes
```

#### Response <!-- omit in toc -->

<details>
<summary>
Click here to expand
</summary>

```json
{
  "processes": [
    "cjuc1fS3_nrxuK0bRr3P3jZeFeT51naOCMXDPekX8rPqho",
    "cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg",
    "cjujqhFEN_T2BV-TcyGNTHNeUds3m8aAc-vIWUdZSyK9Sw"
  ]
}
```

</details>

### Download Public Blob

The public hashweb of the Authority that serves only public (not confidential, not personally identifiable, e.g. processes and schemas) data for unauthorized clients.

The type of the blob (e.g. image, city, street address) is included in the link. Initially, there must be only a few different link types available: blob/unknown, process and schema.

Putting the type into the link and not an envelop around the blob allows hashweb to treat the same blob in multiple ways (like trait objects do for a struct in rust)

The client sends a link (~typed hash) as a requests and receives the resolved blob in the response or an error.

```http
GET http://127.0.0.1:8080/blob/:id
```

#### Parameters <!-- omit in toc -->

| Name | Type | Description |
|---|---|---|
| id | string | **Required**. The id of the blow you'd like to download |

#### Example <!-- omit in toc -->

```bash
curl http://127.0.0.1:8080/blob/cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg
```

#### Response <!-- omit in toc -->

<details>
<summary>
Click here to expand
</summary>

```json
{
  "name": "Digitalize ID card",
  "version": 1,
  "description": "Using a selfie with your ID card we make that piece of plastic obsolete.",
  "claimSchema": "cjuQcHqNwTfmwUMfQPH0tnzmLY1pjDU_6RhO6PzNRsgZtY",
  "evidenceSchema": "cjuJt4rbRkRCRjMcsfqtZ_QZ02a2TMIGFOH2gGySXkS6_E",
  "constraintsSchema": null
}
```

</details>

### Download Private Blob

The private hashweb of the Authority that serves confidential data (possibly containing personally identifiable data) for authorized clients.

Witness request contents can be downloaded by their hashlink.

### Post Witness Request

Returns a capability link to poll for status of the request. Since some verification and checks are done before accepting the request into the queue, we need to rate-limit this endpoint in the future.

```http
POST http://127.0.0.1/requests
```

| Name | Type | Description |
|---|---|---|
| BODY | string | **Required**. A JSON object represents a witness request |

#### Example <!-- omit in toc -->

```bash
curl -d '{"signature":{"publicKey":"pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6","bytes":"sez8TJUpKMQXoMzD9nNchD2Ze23wWsSfWGeJBPCmyVKZFevPwJBvcazghLztVn9DjtEvVycDk1yVWacL81eYDjBrJWE"},"content":{"processId":"cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg","claimant":"did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr#0","claim":{"subject":"did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr","content":{"address":"A simple address","dateOfBirth":"22/03/1980","placeOfBirth":{"city":"Berlin","country":"Germany"}}},"evidence":{},"nonce":"uWgrHk2qbBtuUErYkJpr0y0P/1noSHbNgk+J2oYOxbTE+"}}' -H "Content-Type: application/json" -X POST http://127.0.0.1/requests
```

#### Response <!-- omit in toc -->

<details>
<summary>
Click here to expand
</summary>

```json
{
  "capabilityLink": "uA6o7GI7UQ8ZNWZxkF5FjjRmkeEK6YBT7EkEuVpLxfY-8"
}
```

</details>

### List Witness Requests

Contains hashlinks to the witness requests and some metadata (like when it was requested, assigned clerk, status of the request, etc.). It's used internally by for example clerks, hence it must be authenticated and authorized. TODO: currently it's not.

```http
GET http://127.0.0.1:8080/requests
```

#### Parameters <!-- omit in toc -->

Nothing.

#### Example <!-- omit in toc -->

```bash
curl http://127.0.0.1:8080/requests
```

#### Response <!-- omit in toc -->

<details>
<summary>
Click here to expand
</summary>

```json
{
  "requests": [
    {
      "capabilityLink": "uAn0nejG8RAdFMNMVtrNWH-hHaqPUrVixb98-FujIm1ay",
      "requestId": "cjuBy2Zn1m4VQ6CkyWrXinMxzDort58qlrBKxpNgcamj1Q",
      "dateOfRequest": "2020-03-12T04:52:04.000Z",
      "status": "approved",
      "processId": "cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg",
      "notes": null
    }
  ]
}
```

</details>

### Get Witness Request Status

This endpoint includes some secret in the URI that was generated when the request was accepted for processing.

Pending/Approved/Denied. For approved requests, signed witness statement can be downloaded. For denied, a description of the problem is stated.

On the long term the claimant should be directly notified on the decision instead of polling a link, but that requires Mercury so it's for a later milestone.

```http
GET http://127.0.0.1/requests/:capabilityLink
```

#### Parameters <!-- omit in toc -->

| Name | Type | Description |
|---|---|---|
| capabilityLink | string | **Required**. The capbailityLink received back when the request was sent in. |

#### Example <!-- omit in toc -->

```bash
curl http://127.0.0.1:8080/requests/uA6o7GI7UQ8ZNWZxkF5FjjRmkeEK6YBT7EkEuVpLxfY-8/status
```

#### Response <!-- omit in toc -->

<details>
<summary>
Click here to expand
</summary>

```json
{
  "status": "approved",
  "signedStatement": {
    "signature": {
      "publicKey": "pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6",
      "bytes": "sezAAk8QmRNxaVG7KVGsMGPFB6zbFoKYq9Ky89Mv1gwdrqvXV5xNrn3hzxYATUrLZwBtS4acGNWGZhi1pgc2UwQvKkE"
    },
    "content": {
      "claim": {
        "subject": "did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr",
        "content": {
          "address": "Berlin, Strasse",
          "dateOfBirth": "15/03/2002",
          "placeOfBirth": {
            "city": "Berlin",
            "country": "Germany"
          }
        }
      },
      "processId": "cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg",
      "constraints": {
        "after": "2020-03-13T15:13:34.090083",
        "before": "2021-03-13T00:00:00.000",
        "witness": "did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr#0",
        "authority": "did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr",
        "content": null
      },
      "nonce": "uOGDljmXqzu5eMIHAhj6Ic88Ruquym0S2YsOxozYpXV22"
    }
  },
  "rejectionReason": null
}
```

</details>

### Approve Witness Request

Authority entities (such as a clerk) can approve a request here by creating a [signed witness statement](https://developer.iop.global/glossary?id=signed-witness-statement).

```http
POST http://127.0.0.1/requests/:capabilityLink/approve
```

#### Parameters <!-- omit in toc -->

| Name | Type | Description |
|---|---|---|
| BODY | string | **Required**. A JSON object represents the signed witness statement. |

#### Example <!-- omit in toc -->

```bash
curl -d '{"signature":{"publicKey":"pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6","bytes":"sezAg5HVCZVNvCbpqaQa1VdtnJuU4ezKTGCLSefqyTrje3QnUh2JCadi1E26NUF5PWbG4VSQjn9HLey5FNCwtDKhPZD"},"content":{"claim":{"subject":"did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr","content":{"address":"An Address","dateOfBirth":"22/03/1984","placeOfBirth":{"city":"Berlin","country":"Germany"}}},"processId":"cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg","constraints":{"after":"2020-03-17T10:58:31.143296","before":"2021-03-17T00:00:00.000","witness":"did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr#0","authority":"did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr","content":null},"nonce":"uDWnyDlJNtbOGlkPV52h37qT3aIo6EDHmAy1QCzSAMtbq"}}' -H "Content-Type: application/json" -X POST http://127.0.0.1/requests/uA6o7GI7UQ8ZNWZxkF5FjjRmkeEK6YBT7EkEuVpLxfY-8/approve
```

#### Response <!-- omit in toc -->

<details>
<summary>
Click here to expand
</summary>

```json
{
  "success": true,
}
```

</details>

### Reject Witness Request

Authority entities (such as a clerk) can reject a request here.

```http
POST http://127.0.0.1/requests/:capabilityLink/reject
```

#### Parameters <!-- omit in toc -->

| Name | Type | Description |
|---|---|---|
| BODY | string | **Required**. A JSON object containing the rejection reason. |

#### Example <!-- omit in toc -->

```bash
curl -d '{"rejectionReason" : "I do not approve this"}' -H "Content-Type: application/json" -X POST http://127.0.0.1/requests/uA6o7GI7UQ8ZNWZxkF5FjjRmkeEK6YBT7EkEuVpLxfY-8/reject
```

#### Response <!-- omit in toc -->

<details>
<summary>
Click here to expand
</summary>

```json
{
  "status": "approved",
  "signedStatement": {
    "signature": {
      "publicKey": "pez7aYuvoDPM5i7xedjwjsWaFVzL3qRKPv4sBLv3E3pAGi6",
      "bytes": "sezAAk8QmRNxaVG7KVGsMGPFB6zbFoKYq9Ky89Mv1gwdrqvXV5xNrn3hzxYATUrLZwBtS4acGNWGZhi1pgc2UwQvKkE"
    },
    "content": {
      "claim": {
        "subject": "did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr",
        "content": {
          "address": "Berlin, Strasse",
          "dateOfBirth": "15/03/2002",
          "placeOfBirth": {
            "city": "Berlin",
            "country": "Germany"
          }
        }
      },
      "processId": "cjunI8lB1BEtampkcvotOpF-zr1XmsCRNvntciGl3puOkg",
      "constraints": {
        "after": "2020-03-13T15:13:34.090083",
        "before": "2021-03-13T00:00:00.000",
        "witness": "did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr#0",
        "authority": "did:morpheus:ezbeWGSY2dqcUBqT8K7R14xr",
        "content": null
      },
      "nonce": "uOGDljmXqzu5eMIHAhj6Ic88Ruquym0S2YsOxozYpXV22"
    }
  },
  "rejectionReason": null
}
```

</details>
