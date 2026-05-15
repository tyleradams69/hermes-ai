export function requireBusinessId(req, res) {

  const businessId =
    req.body?.business_id ||
    req.query?.business_id;

  if (!businessId) {
    res.status(400).json({
      ok: false,
      error: "business_id is required",
    });

    return null;
  }

  return businessId;
}
