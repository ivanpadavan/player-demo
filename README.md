# Player demo
Useful Commands:

`npm run build`.
`npm run start`.

Be sure that you have .env file for valid build

You can write me in telegram for fast feedback @ifrolkin

## Problem

Channels with a large difference between the **Availability Start Time (AST)** and the current time are playing **without audio**.

---

There is a browser API called [`SourceBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer), which is used to feed media chunks into the browser.

One of its key properties is `timestampOffset`, which defines the offset applied to timestamps within media segments appended to the `SourceBuffer`.

In our case, the timestamps within the media chunks are always relative to the **Availability Start Time (AST)**. When `timestampOffset` is set, it shifts the effective timestamps seen by the playback engine.

If the resulting playback time (after applying this offset) remains **less than 49 days**, audio plays back correctly. However, if this time exceeds 49 days, audio playback fails — even though video may continue.

This discrepancy arises due to differences in how streaming specifications handle the notion of start time:

- In **HLS**, the start time of a live stream is defined as the depth of the timeshift buffer, which keeps the playback time relatively close to the present moment.
- In contrast, the **DASH** specification defines the start time of a live stream as the **Availability Start Time (AST)**, which can be far in the past for long-running streams.

As a result, for long-lived DASH live streams, the derived playback time can be very large, triggering this audio playback issue in the browser.

