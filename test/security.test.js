import assert from "node:assert/strict";
import test from "node:test";

import { requireApiAuth } from "../api-auth-guard.js";
import { requireRole } from "../role-guard.js";

function mockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test("requireApiAuth rejects requests when HERMES_API_TOKEN is missing", () => {
  const originalToken = process.env.HERMES_API_TOKEN;
  delete process.env.HERMES_API_TOKEN;

  const res = mockResponse();
  const allowed = requireApiAuth({ headers: { "x-hermes-token": "anything" } }, res);

  assert.equal(allowed, false);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, "Server API token is not configured");

  if (originalToken) {
    process.env.HERMES_API_TOKEN = originalToken;
  }
});

test("requireApiAuth accepts the configured token from x-hermes-token", () => {
  process.env.HERMES_API_TOKEN = "test-secret-token";

  const res = mockResponse();
  const allowed = requireApiAuth(
    { headers: { "x-hermes-token": "test-secret-token" } },
    res
  );

  assert.equal(allowed, true);
  assert.equal(res.statusCode, 200);
});

test("requireApiAuth accepts the configured token from Authorization Bearer", () => {
  process.env.HERMES_API_TOKEN = "test-secret-token";

  const res = mockResponse();
  const allowed = requireApiAuth(
    { headers: { authorization: "Bearer test-secret-token" } },
    res
  );

  assert.equal(allowed, true);
});

test("requireApiAuth rejects wrong or length-mismatched tokens", () => {
  process.env.HERMES_API_TOKEN = "test-secret-token";

  for (const providedToken of ["wrong-secret", "test-secret-token-extra", ""]) {
    const res = mockResponse();
    const allowed = requireApiAuth(
      { headers: { "x-hermes-token": providedToken } },
      res
    );

    assert.equal(allowed, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error, "Unauthorized");
  }
});

test("requireRole requires a role header", () => {
  const res = mockResponse();
  const allowed = requireRole({
    req: { headers: {} },
    res,
    allowedRoles: ["admin"],
  });

  assert.equal(allowed, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, "Role required");
});

test("requireRole rejects roles outside the allowlist", () => {
  const res = mockResponse();
  const allowed = requireRole({
    req: { headers: { "x-hermes-role": "viewer" } },
    res,
    allowedRoles: ["admin"],
  });

  assert.equal(allowed, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error, "Insufficient permissions");
});

test("requireRole accepts roles in the allowlist", () => {
  const res = mockResponse();
  const allowed = requireRole({
    req: { headers: { "x-hermes-role": "admin" } },
    res,
    allowedRoles: ["admin"],
  });

  assert.equal(allowed, true);
  assert.equal(res.statusCode, 200);
});
