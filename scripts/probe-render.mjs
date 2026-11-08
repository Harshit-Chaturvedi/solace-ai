import https from "node:https";
import http from "node:http";
import { URL } from "node:url";

export function probeUrl(targetUrl, timeoutMs = 40000) {
  return new Promise((resolve) => {
    const urlObj = new URL(targetUrl);
    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const timings = {
      time: new Date().toLocaleTimeString("en-US", { hour12: false }),
      url: targetUrl.replace("https://solace-ai-tq52.onrender.com", "").replace("http://solace-ai-tq52.onrender.com", "http:"),
      dnsMs: "-",
      tcpMs: "-",
      tlsMs: "-",
      ttfbMs: "-",
      totalMs: "-",
      status: "-",
      server: "-",
      cfRay: "-",
      xRenderRouting: "-",
      rndrId: "-",
      error: null,
    };

    const startTime = Date.now();
    let dnsTime = null;
    let tcpTime = null;
    let tlsTime = null;
    let settled = false;

    const finalize = () => {
      if (settled) return;
      settled = true;
      resolve(timings);
    };

    const req = client.request(
      urlObj,
      {
        method: "GET",
        headers: {
          "User-Agent": "Solace-Probe/1.0",
          Accept: "*/*",
        },
      },
      (res) => {
        timings.ttfbMs = Date.now() - startTime;
        timings.status = res.statusCode;
        timings.server = res.headers["server"] || "-";
        timings.cfRay = res.headers["cf-ray"] || "-";
        timings.xRenderRouting = res.headers["x-render-routing"] || "-";
        timings.rndrId = res.headers["rndr-id"] || "-";

        res.on("data", () => {});
        res.on("end", () => {
          timings.totalMs = Date.now() - startTime;
          finalize();
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      timings.error = `ETIMEDOUT(${timeoutMs / 1000}s)`;
      timings.totalMs = Date.now() - startTime;
      req.destroy();
      finalize();
    });

    req.on("socket", (socket) => {
      socket.on("lookup", () => {
        dnsTime = Date.now();
        timings.dnsMs = dnsTime - startTime;
      });

      socket.on("connect", () => {
        tcpTime = Date.now();
        timings.tcpMs = dnsTime ? tcpTime - dnsTime : tcpTime - startTime;
      });

      if (isHttps) {
        socket.on("secureConnect", () => {
          tlsTime = Date.now();
          timings.tlsMs = tcpTime ? tlsTime - tcpTime : tlsTime - startTime;
        });
      }
    });

    req.on("error", (err) => {
      if (!timings.error) {
        timings.error = err.code || err.message;
        timings.totalMs = Date.now() - startTime;
      }
      finalize();
    });

    req.end();
  });
}

function formatRow(t) {
  const statusCol = t.error ? t.error : String(t.status);
  return `| ${t.time.padEnd(8)} | ${t.url.padEnd(16)} | ${String(t.dnsMs).padStart(7)} | ${String(t.tcpMs).padStart(7)} | ${String(t.tlsMs).padStart(7)} | ${String(t.ttfbMs).padStart(9)} | ${String(t.totalMs).padStart(9)} | ${statusCol.padEnd(15)} | ${t.server.padEnd(10)} | ${t.cfRay.slice(0, 16).padEnd(16)} | ${t.xRenderRouting.padEnd(15)} | ${t.rndrId.padEnd(10)} |`;
}

async function main() {
  console.log("Starting 8-minute probe of Render service...");
  console.log(`Probe Start: ${new Date().toISOString()}`);
  console.log("| Time     | Target           | DNS(ms) | TCP(ms) | TLS(ms) | TTFB(ms)  | Total(ms) | Status/Error    | Server     | CF-Ray           | x-render-rout   | rndr-id    |");
  console.log("|----------|------------------|---------|---------|---------|-----------|-----------|-----------------|------------|------------------|-----------------|------------|");

  // Probe http:// once at start
  const httpRes = await probeUrl("http://solace-ai-tq52.onrender.com/ping", 10000);
  console.log(formatRow(httpRes));

  const DURATION_MS = 8 * 60 * 1000; // 8 minutes
  const INTERVAL_MS = 15 * 1000;    // 15 seconds
  const start = Date.now();
  let iteration = 0;

  while (Date.now() - start < DURATION_MS) {
    iteration++;
    // Primary probe: GET https://.../ping (40s timeout)
    const pingRes = await probeUrl("https://solace-ai-tq52.onrender.com/ping", 40000);
    console.log(formatRow(pingRes));

    // Every 4th iteration, probe /api/v1/health as well
    if (iteration % 4 === 0) {
      const healthRes = await probeUrl("https://solace-ai-tq52.onrender.com/api/v1/health", 40000);
      console.log(formatRow(healthRes));
    }

    if (Date.now() - start < DURATION_MS) {
      await new Promise((r) => setTimeout(r, INTERVAL_MS));
    }
  }

  // End with one more http:// and /api/v1/health probe
  const endHttp = await probeUrl("http://solace-ai-tq52.onrender.com/ping", 10000);
  console.log(formatRow(endHttp));
  const endHealth = await probeUrl("https://solace-ai-tq52.onrender.com/api/v1/health", 40000);
  console.log(formatRow(endHealth));

  console.log(`Probe Complete: ${new Date().toISOString()}`);
}

if (process.argv[1]?.endsWith("probe-render.mjs")) {
  main().catch(console.error);
}
