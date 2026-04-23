import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/domain/models/UserRole";

const updateUserMock = vi.fn();
const updateUserAddressMock = vi.fn();
const uploadImageMock = vi.fn();
const deleteImageMock = vi.fn();
const invalidateQueriesMock = vi.fn();
const refreshCurrentUserMock = vi.fn();
const useAuthMock = vi.fn();
const useUserByIdMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();
const toastLoadingMock = vi.fn();

vi.mock("@/compositionRoot", () => ({
    compositionRoot: {
        userService: {
            updateUser: (...args: unknown[]) => updateUserMock(...args),
            updateUserAddress: (...args: unknown[]) => updateUserAddressMock(...args),
        },
        mediaService: {
            uploadImage: (...args: unknown[]) => uploadImageMock(...args),
            deleteImage: (...args: unknown[]) => deleteImageMock(...args),
        },
    },
    queryClient: {
        invalidateQueries: (...args: unknown[]) => invalidateQueriesMock(...args),
    },
}));

vi.mock("@/context/AuthContext", () => ({
    useAuth: () => useAuthMock(),
}));

vi.mock("@/application/hooks/useUserById", () => ({
    useUserById: (...args: unknown[]) => useUserByIdMock(...args),
}));

vi.mock("sonner", () => ({
    toast: {
        success: (...args: unknown[]) => toastSuccessMock(...args),
        error: (...args: unknown[]) => toastErrorMock(...args),
        loading: (...args: unknown[]) => toastLoadingMock(...args),
    },
}));

import { useAdminUserEditor } from "@/application/hooks/useAdminUserEditor";

