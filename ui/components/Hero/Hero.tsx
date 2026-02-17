/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HERO COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Full-bleed hero section with flame-glass image container.
 * Features the Floyd_the_Phish.png as the hero image with aggressive glow.
 * 
 * @example
 * ```tsx
 * <Hero
 *   imageSrc="/Floyd_the_Phish.png"
 *   title="OPENCLAW"
 *   subtitle="Gateway Dashboard"
 *   animated
 * />
 * ```
 */

import React from 'react';
import styles from './Hero.module.css';

/* ═══════════════════════════════════════════════════════════════════════════
 * TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

export type HeroSize = 'compact' | 'default' | 'large';
export type HeroImageSize = 'small' | 'default' | 'large';

export interface HeroButton {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export interface HeroProps {
  /** Image source URL */
  imageSrc: string;
  
  /** Alt text for image */
  imageAlt?: string;
  
  /** Hero title */
  title?: string;
  
  /** Title with accent gradient (rendered inside title) */
  titleAccent?: string;
  
  /** Subtitle description */
  subtitle?: string;
  
  /** Badge text (shown above title) */
  badge?: string;
  
  /** Size variant */
  size?: HeroSize;
  
  /** Image size variant */
  imageSize?: HeroImageSize;
  
  /** Enable flame animation */
  animated?: boolean;
  
  /** CTA buttons */
  buttons?: HeroButton[];
  
  /** Additional CSS class names */
  className?: string;
  
  /** Custom content below subtitle */
  children?: React.ReactNode;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const Hero: React.FC<HeroProps> = ({
  imageSrc,
  imageAlt = 'Hero image',
  title = 'FLOYDCLAW',
  titleAccent,
  subtitle = 'Gateway Dashboard',
  badge,
  size = 'default',
  imageSize = 'default',
  animated = true,
  buttons,
  className = '',
  children,
}) => {
  // Build class lists
  const heroClasses = [
    styles.hero,
    size === 'compact' && styles.heroCompact,
    size === 'large' && styles.heroLarge,
    className,
  ].filter(Boolean).join(' ');

  const imageContainerClasses = [
    styles.heroImageContainer,
    animated && styles.heroImageContainerAnimated,
  ].filter(Boolean).join(' ');

  const imageClasses = [
    styles.heroImage,
    imageSize === 'small' && styles.heroImageSmall,
    imageSize === 'large' && styles.heroImageLarge,
  ].filter(Boolean).join(' ');

  return (
    <section className={heroClasses}>
      {/* Ambient Glow Background */}
      <div className={styles.heroAmbient} aria-hidden="true" />

      {/* Image with Flame Border */}
      <div className={styles.heroImageWrapper}>
        <div className={imageContainerClasses}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className={imageClasses}
          />
        </div>
      </div>

      {/* Content */}
      <div className={styles.heroContent}>
        {/* Badge */}
        {badge && (
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeIcon} aria-hidden="true" />
            {badge}
          </div>
        )}

        {/* Title */}
        <h1 className={styles.heroTitle}>
          {title}
          {titleAccent && (
            <>
              {' '}
              <span className={styles.heroTitleAccent}>{titleAccent}</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className={styles.heroSubtitle}>
            {subtitle}
          </p>
        )}

        {/* Buttons */}
        {buttons && buttons.length > 0 && (
          <div className={styles.heroActions}>
            {buttons.map((button, index) => {
              const buttonClasses = [
                styles.heroButton,
                button.variant === 'primary' && styles.heroButtonPrimary,
                button.variant === 'secondary' && styles.heroButtonSecondary,
              ].filter(Boolean).join(' ');

              if (button.href) {
                return (
                  <a
                    key={index}
                    href={button.href}
                    className={buttonClasses}
                  >
                    {button.icon}
                    {button.label}
                  </a>
                );
              }

              return (
                <button
                  key={index}
                  type="button"
                  className={buttonClasses}
                  onClick={button.onClick}
                >
                  {button.icon}
                  {button.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Custom children */}
        {children}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

Hero.displayName = 'Hero';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default Hero;
