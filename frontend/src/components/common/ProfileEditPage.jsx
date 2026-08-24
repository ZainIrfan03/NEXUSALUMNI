import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl as fileUrl } from "../../utils/getImageUrl";
import { REDIRECT_DELAY_MS } from "../../consts/appConstants";
import LoadingSpinner from "./LoadingSpinner";
import {
  UserCog,
  FileText,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Plus,
  X,
  MapPin,
} from "lucide-react";

export default function ProfileEditPage({
  profile,
  loading,
  queryError,
  saving,
  uploadingAvatar,
  uploadingResume,
  updateProfile,
  uploadAvatar,
  uploadResume,
  profilePath,
  includeResumeInSave = false,
  seedOnce = false,
  clearSuccessOnUpload = true,
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    location: "",
    headline: "",
    bio: "",
  });

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
  const displayError = error || (queryError && "Could not load profile.");

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
    setForm({ ...form, [event.target.name]: event.target.value });

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
    } catch (err) {
      setError(err.data?.message || "Could not upload profile picture.");
    }
  };

  const handleResumeSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
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
    } catch (err) {
      setError(err.data?.message || "Could not upload resume.");
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccessMsg("");
    try {
      const payload = {
        fullName: form.fullName,
        location: form.location,
        headline: form.headline,
        bio: form.bio,
        skills,
        interests,
        isPublic,
      };
      if (includeResumeInSave) {
        payload.resumeUrl = resumeUrl;
      }
      await updateProfile(payload).unwrap();
      setSuccessMsg("Profile saved successfully.");
      setTimeout(() => navigate(profilePath), REDIRECT_DELAY_MS);
    } catch (err) {
      setError(err.data?.message || "Could not save profile.");
    }
  };

  const handleDiscard = () => {
    navigate(profilePath);
  };

  if (loading) {
    return <LoadingSpinner label="Loading profile..." className="py-20" />;
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2">
        Profile <span className="mx-1">›</span>
        <span className="text-primary font-medium">Edit Profile</span>
      </p>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark mb-1">
            Settings & Preferences
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your digital presence and professional identity.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDiscard}
            className="text-sm font-medium text-dark border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-colors"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium text-white bg-dark rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {displayError}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {successMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <UserCog size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-dark">
                Personal Information
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Current Location
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-4 focus-within:border-primary transition-colors">
                  <MapPin size={15} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full py-2.5 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-dark mb-1.5">
                Professional Headline
              </label>
              <input
                type="text"
                name="headline"
                value={form.headline}
                onChange={handleChange}
                placeholder="e.g. Senior Product Designer | Focus on EdTech"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell your network about yourself..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-dark">Resume / CV</h2>
              </div>
            </div>

            <label className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-10 cursor-pointer hover:border-primary transition-colors">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Upload size={20} className="text-gray-500" />
              </div>
              <p className="font-semibold text-dark mb-1">
                Upload latest Resume
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your PDF here, or{" "}
                <span className="text-primary font-medium">browse files</span>
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeSelect}
                className="hidden"
              />
            </label>

            {resumeFile && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 text-sm text-dark mt-3">
                <FileText size={14} />
                <span className="flex-1 truncate">{resumeFile.name}</span>
                <button
                  type="button"
                  onClick={uploadResumeNow}
                  disabled={uploadingResume}
                  className="text-xs font-medium text-white bg-dark rounded-lg px-3 py-1.5 disabled:opacity-50 shrink-0"
                >
                  {uploadingResume ? "Uploading..." : "Upload"}
                </button>
                <button type="button" onClick={() => setResumeFile(null)}>
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            )}

            {resumeUrl && !resumeFile && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 text-sm text-dark mt-3">
                <FileText size={14} />
                <a
                  href={fileUrl(resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 truncate text-primary hover:underline"
                >
                  View current resume
                </a>
                <button type="button" onClick={() => setResumeUrl("")}>
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="relative inline-block mb-4">
              {avatarPreview || fileUrl(avatarUrl) ? (
                <img
                  src={avatarPreview || fileUrl(avatarUrl)}
                  alt="Profile"
                  className="h-28 w-28 rounded-full object-cover mx-auto"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400 text-2xl font-semibold">
                  {form.fullName ? form.fullName.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center cursor-pointer border-2 border-white">
                <Camera size={14} className="text-white" />
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
            </div>
            <h3 className="font-semibold text-dark mb-1">Profile Picture</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload a high-resolution professional photo. Square format
              recommended.
            </p>

            {avatarFile ? (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview("");
                  }}
                  className="text-sm font-medium text-dark border border-gray-200 rounded-xl px-5 py-2 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadAvatarNow}
                  disabled={uploadingAvatar}
                  className="text-sm font-medium text-white bg-dark rounded-xl px-5 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {uploadingAvatar ? "Uploading..." : "Upload"}
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <label className="text-sm font-medium text-primary bg-blue-50 rounded-xl px-5 py-2 cursor-pointer hover:bg-blue-100 transition-colors">
                  {avatarUrl ? "Change Photo" : "Upload Photo"}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-primary" />
              <h2 className="text-lg font-semibold text-dark">
                Skills & Interests
              </h2>
            </div>

            <p className="text-sm font-medium text-dark mb-2">Expertise Tags</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5"
                >
                  {skill}
                  <button onClick={() => removeChip(skills, setSkills, skill)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 mb-6 focus-within:border-primary transition-colors">
              <input
                type="text"
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) =>
                  addChip(event, skillInput, setSkillInput, skills, setSkills)
                }
                placeholder="Add a skill..."
                className="w-full py-2.5 text-sm outline-none"
              />
              <button
                onClick={() => {
                  if (skillInput.trim()) {
                    setSkills([...skills, skillInput.trim()]);
                    setSkillInput("");
                  }
                }}
                className="h-7 w-7 rounded-lg bg-dark text-white flex items-center justify-center shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>

            <p className="text-sm font-medium text-dark mb-2">
              Areas of Interest
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="flex items-center gap-1 text-xs font-medium text-dark bg-gray-100 rounded-full px-3 py-1.5"
                >
                  {interest}
                  <button
                    onClick={() =>
                      removeChip(interests, setInterests, interest)
                    }
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 focus-within:border-primary transition-colors">
              <input
                type="text"
                value={interestInput}
                onChange={(event) => setInterestInput(event.target.value)}
                onKeyDown={(event) =>
                  addChip(
                    event,
                    interestInput,
                    setInterestInput,
                    interests,
                    setInterests,
                  )
                }
                placeholder="Add an interest..."
                className="w-full py-2.5 text-sm outline-none"
              />
              <button
                onClick={() => {
                  if (interestInput.trim()) {
                    setInterests([...interests, interestInput.trim()]);
                    setInterestInput("");
                  }
                }}
                className="h-7 w-7 rounded-lg bg-dark text-white flex items-center justify-center shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-dark text-sm">Visibility</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Profile is currently {isPublic ? "Public" : "Private"}
              </p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                isPublic
                  ? "bg-primary justify-end"
                  : "bg-gray-300 justify-start"
              }`}
            >
              <span className="h-5 w-5 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
