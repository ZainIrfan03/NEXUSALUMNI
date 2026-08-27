import { useState } from "react";
import {
  useAddEducationMutation,
  useAddExperienceMutation,
  useDeleteEducationMutation,
  useGetMyProfileQuery,
} from "../../../../store/api/studentProfileApi";

const EMPTY_ROLE = {
  title: "",
  company: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
};

export default function useMyProfile() {
  const { data: profile, isLoading: loading, error: queryError } =
    useGetMyProfileQuery();
  const [addExperience] = useAddExperienceMutation();
  const [addEducation] = useAddEducationMutation();
  const [deleteEducation] = useDeleteEducationMutation();
  const [actionError, setActionError] = useState("");
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE);
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduForm, setEduForm] = useState({ school: "", degree: "", year: "" });

  const handleAddRole = async (event) => {
    event.preventDefault();
    if (!roleForm.title || !roleForm.company) return;
    setActionError("");
    try {
      await addExperience(roleForm).unwrap();
      setRoleForm(EMPTY_ROLE);
      setShowRoleForm(false);
    } catch (requestError) {
      setActionError(requestError.data?.message || "Could not add role.");
    }
  };

  const handleAddEducation = async (event) => {
    event.preventDefault();
    if (!eduForm.school || !eduForm.degree) return;
    setActionError("");
    try {
      await addEducation(eduForm).unwrap();
      setEduForm({ school: "", degree: "", year: "" });
      setShowEduForm(false);
    } catch (requestError) {
      setActionError(requestError.data?.message || "Could not add education.");
    }
  };

  const handleDeleteEducation = async (educationId) => {
    setActionError("");
    try {
      await deleteEducation(educationId).unwrap();
    } catch (requestError) {
      setActionError(requestError.data?.message || "Could not remove education.");
    }
  };

  return {
    eduForm,
    error: actionError || (queryError && "Could not load profile."),
    handleAddEducation,
    handleAddRole,
    handleDeleteEducation,
    loading,
    profile,
    roleForm,
    setEduForm,
    setRoleForm,
    setShowEduForm,
    setShowRoleForm,
    showEduForm,
    showRoleForm,
  };
}
