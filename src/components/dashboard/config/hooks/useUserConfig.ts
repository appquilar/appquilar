import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {toast} from 'sonner';
import {useAuth} from '@/context/AuthContext';
import {useSearchParams} from 'react-router-dom';
import {
    addressFormSchema,
    AddressFormValues,
    passwordFormSchema,
    PasswordFormValues,
    profileFormSchema,
    ProfileFormValues
} from '@/domain/schemas/userConfigSchema';
import {RepositoryFactory} from '@/infrastructure/repositories/RepositoryFactory';
import {Uuid} from '@/domain/valueObject/uuidv4';

export const useUserConfig = () => {
    const { user, refreshCurrentUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('profile');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Repositories
    const userRepository = RepositoryFactory.getUserRepository();
    const mediaRepository = RepositoryFactory.getMediaRepository();

    // Leer el tab de los query params al montar
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['profile', 'password', 'address'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Form para perfil
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            profileImage: user?.avatarUrl || '',
        },
    });

    // Update form defaults when user loads or refreshes
    useEffect(() => {
        if (user) {
            profileForm.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profileImage: user.avatarUrl || '',
            });
        }
    }, [user, profileForm]);

    // Form para contraseña
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    // Form para dirección
    const addressForm = useForm<AddressFormValues>({
        resolver: zodResolver(addressFormSchema),
        defaultValues: {
            street: user?.address?.street || '',
            street2: user?.address?.street2 || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            country: user?.address?.country || '',
            postalCode: user?.address?.postalCode || '',
            latitude: user?.location?.latitude || undefined,
            longitude: user?.location?.longitude || undefined,
        },
    });

    // --------------------------------------------------------
    // IMMEDIATE IMAGE UPLOAD HANDLER
    // --------------------------------------------------------
    const onImageUpload = async (file: File) => {
        if (!user) return;

        const toastId = toast.loading("Actualizando foto de perfil...");

        try {
            // 1. Delete existing image if applicable
            if (user.profileImageId) {
                try {
                    await mediaRepository.deleteImage(user.profileImageId);
                } catch (error) {
                    console.warn("Failed to delete old image, continuing with upload.", error);
                }
            }

            // 2. Generate UUID in FE
            const newImageId = Uuid.generate().toString();

            // 3. Upload new image with the generated ID
            await mediaRepository.uploadImage(file, newImageId);

            // 4. Update User: Send ALL required fields + new profile picture ID
            await userRepository.update(user.id, {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profileImageId: newImageId
            });

            // 5. Refresh context
            if (refreshCurrentUser) {
                await refreshCurrentUser();
            }

            toast.success('Foto de perfil actualizada', { id: toastId });
        } catch (error) {
            console.error("Error updating profile picture:", error);
            toast.error("Error al actualizar la foto", { id: toastId });
            // Revert UI
            if (user) {
                profileForm.setValue('profileImage', user.avatarUrl || '');
            }
        }
    };

    // --------------------------------------------------------
    // FORM SUBMISSIONS
    // --------------------------------------------------------

    const onProfileSubmit = async (data: ProfileFormValues) => {
        if (!user) return;

        try {
            await userRepository.update(user.id, {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                // profileImageId is handled separately by onImageUpload
            });

            if (refreshCurrentUser) {
                await refreshCurrentUser();
            }

            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Error al guardar los cambios del perfil");
        }
    };

    const onPasswordSubmit = (data: PasswordFormValues) => {
        toast.success('Contraseña actualizada correctamente');
        console.log('Password data:', data);
        passwordForm.reset();
    };

    const onAddressSubmit = async (data: AddressFormValues) => {
        if (!user) return;
        try {
            await userRepository.updateAddress(user.id, {
                address: {
                    street: data.street,
                    street2: data.street2 || undefined,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    postalCode: data.postalCode,
                },
                location: (data.latitude && data.longitude) ? {
                    latitude: data.latitude,
                    longitude: data.longitude
                } : undefined
            });

            if (refreshCurrentUser) {
                await refreshCurrentUser();
            }

            toast.success('Dirección guardada correctamente');
        } catch (error) {
            console.error("Error updating address:", error);
            toast.error("Error al guardar la dirección");
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const getActiveTabTitle = () => {
        switch (activeTab) {
            case 'profile': return 'Perfil';
            case 'password': return 'Contraseña';
            case 'address': return 'Dirección';
            default: return 'Perfil';
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setIsDrawerOpen(false);
    };

    return {
        activeTab,
        setActiveTab,
        isDrawerOpen,
        setIsDrawerOpen,
        profileForm,
        passwordForm,
        addressForm,
        onProfileSubmit,
        onImageUpload,
        onPasswordSubmit,
        onAddressSubmit,
        getInitials,
        getActiveTabTitle,
        handleTabChange,
        user
    };
};