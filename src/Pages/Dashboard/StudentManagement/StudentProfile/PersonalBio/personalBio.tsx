import React, { useState } from "react";
import CountryFlag from "react-country-flag";
export const getCountryCode = (phoneNumber) => {
  const countryCode = phoneNumber.substring(1, 4);
  switch (countryCode) {
    case "234":
      return <CountryFlag countryCode="NG" svg />;
    case "233":
      return <CountryFlag countryCode="GH" svg />;
    case "254":
      return <CountryFlag countryCode="KY" svg />;
    default:
      return <CountryFlag countryCode="NG" svg />;
  }
};
export const getCountryFlag = (country) => {
  switch (country.toLowerCase()) {
    case "nigeria":
      return <CountryFlag countryCode="NG" svg />;
    case "ghana":
      return <CountryFlag countryCode="GH" svg />;
    case "kenya":
      return <CountryFlag countryCode="KY" svg />;
    default:
      return <CountryFlag countryCode="NG" svg />;
  }
};

export const PersonalBio = () => {
  const personalData = {
    email: "peter.adejare@example.com",
    phone: "+2348012345678",
    religion: "Christianity",
    dateOfBirth: "2000-01-15",
    gender: "Male",
    country: "Nigeria",
    state: "Lagos",
    localGovernment: "Ikeja",
    homeAddress: "No 1, Adeola Odeku Street, Victoria Island, Lagos",
  };

  return (
    <>
      <div className="p-2 flex flex-col gap-y-9 w-full max-w-[925px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[2em] gap-x-[4em] mb-4 w-full">
          <div className="flex flex-col">
            <p className="pb-2">Gender</p>
            <p className="bg-gray-100 p-2 rounded font-light pl-6">
              {personalData.gender}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="pb-2">Email</p>
            <p className="bg-gray-100 p-2 rounded font-light pl-6">
              {personalData.email}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="pb-2">Phone</p>
            <p className="bg-gray-100 p-2 rounded font-light  pl-6 flex items-center gap-2">
              {getCountryCode(personalData.phone)}
              {personalData.phone}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="pb-2">Date of Birth</p>
            <p className="bg-gray-100 p-2 rounded font-light pl-6">
              {personalData.dateOfBirth}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="pb-2">Religion</p>
            <p className="bg-gray-100 p-2 rounded font-light pl-6">
              {personalData.religion}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="pb-2">Country</p>

            <p className="bg-gray-100 p-2 rounded font-light pl-6 flex items-center gap-2">
              {getCountryFlag(personalData.country)}
              {personalData.country}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="pb-2">State</p>
            <p className="bg-gray-100 p-2 rounded font-light pl-6">
              {personalData.state}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="pb-2">Local Government</p>
            <p className="bg-gray-100 p-2 rounded font-light pl-6">
              {personalData.localGovernment}
            </p>
          </div>
        </div>
        <div className="flex flex-col w-full">
          <p className="pb-2">Home Address</p>
          <p className="bg-gray-100 p-2 rounded pl-6 font-light w-full">
            {personalData.homeAddress}
          </p>
        </div>
      </div>
    </>
  );
};
