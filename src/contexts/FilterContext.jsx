// contexts/FilterContext.jsx — shared marketplace filter state
import React, { createContext, useContext, useState, useMemo } from "react";

const FilterContext = createContext(null);

export const FilterProvider = ({ children }) => {
  const [category, setCategory] = useState(null); // e.g. "Vehicles" | "Cars" | null
  const [location, setLocation] = useState(null); // e.g. "Lahore" | "Samanabad" | null
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [kmMin, setKmMin] = useState("");
  const [kmMax, setKmMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [brand, setBrand] = useState(null);
  const [conditions, setConditions] = useState([]); // ["New", "Used"]
  const [fuelTypes, setFuelTypes] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);
  const [assembly, setAssembly] = useState([]);
  const [colors, setColors] = useState([]);
  const [registeredIn, setRegisteredIn] = useState([]);
  const [owners, setOwners] = useState([]);
  const [accidentFree, setAccidentFree] = useState([]);
  const [sellerType, setSellerType] = useState([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [withPhotos, setWithPhotos] = useState(false);

  /* ═══════════════════════════════════════════════════════════════
     ⭐ NEW — Property, Mobile, Electronics, Toys state
     ═══════════════════════════════════════════════════════════════ */
  // Property
  const [bedrooms, setBedrooms] = useState([]);
  const [bathrooms, setBathrooms] = useState([]);
  const [propertyPurpose, setPropertyPurpose] = useState([]);
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");

  // Mobile
  const [storage, setStorage] = useState([]);
  const [ptaApproved, setPtaApproved] = useState([]);
  const [network, setNetwork] = useState([]);

  // Electronics
  const [deviceType, setDeviceType] = useState([]);
  const [warranty, setWarranty] = useState([]);
  const [electronicsBrands, setElectronicsBrands] = useState([]);

  // Toys
  const [toyAudience, setToyAudience] = useState([]);
  const [toyMaterial, setToyMaterial] = useState([]);
  const [toyAge, setToyAge] = useState([]);
  const [toyBattery, setToyBattery] = useState([]);
  const [toyAssembly, setToyAssembly] = useState([]);

  const resetAll = () => {
    setCategory(null);
    setLocation(null);
    setPriceMin(""); setPriceMax("");
    setKmMin(""); setKmMax("");
    setYearMin(""); setYearMax("");
    setBrand(null);
    setConditions([]);
    setFuelTypes([]);
    setTransmissions([]);
    setBodyTypes([]);
    setAssembly([]);
    setColors([]);
    setRegisteredIn([]);
    setOwners([]);
    setAccidentFree([]);
    setSellerType([]);
    setFeaturedOnly(false);
    setWithPhotos(false);

    // ⭐ new resets
    setBedrooms([]);
    setBathrooms([]);
    setPropertyPurpose([]);
    setAreaMin("");
    setAreaMax("");
    setStorage([]);
    setPtaApproved([]);
    setNetwork([]);
    setDeviceType([]);
    setWarranty([]);
    setElectronicsBrands([]);
    setToyAudience([]);
    setToyMaterial([]);
    setToyAge([]);
    setToyBattery([]);
    setToyAssembly([]);
  };

  const toggleInArray = (setter, value) => {
    if (typeof setter !== "function") {
      console.warn("toggleInArray: setter is not a function →", setter);
      return;
    }
    setter((prev) =>
      Array.isArray(prev)
        ? prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
        : [value]
    );
  };

  const value = useMemo(
    () => ({
      category, setCategory,
      location, setLocation,
      priceMin, setPriceMin, priceMax, setPriceMax,
      kmMin, setKmMin, kmMax, setKmMax,
      yearMin, setYearMin, yearMax, setYearMax,
      brand, setBrand,
      conditions, setConditions,
      fuelTypes, setFuelTypes,
      transmissions, setTransmissions,
      bodyTypes, setBodyTypes,
      assembly, setAssembly,
      colors, setColors,
      registeredIn, setRegisteredIn,
      owners, setOwners,
      accidentFree, setAccidentFree,
      sellerType, setSellerType,
      featuredOnly, setFeaturedOnly,
      withPhotos, setWithPhotos,

      /* ⭐ NEW — Property */
      bedrooms, setBedrooms,
      bathrooms, setBathrooms,
      propertyPurpose, setPropertyPurpose,
      areaMin, setAreaMin,
      areaMax, setAreaMax,

      /* ⭐ NEW — Mobile */
      storage, setStorage,
      ptaApproved, setPtaApproved,
      network, setNetwork,

      /* ⭐ NEW — Electronics */
      deviceType, setDeviceType,
      warranty, setWarranty,
      electronicsBrands, setElectronicsBrands,

      /* ⭐ NEW — Toys */
      toyAudience, setToyAudience,
      toyMaterial, setToyMaterial,
      toyAge, setToyAge,
      toyBattery, setToyBattery,
      toyAssembly, setToyAssembly,

      resetAll,
      toggleInArray,
    }),
    [
      category, location,
      priceMin, priceMax,
      kmMin, kmMax,
      yearMin, yearMax,
      brand, conditions, fuelTypes, transmissions, bodyTypes,
      assembly, colors, registeredIn, owners, accidentFree,
      sellerType, featuredOnly, withPhotos,

      // ⭐ new deps
      bedrooms, bathrooms, propertyPurpose, areaMin, areaMax,
      storage, ptaApproved, network,
      deviceType, warranty, electronicsBrands,
      toyAudience, toyMaterial, toyAge, toyBattery, toyAssembly,
    ]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilter = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used inside <FilterProvider>");
  return ctx;
};