import { useMemo } from "react";
import { useApiQuery } from "@/lib/api/queries/useApiQuery";
import EventVenueSkeleton from "@/components/skeleton/EventVenueSkeleton";
import CardItem from "@/components/cards/CardItem";

interface ApiListResponse<T> {
  success?: boolean;
  data?: T[];
}

interface VenueItem {
  id: number;
  name?: string;
  description?: string;
  capacity?: number;
  price?: number;
  featured_image?: string | null;
  gallery?: string[];
}

function extractList<T>(response: { data?: T[] } | T[] | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

function EventVenues() {
  const {
    data: venuesResponse,
    isLoading,
    error,
  } = useApiQuery<ApiListResponse<VenueItem>>(
    ["venues", "home"],
    "/venues?is_all=1",
  );

  const venueList = useMemo(
    () => extractList(venuesResponse),
    [venuesResponse],
  );

  return (
    <section id="venues" className="w-full py-16 bg-gray-50">
      <h2 className="text-4xl font-bold text-center mb-10">
        <span className="text-green-900">EVENT </span>
        <span className="text-yellow-500">VENUES</span>
      </h2>

      {error && (
        <p className="text-red-500 text-center mb-6">
          Error loading venues.
        </p>
      )}

      {isLoading ? (
        <EventVenueSkeleton />
      ) : venueList.length === 0 ? (
        <p className="text-center text-gray-500">
          No venues available.
        </p>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
          {venueList.map((venue) => (
            <CardItem
              key={venue.id}
              id={venue.id}
              name={venue.name}
              description={venue.description}
              capacity={venue.capacity}
              price={venue.price}
              featured_image={venue.featured_image}
              gallery={venue.gallery}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default EventVenues;
