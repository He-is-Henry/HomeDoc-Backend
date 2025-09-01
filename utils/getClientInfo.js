const uaParser = require("ua-parser-js");
const geoip = require("geoip-lite");

function getClientInfo(req) {
  const ua = req.headers["user-agent"] || "Unknown";
  const parsed = uaParser(ua);

  const browser =
    parsed.browser?.name && parsed.browser?.version
      ? `${parsed.browser.name} ${parsed.browser.version}`
      : "Unknown browser";

  const os =
    parsed.os?.name && parsed.os?.version
      ? `${parsed.os.name} ${parsed.os.version}`
      : "Unknown OS";

  const platform = parsed.device?.type || "desktop";

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "Unknown IP";
  const geo = geoip.lookup(ip);
  const location = geo
    ? [geo.city, geo.region, geo.country].filter(Boolean).join(", ")
    : "Unknown Location";
  const info = {
    device: `${browser} on ${os}`,
    location,
    ipAddress: ip,
    userAgent: ua,
    browser: browser,
    os: os,
    platform: platform,
    isMobile: platform === "mobile",
  };
  return info;
}

module.exports = { getClientInfo };
