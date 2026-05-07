'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';
import {locales, localeNames, defaultLocale, type Locale} from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Validate that the locale is one of our supported locales
  const validLocale = locales.includes(locale as Locale) ? locale as Locale : defaultLocale;

  const handleChange = (newLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <select
      value={validLocale}
      onChange={(e) => handleChange(e.target.value as Locale)}
      className="px-3 py-2 text-sm border border-gold/20 rounded-sm bg-card text-foreground focus:outline-none focus:border-gold/50 cursor-pointer"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
