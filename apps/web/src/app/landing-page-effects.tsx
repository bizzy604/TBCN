'use client';

import { useEffect } from 'react';

type LandingPageEffectsProps = {
  navClass: string;
  navScrolledClass: string;
  revealClass: string;
  visibleClass: string;
};

export default function LandingPageEffects({
  navClass,
  navScrolledClass,
  revealClass,
  visibleClass,
}: LandingPageEffectsProps) {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(`.${navClass}`);
    const reveals = Array.from(document.querySelectorAll<HTMLElement>(`.${revealClass}`));

    const onScroll = () => {
      if (!nav) {
        return;
      }

      if (window.scrollY > 60) {
        nav.classList.add(navScrolledClass);
      } else {
        nav.classList.remove(navScrolledClass);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(visibleClass);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    reveals.forEach((element) => observer.observe(element));

    const ctaButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-href]'));
    const clickListeners = ctaButtons.map((button) => {
      const href = button.getAttribute('data-href');
      const listener = () => {
        if (href) {
          window.location.assign(href);
        }
      };

      button.addEventListener('click', listener);
      return { button, listener };
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      clickListeners.forEach(({ button, listener }) => button.removeEventListener('click', listener));
    };
  }, [navClass, navScrolledClass, revealClass, visibleClass]);

  return null;
}
