import * as React from "react";
import { Bold, Italic, List, ListOrdered, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    value: string;
    onChange: (html: string) => void;
    disabled?: boolean;
};

const CategoryDescriptionEditor: React.FC<Props> = ({ value, onChange, disabled }) => {
    const ref = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!ref.current) return;
        if (ref.current.innerHTML !== value) {
            ref.current.innerHTML = value || "";
        }
    }, [value]);

    const exec = (cmd: string, arg?: string) => {
        if (disabled) return;
        document.execCommand(cmd, false, arg);
        if (ref.current) onChange(ref.current.innerHTML);
    };

    const onInput = () => {
        if (!ref.current) return;
        onChange(ref.current.innerHTML);
    };

    const setLink = () => {
        if (disabled) return;
        const url = prompt("URL del enlace:");
        if (!url) return;
        exec("createLink", url);
    };

    return (
        <div className={cn("rounded-md border", disabled && "opacity-70")}>
            <div className="flex flex-wrap gap-1 border-b p-2 bg-muted/20">
                <Button type="button" size="sm" variant="ghost" onClick={() => exec("bold")} disabled={disabled}>
                    <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => exec("italic")} disabled={disabled}>
                    <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => exec("insertUnorderedList")} disabled={disabled}>
                    <List className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => exec("insertOrderedList")} disabled={disabled}>
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={setLink} disabled={disabled}>
                    <Link2 className="h-4 w-4" />
                </Button>
            </div>

            <div
                ref={ref}
                contentEditable={!disabled}
                onInput={onInput}
                className={cn(
                    "min-h-[180px] p-3 outline-none prose prose-sm max-w-none dark:prose-invert",
                    "[&_*]:max-w-none"
                )}
                spellCheck
            />
        </div>
    );
};

export default CategoryDescriptionEditor;
