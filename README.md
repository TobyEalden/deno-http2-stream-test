# deno http2 stream

This is a simple test of streaming data between server and client using HTTP/2, and checking that if the server
closes the stream the client can detect it and handle it gracefully.

## run with deno

```sh
deno run -A main.ts
```

## run with node

```sh
node main.mjs
```

## expected output

```sh
Server: listening on port 3000
Server: received a stream
Client: sending data to server
Server: received data Hello Server
Client: received data Hello client
... (repeated)
Client: sending data to server
Server: received data Hello Server
Client: received data Hello client
Server: closing stream
Client: server ended the stream
Client: stream closed
Server: closed
```

## current deno output

An error is thrown when the server closes the stream.

```sh
Server: listening on port 3000
Server: received a stream
Client: sending data to server
Server: received data Hello Server
Client: received data Hello client
... (repeated)
Client: sending data to server
Server: received data Hello Server
Client: received data Hello client
Server: closing stream
Client: server ended the stream
Server: closed
error: Uncaught (in promise) Http: error reading a body from connection: stream closed because of a broken pipe
    at async Object.pull (ext:deno_web/06_streams.js:938:27)
```