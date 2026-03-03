import http from "node:http";
import { createInitialSeedState, seedConfig } from "./dashboard-seed.mjs";

const PORT = Number(process.env.E2E_SEED_PORT ?? 18080);

let state = createInitialSeedState();

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};

const noContentHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
};

const decodePath = (url) => {
  const parsed = new URL(url, "http://127.0.0.1");
  return parsed;
};

const readJsonBody = async (req) => {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const sendJson = (res, status, body) => {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(body));
};

const sendNoContent = (res, status = 204) => {
  res.writeHead(status, noContentHeaders);
  res.end();
};

const sendText = (res, status, body, contentType = "text/plain") => {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  });
  res.end(body);
};

const toSnakeUser = (user) => ({
  id: user.id,
  user_id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  roles: user.roles,
  address: user.address ?? null,
  location: user.location ?? null,
  company_id: user.company_id ?? null,
  company_name: user.company_name ?? null,
  company_role: user.company_role ?? null,
  is_company_owner: user.is_company_owner ?? false,
  plan_type: user.plan_type ?? "explorer",
  subscription_status: user.subscription_status ?? "active",
  product_slot_limit: user.product_slot_limit ?? null,
  company_plan_type: user.company_plan_type ?? null,
  company_subscription_status: user.company_subscription_status ?? null,
  company_is_founding_account: user.company_is_founding_account ?? null,
  company_product_slot_limit: user.company_product_slot_limit ?? null,
  company_context: user.company_context ?? null,
  status: user.status ?? "active",
  date_added: user.date_added ?? null,
  profile_picture_id: null,
});

const createToken = (user) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      roles: user.roles,
      exp: 4102444800,
    })
  ).toString("base64url");

  return `${header}.${payload}.seed-signature`;
};

const parseToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payloadRaw = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(payloadRaw);

    if (!payload || typeof payload.sub !== "string") {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
};

const authUser = (req) => {
  const userId = parseToken(req.headers.authorization);
  if (!userId) {
    return null;
  }

  return state.users.find((user) => user.id === userId) ?? null;
};

const requireAuth = (req, res) => {
  const user = authUser(req);

  if (!user) {
    sendJson(res, 401, {
      success: false,
      error: ["auth.unauthorized"],
    });
    return null;
  }

  return user;
};

const parsePagination = (searchParams, defaults = { page: 1, perPage: 10 }) => {
  const page = Math.max(1, Number(searchParams.get("page") ?? defaults.page) || defaults.page);
  const perPage = Math.max(1, Number(searchParams.get("per_page") ?? defaults.perPage) || defaults.perPage);
  const offset = (page - 1) * perPage;

  return { page, perPage, offset };
};

const paginate = (rows, page, perPage, offset) => rows.slice(offset, offset + perPage);

const normalize = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

const filterProductsByOwner = (ownerId, ownerType) => {
  return state.products.filter(
    (product) =>
      product.owner_data?.owner_id === ownerId &&
      normalize(product.owner_data?.type) === normalize(ownerType)
  );
};

const applyProductFilters = (products, searchParams) => {
  const id = normalize(searchParams.get("id"));
  const internalId = normalize(searchParams.get("internalId"));
  const name = normalize(searchParams.get("name"));
  const categoryId = normalize(searchParams.get("categoryId"));
  const publicationStatus = normalize(searchParams.get("publicationStatus"));

  return products.filter((product) => {
    if (id && normalize(product.id) !== id) {
      return false;
    }

    if (internalId && normalize(product.internal_id) !== internalId) {
      return false;
    }

    if (name && !normalize(product.name).includes(name)) {
      return false;
    }

    if (categoryId && normalize(product.category_id) !== categoryId) {
      return false;
    }

    if (publicationStatus && normalize(product.publication_status) !== publicationStatus) {
      return false;
    }

    return true;
  });
};

const pendingStatuses = new Set([
  "lead_pending",
  "proposal_pending_renter",
  "rental_confirmed",
  "rental_active",
]);
const cancelledStatuses = new Set(["cancelled", "rejected", "expired"]);
const completedStatuses = new Set(["rental_completed"]);

