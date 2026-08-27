import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { REDIRECT_DELAY_MS } from "../../../consts/appConstants";

const EMPTY_FORM = { fullName: "", location: "", headline: "", bio: "" };

export default function useProfileEdit({
  clearSuccessOnUpload,
  includeResumeInSave,
  profile,
  profilePath,
  queryError,
  seedOnce,
  updateProfile,
  uploadAvatar,
  uploadResume,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [hasSeeded, setHasSeeded] = useState(false);
  const [seededProfile, setSeededProfile] = useState(null);

  if (profile && profile !== seededProfile && (!seedOnce || !hasSeeded)) {
    setSeededProfile(profile);
    setForm({
      fullName: profile.user?.fullName || "",
      location: profile.location || "",
      headline: profile.headline || "",
      bio: profile.bio || "",
    });
    setSkills(profile.skills || []);
    setInterests(profile.interests || []);
    setResumeUrl(profile.resumeUrl || "");
    setAvatarUrl(profile.avatarUrl || "");
    setIsPublic(profile.isPublic ?? true);
    if (seedOnce) setHasSeeded(true);
  }

  const handleChange = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const addChip = (event, value, setValue, list, setList) => {
    if (event.key === "Enter" && value.trim()) {
      event.preventDefault();
      setList([...list, value.trim()]);
      setValue("");
    }
  };

  const removeChip = (list, setList, item) =>
    setList(list.filter((entry) => entry !== item));

  const handleAvatarSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatarNow = async () => {
    if (!avatarFile) return;
    setError("");
    if (clearSuccessOnUpload) setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const data = await uploadAvatar(formData).unwrap();
      setAvatarUrl(data.avatarUrl);
      setAvatarFile(null);
      setAvatarPreview("");
      setSuccessMsg("Profile picture updated.");
    } catch (requestError) {
      setError(
        requestError.data?.message || "Could not upload profile picture.",
      );
    }
  };

  const handleResumeSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const uploadResumeNow = async () => {
    if (!resumeFile) return;
    setError("");
    if (clearSuccessOnUpload) setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const data = await uploadResume(formData).unwrap();
      setResumeUrl(data.resumeUrl);
      setResumeFile(null);
      setSuccessMsg("Resume uploaded.");
    } catch (requestError) {
      setError(requestError.data?.message || "Could not upload resume.");
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccessMsg("");
    try {
      const payload = {
        ...form,
        skills,
        interests,
        isPublic,
      };
      if (includeResumeInSave) payload.resumeUrl = resumeUrl;
      await updateProfile(payload).unwrap();
      setSuccessMsg("Profile saved successfully.");
      setTimeout(() => navigate(profilePath), REDIRECT_DELAY_MS);
    } catch (requestError) {
      setError(requestError.data?.message || "Could not save profile.");
    }
  };

  return {
    addChip,
    avatarFile,
    avatarPreview,
    avatarUrl,
    displayError: error || (queryError && "Could not load profile."),
    form,
    handleAvatarSelect,
    handleChange,
    handleDiscard: () => navigate(profilePath),
    handleResumeSelect,
    handleSave,
    interestInput,
    interests,
    isPublic,
    removeChip,
    resumeFile,
    resumeUrl,
    setAvatarFile,
    setAvatarPreview,
    setInterestInput,
    setInterests,
    setIsPublic,
    setResumeFile,
    setResumeUrl,
    setSkillInput,
    setSkills,
    skillInput,
    skills,
    successMsg,
    uploadAvatarNow,
    uploadResumeNow,
  };
}
