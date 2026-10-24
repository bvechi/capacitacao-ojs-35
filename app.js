(() => {
  "use strict";
  const data = window.OJS_SLIDES || { units: [], slides: [] };
  const root = document.getElementById("slidesRoot");
  const toc = document.getElementById("toc");
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const tocShortcut = document.getElementById("tocShortcut");
  const counter = document.getElementById("slideCounter");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let presentationIndex = 0;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  const isFormField = (el) => el?.closest?.("input, textarea, select, [contenteditable='true']");
  const isControl = (el) => el?.closest?.("button, a, summary, input, textarea, select");
  const scrollBehavior = () => reduceMotion.matches ? "auto" : "smooth";

  function inline(text) {
    let value = escapeHtml(text);
    value = value.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    value = value.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
    value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    value = value.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    value = value.replace(/`([^`]+)`/g, "<code>$1</code>");
    return value;
  }

  function routineIcon(index) {
    const icons = [
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M3.5 18c.8-3.3 2.7-5 5.5-5s4.7 1.7 5.5 5M18 7v6M15 10h6"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 19c.7-3.6 2.6-5.5 5.5-5.5s4.8 1.9 5.5 5.5M14 14.5c3.5-.7 5.8.8 6.8 4.5"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3.5 2"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4V20H6zM14 3.5V8h4"/><path d="m9 14 2 2 4-4"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h10v17H7z"/><circle cx="12" cy="12" r="3"/><path d="M12 7.5v1.5M12 15v1.5M7.5 12H9M15 12h1.5"/></svg>'
    ];
    return icons[index] || icons[0];
  }

  function conceptIcon(name) {
    const icons = {
      account: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.2-6 7-6s6.2 2 7 6"/></svg>',
      role: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM8 6V4h8v2"/><path d="M4 11h16M10 14h4"/></svg>',
      assignment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v16H7zM9 4.5V3h6v1.5"/><path d="m9.5 13 1.7 1.7 3.8-4"/></svg>',
      individual: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6"/></svg>',
      shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-2.4 7.7-7 10-4.6-2.3-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>',
      review: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5zM8 9h8M8 13h5"/><path d="m15 16 1.5 1.5L20 14"/></svg>',
      author: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19h4l10-10-4-4L5 15zM13 7l4 4"/></svg>',
      copyeditor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4"/><path d="M9 11h6M9 15h6"/></svg>'
      ,search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>'
      ,masthead: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM8 9h8M8 13h5"/><path d="M16 16h2"/></svg>'
      ,profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M3 19c.7-3.5 2.4-5.3 5-5.3 1.2 0 2.2.3 3 .8M14 6h7M14 10h5M14 14h7M14 18h5"/></svg>'
      ,verify: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-2.4 7.7-7 10-4.6-2.3-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>'
      ,institution: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></svg>'
      ,location: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11z"/><circle cx="12" cy="10" r="2"/></svg>'
      ,domain: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 4 5.5 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.5-4-9s1.4-6.5 4-9z"/></svg>'
      ,hierarchy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v5M5 14v-3h14v3M5 14v3M12 11v6M19 14v3"/><circle cx="12" cy="3" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>'
      ,interface: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zM3 9h18M7 7h.1M10 7h.1"/></svg>'
      ,submission: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6M9 16h6"/></svg>'
      ,metadata: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM8 9h8M8 13h5M8 17h8"/></svg>'
      ,library: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h4v16H4zM10 4h4v16h-4z"/><path d="m16 5 3.8-1 3 15.5-3.8 1z"/></svg>'
    };
    return icons[name] || icons.account;
  }

  function renderBlocks(blocks) {
    return blocks.map((block) => {
      if (block.type === "ul") return `<ul>${block.items.map(x => `<li>${inline(x)}</li>`).join("")}</ul>`;
      if (block.type === "feature-list") return `<ul class="feature-list">${block.items.map((x, i) => `<li><span class="feature-icon" aria-hidden="true">${["▦","◎","⌘","✉","◷","✓","✦","#","文","T","@","☷"][i % 12]}</span><span>${inline(x)}</span></li>`).join("")}</ul>`;
      if (block.type === "changes-overview") return `<div class="changes-overview">${block.groups.map((group, i) => `<section class="change-group change-group-${i + 1}"><span class="change-number">0${i + 1}</span><div><h4>${escapeHtml(group.title)}</h4><ul>${group.items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></section>`).join("")}</div>`;
      if (block.type === "ol") return `<ol>${block.items.map(x => `<li>${inline(x)}</li>`).join("")}</ol>`;
      if (block.type === "table") {
        const [head, ...rows] = block.rows;
        return `<table><thead><tr>${head.map(x => `<th>${inline(x)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(x => `<td>${inline(x)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
      }
      if (block.type === "image") return `${block.focus?.length ? `<div class="visual-guide">${block.focus.map((item, i) => `<span><b>${i + 1}</b>${escapeHtml(item)}</span>`).join("")}</div>` : ""}<figure class="ojs-figure crop-${escapeHtml(block.crop || "overview")}"><div class="image-window"><button class="image-zoom-trigger" type="button" aria-label="Ampliar ${escapeHtml(block.caption)} e consultar a tradução"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.caption)}" loading="eager" decoding="async"><span class="image-zoom-hint">Ampliar imagem e consultar a tradução</span></button></div><figcaption><strong>${inline(block.caption)}</strong><span>${inline(block.source)}</span>${renderTranslationTable(block.translations)}</figcaption></figure>`;
      if (block.type === "presenters") return `<div class="presenters" aria-label="Apresentadores">${block.people.map(person => `<article class="presenter"><span class="presenter-photo-frame"><img class="presenter-photo ${escapeHtml(person.className)}" src="${escapeHtml(person.src)}" alt="Retrato de ${escapeHtml(person.name)}"></span><div><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(person.affiliation)}</span><a class="lattes-link" href="${escapeHtml(person.lattes)}" target="_blank" rel="noreferrer" aria-label="Currículo Lattes de ${escapeHtml(person.name)}"><img src="assets/pkp/lattes.svg" alt="" aria-hidden="true"><span>Currículo Lattes</span></a></div></article>`).join("")}</div>`;
      if (block.type === "routine") return `<div class="routine-layout"><div class="routine-count"><span>${escapeHtml(block.lead)}</span><strong>${escapeHtml(block.count)}</strong><em>${escapeHtml(block.countLabel)}</em></div><ul class="routine-status">${block.items.map((item, i) => `<li><span class="routine-icon">${routineIcon(i)}</span><span>${escapeHtml(item)}</span></li>`).join("")}</ul><div class="routine-questions">${block.questions.map(question => `<strong>${escapeHtml(question)}</strong>`).join("")}</div><p class="routine-conclusion">${escapeHtml(block.conclusion)}</p></div>`;
      if (block.type === "filter-questions") return `<ul class="filter-questions">${block.items.map(question => `<li>${escapeHtml(question)}</li>`).join("")}</ul>`;
      if (block.type === "module-overview") return `<div class="module-overview"><div class="module-statement"><p class="module-lead">${inline(block.lead)}</p><p>${inline(block.description)}</p></div><div class="module-roadmap"><p>Nos próximos slides</p>${block.items.map((item, i) => `<article><span>0${i + 1}</span><strong>${escapeHtml(item)}</strong></article>`).join("")}</div></div>`;
      if (block.type === "concept-cards") return `<div class="concept-cards">${block.items.map(item => `<article><span class="concept-icon">${conceptIcon(item.icon)}</span><div><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p></div></article>`).join("")}</div>`;
      if (block.type === "persona-example") return `<div class="persona-example"><article class="persona-account"><span class="concept-icon">${conceptIcon("account")}</span><div><small>Conta</small><h4>${escapeHtml(block.name)}</h4><p>${escapeHtml(block.account)}</p></div></article><div class="persona-branch"><span></span></div><div class="persona-roles"><article><span class="concept-icon">${conceptIcon("author")}</span><div><small>Papel</small><strong>${escapeHtml(block.roles[0])}</strong></div></article><article><span class="concept-icon">${conceptIcon("copyeditor")}</span><div><small>Papel</small><strong>${escapeHtml(block.roles[1])}</strong></div></article></div><article class="persona-assignment"><span class="concept-icon">${conceptIcon("assignment")}</span><div><small>Atribuição</small><strong>${escapeHtml(block.assignment)}</strong></div></article></div>`;
      if (block.type === "tip-grid") return `<div class="tip-layout"><div class="tip-principle"><span class="tip-shield">${conceptIcon("shield")}</span><p class="tip-lead">${escapeHtml(block.lead)}</p></div><div class="tip-rules">${block.items.map(item => `<article><span class="concept-icon">${conceptIcon(item.icon)}</span><p>${escapeHtml(item.text)}</p></article>`).join("")}</div><p class="tip-conclusion">${escapeHtml(block.conclusion)}</p></div>`;
      if (block.type === "masthead-flow") return `<div class="masthead-flow"><div>${block.parts.map((part, i) => `<span>${escapeHtml(part)}</span>${i < block.parts.length - 1 ? '<b>+</b>' : ''}`).join("")}</div><i>↓</i><strong>${escapeHtml(block.result)}</strong></div>`;
      if (block.type === "status-pair") return `<div class="status-pair">${block.items.map(item => `<article class="status-${escapeHtml(item.state)}"><span class="status-dot" aria-hidden="true"></span><div><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p></div></article>`).join("")}</div>`;
      if (block.type === "invitation-privacy") return `<div class="invitation-privacy"><div><p class="invitation-lead">${escapeHtml(block.lead)}</p><p>${escapeHtml(block.text)}</p></div><div class="privacy-panel"><span>${conceptIcon("shield")}</span><p>${escapeHtml(block.privacy)}</p><small>${escapeHtml(block.note)}</small></div></div>`;
      if (block.type === "user-management-change") return `<div class="user-management-change"><div class="management-comparison"><section class="management-before"><span>${escapeHtml(block.before.title)}</span><p>${escapeHtml(block.before.lead)}</p><ul>${block.before.items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section><div class="management-shift" aria-hidden="true"><span>→</span><small><strong>MAIS AUTONOMIA</strong><em>para o próprio usuário</em></small></div><section class="management-after"><span>${escapeHtml(block.after.title)}</span><p>${escapeHtml(block.after.lead)}</p><ul>${block.after.items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section></div><div class="access-route"><strong>${escapeHtml(block.question)}</strong><div>${block.route.map((item, index) => `<span>${escapeHtml(item)}</span>${index < block.route.length - 1 ? '<b>→</b>' : ''}`).join("")}</div></div><p class="management-warning">${inline(block.warning)}</p></div>`;
      if (block.type === "doi-intro") return `<div class="doi-intro"><p class="doi-lead">${escapeHtml(block.lead)}</p><p>${escapeHtml(block.text)}</p></div>`;
      if (block.type === "doi-three-moments") return `<div class="doi-three-moments">${block.items.map((item, index) => `<article><span>${escapeHtml(item.number)}</span><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p></article>${index < block.items.length - 1 ? '<b aria-hidden="true">→</b>' : ''}`).join("")}</div>`;
      if (block.type === "doi-before-publication") return `<div class="doi-before-publication">${block.items.map((item, index) => `<article><small>${escapeHtml(item.label)}</small><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p></article>${index === 0 ? '<b aria-hidden="true">→</b>' : ''}`).join("")}</div>`;
      if (block.type === "doi-source-note") return `<p class="doi-source-note">${escapeHtml(block.text)} <a href="${escapeHtml(block.url)}" target="_blank" rel="noreferrer">Crossref</a></p>`;
      if (block.type === "doi-queue") return `<ul class="doi-queue">${block.items.map((item, index) => `<li><b>0${index + 1}</b><span>${escapeHtml(item)}</span></li>`).join("")}</ul>`;
      if (block.type === "doi-agency-flow") return `<div class="doi-agency"><p>${escapeHtml(block.text)}</p><div>${block.steps.map((item, index) => `<strong>${escapeHtml(item)}</strong>${index < block.steps.length - 1 ? '<b aria-hidden="true">→</b>' : ''}`).join("")}</div></div>`;
      if (block.type === "doi-requirements") return `<div class="doi-requirements">${block.items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
      if (block.type === "doi-settings") return `<div class="doi-settings">${block.items.map((item, index) => `<article><b>0${index + 1}</b><span>${escapeHtml(item)}</span></article>`).join("")}</div>`;
      if (block.type === "doi-metadata") return `<div class="doi-metadata"><p>${escapeHtml(block.lead)}</p><div>${block.items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></div>`;
      if (block.type === "doi-check") return `<div class="doi-check"><strong>${escapeHtml(block.label)}</strong><div>${block.items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div></div>`;
      if (block.type === "doi-verification") return `<ol class="doi-verification">${block.items.map(item => `<li><span>${escapeHtml(item)}</span></li>`).join("")}</ol>`;
      if (block.type === "doi-sequence") { const items = ["Atribuir", "Publicar", "Depositar", "Verificar"]; return `<div class="doi-sequence" aria-label="Sequência de gestão do DOI">${items.map((item, index) => `<span class="${index === block.active ? 'active' : ''}"><b>${index + 1}</b>${item}</span>${index < items.length - 1 ? '<i aria-hidden="true">→</i>' : ''}`).join("")}</div>`; }
      if (block.type === "jats-intro") return `<p class="jats-intro">${escapeHtml(block.text)}</p>`;
      if (block.type === "jats-comparison") return `<div class="jats-comparison"><article class="jats-pdf"><span>PDF</span><div><strong>${escapeHtml(block.pdf[0])}</strong>${block.pdf.slice(1).map(item => `<i>${escapeHtml(item)}</i>`).join("")}</div><p>Aparência da página</p></article><b aria-hidden="true">→</b><article class="jats-xml"><span>JATS XML</span><code>${block.xml.map(item => `<i>${escapeHtml(item)}</i>`).join("")}</code><p>Função de cada elemento</p></article></div>`;
      if (block.type === "jats-tags") return `<div class="jats-tags">${block.items.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
      if (block.type === "jats-responsibilities") return `<div class="jats-responsibilities"><section><span>Fora do OJS</span><ul>${block.outside.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section><section><span>No OJS</span><ul>${block.inside.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section></div>`;
      if (block.type === "jats-flow") return `<div class="jats-flow">${block.items.map((item, index) => `<strong>${escapeHtml(item)}</strong>${index < block.items.length - 1 ? '<b aria-hidden="true">→</b>' : ''}`).join("")}</div>`;
      if (block.type === "jats-destinations") return `<div class="jats-destinations">${block.items.map(item => `<article>${item.logo ? `<img src="${escapeHtml(item.logo)}" alt="${escapeHtml(item.alt || item.name)}">` : ""}<div><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.text)}</p></div></article>`).join("")}</div>`;
      if (block.type === "stats-intro") return `<div class="stats-intro"><div>${block.items.map(item => `<article><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></article>`).join("")}</div><p>${escapeHtml(block.note)}</p></div>`;
      if (block.type === "stats-capabilities") return `<div class="stats-capabilities">${block.items.map((item, index) => `<span><b>0${index + 1}</b>${escapeHtml(item)}</span>`).join("")}</div>`;
      if (block.type === "stats-dual-images") return `<div class="stats-dual-images">${block.items.map(item => `<figure class="ojs-figure"><div class="image-window"><button class="image-zoom-trigger" type="button" aria-label="Ampliar ${escapeHtml(item.caption)} e consultar a tradução"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.caption)}" loading="eager" decoding="async"><span class="image-zoom-hint">Ampliar imagem e consultar a tradução</span></button></div><figcaption><strong>${escapeHtml(item.caption)}</strong><span>${escapeHtml(item.source)}</span>${renderTranslationTable(item.translations)}</figcaption></figure>`).join("")}</div>`;
      if (block.type === "stats-access") return `<div class="stats-access">${block.sides.map((side, index) => `${index ? `<div class="stats-not-equal" aria-label="${escapeHtml(block.divider)}"><b>≠</b><span>${escapeHtml(block.divider)}</span></div>` : ""}<article><h4>${escapeHtml(side.title)}</h4><p>${escapeHtml(side.text)}</p><button class="image-zoom-trigger" type="button" aria-label="Ampliar ${escapeHtml(side.caption)}"><img src="${escapeHtml(side.src)}" alt="${escapeHtml(side.caption)}" loading="eager" decoding="async"><span class="image-zoom-hint">Ampliar imagem</span></button></article>`).join("")}</div>`;
      if (block.type === "stats-monthly") return `<p class="stats-monthly"><strong>Resumo mensal</strong>${escapeHtml(block.text)}</p>`;
      if (block.type === "closing-questions") return `<div class="closing-questions"><div class="question-mark" aria-hidden="true">?</div><div><p class="questions-lead">${escapeHtml(block.lead)}</p><p class="questions-copy">${escapeHtml(block.text)}</p><div class="questions-topics">${block.topics.map(topic => `<span>${escapeHtml(topic)}</span>`).join("")}</div></div></div>`;
      if (block.type === "closing-thanks") return `<div class="closing-thanks"><div class="closing-resources">${block.resources.map(resource => `<a href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer"><span>Recurso recomendado</span><strong>${escapeHtml(resource.name)}</strong><p>${escapeHtml(resource.description)}</p><small>${escapeHtml(resource.domain)}</small></a>`).join("")}</div>${renderSourcesLauncher()}</div>`;
      if (block.type === "invite-steps") return `<div class="invite-steps">${block.items.map((item, i) => `<article><b>0${i + 1}</b><span class="concept-icon">${conceptIcon(item.icon)}</span><p>${escapeHtml(item.text)}${item.orcid ? ' <img class="orcid-inline" src="assets/pkp/orcid-id-icon.svg" alt="ORCID iD">' : ''}</p></article>`).join("")}</div>`;
      if (block.type === "path") return `<div class="settings-path"><span>${escapeHtml(block.label)}</span><div>${block.steps.map((step, i) => `<strong>${escapeHtml(step)}</strong>${i < block.steps.length - 1 ? '<b>›</b>' : ''}`).join("")}</div></div>`;
      if (block.type === "link-list") return `<div class="slide-links"><strong>${escapeHtml(block.title)}</strong><ul>${block.items.map(item => `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.text)}</a></li>`).join("")}</ul></div>`;
      if (block.type === "icon-list") return `<div class="icon-list">${block.items.map(item => `<article><span class="concept-icon">${conceptIcon(item.icon)}</span><div>${item.title ? `<h4>${escapeHtml(item.title)}</h4>` : ''}<p>${escapeHtml(item.text)}</p></div></article>`).join("")}</div>`;
      if (block.type === "example") return `<div class="example-box"><span>Exemplo</span><p>${escapeHtml(block.text)}</p></div>`;
      if (block.type === "locale-urls") return `<div class="locale-urls">${block.items.map(item => `<article><span>${escapeHtml(item.locale)}</span><b>${escapeHtml(item.code)}</b><code>${escapeHtml(item.url)}</code></article>`).join("")}</div>`;
      if (block.type === "ror-intro") return `<div class="ror-intro"><div class="ror-mark"><img src="${escapeHtml(block.src)}" alt="Símbolo oficial do ROR"></div><div><p class="ror-name">${escapeHtml(block.title)}</p><h4>${escapeHtml(block.text)}</h4><p>${escapeHtml(block.detail)}</p><a href="https://ror.org/about/" target="_blank" rel="noreferrer">Conheça o Research Organization Registry</a></div></div>`;
      if (block.type === "orcid-intro") return `<div class="orcid-intro"><img src="${escapeHtml(block.src)}" alt="Símbolo oficial do ORCID iD"><div><strong>${escapeHtml(block.title)}</strong><p>${escapeHtml(block.text)}</p><a href="${escapeHtml(block.url)}" target="_blank" rel="noreferrer">Conheça o ORCID.org</a></div></div>`;
      if (block.type === "brand-image") return `<div class="brand-image"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}"><a class="ojs-wordmark" href="https://pkp.sfu.ca/software/ojs/" target="_blank" rel="noreferrer"><b>OJS</b><span>Open Journal Systems</span></a></div>`;
      if (block.type === "highlight") return `<p class="key-highlight">${inline(block.text)}</p>`;
      if (block.type === "question") return `<div class="guiding-question"><span>Pergunta orientadora</span><strong>${inline(block.text)}</strong></div>`;
      if (block.type === "production" && block.visual) return `<div class="screenshot-slot"><div><strong>Captura do OJS 3.5</strong><br>Espaço reservado para inserir a imagem da tela.</div></div>`;
      if (["production", "source", "note", "reflection"].includes(block.type)) return "";
      return `<p>${inline(block.text)}</p>`;
    }).join("");
  }

  function renderTranslationTable(text) {
    const rows = String(text).split(";").map(item => item.trim()).filter(Boolean).map(item => {
      const separator = item.indexOf(":");
      return separator < 0 ? [item, item] : [item.slice(0, separator).trim(), item.slice(separator + 1).trim()];
    });
    return `<details class="translation-table"><summary>Tradução da interface para Português (Brasil)</summary><table><thead><tr><th>Em inglês</th><th>Em português</th></tr></thead><tbody>${rows.map(([en, pt]) => `<tr><td lang="en">${inline(en)}</td><td lang="pt-BR">${inline(pt)}</td></tr>`).join("")}</tbody></table></details>`;
  }

  function renderSlideContent(blocks) {
    const images = blocks.filter(block => block.type === "image");
    if (!images.length) return renderBlocks(blocks);
    const textBlocks = blocks.filter(block => block.type !== "image");
    return `<div class="image-slide-layout"><div class="image-slide-text">${renderBlocks(textBlocks)}</div><div class="image-slide-visual">${renderBlocks(images)}</div></div>`;
  }

  // Fontes e leituras por tema (fontes-data.js): botão no slide final e janela com os temas.
  const fontes = window.OJS_FONTES;
  const fontesTotal = fontes?.temas?.reduce((sum, tema) => sum + tema.curso.length + tema.revdemo.length, 0) || 0;

  function renderSourcesLauncher() {
    if (!fontesTotal) return "";
    return `<button class="sources-launcher" type="button" aria-haspopup="dialog" aria-controls="sourcesDialog"><span class="sources-launcher-icon">${conceptIcon("library")}</span><span><strong>Fontes e leituras por tema</strong><small>${fontes.temas.length} temas · ${fontesTotal} links: fontes citadas na capacitação e sugestões de leitura</small></span><b aria-hidden="true">Abrir</b></button>`;
  }

  function createSourcesDialog() {
    if (!fontesTotal) return;
    const item = (ref) => `<li><a href="${escapeHtml(ref.url)}" target="_blank" rel="noreferrer"${ref.lang ? ` lang="${escapeHtml(ref.lang)}"` : ""}>${escapeHtml(ref.titulo)}</a>${ref.autores ? `<small>${escapeHtml(ref.autores)}</small>` : ""}</li>`;
    const group = (label, refs) => refs.length ? `<section><h4>${label}</h4><ul>${refs.map(item).join("")}</ul></section>` : "";
    body.insertAdjacentHTML("beforeend", `
      <dialog class="sources-dialog" id="sourcesDialog" aria-labelledby="sourcesDialogTitle">
        <div class="sources-dialog-head">
          <div><h2 id="sourcesDialogTitle">Fontes e leituras por tema</h2><p>Abra um tema para ver os links. Todos abrem em nova aba.</p></div>
          <button class="sources-dialog-close" type="button" aria-label="Fechar fontes e leituras">×</button>
        </div>
        <div class="sources-themes">${fontes.temas.map(tema => `<details name="temas"><summary><span>${escapeHtml(tema.titulo)}</span><small>${tema.curso.length + tema.revdemo.length} links</small></summary><div class="sources-theme-body">${group("Fontes citadas na capacitação", tema.curso)}${group("Sugestões de leitura", tema.revdemo)}</div></details>`).join("")}</div>
      </dialog>`);
    const dialog = document.getElementById("sourcesDialog");
    dialog.querySelector(".sources-dialog-close").addEventListener("click", () => dialog.close());
    // Clique no fundo escurecido fecha a janela.
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  }

  function createImageZoomModal() {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="image-zoom-modal" id="imageZoomModal" role="dialog" aria-modal="true" aria-labelledby="imageZoomTitle" hidden>
        <div class="image-zoom-panel">
          <button class="image-zoom-close" type="button" aria-label="Fechar imagem ampliada">×</button>
          <div class="image-zoom-grid">
            <div class="image-zoom-visual"><h2 id="imageZoomTitle"></h2><img alt=""></div>
            <section class="image-zoom-translations" aria-label="Tradução da interface"><h3>Tradução da interface para Português (Brasil)</h3><div class="image-zoom-table"></div></section>
          </div>
        </div>
      </div>`);
  }

  // Enquanto a imagem ampliada está aberta, o resto da página fica inerte:
  // o Tab não escapa da janela e o leitor de tela lê só o conteúdo dela.
  let imageZoomReturnFocus = null;
  let imageZoomInerted = [];
  function openImageZoom(trigger) {
    const figure = trigger.closest(".ojs-figure");
    const sourceImage = trigger.querySelector("img");
    const modal = document.getElementById("imageZoomModal");
    if (!sourceImage || !modal) return;
    const sourceTable = figure?.querySelector(".translation-table table");
    imageZoomReturnFocus = trigger;
    modal.querySelector("#imageZoomTitle").textContent = figure?.querySelector("figcaption > strong")?.textContent
      || trigger.closest("article")?.querySelector("h4")?.textContent
      || sourceImage.alt;
    const modalImage = modal.querySelector(".image-zoom-visual img");
    modalImage.src = sourceImage.currentSrc || sourceImage.src;
    modalImage.alt = sourceImage.alt;
    // Imagens sem tabela de tradução (slide 58) também podem ser ampliadas.
    modal.querySelector(".image-zoom-translations").hidden = !sourceTable;
    modal.querySelector(".image-zoom-grid").style.gridTemplateColumns = sourceTable ? "" : "1fr";
    modal.querySelector(".image-zoom-table").replaceChildren(...(sourceTable ? [sourceTable.cloneNode(true)] : []));
    modal.hidden = false;
    body.classList.add("image-zoom-open");
    imageZoomInerted = [...body.children].filter(el => el !== modal && !el.inert);
    imageZoomInerted.forEach(el => { el.inert = true; });
    modal.querySelector(".image-zoom-close").focus();
  }

  function closeImageZoom() {
    const modal = document.getElementById("imageZoomModal");
    if (!modal || modal.hidden) return false;
    modal.hidden = true;
    body.classList.remove("image-zoom-open");
    imageZoomInerted.forEach(el => { el.inert = false; });
    imageZoomInerted = [];
    imageZoomReturnFocus?.focus();
    return true;
  }

  function render() {
    let currentUnit = "";
    data.slides.forEach((slide) => {
      // O link da unidade no sumário leva ao primeiro slide dela.
      if (slide.unit !== currentUnit) {
        currentUnit = slide.unit;
        toc.insertAdjacentHTML("beforeend", `<a class="unit-link" href="#slide-${slide.number}">Unidade ${slide.unitNumber} · ${escapeHtml(slide.unit)}</a>`);
      }

      const section = document.createElement("section");
      section.className = "study-slide";
      section.id = `slide-${slide.number}`;
      section.dataset.unit = slide.unit;
      section.innerHTML = `
        <article class="slide-card original-slide-${slide.originalNumber} ${slide.number === 1 ? "presenter-slide" : ""} ${slide.originalNumber === 7 ? "policy-slide" : ""} ${slide.originalNumber === 9 ? "routine-slide" : ""} ${[10,11,13,15,17,18,19].includes(slide.originalNumber) ? "dashboard-overview-slide" : ""} ${[22,25,26,27,28,29,80].includes(slide.originalNumber) ? "submission-record-slide" : ""} ${[34,35,36,37].includes(slide.originalNumber) ? "review-settings-slide" : ""} ${[41,48,49,50,51,59].includes(slide.originalNumber) ? "review-workflow-slide" : ""} ${[60,62,63,64,65,66,67,68,69].includes(slide.originalNumber) ? "users-module-slide" : ""} ${[72,73].includes(slide.originalNumber) ? "orcid-module-slide" : ""} ${[70,76,77].includes(slide.originalNumber) ? "ror-module-slide" : ""} ${[78,79].includes(slide.originalNumber) ? "language-module-slide" : ""} ${slide.originalNumber >= 8101 && slide.originalNumber <= 8108 ? "doi-module-slide" : ""} ${slide.originalNumber >= 8201 && slide.originalNumber <= 8204 ? "jats-module-slide" : ""} ${slide.originalNumber >= 8301 && slide.originalNumber <= 8303 ? "stats-module-slide" : ""} ${slide.originalNumber === 9998 ? "questions-slide" : ""} ${slide.originalNumber === 9999 ? "closing-slide" : ""}">
          ${slide.number === 1 ? "" : `<div class="slide-meta">Slide ${slide.number}</div>`}
          ${[22,25,26,27,28,29].includes(slide.originalNumber) ? '<div class="sequence-label"><span>Painel Editorial</span><b>Visualizar submissão</b></div>' : ""}
          ${[34,35,36,37].includes(slide.originalNumber) ? '<div class="sequence-label review-sequence"><span>Configurações</span><span>Fluxo de trabalho</span><b>Avaliação</b></div>' : ""}
          ${[41,48,49,50,51,59].includes(slide.originalNumber) ? '<div class="sequence-label review-workflow-sequence"><span>Painel Editorial</span><span>Visualizar submissão</span><b>Avaliação</b></div>' : ""}
          ${[62,63,64,65,66,67,68,69].includes(slide.originalNumber) ? '<div class="sequence-label users-sequence"><span>Configurações</span><b>Usuários e papéis</b></div>' : ""}
          ${slide.originalNumber === 72 ? '<div class="sequence-label"><span>Configurações</span><span>Usuários e Papéis</span><b>ORCID</b></div>' : ""}
          ${slide.originalNumber === 73 ? '<div class="sequence-label"><span>Editar perfil</span><span>Identidade</span><b>ORCID</b></div>' : ""}
          ${[70,76,77].includes(slide.originalNumber) ? '<div class="sequence-label"><span>Publicação</span><span>Colaboradores</span><b>Afiliações e ROR</b></div>' : ""}
          ${slide.originalNumber === 78 ? '<div class="sequence-label"><span>Configurações</span><span>Website</span><b>Idiomas</b></div>' : ""}
          ${slide.originalNumber === 79 ? '<div class="sequence-label"><span>Página pública</span><b>URL por idioma</b></div>' : ""}
          ${slide.originalNumber === 80 ? '<div class="sequence-label"><span>Painel Editorial</span><span>Visualizar submissão</span><b>Publicação</b></div>' : ""}
          ${slide.originalNumber >= 8101 && slide.originalNumber <= 8108 ? '<div class="sequence-label module-sequence doi-navigation"><span>Menu lateral principal</span><b>DOIs</b></div>' : ""}
          ${slide.originalNumber >= 8201 && slide.originalNumber <= 8204 ? '<div class="sequence-label module-sequence jats-navigation"><span>Painel Editorial</span><span>Visualizar submissão</span><b>Publicação</b></div>' : ""}
          ${slide.originalNumber >= 8301 && slide.originalNumber <= 8303 ? '<div class="sequence-label module-sequence stats-navigation"><span>Menu lateral principal</span><b>Estatísticas</b></div>' : ""}
          ${slide.number === 1 ? "" : `<h3>${escapeHtml(slide.title)}</h3>`}
          <div class="slide-content">${renderSlideContent(slide.blocks)}</div>
          ${slide.number <= 2 ? '<div class="opening-footer">UDESC 2026</div>' : ""}
        </article>`;
      root.appendChild(section);
      toc.insertAdjacentHTML("beforeend", `<a href="#slide-${slide.number}">${slide.number}. ${escapeHtml(slide.title)}</a>`);
    });
  }

  // Sumário: fechado, fica inerte (os links não entram na ordem do Tab).
  let sidebarReturnFocus = null;
  function openSidebar(open, { restoreFocus = true } = {}) {
    sidebar.classList.toggle("open", open);
    sidebar.inert = !open;
    tocShortcut?.setAttribute("aria-expanded", String(open));
    if (open) {
      sidebarReturnFocus = document.activeElement;
      const current = toc.querySelector('[aria-current="true"]') || toc.querySelector("a");
      current?.scrollIntoView({ block: "center" });
      current?.focus({ preventScroll: true });
    } else if (restoreFocus && sidebarReturnFocus && !sidebarReturnFocus.inert) {
      sidebarReturnFocus.focus();
    }
  }

  // Região viva discreta: anuncia número e título a cada troca de slide.
  const announcer = document.createElement("p");
  announcer.setAttribute("aria-live", "polite");
  announcer.setAttribute("aria-atomic", "true");
  announcer.style.cssText = "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;";
  body.appendChild(announcer);
  counter.removeAttribute("aria-live");

  function focusSlide(slide) {
    const target = slide?.querySelector("h1, h3") || slide?.querySelector(".slide-card");
    if (!target) return;
    if (!target.hasAttribute("tabindex")) {
      target.tabIndex = -1;
      // O título não é um controle; o anúncio da região viva já indica a troca.
      target.style.outline = "none";
    }
    target.focus({ preventScroll: true });
  }

  const presentationSlides = () => [document.querySelector(".hero"), ...document.querySelectorAll(".study-slide")];

  // moveFocus: true sempre leva o foco ao título; "auto" só quando o foco
  // estava no slide que sumiu (ou em lugar nenhum), preservando o foco nos botões.
  function showPresentationSlide(index, { moveFocus = "auto" } = {}) {
    const slides = presentationSlides();
    const previous = slides[presentationIndex];
    const focused = document.activeElement;
    const focusWasLost = !focused || focused === body || previous?.contains(focused);
    presentationIndex = Math.max(0, Math.min(index, slides.length - 1));
    const current = slides[presentationIndex];
    slides.forEach((el, i) => el?.classList.toggle("active", i === presentationIndex));
    if (current?.classList.contains("study-slide")) current.scrollTop = 0;
    const total = slides.length - 1;
    counter.textContent = presentationIndex === 0 ? "Capa" : `${presentationIndex} / ${total}`;
    announcer.textContent = presentationIndex === 0
      ? `Capa: ${document.title}`
      : `Slide ${presentationIndex} de ${total}: ${data.slides[presentationIndex - 1]?.title || ""}`;
    toc.querySelectorAll("a").forEach(link => link.toggleAttribute("aria-current", link.hash === `#${current?.id}`));
    toc.querySelectorAll("a[aria-current]").forEach(link => link.setAttribute("aria-current", "true"));
    if (current?.id) history.replaceState(null, "", `#${current.id}`);
    if (moveFocus === true || (moveFocus === "auto" && focusWasLost)) focusSlide(current);
  }

  render();
  createImageZoomModal();
  createSourcesDialog();
  root.addEventListener("click", (event) => {
    const trigger = event.target.closest(".image-zoom-trigger");
    if (trigger) openImageZoom(trigger);
    if (event.target.closest(".sources-launcher")) document.getElementById("sourcesDialog")?.showModal();
  });
  document.getElementById("imageZoomModal").addEventListener("click", (event) => {
    if (event.target.id === "imageZoomModal" || event.target.closest(".image-zoom-close")) closeImageZoom();
  });

  tocShortcut?.setAttribute("aria-controls", "sidebar");
  tocShortcut?.setAttribute("aria-expanded", "false");
  tocShortcut?.addEventListener("click", () => openSidebar(!sidebar.classList.contains("open")));
  document.getElementById("closeSidebar").addEventListener("click", () => openSidebar(false));
  toc.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    // Os slides inativos estão ocultos: a âncora não basta.
    event.preventDefault();
    openSidebar(false, { restoreFocus: false });
    const index = presentationSlides().indexOf(document.getElementById(link.hash.slice(1)));
    if (index >= 0) showPresentationSlide(index, { moveFocus: true });
  });

  const goToForm = document.getElementById("goToForm");
  const goToInput = document.getElementById("goToInput");
  if (goToForm && goToInput) {
    goToInput.max = String(presentationSlides().length - 1);
    goToForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const typed = parseInt(goToInput.value, 10);
      goToInput.value = "";
      if (!Number.isNaN(typed)) showPresentationSlide(typed, { moveFocus: true });
    });
  }

  document.getElementById("previousSlide").addEventListener("click", () => showPresentationSlide(presentationIndex - 1));
  document.getElementById("nextSlide").addEventListener("click", () => showPresentationSlide(presentationIndex + 1));

  // Fase de captura: o atalho é decidido antes de qualquer outro ouvinte.
  addEventListener("keydown", (event) => {
    // Com a janela de fontes aberta, o próprio <dialog> trata Esc e Tab.
    if (document.querySelector("dialog[open]")) return;
    if (event.key === "Escape") {
      if (closeImageZoom()) { event.preventDefault(); return; }
      if (sidebar.classList.contains("open")) { event.preventDefault(); openSidebar(false); }
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!document.getElementById("imageZoomModal").hidden || sidebar.classList.contains("open")) return;
    if (isFormField(event.target)) return;
    // Espaço em botão ou link aciona o próprio controle, não o atalho.
    if (event.key === " " && isControl(event.target)) return;

    const active = document.querySelector(".study-slide.active");
    const canScrollDown = active && active.scrollTop + active.clientHeight < active.scrollHeight - 4;
    const canScrollUp = active && active.scrollTop > 4;
    if (event.key === "ArrowRight") { event.preventDefault(); showPresentationSlide(presentationIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); showPresentationSlide(presentationIndex - 1); }
    if (["PageDown", " "].includes(event.key)) {
      event.preventDefault();
      if (canScrollDown) active.scrollBy({ top: active.clientHeight * .82, behavior: scrollBehavior() });
      else showPresentationSlide(presentationIndex + 1);
    }
    if (event.key === "PageUp") {
      event.preventDefault();
      if (canScrollUp) active.scrollBy({ top: -active.clientHeight * .82, behavior: scrollBehavior() });
      else showPresentationSlide(presentationIndex - 1);
    }
    if (event.key === "Home") { event.preventDefault(); showPresentationSlide(0); }
    if (event.key === "End") { event.preventDefault(); showPresentationSlide(presentationSlides().length - 1); }
  }, true);

  // Início: #slide-N abre a apresentação nesse slide (útil ao recarregar a página).
  sidebar.inert = true;
  document.getElementById("presentationControls").hidden = false;
  const startTarget = location.hash ? document.getElementById(location.hash.slice(1)) : null;
  showPresentationSlide(Math.max(0, presentationSlides().indexOf(startTarget)));
})();