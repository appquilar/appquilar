import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { useUnreadRentMessagesTotal } from "@/application/hooks/useRentalMessages";

interface PublicSessionMessagesLinkProps {
  mobile?: boolean;
  onNavigate?: () => void;
  unreadCount?: number;
}

const PublicSessionMessagesLink = ({
  mobile = false,
  onNavigate,
  unreadCount,
}: PublicSessionMessagesLinkProps) => {
  const { totalUnread: unreadCountFromQuery } = useUnreadRentMessagesTotal({
    enabled: unreadCount === undefined,
  });
  const totalUnread = unreadCount ?? unreadCountFromQuery;
  const hasUnread = totalUnread > 0;

  const badgeClassName = hasUnread
    ? "inline-flex min-w-6 items-center justify-center rounded-md bg-[#F19D70]/20 px-1.5 py-0.5 text-xs font-medium text-[#C86A35]"
    : "inline-flex min-w-6 items-center justify-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500";

  if (mobile) {
    return (
      <Link
        to="/dashboard/messages"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border/80 bg-white text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        aria-label={`Mensajes (${totalUnread} pendientes)`}
        onClick={onNavigate}
      >
        <MessageCircle size={16} />
        Mensajes
        <span className={badgeClassName}>{totalUnread}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/dashboard/messages"
      className="flex items-center justify-between gap-2 rounded-md p-2 text-sm hover:bg-secondary"
      aria-label={`Mensajes (${totalUnread} pendientes)`}
      onClick={onNavigate}
    >
      <span className="flex items-center gap-2">
        <MessageCircle size={16} />
        Mensajes
      </span>
      <span className={badgeClassName}>{totalUnread}</span>
    </Link>
  );
};

export default PublicSessionMessagesLink;