describe("useAdminUserEditor", () => {
    beforeEach(() => {
        updateUserMock.mockReset();
        updateUserAddressMock.mockReset();
        uploadImageMock.mockReset();
        deleteImageMock.mockReset();
        invalidateQueriesMock.mockReset();
        refreshCurrentUserMock.mockReset();
        useAuthMock.mockReset();
        useUserByIdMock.mockReset();
        toastSuccessMock.mockReset();
        toastErrorMock.mockReset();
        toastLoadingMock.mockReset();

        invalidateQueriesMock.mockResolvedValue(undefined);
        refreshCurrentUserMock.mockResolvedValue(null);
        updateUserAddressMock.mockResolvedValue(undefined);

        useAuthMock.mockReturnValue({
            currentUser: {
                id: "user-1",
            },
            refreshCurrentUser: refreshCurrentUserMock,
        });

        useUserByIdMock.mockReturnValue({
            user: {
                id: "user-1",
                firstName: "Victor",
                lastName: "Saavedra",
                email: "victor@appquilar.com",
                roles: [],
                profilePictureId: null,
                address: {
                    street: "",
                    street2: "",
                    city: "",
                    state: "",
                    country: "",
                    postalCode: "",
                },
                location: null,
            },
            isLoading: false,
            error: null,
        });
    });

    it("refreshes currentUser after updating the authenticated user's address", async () => {
        const { result } = renderHook(() => useAdminUserEditor("user-1"));

        await act(async () => {
            await result.current.onAddressSubmit({
                street: "Calle Mayor 1",
                street2: "",
                city: "Madrid",
                state: "Madrid",
                country: "España",
                postalCode: "28001",
                latitude: 40.4168,
                longitude: -3.7038,
            });
        });

        expect(updateUserAddressMock).toHaveBeenCalledWith("user-1", {
            address: {
                street: "Calle Mayor 1",
                street2: undefined,
                city: "Madrid",
                state: "Madrid",
                country: "España",
                postalCode: "28001",
            },
            location: {
                latitude: 40.4168,
                longitude: -3.7038,
            },
        });
        expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["userById", "user-1"] });
        expect(refreshCurrentUserMock).toHaveBeenCalledTimes(1);
        expect(toastSuccessMock).toHaveBeenCalledWith("Dirección guardada correctamente");
    });

    it("does not refresh currentUser when editing a different user", async () => {
        const { result } = renderHook(() => useAdminUserEditor("user-2"));

        await act(async () => {
            await result.current.onAddressSubmit({
                street: "Calle Mayor 1",
                street2: "",
                city: "Madrid",
                state: "Madrid",
                country: "España",
                postalCode: "28001",
                latitude: 40.4168,
                longitude: -3.7038,
            });
        });

        expect(updateUserAddressMock).toHaveBeenCalledWith("user-2", expect.any(Object));
        expect(refreshCurrentUserMock).not.toHaveBeenCalled();
    });

    it("normalizes admin roles and preserves the stored email on profile submit", async () => {
        const { result } = renderHook(() => useAdminUserEditor("user-1"));

        await act(async () => {
            await result.current.onProfileSubmit({
                firstName: "Ada",
                lastName: "Lovelace",
                email: "otro@appquilar.com",
                profilePicture: "",
                roles: [UserRole.ADMIN],
            });
        });

        expect(updateUserMock).toHaveBeenCalledWith("user-1", {
            firstName: "Ada",
            lastName: "Lovelace",
            email: "victor@appquilar.com",
            roles: [UserRole.ADMIN, UserRole.REGULAR_USER],
            profilePictureId: null,
        });
        expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["userById", "user-1"] });
        expect(refreshCurrentUserMock).toHaveBeenCalledTimes(1);
        expect(toastSuccessMock).toHaveBeenCalledWith("Perfil actualizado correctamente");
    });

    it("uploads a new profile image, deletes the previous one and refreshes the current user", async () => {
        toastLoadingMock.mockReturnValue("toast-1");
        uploadImageMock.mockResolvedValue("image-2");

        useUserByIdMock.mockReturnValue({
            user: {
                id: "user-1",
                firstName: "Victor",
                lastName: "Saavedra",
                email: "victor@appquilar.com",
                roles: [],
                profilePictureId: "image-1",
                address: {
                    street: "",
                    street2: "",
                    city: "",
                    state: "",
                    country: "",
                    postalCode: "",
                },
                location: null,
            },
            isLoading: false,
            error: null,
        });

        const { result } = renderHook(() => useAdminUserEditor("user-1"));

        await act(async () => {
            await result.current.onImageUpload(new File(["avatar"], "avatar.png", { type: "image/png" }));
        });

        expect(uploadImageMock).toHaveBeenCalledTimes(1);
        expect(updateUserMock).toHaveBeenCalledWith("user-1", {
            profilePictureId: "image-2",
        });
        expect(deleteImageMock).toHaveBeenCalledWith("image-1");
        expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["userById", "user-1"] });
        expect(refreshCurrentUserMock).toHaveBeenCalledTimes(1);
        expect(toastSuccessMock).toHaveBeenCalledWith("Foto de perfil actualizada", { id: "toast-1" });
    });

    it("resets the profile picture field when the upload fails", async () => {
        toastLoadingMock.mockReturnValue("toast-upload-error");
        uploadImageMock.mockRejectedValue(new Error("upload failed"));

        const { result } = renderHook(() => useAdminUserEditor("user-1"));
        act(() => {
            result.current.profileForm.setValue("profilePicture", "temp-value");
        });

        await act(async () => {
            await result.current.onImageUpload(new File(["avatar"], "avatar.png", { type: "image/png" }));
        });

        expect(updateUserMock).not.toHaveBeenCalled();
        expect(result.current.profileForm.getValues("profilePicture")).toBe("");
        expect(toastErrorMock).toHaveBeenCalledWith("Error al actualizar la foto", {
            id: "toast-upload-error",
        });
    });

    it("clears the profile picture locally when there is no persisted image to remove", async () => {
        const { result } = renderHook(() => useAdminUserEditor("user-1"));
        act(() => {
            result.current.profileForm.setValue("profilePicture", "temp-value");
        });

        await act(async () => {
            await result.current.onImageRemove();
        });

        expect(updateUserMock).not.toHaveBeenCalled();
        expect(deleteImageMock).not.toHaveBeenCalled();
        expect(result.current.profileForm.getValues("profilePicture")).toBe("");
    });

    it("removes persisted profile pictures and refreshes the authenticated user", async () => {
        toastLoadingMock.mockReturnValue("toast-remove");
        useUserByIdMock.mockReturnValue({
            user: {
                id: "user-1",
                firstName: "Victor",
                lastName: "Saavedra",
                email: "victor@appquilar.com",
                roles: [],
                profilePictureId: "image-1",
                address: {
                    street: "",
                    street2: "",
                    city: "",
                    state: "",
                    country: "",
                    postalCode: "",
                },
                location: null,
            },
            isLoading: false,
            error: null,
        });

        const { result } = renderHook(() => useAdminUserEditor("user-1"));
        act(() => {
            result.current.profileForm.setValue("profilePicture", "preview");
        });

        await act(async () => {
            await result.current.onImageRemove();
        });

        expect(updateUserMock).toHaveBeenCalledWith("user-1", {
            profilePictureId: null,
        });
        expect(deleteImageMock).toHaveBeenCalledWith("image-1");
        expect(result.current.profileForm.getValues("profilePicture")).toBe("");
        expect(refreshCurrentUserMock).toHaveBeenCalledTimes(1);
        expect(toastSuccessMock).toHaveBeenCalledWith("Foto de perfil eliminada", {
            id: "toast-remove",
        });
    });

    it("shows error toasts when profile, address or image-removal updates fail", async () => {
        toastLoadingMock.mockReturnValue("toast-remove-error");
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        updateUserMock.mockRejectedValueOnce(new Error("profile failed"));
        const { result } = renderHook(() => useAdminUserEditor("user-1"));

        await act(async () => {
            await result.current.onProfileSubmit({
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@appquilar.test",
                profilePicture: "",
                roles: [UserRole.REGULAR_USER],
            });
        });

        expect(toastErrorMock).toHaveBeenCalledWith("Error al guardar los cambios del perfil");

        updateUserAddressMock.mockRejectedValueOnce(new Error("address failed"));

        await act(async () => {
            await result.current.onAddressSubmit({
                street: "Calle Mayor 1",
                street2: "",
                city: "Madrid",
                state: "Madrid",
                country: "España",
                postalCode: "28001",
                latitude: undefined,
                longitude: undefined,
            });
        });

        expect(toastErrorMock).toHaveBeenCalledWith("Error al guardar la dirección");

        useUserByIdMock.mockReturnValue({
            user: {
                id: "user-1",
                firstName: "Victor",
                lastName: "Saavedra",
                email: "victor@appquilar.com",
                roles: [],
                profilePictureId: "image-1",
                address: {
                    street: "",
                    street2: "",
                    city: "",
                    state: "",
                    country: "",
                    postalCode: "",
                },
                location: null,
            },
            isLoading: false,
            error: null,
        });
        updateUserMock.mockRejectedValueOnce(new Error("remove failed"));

        const { result: removeResult } = renderHook(() => useAdminUserEditor("user-1"));

        await act(async () => {
            await removeResult.current.onImageRemove();
        });

        expect(deleteImageMock).not.toHaveBeenCalledWith("image-1");
        expect(toastErrorMock).toHaveBeenCalledWith("Error al eliminar la foto", {
            id: "toast-remove-error",
        });
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});
