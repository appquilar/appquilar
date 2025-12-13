import {useEffect, useRef} from "react";
import {Bold, Italic, Link2, List, ListOrdered, Redo, Undo} from "lucide-react";
import {Button} from "@/components/ui/button";

type Props = {
    value: string;
    onChange: (html: string) => void;
    disabled?: boolean;
};

function exec(command: string, value?: string) {
    // @deprecated pero soportado ampliamente
    document.execCommand(command, false, value);
}

export default function RichTextEditor({ value, onChange, disabled }: Props) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        if (ref.current.innerHTML !== value) {
            ref.current.innerHTML = value || "";
        }
    }, [value]);

    const handleInput = () => {
        if (!ref.current) return;
        onChange(ref.current.innerHTML);
    };

    const askLink = () => {
        const url = window.prompt("URL del enlace:");
        if (!url) return;
        exec("createLink", url);
        handleInput();
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 border rounded-md p-2 bg-background">
                <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => { exec("undo"); handleInput(); }}>
                    <Undo className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => { exec("redo"); handleInput(); }}>
                    <Redo className="h-4 w-4" />
                </Button>

                <div className="w-px bg-border mx-1" />

                <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => { exec("bold"); handleInput(); }}>
                    <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => { exec("italic"); handleInput(); }}>
                    <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => { exec("insertUnorderedList"); handleInput(); }}>
                    <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => { exec("insertOrderedList"); handleInput(); }}>
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={askLink}>
                    <Link2 className="h-4 w-4" />
                </Button>
            </div>

            <div
                ref={ref}
                contentEditable={!disabled}
                onInput={handleInput}
                className="min-h-[160px] w-full rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ whiteSpace: "pre-wrap" }}
            />
            <p className="text-xs text-muted-foreground">
                Formato guardado como HTML (negrita, cursiva, listas, enlaces).
            </p>
        </div>
    );
}
