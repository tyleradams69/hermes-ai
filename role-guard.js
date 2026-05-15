export function requireRole({
  req,
  res,
  allowedRoles = [],
}) {

  const role =
    req.headers["x-hermes-role"];

  if (!role) {
    res.status(403).json({
      ok: false,
      error: "Role required",
    });

    return false;
  }

  if (!allowedRoles.includes(role)) {
    res.status(403).json({
      ok: false,
      error: "Insufficient permissions",
    });

    return false;
  }

  return true;
}
