/**
 * BEYOND COLLECTION - SCRIPT PRINCIPAL
 * Módulo de Busca Dinâmica por Cidade, CEP, Bairro com Destaque de Parceiro
 */

// ==========================================
// 1. BANCO DE DADOS DE PONTOS DE COLETA
// ==========================================
const PONTOS_DE_COLETA = [
    {
        id: 4,
        nome: "Ponto de Coleta Recitech",
        cidade: "Cascavel",
        uf: "PR",
        bairro: "Santa Felicidade",
        ceps: ["85803", "85803-400", "85803400"],
        keywords: "recitech heinz marth santa felicidade cascavel centro",
        endereco: "Rua Eng. Heinz Marth, 1708 - Santa Felicidade, Cascavel - PR",
        recebe: "Equipamentos eletroeletrônicos de pequeno e médio porte.",
        categorias: ["eletrodomesticos", "computadores", "celulares", "baterias"],
        mapaUrl: "https://www.google.com/maps?cid=10688151581218547372&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=pt-BR&source=embed",
        eParceiro: true // PARCEIRO DESTAQUE
    },
    {
        id: 1,
        nome: "Ponto de Coleta Univel",
        cidade: "Cascavel",
        uf: "PR",
        bairro: "Santa Cruz",
        ceps: ["85806", "85806-080"],
        keywords: "univel santa cruz tito muffato faculdade",
        endereco: "Av. Tito Muffato, 2317 - Santa Cruz, Cascavel - PR",
        recebe: "Pequenos e médios eletrônicos, celulares, baterias e placas.",
        categorias: ["celulares", "computadores", "baterias"],
        mapaUrl: "https://www.google.com/maps/search/?api=1&query=Univel+Cascavel",
        eParceiro: false
    },
    {
        id: 2,
        nome: "Ecoponto Manaus (Prefeitura)",
        cidade: "Cascavel",
        uf: "PR",
        bairro: "Country",
        ceps: ["85811", "85811-030"],
        keywords: "ecoponto manaus country prefeitura",
        endereco: "Rua Manaus, 1524 - Country, Cascavel - PR",
        recebe: "Eletrodomésticos, TVs, computadores, pilhas e baterias.",
        categorias: ["eletrodomesticos", "computadores", "celulares", "baterias", "tvs"],
        mapaUrl: "https://www.google.com/maps/search/?api=1&query=Rua+Manaus+1524+Cascavel",
        eParceiro: false
    }
];

// Dados das Categorias
const DADOS_EQUIPAMENTOS = {
    celulares: {
        titulo: "Celulares e Telefonia",
        descricao: "Celulares e smartphones possuem mineração urbana embutida: conectores folheados a ouro, trilhas de prata e cobre nas placas de circuito impresso. Antes do descarte, recomenda-se remover os cartões SIM e realizar a restauração para os padrões de fábrica."
    },
    computadores: {
        titulo: "Computadores e Informática",
        descricao: "Notebooks, desktops, placas e periféricos possuem alto índice de reaproveitamento metálico e de polímeros. Placas eletrônicas concentram fios de cobre, estruturas de alumínio e soldas de estranho."
    },
    tvs: {
        titulo: "Televisores e Monitores",
        descricao: "Televisores e telas contêm vidros reforçados, estruturas metálicas e placas eletrônicas de controle. Requerem manuseio cuidadoso para que a tela permaneça íntegra durante o envio ao ponto de coleta."
    },
    pilhas: {
        titulo: "Pilhas e Baterias",
        descricao: "Contêm compostos químicos que exigem logística reversa específica. Jamais devem ser perfuradas, amassadas ou destinadas ao lixo comum, evitando contaminação do solo e do lençol freático."
    },
    outros: {
        titulo: "Eletrodomésticos e Outros Equipamentos",
        descricao: "Eletrodomésticos de pequeno e médio porte são ricos em motores com enrolamento de cobre, chassis de ferro e carcaças reutilizáveis para novos ciclos industriais."
    }
};

