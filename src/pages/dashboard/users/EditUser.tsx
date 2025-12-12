import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import FormHeader from "@/components/dashboard/common/FormHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminUserEditor } from "@/application/hooks/useAdminUserEditor";
import AdminUserProfileTab from "@/components/dashboard/users/admin/AdminUserProfileTab";
import AddressTab from "@/components/dashboard/config/tabs/AddressTab";

type TabKey = "profile" | "address";

const EditUserPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const [activeTab, setActiveTab] = useState<TabKey>("profile");

    const {
        user,
        isLoading,
        error,
        profileForm,
        addressForm,
        onProfileSubmit,
        onAddressSubmit,
        onImageUpload,
        onImageRemove,
    } = useAdminUserEditor(userId);

    const userLabel = useMemo(() => {
        if (!user) return "";
        const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
        return full || user.email || user.id;
    }, [user]);

    const copyUserId = async () => {
        if (!userId) return;
        try {
            await navigator.clipboard.writeText(userId);
            toast.success("ID copiado al portapapeles");
        } catch {
            toast.error("No se ha podido copiar el ID");
        }
    };

    if (!userId) {
        return (
            <div className="space-y-6">
                <FormHeader title="Usuario no encontrado" backUrl="/dashboard/users" />
                <p className="text-muted-foreground">
                    No se ha proporcionado ningún ID de usuario.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <FormHeader title="Editar usuario" backUrl="/dashboard/users" />
                <p className="text-muted-foreground">Cargando datos del usuario…</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="space-y-6">
                <FormHeader title="Editar usuario" backUrl="/dashboard/users" />
                <p className="text-destructive">{error ?? "No se ha encontrado el usuario."}</p>
                <Button variant="outline" onClick={() => navigate("/dashboard/users")}>
                    Volver al listado
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FormHeader
                title={`Editar usuario: ${userLabel}`}
                backUrl="/dashboard/users"
            />

            {/* ID visible y copiable */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex-1">
                    <label className="text-sm text-muted-foreground">User ID</label>
                    <Input value={user.id} readOnly className="mt-1 font-mono" />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="md:mt-6"
                    onClick={copyUserId}
                >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar ID
                </Button>
            </div>

            {/* Tabs: Perfil / Dirección */}
            {isMobile ? (
                <div className="space-y-4">
                    <Select
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as TabKey)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sección" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="profile">Perfil</SelectItem>
                            <SelectItem value="address">Dirección</SelectItem>
                        </SelectContent>
                    </Select>

                    {activeTab === "profile" && (
                        <AdminUserProfileTab
                            profileForm={profileForm}
                            userProfilePictureId={user.profilePictureId}
                            onProfileSubmit={onProfileSubmit}
                            onImageUpload={onImageUpload}
                            onImageRemove={onImageRemove}
                        />
                    )}

                    {activeTab === "address" && (
                        <AddressTab addressForm={addressForm} onAddressSubmit={onAddressSubmit} />
                    )}
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
                    <TabsList className="grid grid-cols-2 md:w-[420px]">
                        <TabsTrigger value="profile">Perfil</TabsTrigger>
                        <TabsTrigger value="address">Dirección</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-6">
                        <AdminUserProfileTab
                            profileForm={profileForm}
                            userProfilePictureId={user.profilePictureId}
                            onProfileSubmit={onProfileSubmit}
                            onImageUpload={onImageUpload}
                            onImageRemove={onImageRemove}
                        />
                    </TabsContent>

                    <TabsContent value="address" className="mt-6">
                        <AddressTab addressForm={addressForm} onAddressSubmit={onAddressSubmit} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default EditUserPage;
