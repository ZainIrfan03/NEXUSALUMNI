import ProfileEditPage from "../../../components/common/ProfileEditPage";
import {
  useGetMyAlumniProfileQuery,
  useUpdateMyAlumniProfileMutation,
  useUploadAlumniAvatarMutation,
  useUploadAlumniResumeMutation,
} from "../../../store/api/alumniProfileApi";

export default function AlumniEditProfile() {
  const { data: profile, isLoading: loading, error: queryError } = useGetMyAlumniProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateMyAlumniProfileMutation();
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAlumniAvatarMutation();
  const [uploadResume, { isLoading: uploadingResume }] = useUploadAlumniResumeMutation();

  return (
    <ProfileEditPage
      profile={profile}
      loading={loading}
      queryError={queryError}
      saving={saving}
      uploadingAvatar={uploadingAvatar}
      uploadingResume={uploadingResume}
      updateProfile={updateProfile}
      uploadAvatar={uploadAvatar}
      uploadResume={uploadResume}
      profilePath="/dashboard/alumni/profile"
    />
  );
}
