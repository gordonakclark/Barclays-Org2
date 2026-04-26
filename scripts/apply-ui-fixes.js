const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  /\.brand-logos \{[\s\S]*?\.brand-divider \{/,
  `.brand-logos {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand-logo-stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .brand-metric {
    font-size: 10px;
    color: var(--silver);
    letter-spacing: 1.1px;
    text-transform: uppercase;
  }

  .brand-divider {`
);

html = html.replace(
  /\.person-name-cell \{[\s\S]*?\.person-role-cell \{/,
  `.person-name-cell {
    font-size: 11px; font-weight: 500; color: #c8d8f8;
    max-width: 130px; line-height: 1.3;
  }
  .person-name-button {
    background: transparent;
    border: 0;
    color: inherit;
    font: inherit;
    padding: 0;
    text-align: left;
    cursor: pointer;
  }
  .person-name-button:hover .person-name-cell {
    color: var(--gold-light);
    text-decoration: underline;
  }
  .person-role-cell {`
);

html = html.replace(
  /\.input-bu \{[\s\S]*?\.input-bu::placeholder \{ color: rgba\(255,255,255,0\.25\); font-weight: 300; \}/,
  `.input-bu,
  .input-bu-select {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500;
    padding: 4px 7px;
    width: 100%;
    box-sizing: border-box;
    letter-spacing: 0.3px;
    transition: border-color 0.2s;
  }
  .input-bu:focus,
  .input-bu-select:focus {
    outline: none;
    border-color: var(--gold);
    background: rgba(201,168,76,0.08);
  }
  .input-bu::placeholder { color: rgba(255,255,255,0.25); font-weight: 300; }
  .input-bu-select option { background: #0a1628; color: var(--text-primary); }`
);

html = html.replace(
  `<div class="brand-logos">\r\n      <div class="accenture-logo"><span class="accenture-word">accenture</span><span class="accenture-chevron">&gt;</span></div>\r\n      <div class="brand-divider"></div>`,
  `<div class="brand-logos">\r\n      <div class="brand-logo-stack">\r\n        <div class="accenture-logo"><span class="accenture-word">accenture</span><span class="accenture-chevron">&gt;</span></div>\r\n        <div class="brand-metric" id="brandReinventionMetric">Total Enterprise Reinvention</div>\r\n      </div>\r\n      <div class="brand-divider"></div>`
);

html = html.replace('Organisation Chart ┬À Total Enterprise Reinvention ┬À GitHub Sync', 'Organisation Chart ┬À GitHub Sync');

html = html.replace(
  `<div class="filter-wrap">\r\n      <select class="filter-select" id="ownerFilter" onchange="filterTable(document.getElementById('searchInput').value)">`,
  `<div class="filter-wrap">\r\n      <select class="filter-select" id="tableBuFilter" onchange="filterTable(document.getElementById('searchInput').value)">\r\n        <option value="">All Business Units</option>\r\n      </select>\r\n      <select class="filter-select" id="ownerFilter" onchange="filterTable(document.getElementById('searchInput').value)">`
);

html = html.replace("const APP_VERSION = 'v1.4.5';", "const APP_VERSION = 'v1.4.6';");

html = html.replace(
  `function sanitizeEngagementOwner(value) {\r\n  return sanitizeShortText(value, 24);\r\n}`,
  `function sanitizeEngagementOwner(value) {\r\n  return sanitizeShortText(value, 24);\r\n}\r\n\r\nfunction formatDisplayedRole(role) {\r\n  return String(role || '')\r\n    .replace(/Chief Information Officer/gi, 'CIO')\r\n    .replace(/Chief Technology Officer/gi, 'CTO')\r\n    .replace(/Chief Operating Officer/gi, 'COO')\r\n    .replace(/Chief Financial Officer/gi, 'CFO')\r\n    .replace(/Chief Executive Officer/gi, 'CEO')\r\n    .replace(/Chief of Staff/gi, 'CoS')\r\n    .replace(/Executive Assistant/gi, 'EA')\r\n    .replace(/Managing Director/gi, 'MD')\r\n    .replace(/Group Technology Infrastructure Services/gi, 'GTIS')\r\n    .replace(/Group Technology Service Management/gi, 'GTSM');\r\n}`
);

html = html.replace(
  `  }, 30000); // Every 30 seconds\r\n  console.log('Auto-sync enabled (every 30s)');`,
  `  }, 120000); // Every 2 minutes\r\n  console.log('Auto-sync enabled (every 120s)');`
);

html = html.replace(
  `function buildTable() {\r\n  const tbody = document.getElementById('relTableBody');\r\n  tbody.innerHTML = '';\r\n  allPeople.forEach(person => {`,
  `function buildTable() {\r\n  const tbody = document.getElementById('relTableBody');\r\n  tbody.innerHTML = '';\r\n  const availableBus = getUniqueBUs();\r\n  allPeople.forEach(person => {`
);

html = html.replace(
  `    const tdName = document.createElement('td');\r\n    tdName.innerHTML = \`<div class="person-name-cell">\${person.name}</div><div class="person-role-cell">\${person.role}</div>\`;`,
  `    const tdName = document.createElement('td');\r\n    const nameButton = document.createElement('button');\r\n    nameButton.type = 'button';\r\n    nameButton.className = 'person-name-button';\r\n    nameButton.innerHTML = \`<div class="person-name-cell">\${escapeHtml(person.name)}</div><div class="person-role-cell">\${escapeHtml(formatDisplayedRole(person.role))}</div>\`;\r\n    nameButton.addEventListener('click', event => {\r\n      event.stopPropagation();\r\n      openStakeholderWorkspace(person.name);\r\n    });\r\n    tdName.appendChild(nameButton);`
);

html = html.replace(
  `    const tdBU = document.createElement('td');\r\n    const inpBU = document.createElement('input');\r\n    inpBU.className = 'input-bu';\r\n    inpBU.type = 'text';\r\n    inpBU.placeholder = 'e.g. BUK, CIB, BX';\r\n    inpBU.setAttribute('list', 'bu-suggestions');\r\n    inpBU.value = sanitizeBusinessUnit(rel.businessUnit || '');\r\n    inpBU.dataset.name = person.name;\r\n    inpBU.addEventListener('input', () => { inpBU.value = sanitizeBusinessUnit(inpBU.value); updateRel(person.name); updateCount(); });\r\n    inpBU.addEventListener('change', () => { populateBUFilter(); });\r\n    tdBU.appendChild(inpBU);`,
  `    const tdBU = document.createElement('td');\r\n    const inpBU = document.createElement('select');\r\n    inpBU.className = 'input-bu-select';\r\n    inpBU.innerHTML = ['<option value="">ÔÇö</option>'].concat(availableBus.map(value => \`<option value="\${escapeHtml(value)}">\${escapeHtml(value)}</option>\`)).join('');\r\n    inpBU.value = sanitizeBusinessUnit(rel.businessUnit || '');\r\n    inpBU.dataset.name = person.name;\r\n    inpBU.addEventListener('change', () => { updateRel(person.name); updateCount(); populateBUFilter(); filterTable(document.getElementById('searchInput')?.value || ''); });\r\n    tdBU.appendChild(inpBU);`
);

html = html.replace(
  "const inpBU = document.querySelector(`input.input-bu[data-name=\"${CSS.escape(name)}\"]`);",
  "const inpBU = document.querySelector(`select.input-bu-select[data-name=\"${CSS.escape(name)}\"]`);"
);

html = html.replace(
  `function updateCount() {\r\n  const n = Object.keys(relationships).length;\r\n  document.getElementById('assignedCount').textContent = \`\${n} assigned\`;\r\n}`,
  `function updateCount() {\r\n  const n = Object.keys(relationships).length;\r\n  document.getElementById('assignedCount').textContent = \`\${n} assigned\`;\r\n  const brandMetric = document.getElementById('brandReinventionMetric');\r\n  if (brandMetric) brandMetric.textContent = \`Total Enterprise Reinvention ┬À \${n} tracked\`;\r\n}`
);

html = html.replace(
  `function filterTable(query) {\r\n  const q = query.toLowerCase();\r\n  const ownerFilter = document.getElementById('ownerFilter')?.value || '';`,
  `function filterTable(query) {\r\n  const q = query.toLowerCase();\r\n  const buFilter = document.getElementById('tableBuFilter')?.value || '';\r\n  const ownerFilter = document.getElementById('ownerFilter')?.value || '';`
);

html = html.replace(
  `    const matchesSearch = hay.includes(q);\r\n    const matchesOwner = !ownerFilter || rel.engagementOwner === ownerFilter;`,
  `    const matchesSearch = hay.includes(q);\r\n    const matchesBu = !buFilter || rel.businessUnit === buFilter;\r\n    const matchesOwner = !ownerFilter || rel.engagementOwner === ownerFilter;`
);

html = html.replace(
  `    tr.style.display = matchesSearch && matchesOwner && matchesSupport && matchesRegion && matchesInfluence ? '' : 'none';`,
  `    tr.style.display = matchesSearch && matchesBu && matchesOwner && matchesSupport && matchesRegion && matchesInfluence ? '' : 'none';`
);

html = html.replace(
  /function populateBUFilter\(\) \{[\s\S]*?\n\}/,
  `function populateBUFilter() {\n  const bus = getUniqueBUs();\n  const populateSelect = (id, label) => {\n    const select = document.getElementById(id);\n    if (!select) return;\n    const current = select.value;\n    select.innerHTML = '<option value="">' + label + '</option>' +\n      bus.map(b => \`<option value="\${b.replace(/"/g,'&quot;')}">\${b}</option>\`).join('');\n    if (bus.includes(current)) select.value = current;\n  };\n  populateSelect('buFilter', 'All Business Units');\n  populateSelect('tableBuFilter', 'All Business Units');\n}`
);

html = html.replace(
  `  const nameEl = document.createElement('div');\r\n  nameEl.className = 'name';\r\n  nameEl.textContent = node.name;\r\n  box.appendChild(nameEl);\r\n\r\n  const roleEl = document.createElement('div');\r\n  roleEl.className = 'role';\r\n  roleEl.textContent = node.role;\r\n  box.appendChild(roleEl);`,
  `  const nameEl = document.createElement('div');\r\n  nameEl.className = 'name';\r\n  nameEl.textContent = node.name;\r\n  nameEl.style.cursor = 'pointer';\r\n  nameEl.addEventListener('click', event => {\r\n    event.stopPropagation();\r\n    openStakeholderWorkspace(node.name);\r\n  });\r\n  box.appendChild(nameEl);\r\n\r\n  const roleEl = document.createElement('div');\r\n  roleEl.className = 'role';\r\n  roleEl.textContent = formatDisplayedRole(node.role);\r\n  roleEl.style.cursor = 'pointer';\r\n  roleEl.addEventListener('click', event => {\r\n    event.stopPropagation();\r\n    openStakeholderWorkspace(node.name);\r\n  });\r\n  box.appendChild(roleEl);`
);

fs.writeFileSync('index.html', html);