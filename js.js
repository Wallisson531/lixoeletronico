// Ativa os ícones da biblioteca Lucide
lucide.createIcons();

// Função para Alternar Modo Claro/Escuro
function toggleTheme() {
    // Pega a tag <html> e verifica se ela tem a classe "dark"
    const html = document.documentElement;
    
    if (html.classList.contains('dark')) {
        html.classList.remove('dark'); // Volta pro claro
        localStorage.theme = 'light';
    } else {
        html.classList.add('dark'); // Fica escuro
        localStorage.theme = 'dark';
    }
}

// Verifica qual tema estava ativo da última vez que o usuário visitou
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
}

// Lógica de filtro dos pontos de coleta (pesquisa)
function filtrarPontos() {
    const cidadeQuery = document.getElementById('filtro-cidade').value.toLowerCase();
    const catQuery = document.getElementById('filtro-categoria').value;
    const cards = document.querySelectorAll('.ponto-card');

    cards.forEach(card => {
        const cidadeAttr = card.getAttribute('data-cidade').toLowerCase();
        const catAttr = card.getAttribute('data-cat');

        const bateCidade = cidadeAttr.includes(cidadeQuery);
        const bateCat = (catQuery === 'todos') || catAttr.includes(catQuery);

        if (bateCidade && bateCat) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function buscarPontosHero() {
    const termo = document.getElementById('hero-search-input').value;
    document.getElementById('filtro-cidade').value = termo;
    filtrarPontos();
    document.getElementById('descarte').scrollIntoView({ behavior: 'smooth' });
}