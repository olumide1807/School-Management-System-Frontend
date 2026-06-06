import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Avatar, Chip } from "@mui/material";
import { PersonAdd, OpenInNew } from "@mui/icons-material";
import Student from "./tabs/Student";
import SERVER from "../../../../Utils/server";
import { useQuery } from "@tanstack/react-query";
import { useClassArms, useClassLevels } from "../../../../services/api-call";

// Slim Admissions page — focused on admitting new students.
// Student/parent lists and profiles are now in Student Management.

export default function Admissions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect old profile URLs to Student Management
  const isProfile = searchParams.get("profile");
  const profileId = searchParams.get("id");
  if (isProfile === "student" && profileId) {
    navigate(`/student-management/student-profile/${profileId}`, { replace: true });
    return null;
  }
  if (isProfile === "parent" && profileId) {
    navigate(`/student-management`, { replace: true });
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">
            Register new students here. To view and manage existing students, go to{" "}
            <button
              onClick={() => navigate("/student-management")}
              className="text-tertiary hover:underline font-medium"
            >
              Student Management →
            </button>
          </p>
        </div>
      </div>

      {/* Recent Admissions + Student Registration */}
      <Student />
    </div>
  );
}