import * as http2 from "node:http2";
import assert from "node:assert";
import { streamTest} from "./stream-test.mjs";

streamTest(http2,assert);

