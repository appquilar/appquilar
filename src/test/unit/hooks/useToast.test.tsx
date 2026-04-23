import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { reducer, toast, useToast } from "@/hooks/use-toast";

describe("use-toast", () => {
    it("adds, updates, dismisses and removes toast items through the reducer", () => {
        const baseState = { toasts: [] };

        const addedState = reducer(baseState, {
            type: "ADD_TOAST",
            toast: {
                id: "toast-1",
                title: "Hola",
                open: true,
            },
        });

        expect(addedState.toasts).toEqual([
            {
                id: "toast-1",
                title: "Hola",
                open: true,
            },
        ]);

        const updatedState = reducer(addedState, {
            type: "UPDATE_TOAST",
            toast: {
                id: "toast-1",
                description: "Actualizado",
            },
        });

        expect(updatedState.toasts[0]).toMatchObject({
            id: "toast-1",
            title: "Hola",
            description: "Actualizado",
        });

        const dismissedSingle = reducer(updatedState, {
            type: "DISMISS_TOAST",
            toastId: "toast-1",
        });
        expect(dismissedSingle.toasts[0]?.open).toBe(false);

        const removedSingle = reducer(dismissedSingle, {
            type: "REMOVE_TOAST",
            toastId: "toast-1",
        });
        expect(removedSingle.toasts).toEqual([]);

        const removedAll = reducer(
            {
                toasts: [
                    { id: "a", open: true },
                    { id: "b", open: true },
                ],
            },
            {
                type: "REMOVE_TOAST",
            }
        );
        expect(removedAll.toasts).toEqual([]);
    });

    it("keeps only the latest toast, exposes update and dismiss helpers, and reacts to onOpenChange", () => {
        vi.useFakeTimers();

        const { result } = renderHook(() => useToast());

        act(() => {
            toast({
                title: "Primero",
                description: "toast-1",
            });
        });
        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0]?.title).toBe("Primero");

        let secondToast: ReturnType<typeof toast>;
        act(() => {
            secondToast = toast({
                title: "Segundo",
                description: "toast-2",
            });
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0]?.title).toBe("Segundo");

        act(() => {
            secondToast.update({
                id: secondToast.id,
                title: "Segundo actualizado",
            } as never);
        });
        expect(result.current.toasts[0]?.title).toBe("Segundo actualizado");

        act(() => {
            result.current.toasts[0]?.onOpenChange?.(false);
        });
        expect(result.current.toasts[0]?.open).toBe(false);

        act(() => {
            vi.runOnlyPendingTimers();
        });

        expect(result.current.toasts).toEqual([]);

        vi.useRealTimers();
    });

    it("dismisses all toasts from the hook API", () => {
        const { result } = renderHook(() => useToast());

        act(() => {
            toast({ title: "Toast A" });
            result.current.dismiss();
        });

        expect(result.current.toasts.every((item) => item.open === false)).toBe(true);
    });
});
