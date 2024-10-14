import http2 from "http2";
import assert from "assert";
import {streamTest} from "./stream-test.mjs";

streamTest(http2, assert);

