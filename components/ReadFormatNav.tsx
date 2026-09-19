import {
  FormatComingSoon,
  FormatNav,
} from "@/components/FormatNav";
import {
  READ_FORMAT_FLAGS,
  visibleReadFormats,
  type ActiveReadFormat,
} from "@/lib/read-formats";

type Props = {
  active: ActiveReadFormat;
  onTransitionPending?: (pending: boolean) => void;
};

export function ReadFormatNav({ active, onTransitionPending }: Props) {
  return (
    <FormatNav
      ariaLabel="Read formats"
      navKey="read"
      active={active}
      formats={visibleReadFormats()}
      onTransitionPending={onTransitionPending}
      preview={READ_FORMAT_FLAGS.booksPreview ? <FormatComingSoon label="Books" /> : null}
    />
  );
}
