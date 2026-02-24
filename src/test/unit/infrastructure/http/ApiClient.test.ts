import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError } from "@/infrastructure/http/ApiClient";

describe("ApiClient", () => {
  it("builds urls with trimmed base url on GET", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const client = new ApiClient({ baseUrl: "https://api.example.com///" });

    const response = await client.get<{ ok: boolean }>("/status");

    expect(response).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/status", {
      method: "GET",
      headers: {},
    });
  });

  it("sends JSON payload and merged headers on POST", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ created: true }), { status: 201 }));

    const client = new ApiClient({
      baseUrl: "https://api.example.com",
      defaultHeaders: { "X-App": "appquilar" },
    });

    await client.post("/items", { name: "Bike" }, { headers: { Authorization: "Bearer token" } });

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/items", {
      method: "POST",
      headers: {
        "X-App": "appquilar",
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Bike" }),
    });
  });

  it("does not force Content-Type when payload is FormData", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const formData = new FormData();
    formData.append("file", new Blob(["data"], { type: "text/plain" }), "file.txt");

    const client = new ApiClient({ baseUrl: "https://api.example.com" });

    await client.post("/upload", formData);

    const call = fetchMock.mock.calls[0];
    expect(call[1]?.method).toBe("POST");
    expect((call[1]?.headers as Record<string, string>)["Content-Type"]).toBeUndefined();
    expect(call[1]?.body).toBe(formData);
  });

  it("returns undefined on skipParseJson", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("", {
        status: 201,
      })
    );

    const client = new ApiClient({ baseUrl: "https://api.example.com" });

    const response = await client.post<void>("/items", { name: "Bike" }, { skipParseJson: true });

    expect(response).toBeUndefined();
  });

  it("returns undefined on 204 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = new ApiClient({ baseUrl: "https://api.example.com" });

    const response = await client.delete<void>("/items/1");

    expect(response).toBeUndefined();
  });

  it("supports text and blob response formats", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("plain text", { status: 200 }))
      .mockResolvedValueOnce(new Response("binary", { status: 200 }));

    const client = new ApiClient({ baseUrl: "https://api.example.com" });

    const text = await client.get<string>("/text", { format: "text" });
    const blob = await client.get<Blob>("/blob", { format: "blob" });

    expect(text).toBe("plain text");
    expect(typeof (blob as Blob).text).toBe("function");
    expect(await blob.text()).toBe("binary");
  });

  it("falls back to raw text when json parsing fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("not-json", { status: 200 }));

    const client = new ApiClient({ baseUrl: "https://api.example.com" });

    const response = await client.get<string>("/raw");

    expect(response).toBe("not-json");
  });

  it("throws ApiError with payload message for failed requests", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "validation failed", errors: { name: ["Required"] } }), {
        status: 422,
        statusText: "Unprocessable Entity",
      })
    );

    const client = new ApiClient({ baseUrl: "https://api.example.com" });

    await expect(client.post("/items", { name: "" })).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      message: "validation failed",
      payload: { errors: { name: ["Required"] } },
    });
  });

  it("throws ApiError with fallback message when payload is not json", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Bad Gateway", {
        status: 502,
        statusText: "Bad Gateway",
      })
    );

    const client = new ApiClient({ baseUrl: "https://api.example.com" });

    await expect(client.get("/downstream")).rejects.toEqual(
      expect.objectContaining<ApiError>({
        status: 502,
        message: "Request failed with status 502 (Bad Gateway)",
      })
    );
  });

  it("sends background posts with keepalive and swallows errors", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("offline"));

    const client = new ApiClient({ baseUrl: "https://api.example.com" });

    expect(() => {
      client.postBackground("/stats", { event: "view" });
    }).not.toThrow();

    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "view" }),
      keepalive: true,
    });
  });
});
