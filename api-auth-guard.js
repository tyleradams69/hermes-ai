import crypto from "crypto";

function safeTokenEqual(providedToken, expectedToken) {
  if (!providedToken || !expectedToken) {
    return false;
  }

  const provided =
    Buffer.from(String(providedToken));
  const expected =
    Buffer.from(String(expectedToken));

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, expected);
}

export function requireApiAuth(req, res) {
  const expectedToken =
    process.env.HERMES_API_TOKEN;

  if (!expectedToken) {
    res.status(500).json({
      ok: false,
      error: "Server API token is not configured",
    });

    return false;
  }

  const providedToken =
    req.headers["x-hermes-token"] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!safeTokenEqual(providedToken, expectedToken)) {
    res.status(401).json({
      ok: false,
      error: "Unauthorized",
    });

    return false;
  }

  return true;
}
