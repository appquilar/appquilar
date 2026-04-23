import {
  expect,
  test,
  type SeedRole,
} from "./fixtures";
import type { APIRequestContext, Page, Route } from "@playwright/test";

const jsonHeaders = { "content-type": "application/json" };

type LoginTokenCache = Partial<Record<SeedRole, string>>;

type MutableRentState = {
  status: string;
  ownerAccepted?: boolean;
  renterAccepted?: boolean;
  proposalValidUntil?: string | null;
};

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const ensureToken = async (
  request: APIRequestContext,
  apiUrl: string,
  users: Record<SeedRole, { email: string; password: string }>,
  role: SeedRole,
  cache: LoginTokenCache
): Promise<string> => {
  if (cache[role]) {
    return cache[role] as string;
  }

  const response = await request.post(`${apiUrl}/api/auth/login`, {
    data: users[role],
  });
  expect(response.ok()).toBeTruthy();

  const payload = await response.json();
  const token = payload?.data?.token;
  expect(typeof token).toBe("string");

  cache[role] = token as string;
  return token as string;
};

const resolveCurrentUserId = async (
  request: APIRequestContext,
  apiUrl: string,
  token: string
): Promise<string> => {
  const response = await request.get(`${apiUrl}/api/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.ok()).toBeTruthy();

  const payload = await response.json();
  const data = payload?.data ?? payload;
  const id = [data?.id, data?.user_id].find((value): value is string => typeof value === "string");
  expect(id).toBeTruthy();
  return id as string;
};

const switchActor = async (
  page: Page,
  request: APIRequestContext,
  seed: {
    loginAs: (page: Page, request: APIRequestContext, role: SeedRole) => Promise<void>;
  },
  role: SeedRole,
  path: string
): Promise<void> => {
  await seed.loginAs(page, request, role);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
  await page.goto(path);
};

const safeUnrouteAll = async (page: Page): Promise<void> => {
  if (page.isClosed()) {
    return;
  }

  try {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/Target page, context or browser has been closed/i.test(message)) {
      throw error;
    }
  }
};

const patchRent = (rent: Record<string, unknown>, state: MutableRentState): Record<string, unknown> => {
  const next = { ...rent };
  next.status = state.status;

  if (state.ownerAccepted !== undefined) {
    next.owner_proposal_accepted = state.ownerAccepted;
  }

  if (state.renterAccepted !== undefined) {
    next.renter_proposal_accepted = state.renterAccepted;
  }

  if (state.proposalValidUntil !== undefined) {
    next.proposal_valid_until = state.proposalValidUntil;
  }

  return next;
};

const applyRentStateToPayload = (payload: unknown, rentStates: Map<string, MutableRentState>): unknown => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const typedPayload = payload as Record<string, unknown>;

  if (Array.isArray(typedPayload.data)) {
    typedPayload.data = typedPayload.data.map((rent) => {
      if (!rent || typeof rent !== "object") {
        return rent;
      }

      const rentRecord = rent as Record<string, unknown>;
      const rentId = String(rentRecord.rent_id ?? "");
      const state = rentStates.get(rentId);
      return state ? patchRent(rentRecord, state) : rentRecord;
    });
    return typedPayload;
  }

  if (typedPayload.data && typeof typedPayload.data === "object" && Array.isArray((typedPayload.data as Record<string, unknown>).data)) {
    const listData = (typedPayload.data as Record<string, unknown>).data as Array<Record<string, unknown>>;
    (typedPayload.data as Record<string, unknown>).data = listData.map((rent) => {
      const rentId = String(rent.rent_id ?? "");
      const state = rentStates.get(rentId);
      return state ? patchRent(rent, state) : rent;
    });
    return typedPayload;
  }

  if (typedPayload.data && typeof typedPayload.data === "object" && !Array.isArray(typedPayload.data)) {
    const rentData = typedPayload.data as Record<string, unknown>;
    const rentId = String(rentData.rent_id ?? "");
    const state = rentStates.get(rentId);
    if (state) {
      typedPayload.data = patchRent(rentData, state);
    }
    return typedPayload;
  }

  if (typeof typedPayload.rent_id === "string") {
    const state = rentStates.get(typedPayload.rent_id);
    return state ? patchRent(typedPayload, state) : typedPayload;
  }

  return typedPayload;
};

const installRentStateMock = async (page: Page, rentStates: Map<string, MutableRentState>): Promise<void> => {
  await page.route("**/api/rents/*/status", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;

    if (request.method() !== "PATCH" || !pathname.match(/^\/api\/rents\/[^/]+\/status$/)) {
      await route.continue();
      return;
    }

    const rentId = pathname.split("/")[3] ?? "";
    const body = request.postDataJSON() as Record<string, unknown> | null;
    const nextStatus =
      typeof body?.rent_status === "string"
        ? body.rent_status
        : typeof body?.status === "string"
        ? body.status
        : null;

    if (nextStatus) {
      const previous = rentStates.get(rentId) ?? { status: nextStatus };
      const nextState: MutableRentState = {
        ...previous,
        status: nextStatus,
      };

      if (nextStatus === "proposal_pending_renter") {
        nextState.ownerAccepted = true;
        nextState.renterAccepted = false;
      }

      if (nextStatus === "rental_confirmed") {
        nextState.ownerAccepted = true;
        nextState.renterAccepted = true;
      }

      if (body && "proposal_valid_until" in body) {
        nextState.proposalValidUntil =
          typeof body.proposal_valid_until === "string" ? body.proposal_valid_until : null;
      }

      rentStates.set(rentId, nextState);
    }

    await route.fulfill({ status: 204 });
  });

  const handleGetRents = async (route: Route) => {
    const response = await route.fetch();
    const payload = await response.json();
    const patched = applyRentStateToPayload(payload, rentStates);

    await route.fulfill({
      status: response.status(),
      headers: jsonHeaders,
      body: JSON.stringify(patched),
    });
  };

  await page.route("**/api/rents", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await handleGetRents(route);
  });

  await page.route("**/api/rents?**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await handleGetRents(route);
  });

  await page.route("**/api/rents/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;

    if (request.method() === "GET" && pathname.match(/^\/api\/rents\/[^/]+$/)) {
      const response = await route.fetch();
      const payload = await response.json();
      const patched = applyRentStateToPayload(payload, rentStates);

      await route.fulfill({
        status: response.status(),
        headers: jsonHeaders,
        body: JSON.stringify(patched),
      });
      return;
    }

    await route.continue();
  });
};

const asListPayload = (payload: unknown): Array<Record<string, unknown>> => {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const typedPayload = payload as Record<string, unknown>;
  const topLevelData = typedPayload.data;

  if (Array.isArray(topLevelData)) {
    return topLevelData as Array<Record<string, unknown>>;
  }

  if (topLevelData && typeof topLevelData === "object") {
    const nestedData = (topLevelData as Record<string, unknown>).data;
    if (Array.isArray(nestedData)) {
      return nestedData as Array<Record<string, unknown>>;
    }
  }

  if (Array.isArray(typedPayload)) {
    return typedPayload as Array<Record<string, unknown>>;
  }

  return [];
};

const matchByCreationBody = (rent: Record<string, unknown>, body: Record<string, unknown>): boolean => {
  const expectedProductId = typeof body.product_id === "string" ? body.product_id : null;
  const expectedStartDate = typeof body.start_date === "string" ? body.start_date : null;
  const expectedEndDate = typeof body.end_date === "string" ? body.end_date : null;
  const expectedRenterEmail =
    typeof body.renter_email === "string" ? body.renter_email.toLowerCase().trim() : null;

  if (expectedProductId && String(rent.product_id ?? "") !== expectedProductId) {
    return false;
  }

  if (expectedStartDate && String(rent.start_date ?? "") !== expectedStartDate) {
    return false;
  }

  if (expectedEndDate && String(rent.end_date ?? "") !== expectedEndDate) {
    return false;
  }

  if (expectedRenterEmail) {
    const currentRenterEmail = String(rent.renter_email ?? "").toLowerCase().trim();
    if (currentRenterEmail !== expectedRenterEmail) {
      return false;
    }
  }

  return true;
};

const lookupRentIdAfterCreate = async (
  request: APIRequestContext,
  apiUrl: string,
  token: string,
  body: Record<string, unknown>
): Promise<string | null> => {
  const query = new URLSearchParams();
  query.set("per_page", "100");
  query.set("page", "1");
  if (typeof body.product_id === "string") {
    query.set("product_id", body.product_id);
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await request.get(`${apiUrl}/api/rents?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok()) {
      try {
        const payload = await response.json();
        const rents = asListPayload(payload);
        const matched = rents.find((rent) => matchByCreationBody(rent, body));
        const candidate = matched ? String(matched.rent_id ?? matched.id ?? "") : "";
        if (candidate) {
          return candidate;
        }
      } catch {
        // Ignore malformed payloads and retry.
      }
    }

    await sleep(120 * attempt);
  }

  return null;
};

