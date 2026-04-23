import { expect, test } from "./fixtures";

const jsonHeaders = { "content-type": "application/json" };

type BlogCategory = {
  category_id: string;
  name: string;
  slug: string;
};

type BlogPost = {
  post_id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  keywords: string[];
  category: BlogCategory | null;
  header_image_id: string | null;
  hero_image_id: string | null;
  status: "draft" | "scheduled" | "published";
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const buildPosts = (categories: BlogCategory[]): BlogPost[] => {
  const [guidesCategory, operationsCategory] = categories;

  return [
    {
      post_id: "post-draft",
      title: "Cobertura borrador",
      slug: "cobertura-borrador",
      excerpt: "Borrador listo para publicar.",
      body: "<p>Borrador</p>",
      keywords: ["draft"],
      category: guidesCategory,
      header_image_id: null,
      hero_image_id: null,
      status: "draft",
      scheduled_for: null,
      published_at: null,
      created_at: "2026-04-20T09:00:00Z",
      updated_at: "2026-04-20T09:00:00Z",
    },
    {
      post_id: "post-published",
      title: "Cobertura publicado",
      slug: "cobertura-publicado",
      excerpt: "Post ya visible en producción.",
      body: "<p>Publicado</p>",
      keywords: ["published"],
      category: operationsCategory,
      header_image_id: null,
      hero_image_id: null,
      status: "published",
      scheduled_for: null,
      published_at: "2026-04-18T09:00:00Z",
      created_at: "2026-04-18T09:00:00Z",
      updated_at: "2026-04-18T09:00:00Z",
    },
    {
      post_id: "post-scheduled",
      title: "Cobertura programado",
      slug: "cobertura-programado",
      excerpt: "Post programado para mañana.",
      body: "<p>Programado</p>",
      keywords: ["scheduled"],
      category: guidesCategory,
      header_image_id: null,
      hero_image_id: null,
      status: "scheduled",
      scheduled_for: "2026-04-21T09:00:00Z",
      published_at: null,
      created_at: "2026-04-19T09:00:00Z",
      updated_at: "2026-04-19T09:00:00Z",
    },
    ...Array.from({ length: 18 }, (_, index) => ({
      post_id: `post-${index + 4}`,
      title: `Cobertura auxiliar ${index + 4}`,
      slug: `cobertura-auxiliar-${index + 4}`,
      excerpt: "Post de apoyo para paginación.",
      body: "<p>Auxiliar</p>",
      keywords: ["auxiliar"],
      category: operationsCategory,
      header_image_id: null,
      hero_image_id: null,
      status: "draft" as const,
      scheduled_for: null,
      published_at: null,
      created_at: "2026-04-10T09:00:00Z",
      updated_at: "2026-04-10T09:00:00Z",
    })),
  ];
};

test.describe("Dashboard Blog Management Matrix", () => {
  test.beforeEach(async ({ seed, request, page }) => {
    await seed.reset(request);
    await seed.clearToken(page);
  });

  test("admin manages filters, publication states, pagination and blog categories", async ({
    page,
    request,
    seed,
  }) => {
    await seed.loginAs(page, request, "admin");

    const categories: BlogCategory[] = [
      { category_id: "blog-cat-1", name: "Guías", slug: "guias" },
      { category_id: "blog-cat-2", name: "Operaciones", slug: "operaciones" },
    ];
    let posts = buildPosts(categories);

    const listPosts = (url: URL) => {
      const pageNumber = Number(url.searchParams.get("page") ?? "1");
      const text = (url.searchParams.get("text") ?? "").trim().toLowerCase();
      const status = url.searchParams.get("status");

      const filtered = posts.filter((post) => {
        if (status && post.status !== status) {
          return false;
        }

        if (text.length === 0) {
          return true;
        }

        return `${post.title} ${post.body}`.toLowerCase().includes(text);
      });

      const pageSize = 20;
      const start = (pageNumber - 1) * pageSize;
      const end = start + pageSize;

      return {
        data: filtered.slice(start, end),
        total: filtered.length,
        page: pageNumber,
      };
    };

    await page.route("**/api/admin/blog/posts?**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify(listPosts(new URL(route.request().url()))),
      });
    });

    await page.route("**/api/admin/blog/posts/*/publish", async (route) => {
      const postId = route.request().url().split("/").at(-2);
      posts = posts.map((post) =>
        post.post_id === postId
          ? {
              ...post,
              status: "published",
              published_at: "2026-04-20T12:00:00Z",
              scheduled_for: null,
            }
          : post
      );

      await route.fulfill({ status: 204 });
    });

    await page.route("**/api/admin/blog/posts/*/draft", async (route) => {
      const postId = route.request().url().split("/").at(-2);
      posts = posts.map((post) =>
        post.post_id === postId
          ? {
              ...post,
              status: "draft",
              published_at: null,
              scheduled_for: null,
            }
          : post
      );

      await route.fulfill({ status: 204 });
    });

    await page.route("**/api/admin/blog/categories", async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON() as { category_id: string; name: string };
        categories.push({
          category_id: body.category_id,
          name: body.name,
          slug: body.name.toLowerCase().replace(/\s+/g, "-"),
        });

        await route.fulfill({ status: 204 });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          success: true,
          data: categories,
        }),
      });
    });

    await page.route("**/api/admin/blog/categories/*", async (route) => {
      const categoryId = route.request().url().split("/").at(-1) ?? "";
      const index = categories.findIndex((category) => category.category_id === categoryId);
      if (index >= 0) {
        categories.splice(index, 1);
      }

      await route.fulfill({ status: 204 });
    });

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard(?:\?.*)?$/);
    await expect(page.getByText("Restaurando tu sesion...")).toHaveCount(0, { timeout: 15000 });

    await page.goto("/dashboard/blog");
    await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Programado" }).click();
    await expect(page.getByText("Cobertura programado")).toBeVisible();
    await expect(page.getByText("Cobertura borrador")).toHaveCount(0);

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Todos los estados" }).click();

    const searchInput = page.getByPlaceholder("Buscar por título o contenido...");
    await searchInput.fill("sin coincidencias");
    await expect(page.getByText("No hay posts con los filtros actuales.")).toBeVisible();

    await searchInput.fill("");
    await expect(page.getByText("Cobertura borrador")).toBeVisible();

    const draftRow = page.locator("div.grid").filter({ hasText: "Cobertura borrador" }).first();
    await draftRow.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText("Post publicado.")).toBeVisible();

    const publishedRow = page.locator("div.grid").filter({ hasText: "Cobertura publicado" }).first();
    await publishedRow.getByRole("button", { name: "Borrador" }).click();
    await expect(page.getByText("Post movido a borrador.")).toBeVisible();

    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.getByText("Página 2 de 2")).toBeVisible();
    await expect(page.getByText("Cobertura auxiliar 21")).toBeVisible();

    await page.getByRole("button", { name: "Anterior" }).click();
    await expect(page.getByText("Página 1 de 2")).toBeVisible();

    const categoryInput = page.getByPlaceholder("Nombre de categoría");
    await categoryInput.fill("Tendencias");
    await categoryInput.press("Enter");
    await expect(page.getByText("Categoría creada.")).toBeVisible();
    await expect(page.getByText("Tendencias")).toBeVisible();

    await page.getByRole("button", { name: "Eliminar categoría Tendencias" }).click();
    await expect(page.getByText("Categoría eliminada.")).toBeVisible();
    await expect(page.getByText("Tendencias")).toHaveCount(0);
  });
});
