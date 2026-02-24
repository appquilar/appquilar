import { useUnreadRentMessagesTotal } from "@/application/hooks/useRentalMessages";

const UnreadMessagesBadge = () => {
  const { totalUnread } = useUnreadRentMessagesTotal();
  const hasUnread = totalUnread > 0;

  return (
    <span
      className={
        hasUnread
          ? "bg-[#F19D70]/20 text-[#C86A35] text-xs font-medium px-2 py-0.5 rounded-md"
          : "bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-md"
      }
    >
      {totalUnread}
    </span>
  );
};

export default UnreadMessagesBadge;
