export function streamTest(http2, assert) {
  const mode = process.argv[2] || "both";

  function startServer() {
    return new Promise((resolve, reject) => {
      const server = http2.createServer();
      const activeStreams = [];

      // Server listens for streams
      server.on("stream", (stream) => {
        activeStreams.push(stream);
        console.log("Server: received a stream");
        let streamCount = 0;

        // Server sends back data to the client.
        stream.on("data", (chunk) => {
          console.log(`Server: received data ${chunk}`);
          if (streamCount++ === 0) {
            stream.respond({ ":status": 200, "content-type": "text/plain" });
          }
          stream.write("Hello client");
        });

        // Close the stream after 1 second
        setTimeout(() => {
          console.log("Server: closing stream");
          // End the server side of the stream
          server.close();
          activeStreams.forEach((stream) => {
            stream.end();
          });
        }, 1000);
      });

      server.on("error", (err) => {
        console.error("Server: encountered an error:", err.message);
        reject(err);
      });

      server.on("close", () => {
        console.log("Server: closed");
      });

      // Start the server
      server.listen(3000, () => {
        console.log("Server: listening on port 3000");
        resolve(server);
      });
    });
  }

  function startClient() {
    return new Promise((resolve, reject) => {
      // Create an HTTP2 client connection
      const client = http2.connect("http://localhost:3000");
      let timer;

      // Create a stream
      const stream = client.request({
        ":method": "POST",
        ":path": "/",
        "content-type": "text/plain",
      });

      let receivedData = "";

      // Client handles incoming data from the server
      stream.on("data", (chunk) => {
        console.log(`Client: received data ${chunk}`);
        receivedData += chunk;
      });

      // Stop sending data and clean up once the server ends the stream
      stream.on("end", () => {
        console.log("Client: server ended the stream");
        clearInterval(timer);

        assert(
          receivedData.length > 0,
          "Client should have received some data"
        );

        // End the client side of the stream
        stream.end();

        client.close();

        // Timeout necessary to prevent server throwing error on deno.
        // setTimeout(() => {
        //   client.close();
        // }, 0);

        resolve();
      });

      // Handle error event to avoid unhandled errors
      stream.on("error", (err) => {
        console.error("Client: encountered an error:", err.message);
        clearInterval(timer);
        reject(err);
      });

      // Send data periodically from the client to the server
      timer = setInterval(() => {
        console.log("Client: sending data to server");
        stream.write("Hello Server");
      }, 100);

      // Stop sending data once the server closes the stream
      stream.on("close", () => {
        console.log("Client: stream closed");
        clearInterval(timer);
      });
    });
  }

  function runTest() {
    let serverPromise;
    if (mode === "both" || mode === "server") {
      serverPromise = startServer();
    } else {
      serverPromise = Promise.resolve();
    }

    return serverPromise
      .then(() => {
        if (mode === "both" || mode === "client") {
          return startClient();
        }
      })
      .catch((err) => {
        console.error("Error:", err.message);
      });
  }

  runTest();
}
