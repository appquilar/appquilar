import { describe, expect, it, vi } from "vitest";
import { AuthService } from "@/application/services/AuthService";
import { createAuthSession } from "@/domain/models/AuthSession";
import type { AuthRepository } from "@/domain/repositories/AuthRepository";
import type { UserRepository } from "@/domain/repositories/UserRepository";
import type { User } from "@/domain/models/User";
import { UserRole } from "@/domain/models/UserRole";

const mockUser: User = {
  id: "user-1",
  firstName: "Victor",
  lastName: "Saavedra",
  email: "victor@appquilar.com",
  roles: [UserRole.REGULAR_USER],
  address: null,
  location: null,
};

const createAuthRepositoryMock = (): AuthRepository => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  requestPasswordReset: vi.fn(),
  changePassword: vi.fn(),
  resetPassword: vi.fn(),
  getCurrentSession: vi.fn(),
  getCurrentSessionSync: vi.fn(),
});

const createUserRepositoryMock = (): UserRepository => ({
  getCurrentUser: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  updateAddress: vi.fn(),
  getByCompanyId: vi.fn(),
  getAllUsers: vi.fn(),
});

describe("AuthService", () => {
  it("logs in and returns freshly loaded current user", async () => {
    const authRepository = createAuthRepositoryMock();
    const userRepository = createUserRepositoryMock();

    vi.mocked(authRepository.getCurrentSession).mockResolvedValue(
      createAuthSession({ token: "token" })
    );
    vi.mocked(userRepository.getCurrentUser).mockResolvedValue(mockUser);

    const service = new AuthService(authRepository, userRepository);

    const user = await service.login({ email: "a@b.com", password: "secret" });

    expect(authRepository.login).toHaveBeenCalledWith({ email: "a@b.com", password: "secret" });
    expect(userRepository.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(user).toEqual(mockUser);
  });

  it("throws if login succeeds but current user cannot be loaded", async () => {
    const authRepository = createAuthRepositoryMock();
    const userRepository = createUserRepositoryMock();

    vi.mocked(authRepository.getCurrentSession).mockResolvedValue(
      createAuthSession({ token: "token" })
    );
    vi.mocked(userRepository.getCurrentUser).mockResolvedValue(null as unknown as User);

    const service = new AuthService(authRepository, userRepository);

    await expect(
      service.login({ email: "a@b.com", password: "secret" })
    ).rejects.toThrow("Login succeeded but current user could not be loaded.");
  });

  it("returns cached current user after first load", async () => {
    const authRepository = createAuthRepositoryMock();
    const userRepository = createUserRepositoryMock();

    vi.mocked(authRepository.getCurrentSession).mockResolvedValue(
      createAuthSession({ token: "token" })
    );
    vi.mocked(userRepository.getCurrentUser).mockResolvedValue(mockUser);

    const service = new AuthService(authRepository, userRepository);

    const first = await service.getCurrentUser();
    const second = await service.getCurrentUser();

    expect(first).toEqual(mockUser);
    expect(second).toEqual(mockUser);
    expect(authRepository.getCurrentSession).toHaveBeenCalledTimes(1);
    expect(userRepository.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("deduplicates parallel getCurrentUser calls", async () => {
    const authRepository = createAuthRepositoryMock();
    const userRepository = createUserRepositoryMock();

    let resolveUser: (value: User) => void = () => undefined;
    const pendingUser = new Promise<User>((resolve) => {
      resolveUser = resolve;
    });

    vi.mocked(authRepository.getCurrentSession).mockResolvedValue(
      createAuthSession({ token: "token" })
    );
    vi.mocked(userRepository.getCurrentUser).mockReturnValue(pendingUser);

    const service = new AuthService(authRepository, userRepository);

    const p1 = service.getCurrentUser();
    const p2 = service.getCurrentUser();

    resolveUser(mockUser);

    const [user1, user2] = await Promise.all([p1, p2]);

    expect(user1).toEqual(mockUser);
    expect(user2).toEqual(mockUser);
    expect(userRepository.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("returns null without backend call when no session exists", async () => {
    const authRepository = createAuthRepositoryMock();
    const userRepository = createUserRepositoryMock();

    vi.mocked(authRepository.getCurrentSession).mockResolvedValue(null);

    const service = new AuthService(authRepository, userRepository);

    const user = await service.getCurrentUser();

    expect(user).toBeNull();
    expect(userRepository.getCurrentUser).not.toHaveBeenCalled();
  });

  it("refreshes current user and resets cache on logout", async () => {
    const authRepository = createAuthRepositoryMock();
    const userRepository = createUserRepositoryMock();

    const getCurrentSessionMock = vi.mocked(authRepository.getCurrentSession);
    getCurrentSessionMock.mockResolvedValue(createAuthSession({ token: "token" }));

    vi.mocked(userRepository.getCurrentUser).mockResolvedValue(mockUser);

    const service = new AuthService(authRepository, userRepository);

    await service.refreshCurrentUser();
    await service.logout();
    getCurrentSessionMock.mockResolvedValue(null);
    const afterLogout = await service.getCurrentUser();

    expect(authRepository.logout).toHaveBeenCalledTimes(1);
    expect(afterLogout).toBeNull();
  });

  it("delegates password and registration use cases", async () => {
    const authRepository = createAuthRepositoryMock();
    const userRepository = createUserRepositoryMock();
    const service = new AuthService(authRepository, userRepository);

    await service.register({
      firstName: "Victor",
      lastName: "User",
      email: "victor@appquilar.com",
      password: "Password123!",
      captchaToken: "token",
    });

    await service.requestPasswordReset("victor@appquilar.com");
    await service.changePassword({
      oldPassword: "old123",
      newPassword: "new123",
      token: "token",
    });
    await service.resetPassword({
      email: "victor@appquilar.com",
      token: "reset-token",
      newPassword: "new123",
    });

    expect(authRepository.register).toHaveBeenCalledTimes(1);
    expect(authRepository.requestPasswordReset).toHaveBeenCalledWith("victor@appquilar.com");
    expect(authRepository.changePassword).toHaveBeenCalledTimes(1);
    expect(authRepository.resetPassword).toHaveBeenCalledTimes(1);
  });
});
