import { useGetMyAlumniProfileQuery } from "../store/api/alumniProfileApi";
import { useGetMyProfileQuery } from "../store/api/studentProfileApi";
import { ROLES } from "../consts/appConstants";

export default function useDashboardProfile(user) {
  const { data: studentProfile } = useGetMyProfileQuery(undefined, {
    skip: user?.role !== ROLES.STUDENT,
  });
  const { data: alumniProfile } = useGetMyAlumniProfileQuery(undefined, {
    skip: user?.role !== ROLES.ALUMNI,
  });

  const activeProfile = user?.role === ROLES.STUDENT ? studentProfile : alumniProfile;

  return {
    displayName: activeProfile?.user?.fullName || user?.fullName,
    avatarUrl: activeProfile?.avatarUrl || "",
  };
}
