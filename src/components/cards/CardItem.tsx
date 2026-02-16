import { useState } from "react";
import { pricingFormat } from "@/lib/formatters/pricingFormat";
import { X } from "lucide-react";

interface CardItemProps {
  id: number;
  type?: string;
  name?: string;
  capacity?: number;
  price?: number;
  description?: string;
  amenities?: unknown[];
  featured_image?: string | null;
  gallery?: string[];
  images?: string[];
}

function amenityNames(amenities: unknown[] | undefined): string {
  if (!Array.isArray(amenities) || amenities.length === 0) return "—";
  return (
    amenities
      .map((a: unknown) =>
        typeof a === "string" ? a : (a as { name?: string })?.name
      )
      .filter(Boolean)
      .join(", ") || "—"
  );
}

function CardItem(props: CardItemProps) {
  const {
    type,
    name,
    capacity,
    price,
    description,
    amenities,
    featured_image,
    gallery = [],
    images: imagesProp,
  } = props;

  const [showMore, setShowMore] = useState(false);

  const images =
    imagesProp ??
    [featured_image, ...(Array.isArray(gallery) ? gallery : [])].filter(
      (url): url is string => Boolean(url)
    );

  const mainImage = images[0];
  const title = type ?? name ?? "Room";
  const subtitle = description ?? amenityNames(amenities);

  const truncatedLength = 120;
  const isLongText = subtitle && subtitle.length > truncatedLength;

  return (
    <div className="relative max-w-sm mx-auto h-[420px] flex flex-col bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg duration-300">

      {/* IMAGE */}
      <div className="w-full h-60 bg-gray-100 overflow-hidden">
        <img
          src={mainImage ?? "/placeholder-room.jpg"}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* NORMAL CARD CONTENT */}
      <div
        className={`p-4 flex flex-col flex-1 transition-opacity duration-300 ${
          showMore ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <h2 className="text-xl font-semibold mb-2 text-gray-900">{title}</h2>

        {capacity != null && (
          <p className="text-gray-600 text-sm mb-1">Capacity: {capacity}</p>
        )}

        <p className="text-gray-600 text-sm mb-2">
          {isLongText ? (
            <>
              {subtitle.slice(0, truncatedLength)}...
              <button
                onClick={() => setShowMore(true)}
                className="ml-1 text-[#0D542B] text-sm font-semibold hover:text-[#F0B100] transition-colors duration-200"
              >
                See more
              </button>
            </>
          ) : (
            subtitle
          )}
        </p>

        {price != null && (
          <p className="text-green-800 font-semibold mt-auto">
            {pricingFormat(String(price))}
          </p>
        )}
      </div>

      {/* DARK SLIDE-UP OVERLAY */}
      <div
        className={`absolute inset-0 bg-[#0D542B]/90 flex flex-col transition-all duration-500 ease-in-out ${
          showMore
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Close Button with Yellow Hover */}
        <button
          onClick={() => setShowMore(false)}
          className="absolute top-3 right-3 text-white p-2 rounded-full hover:text-[#F0B100] hover:bg-white/10 hover:scale-110 transition-all duration-200"
        >
          <X size={20} />
        </button>

        {/* Scrollable Content */}
        <div className="p-6 pt-10 text-white flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          <h2 className="text-xl font-bold">{title}</h2>

          {capacity != null && (
            <p className="text-sm">Capacity: {capacity}</p>
          )}

          <p className="text-sm leading-relaxed">{subtitle}</p>

          {price != null && (
            <p className="font-semibold">{pricingFormat(String(price))}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardItem;
