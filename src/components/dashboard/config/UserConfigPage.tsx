// src/components/dashboard/config/UserConfigPage.tsx

import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { useUserConfig } from "./hooks/useUserConfig";
import { useIsMobile } from "@/hooks/use-mobile";
import ProfileTab from "./tabs/ProfileTab";
import PasswordTab from "./tabs/PasswordTab";
import AddressTab from "./tabs/AddressTab";
import MobileConfigLayout from "./layout/MobileConfigLayout";
import DesktopConfigLayout from "./layout/DesktopConfigLayout";
import {useSeo} from "@/hooks/useSeo.ts";
import UserSubscriptionSettingsCard from "@/components/dashboard/config/UserSubscriptionSettingsCard";

const UserConfigPage: React.FC = () => {
    useSeo(
        { type: "dashboard-section", section: "Configuración" },
        { noIndex: true }
    );

    const {
        activeTab,
        setActiveTab,
        profileForm,
        passwordForm,
        addressForm,
        onProfileSubmit,
        onImageUpload,
        onImageRemove,
        onPasswordSubmit,
        onAddressSubmit,
        getInitials,
        getActiveTabTitle,
        handleTabChange,
    } = useUserConfig();

    const isMobile = useIsMobile();

    const renderTabContent = () => (
        <>
            <TabsContent value="profile" className="space-y-6">
                <ProfileTab
                    profileForm={profileForm}
                    onProfileSubmit={onProfileSubmit}
                    onImageUpload={onImageUpload}
                    onImageRemove={onImageRemove}
                    getInitials={getInitials}
                />
            </TabsContent>

            <TabsContent value="password" className="space-y-6">
                <PasswordTab
                    passwordForm={passwordForm}
                    onPasswordSubmit={onPasswordSubmit}
                />
            </TabsContent>

            <TabsContent value="address" className="space-y-6">
                <AddressTab
                    addressForm={addressForm}
                    onAddressSubmit={onAddressSubmit}
                />
            </TabsContent>
        </>
    );

    return (
        <div className="container mx-auto py-6 space-y-8 max-w-5xl">
            <div>
                <h1 className="text-2xl font-display font-semibold">
                    Configuración
                </h1>
                <p className="text-muted-foreground">
                    Gestiona tus preferencias y datos personales
                </p>
            </div>

            <UserSubscriptionSettingsCard />

            {isMobile ? (
                <MobileConfigLayout
                    activeTab={activeTab}
                    title={getActiveTabTitle()}
                    handleTabChange={handleTabChange}
                >
                    {renderTabContent()}
                </MobileConfigLayout>
            ) : (
                <DesktopConfigLayout
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                >
                    {renderTabContent()}
                </DesktopConfigLayout>
            )}
        </div>
    );
};

export default UserConfigPage;
