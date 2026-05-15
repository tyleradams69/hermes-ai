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
    req.headers.authorization?.replace("Bearer ", "");

  if (!providedToken || providedToken !== expectedToken) {
    res.status(401).json({
      ok: false,
      error: "Unauthorized",
    });

    return false;
  }

  return true;
}
