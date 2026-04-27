type Props = {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder: string;
  helpText?: string;
  emptyText: string;
  previewAlt: string;
};

export function AdminImageUrlField({
  label,
  name,
  defaultValue,
  placeholder,
  helpText,
  emptyText,
  previewAlt,
}: Props) {
  const value = defaultValue?.trim() ?? "";

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      {helpText ? <span className="text-muted text-xs">{helpText}</span> : null}
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
        <div className="flex flex-col gap-2">
          <input
            type="file"
            name="imageFile"
            accept="image/*"
            className="border-border bg-background rounded-md border px-3 py-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          <input type="hidden" name={name} value={value} />
        </div>
        <div className="border-border bg-muted/30 flex min-h-28 items-center justify-center overflow-hidden rounded-lg border">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={previewAlt} className="h-40 w-full object-contain bg-muted/20" />
          ) : (
            <span className="text-muted px-3 py-8 text-center text-xs">{emptyText}</span>
          )}
        </div>
      </div>
    </label>
  );
}
