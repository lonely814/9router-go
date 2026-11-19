### Fixed

- **CodeBuddy CN connections showed no quota rows.** `GET /api/usage/{id}`
  answered "Account active. No quota limits tracked." for every `codebuddy-cn`
  connection: `fetchProviderUsage` had a `codebuddy-intl` case and no `codebuddy-cn`
  case, so the provider fell to the `default` branch and returned `ok=false`.

  `fetchCodeBuddyIntlUsage` became `fetchCodeBuddyUsage`, which takes the provider
  and selects two things from it — the billing origin
  (`www.codebuddy.ai` → `copilot.tencent.com`) and the request identity
  (`codebuddyIntlHeaders` → the registry's `codebuddy-cn.StaticHeaders`). The
  response envelope, the refill/bonus split and the `Monthly` / `Bonus Pack N` row
  names are identical on both lanes, so they are parsed once. The intl headers are
  untouched and `fetchCodeBuddyIntlUsage` is kept as the intl-only entry point.

  The CN identity is read from `providers.KnownProviders["codebuddy-cn"].StaticHeaders`
  rather than hardcoded, so a billing read presents the same `CLI/2.133.1`,
  `X-IDE-Type: CLI`, `X-Domain: www.codebuddy.cn` client the chat lane sends and
  the identity bump has one place to change.

  Error messages now name the provider that answered (`CodeBuddy (codebuddy-cn)
  credential invalid or expired.`) instead of saying "CN" on both lanes.

### Verification

- `go test ./internal/handlers/dashboard/` passes (57s), including the new
  `usage_codebuddy_test.go`: CN dispatch fills `Monthly` + `Bonus Pack 1`, the CN
  request carries the CLI identity, the intl request keeps its IDE identity and
  sends no `X-Domain`, error text names the right lane, and an empty account list
  is a message rather than a failure.
- `go test ./internal/handlers/... ./internal/providers/... ./internal/proxy/...` —
  no failures.
- `go build ./...` and `go vet ./internal/handlers/dashboard/` clean.