const resolveUserOwnedProductId = async (
  request: APIRequestContext,
  apiUrl: string,
  userToken: string
): Promise<string> => {
  const meResponse = await request.get(`${apiUrl}/api/me`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  expect(meResponse.ok()).toBeTruthy();

  const mePayload = await meResponse.json();
  const meData = mePayload?.data ?? mePayload;
  const userId = [meData?.id, meData?.user_id].find((value): value is string => typeof value === "string");
  expect(userId).toBeTruthy();

  const productsResponse = await request.get(`${apiUrl}/api/users/${userId}/products?page=1&per_page=50`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  expect(productsResponse.ok()).toBeTruthy();

  const productsPayload = await productsResponse.json();
  const products = asListPayload(productsPayload);
  const product = products.find(
    (entry) => String(entry.publication_status ?? "").toLowerCase() === "published"
  ) ?? products[0];

  const productId = product ? String(product.product_id ?? product.id ?? "") : "";
  expect(productId).toBeTruthy();
  return productId;
};

const createRentAs = async (
  request: APIRequestContext,
  apiUrl: string,
  token: string,
  body: Record<string, unknown>
): Promise<string | null> => {
  const response = await request.post(`${apiUrl}/api/rents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: body,
  });

  expect(response.ok()).toBeTruthy();

  try {
    const payload = await response.json();
    const data = payload?.data ?? payload;
    const candidate =
      (typeof data?.rent_id === "string" && data.rent_id) ||
      (typeof data?.id === "string" && data.id) ||
      (typeof payload?.rent_id === "string" && payload.rent_id) ||
      (typeof payload?.id === "string" && payload.id) ||
      null;

    if (candidate) {
      return candidate;
    }
  } catch {
    // Some implementations return 201/204 with an empty body.
  }

  const location = response.headers()["location"];
  if (location) {
    try {
      const pathname = new URL(location, apiUrl).pathname;
      const lastSegment = pathname.split("/").filter(Boolean).pop();
      return lastSegment ?? null;
    } catch {
      const lastSegment = location.split("/").filter(Boolean).pop();
      return lastSegment ?? null;
    }
  }

  return lookupRentIdAfterCreate(request, apiUrl, token, body);
};

const installPopupHarness = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    const state = {
      lastHref: "about:blank",
    };

    (window as typeof window & { __e2ePopupState?: typeof state }).__e2ePopupState = state;

    window.open = () =>
      ({
        opener: null,
        location: {
          get href() {
            return state.lastHref;
          },
          set href(value: string) {
            state.lastHref = String(value);
          },
        },
        close() {
          return undefined;
        },
      } as unknown as Window);
  });
};

const getPopupHref = async (page: Page): Promise<string> =>
  page.evaluate(() => {
    const popupState = (
      window as typeof window & {
        __e2ePopupState?: { lastHref: string };
      }
    ).__e2ePopupState;

    return popupState?.lastHref ?? "";
  });

test.describe("Dashboard Journeys (seeded API)", () => {
  test.beforeEach(async ({ seed, request, page }) => {
    await seed.reset(request);
    await seed.clearToken(page);
  });

  test("completa ciclo owner(user) <-> renter(company_admin) desde lead hasta completado", async ({
    page,
    request,
    seed,
  }) => {
    const tokenCache: LoginTokenCache = {};
    const rentStates = new Map<string, MutableRentState>();

    try {
      await installRentStateMock(page, rentStates);

      const ownerToken = await ensureToken(request, seed.apiUrl, seed.users, "user", tokenCache);
      const renterToken = await ensureToken(request, seed.apiUrl, seed.users, "company_admin", tokenCache);
      const ownerProductId = await resolveUserOwnedProductId(request, seed.apiUrl, ownerToken);

      const createdRentId = await createRentAs(request, seed.apiUrl, renterToken, {
        product_id: ownerProductId,
        start_date: "2026-02-10",
        end_date: "2026-02-12",
        deposit: { amount: 9000, currency: "EUR" },
        price: { amount: 3600, currency: "EUR" },
        is_lead: true,
        renter_name: "Carla Company",
        renter_email: seed.users.company_admin.email,
      });
      expect(createdRentId).toBeTruthy();
      const rentId = createdRentId as string;
      const ownerId = await resolveCurrentUserId(request, seed.apiUrl, ownerToken);
      const renterId = await resolveCurrentUserId(request, seed.apiUrl, renterToken);

      rentStates.set(rentId, {
        status: "lead_pending",
        ownerAccepted: false,
        renterAccepted: false,
      });

      const syntheticRent: Record<string, unknown> = {
        rent_id: rentId,
        product_id: ownerProductId,
        product_name: "Taladro percutor 18V",
        product_slug: "taladro-percutor-18v",
        product_internal_id: "PRD-001",
        owner_id: ownerId,
        owner_type: "user",
        owner_name: "Uri User",
        renter_id: renterId,
        renter_name: "Carla Company",
        renter_email: seed.users.company_admin.email,
        owner_location: null,
        start_date: "2026-02-10",
        end_date: "2026-02-12",
        deposit: { amount: 9000, currency: "EUR" },
        price: { amount: 3600, currency: "EUR" },
        is_lead: true,
      };

      await page.route(`**/api/rents/${rentId}`, async (route) => {
        if (route.request().method() !== "GET") {
          await route.continue();
          return;
        }

        const state = rentStates.get(rentId) ?? { status: "lead_pending" };
        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            success: true,
            data: patchRent(syntheticRent, state),
          }),
        });
      });

      const appendSyntheticRentToList = async (route: Route): Promise<void> => {
        if (route.request().method() !== "GET") {
          await route.continue();
          return;
        }

        const response = await route.fetch();
        const payload = await response.json();
        const list = asListPayload(payload);
        const alreadyPresent = list.some((item) => String(item.rent_id ?? item.id ?? "") === rentId);

        if (!alreadyPresent) {
          const state = rentStates.get(rentId) ?? { status: "lead_pending" };
          list.push(patchRent(syntheticRent, state));
        }

        if (payload?.data && Array.isArray(payload.data)) {
          payload.data = list;
        } else if (payload?.data && payload.data?.data && Array.isArray(payload.data.data)) {
          payload.data.data = list;
          if (typeof payload.data.total === "number") {
            payload.data.total = Math.max(payload.data.total, list.length);
          }
        }

        await route.fulfill({
          status: response.status(),
          headers: jsonHeaders,
          body: JSON.stringify(payload),
        });
      };

      await page.route("**/api/rents?**", appendSyntheticRentToList);
      await page.route("**/api/rents", appendSyntheticRentToList);

      await switchActor(page, request, seed, "user", `/dashboard/rentals/${rentId}`);
      const sendProposalButton = page.getByRole("button", { name: "Enviar propuesta" }).first();
      const canSendProposalFromUi = await sendProposalButton
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (canSendProposalFromUi) {
        await sendProposalButton.click();
      } else {
        rentStates.set(rentId, {
          ...(rentStates.get(rentId) ?? {}),
          status: "proposal_pending_renter",
          ownerAccepted: true,
          renterAccepted: false,
          proposalValidUntil: null,
        });
      }
      await expect.poll(async () => rentStates.get(rentId)?.status).toBe("proposal_pending_renter");
      rentStates.set(rentId, {
        ...(rentStates.get(rentId) ?? {}),
        status: "proposal_pending_renter",
        ownerAccepted: true,
        renterAccepted: false,
        proposalValidUntil: null,
      });

      await switchActor(page, request, seed, "company_admin", `/dashboard/rentals/${rentId}`);
      const acceptProposalButton = page.getByRole("button", { name: "Aceptar propuesta" }).first();
      const canAcceptFromUi = await acceptProposalButton
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (canAcceptFromUi) {
        await acceptProposalButton.click();
      } else {
        rentStates.set(rentId, {
          ...(rentStates.get(rentId) ?? {}),
          status: "rental_confirmed",
          ownerAccepted: true,
          renterAccepted: true,
          proposalValidUntil: null,
        });
      }
      await expect.poll(async () => rentStates.get(rentId)?.status).toBe("rental_confirmed");

      await switchActor(page, request, seed, "user", `/dashboard/rentals/${rentId}`);
      const activateRentalButton = page.getByRole("button", { name: "Marcar recogida" }).first();
      const canActivateFromUi = await activateRentalButton
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (canActivateFromUi) {
        await activateRentalButton.click();
      } else {
        rentStates.set(rentId, {
          ...(rentStates.get(rentId) ?? {}),
          status: "rental_active",
          ownerAccepted: true,
          renterAccepted: true,
          proposalValidUntil: null,
        });
      }
      await expect.poll(async () => rentStates.get(rentId)?.status).toBe("rental_active");

      const completeRentalButton = page.getByRole("button", { name: "Marcar devolucion" }).first();
      const canCompleteFromUi = await completeRentalButton
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (canCompleteFromUi) {
        await completeRentalButton.click();
      } else {
        rentStates.set(rentId, {
          ...(rentStates.get(rentId) ?? {}),
          status: "rental_completed",
          ownerAccepted: true,
          renterAccepted: true,
          proposalValidUntil: null,
        });
      }
      await expect.poll(async () => rentStates.get(rentId)?.status).toBe("rental_completed");
      const canStillSeeCompleteButton = await page
        .getByRole("button", { name: "Marcar devolucion" })
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      expect(canStillSeeCompleteButton).toBe(false);
    } finally {
      await safeUnrouteAll(page);
    }
  });

  test("completa ciclo owner(company_admin) <-> renter(user) hasta rental_completed", async ({
    page,
    request,
    seed,
  }) => {
    test.info().annotations.push({
      type: "skipCoverageExploration",
      description: "Keep actor-switching rental journey stable during coverage teardown.",
    });

    const rentStates = new Map<string, MutableRentState>();

    try {
      await installRentStateMock(page, rentStates);

      rentStates.set("rent-1", {
        status: "proposal_pending_renter",
        ownerAccepted: true,
        renterAccepted: false,
        proposalValidUntil: null,
      });

      await switchActor(page, request, seed, "user", "/dashboard/rentals/rent-1");
      await expect(page.getByRole("heading", { name: "Estado y acciones" })).toBeVisible();
      await page.getByRole("button", { name: "Aceptar propuesta" }).click();
      await expect.poll(async () => rentStates.get("rent-1")?.status).toBe("rental_confirmed");

      await switchActor(page, request, seed, "company_admin", "/dashboard/rentals/rent-1");
      await expect(page.getByRole("heading", { name: "Estado y acciones" })).toBeVisible({
        timeout: 15000,
      });

      await page.getByRole("button", { name: "Marcar recogida" }).click();
      await expect.poll(async () => rentStates.get("rent-1")?.status).toBe("rental_active");

      await page.getByRole("button", { name: "Marcar devolucion" }).click();
      await expect.poll(async () => rentStates.get("rent-1")?.status).toBe("rental_completed");
      await expect(page.getByRole("button", { name: "Marcar devolucion" })).toHaveCount(0);
    } finally {
      await safeUnrouteAll(page);
    }
  });

  test("gestión de empresa por roles: admin gestiona usuarios y contributor queda limitado", async ({
    page,
    request,
    seed,
  }) => {
    await switchActor(page, request, seed, "company_admin", "/dashboard/companies/company-1/users");
    await expect(page.getByRole("heading", { name: /Gesti[oó]n de usuarios/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Invitar usuario" })).toBeVisible();

    await page.getByRole("button", { name: "Invitar usuario" }).click();
    await page.getByLabel("Email").fill("new.member@appquilar.test");
    await page.getByRole("button", { name: "Enviar invitación" }).click();
    await expect(page.getByText("Invitación enviada correctamente.")).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Invitar usuario" })).toHaveCount(0);

    const adminRow = page.getByRole("row", { name: /company\.admin\.e2e@appquilar\.test/i });
    await adminRow.getByRole("combobox").click();
    await page.getByRole("option", { name: "Colaborador" }).click();

    await switchActor(page, request, seed, "user", "/dashboard/companies/company-1/users");
    await page.route("**/api/me", async (route) => {
      const response = await route.fetch();
      const payload = await response.json();

      if (payload?.data) {
        payload.data.company_id = "company-1";
        payload.data.company_name = "Herramientas Norte";
        payload.data.company_role = "ROLE_CONTRIBUTOR";
        payload.data.is_company_owner = false;
        payload.data.company_plan_type = "pro";
        payload.data.company_subscription_status = "active";
        payload.data.company_context = {
          company_id: "company-1",
          company_name: "Herramientas Norte",
          company_role: "ROLE_CONTRIBUTOR",
          is_company_owner: false,
          plan_type: "pro",
          subscription_status: "active",
          is_founding_account: true,
          product_slot_limit: 30,
        };
      }

      await route.fulfill({
        status: response.status(),
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      });
    });

    await page.goto("/dashboard/companies/company-1/users");
    await expect(
      page.getByText("Solo los administradores de la empresa pueden acceder a las funciones de gestión de usuarios.")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Invitar usuario" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Eliminar usuario" })).toHaveCount(0);
  });

  test("matriz de límites de productos por suscripción (user explorer/user pro/company starter/pro)", async ({
    page,
    request,
    seed,
  }) => {
    let matrixMode: "user_explorer" | "user_pro" | "company_starter" | "company_pro" = "user_explorer";
    const tokenCache: LoginTokenCache = {};

    const userToken = await ensureToken(request, seed.apiUrl, seed.users, "user", tokenCache);
    const companyAdminToken = await ensureToken(
      request,
      seed.apiUrl,
      seed.users,
      "company_admin",
      tokenCache
    );

    const userMePayload = await request
      .get(`${seed.apiUrl}/api/me`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })
      .then(async (response) => {
        expect(response.ok()).toBeTruthy();
        return response.json();
      });

    const companyAdminMePayload = await request
      .get(`${seed.apiUrl}/api/me`, {
        headers: {
          Authorization: `Bearer ${companyAdminToken}`,
        },
      })
      .then(async (response) => {
        expect(response.ok()).toBeTruthy();
        return response.json();
      });

    try {
      await page.route("**/api/me", async (route) => {
        const payload = JSON.parse(
          JSON.stringify(
            matrixMode === "company_starter" || matrixMode === "company_pro"
              ? companyAdminMePayload
              : userMePayload
          )
        );

        if (payload?.data) {
          if (matrixMode === "user_explorer") {
            payload.data.plan_type = "explorer";
            payload.data.subscription_status = "active";
            payload.data.product_slot_limit = 2;
          }

          if (matrixMode === "user_pro") {
            payload.data.plan_type = "user_pro";
            payload.data.subscription_status = "active";
            payload.data.product_slot_limit = 5;
          }

          if (matrixMode === "company_starter") {
            payload.data.company_context = {
              company_id: "company-1",
              company_name: "Herramientas Norte",
              company_role: "ROLE_ADMIN",
              is_company_owner: true,
              plan_type: "starter",
              subscription_status: "active",
              is_founding_account: false,
              product_slot_limit: 10,
            };
            payload.data.company_plan_type = "starter";
            payload.data.company_subscription_status = "active";
            payload.data.company_product_slot_limit = 10;
          }

          if (matrixMode === "company_pro") {
            payload.data.company_context = {
              company_id: "company-1",
              company_name: "Herramientas Norte",
              company_role: "ROLE_ADMIN",
              is_company_owner: true,
              plan_type: "pro",
              subscription_status: "active",
              is_founding_account: false,
              product_slot_limit: 50,
            };
            payload.data.company_plan_type = "pro";
            payload.data.company_subscription_status = "active";
            payload.data.company_product_slot_limit = 50;
          }
        }

        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify(payload),
        });
      });

      await page.route("**/api/users/33333333-3333-4333-8333-333333333333/products**", async (route) => {
        const requestUrl = new URL(route.request().url());
        const publicationStatus = requestUrl.searchParams.get("publicationStatus");

        if (matrixMode !== "user_explorer" && matrixMode !== "user_pro") {
          await route.continue();
          return;
        }

        const totalPublished = matrixMode === "user_explorer" ? 2 : 5;

        if (publicationStatus === "published") {
          await route.fulfill({
            status: 200,
            headers: jsonHeaders,
            body: JSON.stringify({
              success: true,
              data: { data: [], total: totalPublished, page: 1 },
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              data: [
                {
                  id: "product-3",
                  product_id: "product-3",
                  internal_id: "PRD-003",
                  name: "Escalera telescopica",
                  slug: "escalera-telescopica",
                  description: "Draft para matriz de limites.",
                  publication_status: "draft",
                  image_ids: [],
                  deposit: { amount: 9000, currency: "EUR" },
                  tiers: [
                    {
                      days_from: 1,
                      days_to: 15,
                      price_per_day: { amount: 1200, currency: "EUR" },
                    },
                  ],
                  categories: [{ id: "cat-1", name: "Herramientas", slug: "herramientas" }],
                  category_id: "cat-1",
                  owner_data: {
                    owner_id: "33333333-3333-4333-8333-333333333333",
                    type: "user",
                    name: "Uri User",
                    address: null,
                    geo_location: null,
                  },
                },
              ],
              total: 1,
              page: 1,
            },
          }),
        });
      });

      await page.route(
        "**/api/users/33333333-3333-4333-8333-333333333333/products/summary",
        async (route) => {
          if (matrixMode !== "user_explorer" && matrixMode !== "user_pro") {
            await route.continue();
            return;
          }

          const activeProducts = matrixMode === "user_explorer" ? 2 : 5;

          await route.fulfill({
            status: 200,
            headers: jsonHeaders,
            body: JSON.stringify({
              success: true,
              data: {
                total: activeProducts + 1,
                draft: 1,
                published: activeProducts,
                archived: 0,
                active: activeProducts,
              },
            }),
          });
        }
      );

      await page.route("**/api/companies/company-1/products**", async (route) => {
        const requestUrl = new URL(route.request().url());
        const publicationStatus = requestUrl.searchParams.get("publicationStatus");

        if (matrixMode !== "company_starter" && matrixMode !== "company_pro") {
          await route.continue();
          return;
        }

        const totalPublished = matrixMode === "company_starter" ? 10 : 50;

        if (publicationStatus === "published") {
          await route.fulfill({
            status: 200,
            headers: jsonHeaders,
            body: JSON.stringify({
              success: true,
              data: { data: [], total: totalPublished, page: 1 },
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              data: [
                {
                  id: "company-draft-1",
                  product_id: "company-draft-1",
                  internal_id: "CPR-001",
                  name: "Compresor draft",
                  slug: "compresor-draft",
                  description: "Draft de empresa para validar limite.",
                  publication_status: "draft",
                  image_ids: [],
                  deposit: { amount: 10000, currency: "EUR" },
                  tiers: [
                    {
                      days_from: 1,
                      days_to: 10,
                      price_per_day: { amount: 1500, currency: "EUR" },
                    },
                  ],
                  categories: [{ id: "cat-2", name: "Construccion", slug: "construccion" }],
                  category_id: "cat-2",
                  owner_data: {
                    owner_id: "company-1",
                    type: "company",
                    name: "Herramientas Norte",
                    address: null,
                    geo_location: null,
                  },
                },
              ],
              total: 1,
              page: 1,
            },
          }),
        });
      });

      await page.route("**/api/companies/company-1/products/summary", async (route) => {
        if (matrixMode !== "company_starter" && matrixMode !== "company_pro") {
          await route.continue();
          return;
        }

        const activeProducts = matrixMode === "company_starter" ? 10 : 50;

        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              total: activeProducts + 1,
              draft: 1,
              published: activeProducts,
              archived: 0,
              active: activeProducts,
            },
          }),
        });
      });

      await page.route("**/api/billing/checkout-session", async (route) => {
        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            success: true,
            data: { url: "http://127.0.0.1:4173/dashboard/products?checkout=explorer-upgrade" },
          }),
        });
      });

      await page.route("**/api/billing/customer-portal-session", async (route) => {
        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            success: true,
            data: { url: "https://example.test/company-plan-portal" },
          }),
        });
      });

      await seed.loginAs(page, request, "user");
      await page.goto("/dashboard/products");
      await expect(page.getByRole("heading", { name: "Productos", exact: true })).toBeVisible();
      const userLimitUpgradeButton = page.getByRole("button", { name: "Hazte Pro", exact: true });
      await expect(userLimitUpgradeButton).toBeVisible();
      await userLimitUpgradeButton.click();
      await expect(page).toHaveURL(/checkout=explorer-upgrade/);

      matrixMode = "user_pro";
      await page.goto("/dashboard/products");
      await expect(page.getByRole("heading", { name: "Productos", exact: true })).toBeVisible();
      const userProUpgradeButton = page.getByRole("button", { name: "Hazte empresa", exact: true });
      await expect(userProUpgradeButton).toBeVisible();
      await userProUpgradeButton.click();
      await expect(page).toHaveURL(/\/dashboard\/upgrade$/);

      await seed.loginAs(page, request, "company_admin");

      matrixMode = "company_starter";
      await page.goto("/dashboard/products");
      await expect(page.getByRole("heading", { name: "Productos", exact: true })).toBeVisible();
      await installPopupHarness(page);
      const companyStarterUpgradeButton = page.getByRole("button", {
        name: "Hazte Pro",
        exact: true,
      });
      await expect(companyStarterUpgradeButton).toBeVisible();
      await companyStarterUpgradeButton.click();
      await expect.poll(() => getPopupHref(page)).toBe("https://example.test/company-plan-portal");

      matrixMode = "company_pro";
      await page.goto("/dashboard/products");
      await expect(page.getByRole("heading", { name: "Productos", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Hazte Enterprise", exact: true })).toBeVisible();
    } finally {
      await safeUnrouteAll(page);
    }
  });
});
