"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { fetchUserData, updateUserData } from "../../lib/api/user";

const EditIcon = () => (
  <svg
    className="fill-current"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
      fill=""
    />
  </svg>
);

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const t = useTranslations("ProfilePage");
  const [addressInfo, setAddressInfo] = useState({
    country: "",
    city: "",
    postalCode: "",

  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    async function loadAddressInfo() {
      try {
        const data = await fetchUserData();
        setAddressInfo({
          country: data.country,
          city: data.city,
          postalCode: data.postalCode,

        });
      } catch (error) {
        console.error("Failed to fetch address info", error);
      }
    }

    loadAddressInfo();
  }, []);

  const handleFieldChange = (field: keyof typeof addressInfo, value: string) => {
    setAddressInfo((prev) => ({ ...prev, [field]: value }));
  };

  const getCurrentPosition = (options: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  const mapGeolocationError = (error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      return t("locationPermissionDenied");
    }

    if (error.code === error.TIMEOUT) {
      return t("locationTimeout");
    }

    return t("locationUnavailable");
  };

  const handleUseCurrentLocation = useCallback(async () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationError(t("geolocationNotSupported"));
      return;
    }

    setLocationError("");
    setIsDetectingLocation(true);

    try {
      let position: GeolocationPosition;

      try {
        position = await getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 30000,
        });
      } catch (error) {
        const geoError = error as GeolocationPositionError;
        if (geoError.code !== geoError.TIMEOUT) {
          throw error;
        }

        // Retry once with lower accuracy because some devices time out when GPS precision is requested.
        position = await getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 120000,
        });
      }

      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) {
        throw new Error("Unable to reverse geocode coordinates.");
      }

      const data = (await response.json()) as {
        address?: {
          city?: string;
          town?: string;
          municipality?: string;
          country?: string;
        };
      };

      const address = data.address || {};
      const detectedCity =
        address.city?.trim() ||
        address.town?.trim() ||
        address.municipality?.trim() ||
        "";

      setAddressInfo((prev) => ({
        ...prev,
        city: detectedCity || prev.city,
        country: address.country || prev.country,
      }));
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "number"
      ) {
        setLocationError(mapGeolocationError(error as GeolocationPositionError));
      } else {
        console.error("Failed to detect current location", error);
        setLocationError(t("detectLocationFailed"));
      }
    } finally {
      setIsDetectingLocation(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !("permissions" in navigator)) {
      return;
    }

    let isMounted = true;
    (navigator.permissions as Permissions)
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (isMounted && status.state === "granted") {
          void handleUseCurrentLocation();
        }
      })
      .catch(() => {
        // Ignore Permissions API errors and keep manual trigger available.
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, handleUseCurrentLocation]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      await updateUserData(addressInfo);
      closeModal();
    } catch (error) {
      console.error("Failed to update address info", error);
    } finally {
      setIsSaving(false);
    }
  };
  const displayValue = (value: string) => value || t("notAvailable");
  return (
    <>
      <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-primary dark:text-white/90 lg:mb-6">
              {t("address")}
            </h4>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-md leading-normal text-gray-500 dark:text-gray-400">
                  {t("countryLabel")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {displayValue(addressInfo.country)}
                </p>
              </div>
              <div>
                <p className="mb-2 text-md leading-normal text-gray-500 dark:text-gray-400">
                  {t("cityLabel")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {displayValue(addressInfo.city)}
                </p>
              </div>
              <div>
                <p className="mb-2 text-md leading-normal text-gray-500 dark:text-gray-400">
                  {t("postalCodeLabel")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {displayValue(addressInfo.postalCode)}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <EditIcon />
            {t("edit")}
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full overflow-y-auto rounded-3xl bg-white p-4 no-scrollbar dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {t("editAddressTitle")}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              {t("updateDetails")}
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isDetectingLocation}
                  className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  {isDetectingLocation ? t("detectingLocation") : t("useCurrentLocation")}
                </button>
                {locationError ? (
                  <p className="text-xs text-error-500">{locationError}</p>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>{t("countryLabel")}</Label>
                  <Input
                    type="text"
                    value={addressInfo.country}
                    onChange={(event) => handleFieldChange("country", event.target.value)}
                  />
                </div>
                <div>
                  <Label>{t("cityLabel")}</Label>
                  <Input
                    type="text"
                    value={addressInfo.city}
                    onChange={(event) => handleFieldChange("city", event.target.value)}
                  />
                </div>
                <div>
                  <Label>{t("postalCodeLabel")}</Label>
                  <Input
                    type="text"
                    value={addressInfo.postalCode}
                    onChange={(event) => handleFieldChange("postalCode", event.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                {t("close")}
              </Button>
              <Button size="sm" type="submit" disabled={isSaving}>
                {isSaving ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
