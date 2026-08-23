import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
import { getImageUrl } from "../utils/getImageUrl";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import { UI_LIMITS } from "../consts/appConstants";
import {
  useGetStoryCategoriesQuery,
  useLazyGetSuccessStoriesQuery,
} from "../store/api/publicApi";



const initialsOf = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, UI_LIMITS.SUCCESS_STORIES_HERO_COUNT)
    .toUpperCase();

const shortYear = (year) => (year ? `'${String(year).slice(-2)}` : "");

export default function SuccessStoriesPage() {
  const { data: categoryData } = useGetStoryCategoriesQuery();
  const [fetchStories] = useLazyGetSuccessStoriesQuery();
  const categories = ["All Categories", ...(categoryData?.categories || [])];
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadedQuery, setLoadedQuery] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const queryKey = `${activeCategory}\u0000${search}`;
  const loading = loadedQuery !== queryKey;

 
  useEffect(() => {
    const t = setTimeout(
      () => setSearch(searchInput.trim()),
      UI_LIMITS.SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(t);
  }, [searchInput]);

  
  useEffect(() => {
    let cancelled = false;
    const requestedQuery = queryKey;

    fetchStories({
      category: activeCategory,
      search,
      page: 1,
      limit: UI_LIMITS.SUCCESS_STORIES_PAGE_SIZE,
    })
      .unwrap()
      .then((data) => {
        if (cancelled) return;
        setStories(data.results || []);
        setPage(1);
        setTotalPages(data.totalPages || 1);
        setLoadedQuery(requestedQuery);
      })
      .catch(() => {
        if (!cancelled) {
          setStories([]);
          setPage(1);
          setTotalPages(1);
          setLoadedQuery(requestedQuery);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, fetchStories, search, queryKey]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    fetchStories({
      category: activeCategory,
      search,
      page: nextPage,
      limit: UI_LIMITS.SUCCESS_STORIES_PAGE_SIZE,
    })
      .unwrap()
      .then((data) => {
        setStories((prev) => [...prev, ...(data.results || [])]);
        setPage(nextPage);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const [hero, secondary, ...rest] = stories;

  return (
    <section className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
     
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl font-bold text-dark mb-3">Success Stories</h1>
          <p className="text-gray-500">
            Discover the inspiring journeys of our alumni and see how they are
            shaping the world.
          </p>
        </div>

       
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search stories, names, or industries..."
              className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-4 py-2.5 text-sm text-dark placeholder:text-gray-400 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`text-sm font-medium px-4 py-2.5 rounded-full border whitespace-nowrap transition-colors ${
                  activeCategory === c
                    ? "bg-dark text-white border-dark"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading success stories..." />
        ) : stories.length === 0 ? (
          <EmptyState message="No success stories match your search yet." />
        ) : (
          <>
            
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <HeroCard story={hero} />
              {secondary && <StoryCard story={secondary} />}
            </div>

           
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((s) => (
                  <StoryCard key={s._id} story={s} />
                ))}
              </div>
            )}

            
            {page < totalPages && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-dark border border-gray-200 bg-white rounded-full px-5 py-2.5 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load More Stories"}
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function HeroCard({ story }) {
  if (!story) return null;
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row">
      <img
        src={getImageUrl(story.image)}
        alt={story.authorName}
        className="w-full sm:w-2/5 h-56 sm:h-auto object-cover"
      />
      <div className="flex-1 p-6 sm:p-8 flex flex-col">
        <span className="self-start text-xs font-medium text-gray-500 bg-gray-100 rounded-md px-2.5 py-1 mb-4">
          Class of {shortYear(story.graduationYear)}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-dark mb-3 leading-snug">
          {story.title}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{story.description}</p>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
          <div>
            <p className="text-sm font-semibold text-dark">{story.authorName}</p>
            <p className="text-xs text-gray-400">{story.authorRole}</p>
          </div>
          <span className="h-9 w-9 shrink-0 rounded-full bg-primary text-white flex items-center justify-center">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </div>
  );
}

function StoryCard({ story }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col">
      <div className="relative">
        <img src={getImageUrl(story.image)} alt={story.title} className="w-full h-48 object-cover" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex gap-2 mb-3">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-md px-2.5 py-1">
            {story.category}
          </span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-md px-2.5 py-1">
            {shortYear(story.graduationYear)}
          </span>
        </div>
        <h3 className="font-semibold text-dark text-lg mb-2 leading-snug">{story.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{story.description}</p>
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-50 text-primary text-xs font-semibold flex items-center justify-center">
              {initialsOf(story.authorName)}
            </div>
            <div>
              <p className="text-sm font-medium text-dark">{story.authorName}</p>
              <p className="text-xs text-gray-400">{story.authorRole}</p>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
