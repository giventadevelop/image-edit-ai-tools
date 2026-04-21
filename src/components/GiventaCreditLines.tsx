/** Shared “Powered by Giventa” block — keep copy in sync site-wide. */
const LINK_RB_DARK =
  'text-[#ababab] underline-offset-2 transition-colors duration-200 hover:text-gray-200 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]';

const LINK_FOOTER_GRAY =
  'text-gray-400 underline-offset-2 transition-colors duration-200 hover:text-gray-200 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900';

const LINK_FC_UNITED =
  'font-medium text-[#848992] underline-offset-2 transition-colors hover:text-white hover:underline';

const VARIANT_LINK: Record<'rbDark' | 'footerGray' | 'fcUnited', string> = {
  rbDark: LINK_RB_DARK,
  footerGray: LINK_FOOTER_GRAY,
  fcUnited: LINK_FC_UNITED,
};

export type GiventaCreditVariant = keyof typeof VARIANT_LINK;

type Props = {
  variant?: GiventaCreditVariant;
  className?: string;
};

/**
 * Three lines: “Powered and designed by…”, site URL, sales email.
 * Parent supplies layout (e.g. border-t, padding); this is content only.
 */
export default function GiventaCreditLines({ variant = 'rbDark', className = '' }: Props) {
  const link = VARIANT_LINK[variant];
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <p>
        Powered and designed by{' '}
        <a href="https://www.giventa.com" target="_blank" rel="noopener noreferrer" className={link}>
          Giventa Inc. USA
        </a>
      </p>
      <p>
        <a href="https://www.giventa.com" target="_blank" rel="noopener noreferrer" className={link}>
          www.giventa.com
        </a>
      </p>
      <p>
        <a href="mailto:sales@giventa.com" className={link}>
          sales@giventa.com
        </a>
      </p>
    </div>
  );
}
