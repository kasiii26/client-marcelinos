import { useState } from "react";
import { z } from "zod";
// Adjust these imports to match your project structure!
import { FormWrapper } from "@/components/forms/FormWrapper";
import { useApiMutation } from "@/lib/api/mutations/useApiMutation";

interface Props {
  bookingRef: string | undefined;
  onClose: () => void;
}

const rescheduleSchema = z.object({
  days: z.coerce.number().min(1, "Invalid number of days"),
  check_in: z.coerce.date({ error: "Select check-in date" }),
  check_out: z.coerce.date().optional(),
});

// Helper to format dates to "YYYY-MM-DD" safely without timezone shifting
const formatToYYYYMMDD = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function RescheduleModal({ bookingRef, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);

  // 1. Use YOUR custom API hook instead of standard fetch
  // Note: change "post" to "patch" or "put" if your backend requires it
  const rescheduleMutation = useApiMutation<any>("post", {
    onError: (err: any) => {
      // Safely extract backend error message
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reschedule booking. Please try again.",
      );
    },
  });

  const fields = [
    {
      name: "days",
      type: "counter" as const,
      label: "Number of Day(s)",
      value: 1,
    },
    {
      name: "check_in",
      type: "calendar" as const,
      label: "Check-in Date",
      placeholder: "Select check-in date",
      value: "",
    },
    {
      name: "check_out",
      type: "date" as const,
      label: "Check-out Date",
      readOnly: true,
      className: "cursor-not-allowed text-center",
      value: "",
    },
  ];

  const handleSubmit = async (values: z.infer<typeof rescheduleSchema>) => {
    if (!bookingRef) return;
    setError(null);

    try {
      // 2. Calculate dates safely
      const checkInDate = new Date(values.check_in);

      // If FormWrapper didn't pass check_out, calculate it manually as a fallback
      const checkOutDate = values.check_out
        ? new Date(values.check_out)
        : new Date(checkInDate.getTime() + values.days * 24 * 60 * 60 * 1000);

      // Format correctly for the backend
      const checkInStr = formatToYYYYMMDD(checkInDate);
      const checkOutStr = formatToYYYYMMDD(checkOutDate);

      // 3. Trigger the mutation
      await rescheduleMutation.mutateAsync({
        url: `/booking/${bookingRef}/reschedule`,
        body: {
          check_in: checkInStr,
          check_out: checkOutStr,
        },
      });           

      // Reload on success
      window.location.reload();
    } catch (err) {
      console.error("Reschedule error:", err);
      // The error state is handled automatically by the onError callback in useApiMutation
    }
  };

  return (
    <div className="flex flex-col h-full w-full min-w-[300px]">
      <div className="text-lg font-bold mb-2">Reschedule Booking</div>
      <p className="text-xs opacity-80 mb-4">
        Select your new check-in date and the number of days you wish to stay.
      </p>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 text-xs p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="flex-1">
        <FormWrapper
          schema={rescheduleSchema}
          fields={fields}
          onSubmit={handleSubmit}
          submitLabel={
            rescheduleMutation.isPending
              ? "Rescheduling..."
              : "Confirm Reschedule"
          }
          className="space-y-4 flex flex-col items-center justify-center w-full"
          onChangeFields={(values) => {
            if (values.days && values.check_in) {
              const checkInDate = new Date(values.check_in);
              const checkOutDate = new Date(
                checkInDate.getTime() + values.days * 24 * 60 * 60 * 1000,
              );
              return { check_out: checkOutDate };
            }
            return {};
          }}
        />
      </div>

      <button
        onClick={onClose}
        disabled={rescheduleMutation.isPending}
        className="mt-4 w-full px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition disabled:opacity-50 text-sm"
      >
        Cancel
      </button>
    </div>
  );
}