const applyRentFilters = (rents, searchParams, currentUser) => {
  const role = normalize(searchParams.get("role"));
  const ownerId = normalize(searchParams.get("owner_id"));
  const status = normalize(searchParams.get("status"));
  const statusGroup = normalize(searchParams.get("status_group"));
  const timeline = normalize(searchParams.get("timeline"));
  const search = normalize(searchParams.get("search"));
  const isLeadParam = searchParams.get("is_lead");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  return rents.filter((rent) => {
    if (role === "owner") {
      const effectiveOwner = ownerId || normalize(currentUser?.company_id || currentUser?.id);
      if (effectiveOwner && normalize(rent.owner_id) !== effectiveOwner) {
        return false;
      }
    }

    if (role === "renter") {
      if (!currentUser || normalize(rent.renter_id) !== normalize(currentUser.id)) {
        return false;
      }
    }

    if (status && normalize(rent.status) !== status) {
      return false;
    }

    if (statusGroup === "pending" && !pendingStatuses.has(normalize(rent.status))) {
      return false;
    }

    if (statusGroup === "cancelled" && !cancelledStatuses.has(normalize(rent.status))) {
      return false;
    }

    if (statusGroup === "completed" && !completedStatuses.has(normalize(rent.status))) {
      return false;
    }

    if (timeline === "past") {
      const ended = new Date(`${rent.end_date}T23:59:59Z`).getTime();
      const now = Date.now();
      const inPastByDate = Number.isFinite(ended) ? ended < now : false;
      const isPastByStatus = completedStatuses.has(normalize(rent.status)) || cancelledStatuses.has(normalize(rent.status));
      if (!inPastByDate && !isPastByStatus) {
        return false;
      }
    }

    if (timeline === "upcoming") {
      const start = new Date(`${rent.start_date}T00:00:00Z`).getTime();
      if (Number.isFinite(start) && start < Date.now()) {
        return false;
      }
    }

    if (search) {
      const haystack = [rent.rent_id, rent.product_name, rent.owner_name, rent.renter_name].map(normalize).join(" ");
      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (typeof isLeadParam === "string") {
      const expected = isLeadParam === "true";
      if (Boolean(rent.is_lead) !== expected) {
        return false;
      }
    }

    if (startDate && rent.start_date < startDate) {
      return false;
    }

    if (endDate && rent.end_date > endDate) {
      return false;
    }

    return true;
  });
};

const resolveUnreadByUser = (user) => {
  if (!user) {
    return [];
  }

  const ownerReference = user.company_id ?? user.id;
  const visibleRents = state.rents.filter(
    (rent) => normalize(rent.owner_id) === normalize(ownerReference) || normalize(rent.renter_id) === normalize(user.id)
  );

  return visibleRents.map((rent) => ({
    rent_id: rent.rent_id,
    unread_count: state.unreadByRent[rent.rent_id] ?? 0,
  }));
};

const ensureCompanyContextForOwner = (company, owner) => {
  owner.company_id = company.company_id;
  owner.company_name = company.name;
  owner.company_role = "ROLE_ADMIN";
  owner.is_company_owner = true;
  owner.company_plan_type = company.plan_type;
  owner.company_subscription_status = company.subscription_status;
  owner.company_is_founding_account = company.is_founding_account;
  owner.company_product_slot_limit = 20;
  owner.company_context = {
    company_id: company.company_id,
    company_name: company.name,
    company_role: "ROLE_ADMIN",
    is_company_owner: true,
    plan_type: company.plan_type,
    subscription_status: company.subscription_status,
    is_founding_account: company.is_founding_account,
    product_slot_limit: 20,
  };
};

const parseIdFromPath = (path, prefix) => decodeURIComponent(path.slice(prefix.length));

const handleApiRequest = async (req, res, parsedUrl) => {
  const { pathname, searchParams } = parsedUrl;
  const method = req.method ?? "GET";

  if (pathname === "/api/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (pathname === "/api/test/seed") {
    sendJson(res, 200, {
      success: true,
      data: {
        site_id: seedConfig.siteId,
        users: seedConfig.credentials,
      },
    });
    return;
  }

  if (pathname === "/api/test/reset" && method === "POST") {
    state = createInitialSeedState();
    sendNoContent(res, 204);
    return;
  }

  if (pathname === "/api/captcha/config") {
    sendJson(res, 200, {
      success: true,
      data: {
        enabled: false,
        site_key: "seed-site-key",
      },
    });
    return;
  }

  if (pathname === "/api/auth/login" && method === "POST") {
    const body = await readJsonBody(req);
    const email = normalize(body.email);
    const password = body.password;

    const user = state.users.find(
      (candidate) => normalize(candidate.email) === email && candidate.password === password
    );

    if (!user) {
      sendJson(res, 401, {
        success: false,
        error: ["auth.invalid_credentials"],
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: {
        token: createToken(user),
      },
    });
    return;
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    sendNoContent(res, 204);
    return;
  }

  if (pathname === "/api/auth/register" && method === "POST") {
    sendNoContent(res, 201);
    return;
  }

  if (pathname === "/api/auth/forgot-password" && method === "POST") {
    sendNoContent(res, 200);
    return;
  }

  if (pathname === "/api/auth/change-password" && method === "POST") {
    sendNoContent(res, 204);
    return;
  }

  if (pathname === "/api/me" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: toSnakeUser(user),
    });
    return;
  }

  if (pathname === "/api/users" && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const idFilter = normalize(searchParams.get("id"));
    const emailFilter = normalize(searchParams.get("email"));
    const nameFilter = normalize(searchParams.get("name"));

    const filtered = state.users.filter((user) => {
      if (idFilter && normalize(user.id) !== idFilter) {
        return false;
      }

      if (emailFilter && !normalize(user.email).includes(emailFilter)) {
        return false;
      }

      if (nameFilter) {
        const fullName = `${user.first_name} ${user.last_name}`;
        if (!normalize(fullName).includes(nameFilter)) {
          return false;
        }
      }

      return true;
    });

    const { page, perPage, offset } = parsePagination(searchParams, { page: 1, perPage: 10 });
    const rows = paginate(filtered, page, perPage, offset).map((user) => toSnakeUser(user));

    sendJson(res, 200, {
      data: rows,
      total: filtered.length,
      page,
      per_page: perPage,
    });
    return;
  }

  if (pathname.startsWith("/api/users/") && pathname.endsWith("/products") && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const ownerId = decodeURIComponent(pathname.split("/")[3]);
    const base = filterProductsByOwner(ownerId, "user");
    const filtered = applyProductFilters(base, searchParams);
    const { page, perPage, offset } = parsePagination(searchParams, { page: 1, perPage: 10 });
    const rows = paginate(filtered, page, perPage, offset);

    sendJson(res, 200, {
      success: true,
      data: {
        data: rows,
        total: filtered.length,
        page,
      },
    });
    return;
  }

  if (pathname.startsWith("/api/users/") && pathname.endsWith("/stats/engagement") && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const userId = decodeURIComponent(pathname.split("/")[3]);
    const stats = state.userStats[userId] ?? {
      user_id: userId,
      period: {
        from: searchParams.get("from") ?? "2026-02-01",
        to: searchParams.get("to") ?? "2026-03-03",
      },
      summary: {
        total_views: 0,
        unique_visitors: 0,
        messages_total: 0,
        message_threads: 0,
      },
      series: { daily_views: [], daily_messages: [] },
      by_product: [],
    };

    sendJson(res, 200, {
      success: true,
      data: stats,
    });
    return;
  }

  if (pathname.startsWith("/api/users/") && pathname.endsWith("/change-password") && method === "PATCH") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    sendNoContent(res, 204);
    return;
  }

  if (pathname.startsWith("/api/users/") && pathname.endsWith("/address") && method === "PATCH") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const userId = decodeURIComponent(pathname.split("/")[3]);
    const user = state.users.find((candidate) => candidate.id === userId);
    if (!user) {
      sendJson(res, 404, { success: false, error: ["user.not_found"] });
      return;
    }

    const body = await readJsonBody(req);
    user.address = body.address ?? null;
    user.location = body.location ?? null;

    sendNoContent(res, 204);
    return;
  }

  if (pathname.startsWith("/api/users/") && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const userId = decodeURIComponent(pathname.split("/")[3]);
    const user = state.users.find((candidate) => candidate.id === userId);

    if (!user) {
      sendJson(res, 404, { success: false, error: ["user.not_found"] });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: toSnakeUser(user),
    });
    return;
  }

  if (pathname.startsWith("/api/users/") && method === "PATCH") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const userId = decodeURIComponent(pathname.split("/")[3]);
    const user = state.users.find((candidate) => candidate.id === userId);

    if (!user) {
      sendJson(res, 404, { success: false, error: ["user.not_found"] });
      return;
    }

    const body = await readJsonBody(req);
    if (typeof body.first_name === "string") user.first_name = body.first_name;
    if (typeof body.last_name === "string") user.last_name = body.last_name;
    if (typeof body.email === "string") user.email = body.email;
    if (Array.isArray(body.roles)) user.roles = body.roles;

    sendNoContent(res, 204);
    return;
  }

  if (pathname === "/api/companies" && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const name = normalize(searchParams.get("name"));
    const filtered = state.companies.filter((company) => {
      if (!name) {
        return true;
      }
      return normalize(company.name).includes(name);
    });

    const { page, perPage, offset } = parsePagination(searchParams, { page: 1, perPage: 10 });
    const rows = paginate(filtered, page, perPage, offset);

    sendJson(res, 200, {
      success: true,
      data: rows,
      total: filtered.length,
      page,
    });
    return;
  }

  if (pathname === "/api/companies" && method === "POST") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const body = await readJsonBody(req);
    const companyId = body.company_id || `company-${state.companies.length + 1}`;

    const company = {
      company_id: companyId,
      owner_id: body.owner_id ?? authenticated.id,
      name: body.name ?? "Empresa seed",
      slug: body.slug ?? normalize(body.name ?? `empresa-${state.companies.length + 1}`).replace(/\s+/g, "-"),
      description: body.description ?? null,
      fiscal_identifier: body.fiscal_identifier ?? null,
      contact_email: body.contact_email ?? null,
      phone_number: {
        country_code: body.phone_number_country_code ?? null,
        prefix: body.phone_number_prefix ?? null,
        number: body.phone_number_number ?? null,
      },
      address: body.address ?? null,
      location: body.location ?? null,
      plan_type: "starter",
      subscription_status: "active",
      is_founding_account: false,
    };

    state.companies.push(company);

    const ownerUser = state.users.find((user) => user.id === company.owner_id);
    if (ownerUser) {
      ensureCompanyContextForOwner(company, ownerUser);
    }

    state.companyUsers.push({
      company_id: company.company_id,
      user_id: company.owner_id,
      email: ownerUser?.email ?? "",
      role: "ROLE_ADMIN",
      status: "ACCEPTED",
    });

    sendNoContent(res, 201);
    return;
  }

  if (pathname.startsWith("/api/companies/") && pathname.endsWith("/products") && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const companyId = decodeURIComponent(pathname.split("/")[3]);
    const base = filterProductsByOwner(companyId, "company");
    const filtered = applyProductFilters(base, searchParams);
    const { page, perPage, offset } = parsePagination(searchParams, { page: 1, perPage: 10 });
    const rows = paginate(filtered, page, perPage, offset);

    sendJson(res, 200, {
      success: true,
      data: {
        data: rows,
        total: filtered.length,
        page,
      },
    });
    return;
  }

  if (pathname.startsWith("/api/companies/") && pathname.endsWith("/users") && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const companyId = decodeURIComponent(pathname.split("/")[3]);
    const rows = state.companyUsers.filter((membership) => membership.company_id === companyId);

    const { page, perPage, offset } = parsePagination(searchParams, { page: 1, perPage: 50 });
    const paginated = paginate(rows, page, perPage, offset);

    sendJson(res, 200, {
      success: true,
      data: paginated,
      total: rows.length,
      page,
      per_page: perPage,
    });
    return;
  }

  if (pathname.startsWith("/api/companies/") && pathname.endsWith("/users") && method === "POST") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const companyId = decodeURIComponent(pathname.split("/")[3]);
    const body = await readJsonBody(req);

    state.companyUsers.push({
      company_id: companyId,
      user_id: null,
      email: body.email ?? "",
      role: body.role === "ROLE_ADMIN" ? "ROLE_ADMIN" : "ROLE_CONTRIBUTOR",
      status: "PENDING",
    });

    sendNoContent(res, 201);
    return;
  }

  if (pathname.match(/^\/api\/companies\/[^/]+\/users\/[^/]+$/) && method === "PATCH") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const [, , , companyIdEncoded, , userIdEncoded] = pathname.split("/");
    const companyId = decodeURIComponent(companyIdEncoded);
    const userId = decodeURIComponent(userIdEncoded);
    const body = await readJsonBody(req);

    const membership = state.companyUsers.find(
      (row) => row.company_id === companyId && normalize(row.user_id) === normalize(userId)
    );

    if (!membership) {
      sendJson(res, 404, { success: false, error: ["company.user_not_found"] });
      return;
    }

    if (body.role === "ROLE_ADMIN" || body.role === "ROLE_CONTRIBUTOR") {
      membership.role = body.role;
    }

    sendNoContent(res, 204);
    return;
  }

  if (pathname.match(/^\/api\/companies\/[^/]+\/users\/[^/]+$/) && method === "DELETE") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const [, , , companyIdEncoded, , userIdEncoded] = pathname.split("/");
    const companyId = decodeURIComponent(companyIdEncoded);
    const userId = decodeURIComponent(userIdEncoded);

    state.companyUsers = state.companyUsers.filter(
      (row) => !(row.company_id === companyId && normalize(row.user_id) === normalize(userId))
    );

    sendNoContent(res, 204);
    return;
  }

  if (pathname.match(/^\/api\/companies\/[^/]+\/invitations\/[^/]+\/accept$/) && method === "POST") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    sendNoContent(res, 204);
    return;
  }

  if (pathname.match(/^\/api\/companies\/[^/]+\/stats\/engagement$/) && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const companyId = decodeURIComponent(pathname.split("/")[3]);
    const stats = state.companyStats[companyId] ?? {
      company_id: companyId,
      period: {
        from: searchParams.get("from") ?? "2026-02-01",
        to: searchParams.get("to") ?? "2026-03-03",
      },
      summary: {
        total_views: 0,
        unique_visitors: 0,
        repeat_visitors: 0,
        repeat_visitor_ratio: 0,
        logged_views: 0,
        anonymous_views: 0,
        messages_total: 0,
        message_threads: 0,
        message_to_rental_ratio: 0,
        average_first_response_minutes: null,
      },
      top_locations: [],
      series: { daily_views: [], daily_messages: [] },
      by_product: [],
      opportunities: { high_interest_low_conversion: null },
    };

    sendJson(res, 200, {
      success: true,
      data: stats,
    });
    return;
  }

  if (pathname.startsWith("/api/companies/") && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const companyId = decodeURIComponent(pathname.split("/")[3]);
    const company = state.companies.find(
      (row) => row.company_id === companyId || row.slug === companyId
    );

    if (!company) {
      sendJson(res, 404, { success: false, error: ["company.not_found"] });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: company,
    });
    return;
  }

  if (pathname.startsWith("/api/companies/") && method === "PATCH") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const companyId = decodeURIComponent(pathname.split("/")[3]);
    const company = state.companies.find((row) => row.company_id === companyId);

    if (!company) {
      sendJson(res, 404, { success: false, error: ["company.not_found"] });
      return;
    }

    const body = await readJsonBody(req);

    if (typeof body.name === "string") company.name = body.name;
    if (typeof body.slug === "string") company.slug = body.slug;
    if (typeof body.description === "string" || body.description === null) {
      company.description = body.description;
    }
    if (typeof body.fiscal_identifier === "string" || body.fiscal_identifier === null) {
      company.fiscal_identifier = body.fiscal_identifier;
    }
    if (typeof body.contact_email === "string" || body.contact_email === null) {
      company.contact_email = body.contact_email;
    }

    if (body.address) {
      company.address = body.address;
    }

    if (body.location) {
      company.location = body.location;
    }

    sendNoContent(res, 204);
    return;
  }

  if (pathname === "/api/categories" && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const id = normalize(searchParams.get("id"));
    const name = normalize(searchParams.get("name"));

    const filtered = state.categories.filter((category) => {
      if (id && normalize(category.id) !== id) {
        return false;
      }

      if (name && !normalize(category.name).includes(name)) {
        return false;
      }

      return true;
    });

    const { page, perPage, offset } = parsePagination(searchParams, { page: 1, perPage: 50 });
    const rows = paginate(filtered, page, perPage, offset);

    sendJson(res, 200, {
      success: true,
      data: rows,
      total: filtered.length,
      page,
      per_page: perPage,
    });
    return;
  }

  if (pathname === "/api/categories" && method === "POST") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const body = await readJsonBody(req);
    const category = {
      id: body.category_id || `cat-${state.categories.length + 1}`,
      name: body.name ?? "Categoria",
      slug: body.slug ?? normalize(body.name ?? "categoria").replace(/\s+/g, "-"),
      description: body.description ?? null,
      parent_id: body.parent_id ?? null,
      icon_id: body.icon_id ?? null,
      featured_image_id: body.featured_image_id ?? null,
      landscape_image_id: body.landscape_image_id ?? null,
    };

    state.categories.push(category);
    sendNoContent(res, 201);
    return;
  }

  if (pathname.match(/^\/api\/categories\/[^/]+\/products$/) && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const categoryId = decodeURIComponent(pathname.split("/")[3]);
    const products = state.products.filter((product) => normalize(product.category_id) === normalize(categoryId));

    sendJson(res, 200, {
      success: true,
      data: products,
    });
    return;
  }

  if (pathname.startsWith("/api/categories/") && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const idOrSlug = decodeURIComponent(pathname.split("/")[3]);
    const category = state.categories.find(
      (row) => row.id === idOrSlug || row.slug === idOrSlug
    );

    if (!category) {
      sendJson(res, 404, { success: false, error: ["category.not_found"] });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: category,
    });
    return;
  }

  if (pathname.startsWith("/api/categories/") && method === "PATCH") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const categoryId = decodeURIComponent(pathname.split("/")[3]);
    const category = state.categories.find((row) => row.id === categoryId);

    if (!category) {
      sendJson(res, 404, { success: false, error: ["category.not_found"] });
      return;
    }

    const body = await readJsonBody(req);

    if (typeof body.name === "string") category.name = body.name;
    if (typeof body.slug === "string") category.slug = body.slug;
    if (typeof body.description === "string" || body.description === null) category.description = body.description;
    if (typeof body.parent_id === "string" || body.parent_id === null) category.parent_id = body.parent_id;
    if (typeof body.icon_id === "string" || body.icon_id === null) category.icon_id = body.icon_id;
    if (typeof body.featured_image_id === "string" || body.featured_image_id === null) {
      category.featured_image_id = body.featured_image_id;
    }
    if (typeof body.landscape_image_id === "string" || body.landscape_image_id === null) {
      category.landscape_image_id = body.landscape_image_id;
    }

    sendNoContent(res, 204);
    return;
  }

  if (pathname.startsWith("/api/sites/") && method === "GET") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const siteId = parseIdFromPath(pathname, "/api/sites/");

    if (siteId !== state.site.site_id) {
      sendJson(res, 404, { success: false, error: ["site.not_found"] });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: state.site,
    });
    return;
  }

  if (pathname.startsWith("/api/sites/") && method === "PATCH") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const siteId = parseIdFromPath(pathname, "/api/sites/");

    if (siteId !== state.site.site_id) {
      sendJson(res, 404, { success: false, error: ["site.not_found"] });
      return;
    }

    const body = await readJsonBody(req);

    if (typeof body.name === "string") state.site.name = body.name;
    if (typeof body.title === "string") state.site.title = body.title;
    if (typeof body.url === "string") state.site.url = body.url;
    if (typeof body.description === "string" || body.description === null) state.site.description = body.description;
    if (typeof body.logo_id === "string" || body.logo_id === null) state.site.logo_id = body.logo_id;
    if (typeof body.favicon_id === "string" || body.favicon_id === null) state.site.favicon_id = body.favicon_id;
    if (typeof body.primary_color === "string") state.site.primary_color = body.primary_color;
    if (Array.isArray(body.category_ids)) state.site.category_ids = body.category_ids;
    if (Array.isArray(body.menu_category_ids)) state.site.menu_category_ids = body.menu_category_ids;
    if (Array.isArray(body.featured_category_ids)) state.site.featured_category_ids = body.featured_category_ids;

    sendNoContent(res, 204);
    return;
  }

  if (pathname === "/api/products/search" && method === "GET") {
    const text = normalize(searchParams.get("text"));
    const categories = searchParams.getAll("categories[]").map((value) => normalize(value));

    const filtered = state.products.filter((product) => {
      if (product.publication_status !== "published") {
        return false;
      }

      if (text) {
        const haystack = `${product.name} ${product.slug} ${product.description}`.toLowerCase();
        if (!haystack.includes(text)) {
          return false;
        }
      }

      if (categories.length > 0) {
        const productCategories = (product.categories ?? []).map((category) => normalize(category.id));
        const hasAnyCategory = categories.some((categoryId) => productCategories.includes(categoryId));
        if (!hasAnyCategory) {
          return false;
        }
      }

      return true;
    });

    const { page, perPage, offset } = parsePagination(searchParams, { page: 1, perPage: 20 });
    const rows = paginate(filtered, page, perPage, offset);

    sendJson(res, 200, {
      success: true,
      data: {
        data: rows,
        total: filtered.length,
        page,
      },
    });
    return;
  }

  if (pathname.match(/^\/api\/products\/[^/]+\/rental-cost$/) && method === "GET") {
    const productId = decodeURIComponent(pathname.split("/")[3]);
    const product = state.products.find((row) => row.id === productId);

    if (!product) {
      sendJson(res, 404, { success: false, error: ["product.not_found"] });
      return;
    }

    const startDate = searchParams.get("start_date") ?? "2026-03-01";
    const endDate = searchParams.get("end_date") ?? "2026-03-02";

    const start = new Date(`${startDate}T00:00:00Z`).getTime();
    const end = new Date(`${endDate}T00:00:00Z`).getTime();
    const days = Number.isFinite(start) && Number.isFinite(end) ? Math.max(1, Math.round((end - start) / 86400000) + 1) : 1;
    const pricePerDay = product.tiers?.[0]?.price_per_day?.amount ?? 0;
    const rentalPrice = days * pricePerDay;
    const total = rentalPrice + (product.deposit?.amount ?? 0);

    sendJson(res, 200, {
      success: true,
      data: {
        product_id: productId,
        start_date: startDate,
        end_date: endDate,
        days,
        price_per_day: { amount: pricePerDay, currency: "EUR" },
        rental_price: { amount: rentalPrice, currency: "EUR" },
        deposit: product.deposit,
        total_price: { amount: total, currency: "EUR" },
      },
    });
    return;
  }

  if (pathname === "/api/products" && method === "POST") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const body = await readJsonBody(req);

    const productId = body.product_id || `product-${state.products.length + 1}`;
    const ownerId = body.company_id || authenticated.company_id || authenticated.id;
    const ownerType = body.company_id ? "company" : authenticated.company_id ? "company" : "user";

    const category = state.categories.find((entry) => entry.id === body.category_id);

    const product = {
      id: productId,
      product_id: productId,
      internal_id: body.internal_id || `PRD-${String(state.products.length + 1).padStart(3, "0")}`,
      name: body.name || "Producto seed",
      slug: body.slug || normalize(body.name || `producto-${state.products.length + 1}`).replace(/\s+/g, "-"),
      description: body.description || "",
      publication_status: "draft",
      image_ids: Array.isArray(body.image_ids) ? body.image_ids : [],
      deposit: body.deposit || { amount: 0, currency: "EUR" },
      tiers: Array.isArray(body.tiers) ? body.tiers : [],
      categories: category
        ? [{ id: category.id, name: category.name, slug: category.slug }]
        : [],
      category_id: body.category_id || null,
      owner_data: {
        owner_id: ownerId,
        type: ownerType,
        name: ownerType === "company"
          ? state.companies.find((entry) => entry.company_id === ownerId)?.name ?? "Empresa"
          : `${authenticated.first_name} ${authenticated.last_name}`,
      },
    };

    state.products.push(product);

    sendJson(res, 201, {
      success: true,
      data: product,
    });
    return;
  }

  if (pathname.match(/^\/api\/products\/[^/]+\/(publish|unpublish|archive)$/) && method === "PATCH") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const productId = decodeURIComponent(pathname.split("/")[3]);
    const action = pathname.split("/")[4];
    const product = state.products.find((row) => row.id === productId);

    if (!product) {
      sendJson(res, 404, { success: false, error: ["product.not_found"] });
      return;
    }

    if (action === "publish") product.publication_status = "published";
    if (action === "unpublish") product.publication_status = "draft";
    if (action === "archive") product.publication_status = "archived";

    sendNoContent(res, 204);
    return;
  }

  if (pathname.startsWith("/api/products/") && method === "PATCH") {
    const authenticated = requireAuth(req, res);
    if (!authenticated) {
      return;
    }

    const productId = decodeURIComponent(pathname.split("/")[3]);
    const product = state.products.find((row) => row.id === productId);

    if (!product) {
      sendJson(res, 404, { success: false, error: ["product.not_found"] });
      return;
    }

    const body = await readJsonBody(req);

    if (typeof body.name === "string") product.name = body.name;
    if (typeof body.slug === "string") product.slug = body.slug;
    if (typeof body.description === "string") product.description = body.description;
    if (Array.isArray(body.image_ids)) product.image_ids = body.image_ids;
    if (body.deposit) product.deposit = body.deposit;
    if (Array.isArray(body.tiers)) product.tiers = body.tiers;
    if (typeof body.category_id === "string") {
      product.category_id = body.category_id;
      const category = state.categories.find((entry) => entry.id === body.category_id);
      product.categories = category ? [{ id: category.id, name: category.name, slug: category.slug }] : [];
    }

    sendNoContent(res, 204);
    return;
  }

  if (pathname.startsWith("/api/products/") && method === "GET") {
    const idOrSlug = decodeURIComponent(pathname.split("/")[3]);

    const product = state.products.find(
      (row) => row.id === idOrSlug || row.product_id === idOrSlug || row.slug === idOrSlug
    );

    if (!product) {
      sendJson(res, 404, { success: false, error: ["product.not_found"] });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: product,
    });
    return;
  }

  if (pathname === "/api/rents/messages/unread-count" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const byRent = resolveUnreadByUser(user);
    const totalUnread = byRent.reduce((sum, row) => sum + row.unread_count, 0);

    sendJson(res, 200, {
      success: true,
      data: {
        total_unread: totalUnread,
        by_rent: byRent,
      },
    });
    return;
  }

  if (pathname.match(/^\/api\/rents\/[^/]+\/messages\/read$/) && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const rentId = decodeURIComponent(pathname.split("/")[3]);
    state.unreadByRent[rentId] = 0;

    sendNoContent(res, 204);
    return;
  }

  if (pathname.match(/^\/api\/rents\/[^/]+\/messages$/) && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const rentId = decodeURIComponent(pathname.split("/")[3]);
    const messages = state.rentMessages[rentId] ?? [];

    const { page, perPage, offset } = parsePagination(searchParams, { page: 1, perPage: 200 });
    const rows = paginate(messages, page, perPage, offset);

    sendJson(res, 200, {
      success: true,
      data: {
        data: rows,
        total: messages.length,
        page,
        per_page: perPage,
      },
    });
    return;
  }

  if (pathname.match(/^\/api\/rents\/[^/]+\/messages$/) && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const rentId = decodeURIComponent(pathname.split("/")[3]);
    const body = await readJsonBody(req);

    if (!state.rentMessages[rentId]) {
      state.rentMessages[rentId] = [];
    }

    const rent = state.rents.find((entry) => entry.rent_id === rentId);
    const senderRole = normalize(user.company_id ?? "") === normalize(rent?.owner_id ?? "") ? "owner" : "renter";

    state.rentMessages[rentId].push({
      message_id: `msg-${Date.now()}`,
      rent_id: rentId,
      sender_role: senderRole,
      sender_name: `${user.first_name} ${user.last_name}`,
      content: String(body.content ?? "").trim(),
      created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      is_mine: true,
    });

    state.unreadByRent[rentId] = 0;

    sendNoContent(res, 201);
    return;
  }

  if (pathname.match(/^\/api\/rents\/[^/]+\/status$/) && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const rentId = decodeURIComponent(pathname.split("/")[3]);
    const rent = state.rents.find((entry) => entry.rent_id === rentId);

    if (!rent) {
      sendJson(res, 404, { success: false, error: ["rent.not_found"] });
      return;
    }

    const body = await readJsonBody(req);

    if (typeof body.status === "string") {
      rent.status = body.status;
    }

    if (body.proposal_valid_until) {
      rent.proposal_valid_until = body.proposal_valid_until;
    }

    sendNoContent(res, 204);
    return;
  }

  if (pathname.match(/^\/api\/rents\/[^/]+$/) && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const rentId = decodeURIComponent(pathname.split("/")[3]);
    const rent = state.rents.find((entry) => entry.rent_id === rentId);

    if (!rent) {
      sendJson(res, 404, { success: false, error: ["rent.not_found"] });
      return;
    }

    const body = await readJsonBody(req);

    if (body.start_date) rent.start_date = body.start_date;
    if (body.end_date) rent.end_date = body.end_date;
    if (body.deposit) rent.deposit = body.deposit;
    if (body.price) rent.price = body.price;
    if (body.renter_name !== undefined) rent.renter_name = body.renter_name;
    if (body.renter_email !== undefined) rent.renter_email = body.renter_email;

    sendNoContent(res, 204);
    return;
  }

  if (pathname.match(/^\/api\/rents\/[^/]+$/) && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const rentId = decodeURIComponent(pathname.split("/")[3]);
    const rent = state.rents.find((entry) => entry.rent_id === rentId);

    if (!rent) {
      sendJson(res, 404, { success: false, error: ["rent.not_found"] });
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: rent,
    });
    return;
  }

  if (pathname === "/api/rents" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const filtered = applyRentFilters(state.rents, searchParams, user);
    const { page, perPage, offset } = parsePagination(searchParams, { page: 1, perPage: 9 });
    const rows = paginate(filtered, page, perPage, offset);

    sendJson(res, 200, {
      success: true,
      data: {
        data: rows,
        total: filtered.length,
        page,
        per_page: perPage,
      },
    });
    return;
  }

  if (pathname === "/api/rents" && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const body = await readJsonBody(req);

    const product = state.products.find((entry) => entry.id === body.product_id || entry.product_id === body.product_id);
    if (!product) {
      sendJson(res, 404, { success: false, error: ["product.not_found"] });
      return;
    }

    const rentId = body.rent_id ?? `rent-${state.rents.length + 1}`;
    const rent = {
      rent_id: rentId,
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      product_internal_id: product.internal_id,
      owner_id: product.owner_data?.owner_id ?? user.id,
      owner_type: product.owner_data?.type ?? "user",
      owner_name: product.owner_data?.name ?? `${user.first_name} ${user.last_name}`,
      renter_id: user.id,
      renter_name: body.renter_name ?? `${user.first_name} ${user.last_name}`,
      renter_email: body.renter_email ?? user.email,
      start_date: body.start_date,
      end_date: body.end_date,
      deposit: body.deposit ?? { amount: 0, currency: "EUR" },
      price: body.price ?? { amount: 0, currency: "EUR" },
      status: body.is_lead ? "lead_pending" : "proposal_pending_renter",
      is_lead: Boolean(body.is_lead),
      owner_proposal_accepted: false,
      renter_proposal_accepted: false,
      proposal_valid_until: null,
    };

    state.rents.unshift(rent);
    state.rentMessages[rentId] = [];
    state.unreadByRent[rentId] = 0;

    sendNoContent(res, 201);
    return;
  }

  if (pathname === "/api/admin/blog/posts" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: {
        data: state.blog.posts,
        total: state.blog.posts.length,
        page: 1,
        per_page: 20,
      },
    });
    return;
  }

  if (pathname === "/api/admin/blog/categories" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: state.blog.categories,
    });
    return;
  }

  if (pathname === "/api/blog/posts" && method === "GET") {
    sendJson(res, 200, {
      success: true,
      data: {
        data: state.blog.posts,
        total: state.blog.posts.length,
        page: 1,
        per_page: 20,
      },
    });
    return;
  }

  if (pathname.startsWith("/api/blog/posts/") && method === "GET") {
    sendJson(res, 404, {
      success: false,
      error: ["blog.post_not_found"],
    });
    return;
  }

  if (pathname === "/api/billing/checkout-session" && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: {
        checkout_url: "https://example.test/checkout",
      },
    });
    return;
  }

  if (pathname === "/api/billing/customer-portal-session" && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    sendJson(res, 200, {
      success: true,
      data: {
        portal_url: "https://example.test/portal",
      },
    });
    return;
  }

  if (pathname === "/api/billing/company/migrate-to-explorer" && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    sendNoContent(res, 204);
    return;
  }

  if (pathname === "/api/contact" && method === "POST") {
    sendNoContent(res, 201);
    return;
  }

  if (pathname === "/api/media/images/upload" && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    sendNoContent(res, 201);
    return;
  }

  if (pathname.match(/^\/api\/media\/images\/[^/]+$/) && method === "DELETE") {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    sendNoContent(res, 204);
    return;
  }

  if (pathname.match(/^\/api\/media\/images\/[^/]+\/(THUMBNAIL|MEDIUM|ORIGINAL)$/) && method === "GET") {
    const png = Buffer.from(seedConfig.transparentPngBase64, "base64");
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(png);
    return;
  }

  if (pathname.match(/^\/api\/public\/products\/[^/]+\/view$/) && method === "POST") {
    sendNoContent(res, 202);
    return;
  }

  if (pathname.startsWith("/api/")) {
    sendJson(res, 200, {
      success: true,
      data: null,
    });
    return;
  }

  sendText(res, 404, "Not found");
};

const server = http.createServer(async (req, res) => {
  if ((req.method ?? "GET") === "OPTIONS") {
    sendNoContent(res, 204);
    return;
  }

  const parsed = decodePath(req.url ?? "/");

  try {
    await handleApiRequest(req, res, parsed);
  } catch (error) {
    console.error("[seed-server] unexpected error", error);
    sendJson(res, 500, {
      success: false,
      error: ["seed.internal_error"],
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[seed-server] listening on http://127.0.0.1:${PORT}`);
  console.log(`[seed-server] site_id=${seedConfig.siteId}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
