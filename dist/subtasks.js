// ToolHang subtask timeline: chips light up as the rollout passes each completion time.
(() => {
 const demo = document.querySelector('#subtask-demo');
 if (!demo) return;
 const video = demo.querySelector('video');
 const chips = [...demo.querySelectorAll('.subtask-chips li')];
 const fill = demo.querySelector('.subtask-fill');
 const playBtn = demo.querySelector('#subtask-play');
 const speed = demo.querySelector('#subtask-speed');
 const times = chips.map(li => Number(li.dataset.t));
 const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
 let userPaused = reduceMotion, restartTimer = null, raf = null;

 const rate = () => Number(speed.value);
 const update = () => {
  const t = video.currentTime, d = video.duration || times.at(-1);
  fill.style.width = Math.min(100, t / d * 100) + '%';
  const next = times.findIndex(x => t < x);
  chips.forEach((li, i) => {
   const done = t >= times[i];
   li.classList.toggle('done', done);
   li.classList.toggle('active', i === next);
   li.querySelector('.subtask-status').textContent = done ? 'complete' : i === next ? 'in progress' : 'pending';
  });
 };
 const loop = () => { update(); raf = video.paused ? null : requestAnimationFrame(loop); };
 const play = () => { video.playbackRate = rate(); video.play().catch(() => {}); };

 // Place tick marks for each completion time on the track.
 const placeTicks = () => {
  const track = demo.querySelector('.subtask-track');
  track.querySelectorAll('.subtask-tick').forEach(n => n.remove());
  times.forEach(x => {
   const tick = document.createElement('span');
   tick.className = 'subtask-tick';
   tick.style.left = (x / video.duration * 100) + '%';
   track.append(tick);
  });
 };

 video.addEventListener('loadedmetadata', () => { placeTicks(); update(); });
 if (video.readyState >= 1) placeTicks();
 video.addEventListener('play', () => { playBtn.textContent = 'Pause'; if (!raf) raf = requestAnimationFrame(loop); });
 video.addEventListener('pause', () => { playBtn.textContent = 'Play'; update(); });
 video.addEventListener('seeked', update);
 video.addEventListener('ended', () => {
  update();
  restartTimer = setTimeout(() => { if (!userPaused) { video.currentTime = 0; play(); } }, 1500);
 });

 playBtn.addEventListener('click', () => {
  clearTimeout(restartTimer);
  if (video.paused) { userPaused = false; if (video.ended) video.currentTime = 0; play(); }
  else { userPaused = true; video.pause(); }
 });
 speed.addEventListener('change', () => { video.playbackRate = rate(); });
 chips.forEach((li, i) => li.querySelector('button').addEventListener('click', () => {
  clearTimeout(restartTimer);
  // Jump to just before this subtask completes so its chip lights up on screen.
  video.currentTime = Math.max(0, times[i] - 0.15);
  userPaused = false; play();
 }));

 // Play only while visible.
 new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting && !userPaused) play();
  else if (!e.isIntersecting) video.pause();
 }), {threshold: 0.4}).observe(demo);
 if (reduceMotion) playBtn.textContent = 'Play';
 update();
})();

// Color every mention of "VaDar" in body text.
(() => {
 const root = document.querySelector('main');
 const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
 const nodes = [];
 while (walker.nextNode()) {
  const n = walker.currentNode;
  if (n.textContent.includes('VaDar') && !n.parentElement.closest('h1,pre,svg,script,style,button,select,.vadar,.katex')) nodes.push(n);
 }
 nodes.forEach(n => {
  const f = document.createDocumentFragment();
  n.textContent.split(/(VaDar)/).forEach(part => {
   if (part === 'VaDar') { const s = document.createElement('span'); s.className = 'vadar'; s.textContent = part; f.append(s); }
   else if (part) f.append(part);
  });
  n.replaceWith(f);
 });
})();