// ==========================================
// 2. INICIALIZAÇÃO DA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) lucide.createIcons();
    inicializarTema();
    renderizarPontos(PONTOS_DE_COLETA);
    configurarEventos();
});

// ==========================================
// 3. TEMA CLARO E ESCURO
// ==========================================
function inicializarTema() {
    const temaSalvo = localStorage.getItem("theme");
    const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (temaSalvo === "dark" || (!temaSalvo && prefereEscuro)) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}

function alternarTema() {
    const estaEscuro = document.documentElement.classList.contains("dark");
    if (estaEscuro) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }
}

// ==========================================
// 4. LÓGICA DE FILTRAGEM E BUSCA POR CEP/CIDADE
// ==========================================
async function buscarEFiltrarPontos() {
    const inputCidade = document.getElementById("filtro-cidade");
    const selectCat = document.getElementById("filtro-categoria");

    if (!inputCidade || !selectCat) return;

    const termoOriginal = inputCidade.value.trim();
    const termoLimpo = termoOriginal.toLowerCase().replace(/[-.]/g, "");
    const categoriaSelecionada = selectCat.value;

    let cidadeBuscada = "";
    let ufBuscada = "";

    // Se for um CEP (8 números)
    if (termoLimpo.length === 8 && !isNaN(termoLimpo)) {
        try {
            const res = await fetch(`https://viacep.com.br/ws/${termoLimpo}/json/`);
            const dados = await res.json();
            if (!dados.erro) {
                cidadeBuscada = dados.localidade;
                ufBuscada = dados.uf;
            }
        } catch (e) {
            console.error("Erro ao consultar ViaCEP:", e);
        }
    }

    // Filtragem dos Resultados
    const resultados = PONTOS_DE_COLETA.filter(ponto => {
        const bateCategoria = (categoriaSelecionada === "todos") || ponto.categorias.includes(categoriaSelecionada);
        if (!bateCategoria) return false;

        if (termoOriginal === "") return true;

        if (cidadeBuscada !== "") {
            return ponto.cidade.toLowerCase().includes(cidadeBuscada.toLowerCase());
        }

        const matchNome = ponto.nome.toLowerCase().includes(termoLimpo);
        const matchCidade = ponto.cidade.toLowerCase().includes(termoLimpo);
        const matchBairro = ponto.bairro.toLowerCase().includes(termoLimpo);
        const matchUf = ponto.uf.toLowerCase() === termoLimpo;
        const matchEndereco = ponto.endereco.toLowerCase().includes(termoLimpo);
        const matchKeywords = ponto.keywords.toLowerCase().includes(termoLimpo);

        return matchNome || matchCidade || matchBairro || matchUf || matchEndereco || matchKeywords;
    });

    if (resultados.length > 0) {
        renderizarPontos(resultados);
    } else if (termoOriginal !== "") {
        const localNome = cidadeBuscada !== "" ? `${cidadeBuscada} - ${ufBuscada}` : termoOriginal;
        renderizarPontoDinamicoMaps(localNome, `Ponto de coleta lixo eletronico ${localNome}`);
    } else {
        renderizarPontos([]);
    }
}

