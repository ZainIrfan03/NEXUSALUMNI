import ProfileEditPage from "../../../components/common/ProfileEditPage";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadAvatarMutation,
  useUploadResumeMutation,
} from "../../../store/api/studentProfileApi";
import { ROUTES } from "../../../consts/appConstants";

export default function EditProfile() {
  const { data: profile, isLoading: loading, error: queryError } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateMyProfileMutation();
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAvatarMutation();
  const [uploadResume, { isLoading: uploadingResume }] = useUploadResumeMutation();

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
      profilePath={ROUTES.STUDENT.PROFILE}
      includeResumeInSave
      seedOnce
      clearSuccessOnUpload={false}
    />
  );
}
