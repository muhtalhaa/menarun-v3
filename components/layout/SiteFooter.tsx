const MENARUN_ASPECT_RATIO = 1575 / 999;
const MKAI_RUNNERS_ASPECT_RATIO = 600 / 242;

export function SiteFooter() {
  const menaRunHeight = 32;
  const menaRunWidth = Math.round(menaRunHeight * MENARUN_ASPECT_RATIO);
  const mkaiRunnersHeight = 28;
  const mkaiRunnersWidth = Math.round(mkaiRunnersHeight * MKAI_RUNNERS_ASPECT_RATIO);

  return (
    <footer className="border-t-2 border-tosca-muted/50 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="menaRun"
            width={menaRunWidth}
            height={menaRunHeight}
            data-pixel="true"
            className="pixel-render block max-w-none"
            style={{ height: `${menaRunHeight}px`, width: `${menaRunWidth}px` }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-mkai-runners.jpeg"
            alt="MKAI Runners"
            width={mkaiRunnersWidth}
            height={mkaiRunnersHeight}
            className="block max-w-none rounded-sm"
            style={{
              height: `${mkaiRunnersHeight}px`,
              width: `${mkaiRunnersWidth}px`,
            }}
          />
        </div>
        <p className="text-center font-sans text-xs leading-relaxed text-text-muted md:text-sm">
          Created by Muawin Sadr IT PPMKAI · Managed by Sehat Jasmani PPMKAI
        </p>
      </div>
    </footer>
  );
}
