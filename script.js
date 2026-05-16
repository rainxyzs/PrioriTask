// Array para armazenar as tarefas
let tarefas = [];
let filtroAtual = 'todas';

// Carregar tarefas do localStorage ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    const tarefasSalvas = localStorage.getItem('minhasTarefas');
    if (tarefasSalvas) {
        tarefas = JSON.parse(tarefasSalvas);
    }
    renderizarTarefas();
    
    // Adicionar tarefa ao pressionar Enter
    document.getElementById('inputTarefa').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            adicionarTarefa();
        }
    });
});

function adicionarTarefa() {
    const input = document.getElementById('inputTarefa');
    const texto = input.value.trim();
    
    if (texto === '') {
        input.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 1000);
        return;
    }
    
    // Pegar a prioridade selecionada
    const prioridadeSelecionada = document.querySelector('input[name="prioridade"]:checked').value;
    
    const novaTarefa = {
        id: Date.now(),
        texto: texto,
        prioridade: prioridadeSelecionada,
        concluida: false,
        dataCriacao: new Date().toLocaleDateString('pt-BR')
    };
    
    tarefas.unshift(novaTarefa); // Adiciona no início
    salvarTarefas();
    input.value = '';
    renderizarTarefas();
    
    // Animação no botão
    const btn = document.getElementById('btnAdicionar');
    btn.innerHTML = '<span>✨</span> Adicionada!';
    setTimeout(() => {
        btn.innerHTML = '<span>Adicionar Tarefa</span>';
    }, 1500);
}

function toggleTarefa(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
        salvarTarefas();
        renderizarTarefas();
    }
}

function excluirTarefa(id) {
    const elemento = document.querySelector(`[data-id="${id}"]`);
    if (elemento) {
        elemento.style.animation = 'sumir 0.3s ease forwards';
        setTimeout(() => {
            tarefas = tarefas.filter(t => t.id !== id);
            salvarTarefas();
            renderizarTarefas();
        }, 300);
    }
}

function editarTarefa(id) {
    const tarefa = tarefas.find(t => t.id === id);

    if (tarefa) {
        // Editar texto
        const novoTexto = prompt("Editar tarefa:", tarefa.texto);

        if (novoTexto !== null && novoTexto.trim() !== "") {

            // Editar prioridade
            const novaPrioridade = prompt(
                "Digite a nova prioridade: alta, media ou baixa",
                tarefa.prioridade
            );

            // Validar prioridade
            const prioridadesValidas = ['alta', 'media', 'baixa'];

            if (
                novaPrioridade !== null &&
                prioridadesValidas.includes(novaPrioridade.toLowerCase())
            ) {
                tarefa.texto = novoTexto.trim();
                tarefa.prioridade = novaPrioridade.toLowerCase();

                salvarTarefas();
                renderizarTarefas();
            } else {
                alert("Prioridade inválida! Use: alta, media ou baixa.");
            }
        }
    }
}


function filtrarTarefas(filtro) {
    filtroAtual = filtro;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filtro').forEach(btn => {
        btn.classList.remove('ativo');
    });
    event.target.classList.add('ativo');
    
    renderizarTarefas();
}

function getEmojiPrioridade(prioridade) {
    const emojis = {
        'alta': '🔥',
        'media': '⚡',
        'baixa': '🌱'
    };
    return emojis[prioridade] || '';
}

function renderizarTarefas() {
    const lista = document.getElementById('listaTarefas');
    const vazio = document.getElementById('vazio');
    const contador = document.getElementById('contadorTexto');
    
    // Filtrar tarefas
    let tarefasFiltradas = tarefas;
    
    if (filtroAtual !== 'todas') {
        if (filtroAtual === 'concluidas') {
            tarefasFiltradas = tarefas.filter(t => t.concluida);
        } else {
            tarefasFiltradas = tarefas.filter(t => t.prioridade === filtroAtual && !t.concluida);
        }
    }
    
    // Atualizar contador
    const pendentes = tarefas.filter(t => !t.concluida).length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    
    if (pendentes === 0 && tarefas.length > 0) {
        contador.textContent = '🎉 Todas as tarefas concluídas! Parabéns!';
    } else if (tarefas.length === 0) {
        contador.textContent = 'Você tem 0 tarefas pendentes';
    } else {
        contador.textContent = `Você tem ${pendentes} tarefa${pendentes !== 1 ? 's' : ''} pendente${pendentes !== 1 ? 's' : ''} (${concluidas} concluída${concluidas !== 1 ? 's' : ''})`;
    }
    
    // Mostrar/esconder estado vazio
    if (tarefasFiltradas.length === 0) {
        lista.innerHTML = '';
        vazio.classList.add('visivel');
        
        // Mudar mensagem do vazio conforme filtro
        const emojiVazio = vazio.querySelector('.emoji-vazio');
        const textoVazio = vazio.querySelector('p');
        
        if (filtroAtual === 'concluidas') {
            emojiVazio.textContent = '❌';
            textoVazio.textContent = 'Nenhuma tarefa concluída';
        } else if (filtroAtual !== 'todas') {
            emojiVazio.textContent = '❌';
            textoVazio.textContent = `Nenhuma tarefa ${filtroAtual} por aqui!`;
        } else {
            emojiVazio.textContent = '❌';
            textoVazio.textContent = 'Nenhuma tarefa por aqui!';
        }
        return;
    }
    
    vazio.classList.remove('visivel');
    
    // Renderizar tarefas
    lista.innerHTML = tarefasFiltradas.map(tarefa => `
        <div class="tarefa ${tarefa.prioridade} ${tarefa.concluida ? 'concluida' : ''}" data-id="${tarefa.id}">
            <div class="checkbox-tarefa" onclick="toggleTarefa(${tarefa.id})"></div>
            <div class="texto-tarefa">${tarefa.texto}</div>
            <div class="prioridade-tag ${tarefa.prioridade}">
                ${getEmojiPrioridade(tarefa.prioridade)} ${tarefa.prioridade}
            </div>
            <button class="btn-editar" onclick="editarTarefa(${tarefa.id})" title="Editar tarefa">✏️</button>
            <button class="btn-excluir" onclick="excluirTarefa(${tarefa.id})" title="Excluir tarefa">🗑️</button>
        </div>
    `).join('');
}

function salvarTarefas() {
    localStorage.setItem('minhasTarefas', JSON.stringify(tarefas));
}