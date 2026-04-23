interface SafeHtmlProps {
    html?: string | null;
    className?: string;
}

const SafeHtml = ({ html, className }: SafeHtmlProps) => {
    const trimmedHtml = (html ?? "").trim();
    if (!trimmedHtml) {
        return null;
    }

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: trimmedHtml }}
        />
    );
};

export default SafeHtml;
