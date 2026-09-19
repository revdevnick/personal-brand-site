import {
  FormatComingSoon,
  FormatNav,
} from "@/components/FormatNav";
import {
  LISTEN_FORMAT_FLAGS,
  visibleListenFormats,
  type ActiveListenFormat,
} from "@/lib/listen-formats";

type Props = {
  active: ActiveListenFormat;
  onTransitionPending?: (pending: boolean) => void;
};

export function ListenFormatNav({ active, onTransitionPending }: Props) {
  return (
    <FormatNav
      ariaLabel="Listen formats"
      navKey="listen"
      active={active}
      formats={visibleListenFormats()}
      onTransitionPending={onTransitionPending}
      preview={
        LISTEN_FORMAT_FLAGS.podcastsPreview ? <FormatComingSoon label="Podcasts" /> : null
      }
    />
  );
}