// ==========================================
// 5. RENDERIZAÇÃO DE CARDS NA TELA
// ==========================================
function renderizarPontos(lista) {
    const container = document.getElementById("grid-pontos");
    if (!container) return;

    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                <i data-lucide="map-pin-off" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 12px;"></i>
                <h3 style="font-size: 1.1rem; margin-bottom: 6px;">Nenhum ponto local encontrado</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Tente buscar por nome da cidade (ex: Cascavel, São Paulo, Curitiba) ou CEP.</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    // Ordenação: Parceiro oficial fica no topo da lista
    const listaOrdenada = [...lista].sort((a, b) => (b.eParceiro ? 1 : 0) - (a.eParceiro ? 1 : 0));

    listaOrdenada.forEach(ponto => {
        const classeParceiro = ponto.eParceiro ? "parceiro-destaque" : "";
        const badgeParceiro = ponto.eParceiro ? `<div class="parceiro-badge">⭐ Parceiro</div>` : "";

        const cardHtml = `
            <article class="ponto-card ${classeParceiro}">
                ${badgeParceiro}
                <div class="ponto-card-header">
                    <span class="location-badge">${ponto.cidade} / ${ponto.uf}</span>
                    <i data-lucide="map-pin" class="pin-icon"></i>
                </div>
                <h3 class="ponto-title">${ponto.nome}</h3>
                <p class="ponto-address">${ponto.endereco}</p>
                <div class="ponto-details">
                    <p><strong>Recebe:</strong> ${ponto.recebe}</p>
                </div>
                <a href="${ponto.mapaUrl}" target="_blank" rel="noopener" class="ponto-link">
                    Como chegar <i data-lucide="external-link"></i>
                </a>
            </article>
        `;
        container.insertAdjacentHTML("beforeend", cardHtml);
    });

    if (window.lucide) lucide.createIcons();
}

function renderizarPontoDinamicoMaps(localNome, queryMaps) {
    const container = document.getElementById("grid-pontos");
    if (!container) return;

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryMaps)}`;

    container.innerHTML = `
        <article class="ponto-card" style="grid-column: 1 / -1; border-color: var(--primary);">
            <div class="ponto-card-header">
                <span class="location-badge">Busca Nacional</span>
                <i data-lucide="navigation" class="pin-icon" style="color: var(--primary);"></i>
            </div>
            <h3 class="ponto-title">Pontos de Coleta e Ecopontos em: ${localNome}</h3>
            <p class="ponto-address">Localizamos postos de reciclagem, coletores de logística reversa e Ecopontos municipais na sua região.</p>
            <div class="ponto-details">
                <p><strong>Recebe:</strong> Aparelhos celulares, pilhas, computadores, TVs e eletrodomésticos.</p>
            </div>
            <a href="${mapsUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-small" style="margin-top: 10px; display: inline-flex;">
                <i data-lucide="map"></i> Abrir Postos de Coleta no Google Maps
            </a>
        </article>
    `;

    if (window.lucide) lucide.createIcons();
}

// ==========================================
// 6. PAINEL DE CATEGORIAS
// ==========================================
function selecionarCategoria(chave, elementoBotao) {
    const dados = DADOS_EQUIPAMENTOS[chave];
    if (!dados) return;

    const tituloEl = document.getElementById("eq-titulo");
    const descEl = document.getElementById("eq-descricao");

    if (tituloEl) tituloEl.innerText = dados.titulo;
    if (descEl) descEl.innerText = dados.descricao;

    document.querySelectorAll(".category-card").forEach(btn => btn.classList.remove("active"));
    if (elementoBotao) elementoBotao.classList.add("active");
}

// ==========================================
// 7. LISTENERS DE EVENTOS
// ==========================================
function configurarEventos() {
    const btnTema = document.getElementById("theme-toggle");
    if (btnTema) btnTema.addEventListener("click", alternarTema);

    const inputCidade = document.getElementById("filtro-cidade");
    const selectCat = document.getElementById("filtro-categoria");

    if (inputCidade) {
        inputCidade.addEventListener("input", buscarEFiltrarPontos);
    }
    if (selectCat) {
        selectCat.addEventListener("change", buscarEFiltrarPontos);
    }

    const heroForm = document.getElementById("hero-search-form");
    if (heroForm) {
        heroForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const termo = document.getElementById("hero-search-input").value;
            if (inputCidade) {
                inputCidade.value = termo;
                buscarEFiltrarPontos();
            }
            const secaoDescarte = document.getElementById("descarte");
            if (secaoDescarte) {
                secaoDescarte.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    const categoriaBotoes = document.querySelectorAll(".category-card");
    categoriaBotoes.forEach(btn => {
        btn.addEventListener("click", () => {
            const chave = btn.getAttribute("data-category");
            selecionarCategoria(chave, btn);
        });
    });
}