(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const heroImage = document.querySelector('.hero-visual > img');
  let frame = 0;
  function updateScroll() {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (heroImage) {
      const rect = heroImage.parentElement.getBoundingClientRect();
      heroImage.style.translate = !preference.matches && rect.bottom > 0 && rect.top < innerHeight
        ? `0 ${Math.max(-14, Math.min(14, (innerHeight / 2 - rect.top - rect.height / 2) * .035))}px` : 'none';
    }
  }
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateScroll); }, { passive:true });
  addEventListener('resize', updateScroll, { passive:true });
  updateScroll();
  let observer;
  const targets = [...document.querySelectorAll('.section-top, .art, .section-end, .about-photo, .about > div:last-child, .practice > div:first-child, .practice-list article, .contact > .eyebrow, .contact-top, .contact-bottom')];
  if (!preference.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold:.08 });
    targets.forEach((el,i) => {
      el.style.setProperty('--reveal-delay', `${el.classList.contains('art') ? (i % 2) * .09 : 0}s`);
      el.classList.add('reveal-pending');
      observer.observe(el);
    });
  }
  function animate(el, keyframes, options) {
    if (preference.matches || !el.animate) return;
    el.getAnimations().forEach(a => a.cancel());
    el.animate(keyframes, options);
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.art:not([hidden])').forEach((card,i) => {
      observer?.unobserve(card);
      card.classList.remove('reveal-pending');
      animate(card, [{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}], {duration:450,delay:i*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
    });
    requestAnimationFrame(updateScroll);
  }));
  const artDialog = document.querySelector('#art-dialog');
  artDialog.querySelectorAll('#previous, #next').forEach(button => button.addEventListener('click', () => {
    animate(artDialog.querySelector('img'),[{opacity:.3,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}],{duration:400,easing:'ease-out'});
  }));
  preference.addEventListener('change', () => {
    if (preference.matches) {
      observer?.disconnect();
      targets.forEach(el => { el.classList.remove('reveal-pending');el.getAnimations().forEach(a=>a.cancel()); });
    }
    updateScroll();
  });
})();
