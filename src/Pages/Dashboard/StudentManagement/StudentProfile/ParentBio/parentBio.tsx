import React, { useState } from "react";
// import CountryFlag from "react-country-flag";
import { getCountryCode } from "../PersonalBio/personalBio";
import { getCountryFlag } from "../PersonalBio/personalBio";

export const ParentBio = () => {
  const parentData = {
    title: "Mr",
    surname: "Fayo",
    firstName: "Ade",
    otherName: "Jare",
    maritalStatus: "Married",
    occupation: "Software Engineer",
    relationship: "Father",
    email: "peter.adejare@example.com",
    phone: "+2348012345678",
    gender: "Male",
    homeAddress: "No 1, Adeola Odeku Street, Victoria Island, Lagos",
  };

  return (
    <>
      <>
        <div className="p-2 flex flex-col gap-y-9 w-full max-w-[925px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-[2em] gap-x-[4em] mb-4 w-full">
            <div className="flex flex-col">
              <p className="pb-2">Title</p>
              <p className="bg-gray-100 p-2 rounded font-light pl-6">
                {parentData.title}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="pb-2">Surname</p>
              <p className="bg-gray-100 p-2 rounded font-light pl-6">
                {parentData.surname}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="pb-2">First name</p>
              <p className="bg-gray-100 p-2 rounded font-light pl-6">
                {parentData.firstName}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="pb-2">Other name</p>
              <p className="bg-gray-100 p-2 rounded font-light pl-6">
                {parentData.otherName}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="pb-2">Gender</p>
              <p className="bg-gray-100 p-2 rounded font-light pl-6">
                {parentData.gender}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="pb-2">Marital status</p>
              <p className="bg-gray-100 p-2 rounded font-light pl-6">
                {parentData.maritalStatus}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="pb-2">Email</p>
              <p className="bg-gray-100 p-2 rounded font-light pl-6">
                {parentData.email}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="pb-2">Phone</p>
              <p className="bg-gray-100 p-2 rounded font-light  pl-6 flex items-center gap-2">
                {getCountryCode(parentData.phone)}
                {parentData.phone}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="pb-2">Occupation</p>
              <p className="bg-gray-100 p-2 rounded font-light pl-6">
                {parentData.occupation}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="pb-2">Relationship</p>
              <p className="bg-gray-100 p-2 rounded font-light pl-6">
                {parentData.relationship}
              </p>
            </div>
            <div className="flex flex-col w-full">
              <p className="pb-2">Home Address</p>
              <p className="bg-gray-100 p-2 rounded pl-6 font-light w-full">
                {parentData.homeAddress}
              </p>
            </div>
          </div>
        </div>
      </>
    </>
  );
};
