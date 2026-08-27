import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl as fileUrl } from "../../utils/getImageUrl";
import LoadingSpinner from "../common/LoadingSpinner";
import EmptyState from "../common/EmptyState";
import { UI_LIMITS } from "../../consts/appConstants";
import { useGetFeaturedAlumniQuery } from "../../store/api/publicApi";

export default function FeaturedAlumni() {
  const { data, isLoading } = useGetFeaturedAlumniQuery(
    UI_LIMITS.FEATURED_ALUMNI,
  );
  const alumni = (data?.results || []).map((a) => ({
    id: a._id,
    name: a.user?.fullName || "Alumni Member",
    role: a.jobTitle,
    company: a.company,
    img: fileUrl(a.avatarUrl),
  }));

  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-3">
              Featured Alumni
            </h2>
            <p className="text-gray-500">
              Meet leaders shaping the future across industries.
            </p>
          </div>
          <Link
            to="#"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            View All Alumni <ArrowRight size={15} />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading featured alumni..." />
        ) : alumni.length === 0 ? (
          <EmptyState message="No featured alumni to show yet." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {alumni.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center"
              >
                {a.img ? (
                  <img
                    src={a.img}
                    alt={a.name}
                    className="h-20 w-20 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-semibold mb-4">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="font-semibold text-dark">{a.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">
                  {a.role}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 mb-5">{a.company}</p>
                <button className="w-full border border-gray-200 text-dark text-sm font-medium py-2 rounded-full hover:border-primary hover:text-primary transition-colors">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
