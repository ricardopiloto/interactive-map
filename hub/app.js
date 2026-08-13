const root = document.getElementById('hub-root')

function isValidEntry(row) {
  return row && typeof row.nome === 'string' && row.nome.trim() && typeof row.url === 'string' && row.url.trim()
}

function cardHtml(row) {
  const sistema = row.sistema ? `<p class="hub-card__meta">${escapeHtml(row.sistema)}</p>` : ''
  const mestre = row.mestre ? `<p class="hub-card__meta">Mestre: ${escapeHtml(row.mestre)}</p>` : ''
  const cover = row.capa_url
    ? `<img class="hub-card__cover" src="${escapeAttr(row.capa_url)}" alt="" />`
    : ''
  return `<article class="hub-card">
    ${cover}
    <div class="hub-card__body">
      <h2>${escapeHtml(row.nome)}</h2>
      ${sistema}
      ${mestre}
      <a href="${escapeAttr(row.url)}">Abrir campanha</a>
    </div>
  </article>`
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s) {
  return escapeHtml(s)
}

async function load() {
  try {
    const res = await fetch('campanhas.json', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('JSON inválido')
    const rows = data.filter(isValidEntry)
    if (data.length === 0 || rows.length === 0) {
      root.innerHTML = '<p class="hub-empty">Nenhuma campanha listada.</p>'
      return
    }
    root.innerHTML = rows.map(cardHtml).join('')
  } catch {
    root.innerHTML =
      '<p class="hub-error">Não foi possível carregar a lista. Verifique campanhas.json e recarregue a página.</p>'
  }
}

void load()
