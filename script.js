
let tarefas = [];
let idAtual = 0;
let filtroCategoriaAtual = "todos";
let tarefaSendoEditadaId = null;
let tarefaArrastadaId = null; 

const form = document.getElementById("task-form");
const inputNome = document.getElementById("task-name");
const selectPrioridade = document.getElementById("task-priority");
const selectCategoria = document.getElementById("task-category");
const filterCategorySelect = document.getElementById("filter-category");

const pendingTasksContainer = document.getElementById("pending-tasks");
const archivedTasksContainer = document.getElementById("archived-tasks");
const noPendingTasksMessage = document.getElementById("no-pending-tasks-message");
const noArchivedTasksMessage = document.getElementById("no-archived-tasks-message");

const themeToggleBtn = document.getElementById("theme-toggle");
const backButton = document.getElementById("back-button");

const editTaskModal = document.getElementById("edit-task-modal");
const editTaskForm = document.getElementById("edit-task-form");
const editTaskNameInput = document.getElementById("edit-task-name");
const editTaskPrioritySelect = document.getElementById("edit-task-priority");
const editTaskCategorySelect = document.getElementById("edit-task-category");
const editTaskReminderDatetimeInput = document.getElementById("edit-task-reminder-datetime");
const cancelEditButton = document.getElementById("cancel-edit-button");
const exportTxtButton = document.getElementById("export-txt-button");
const exportJsonButton = document.getElementById("export-json-button");


const messageModal = document.getElementById("message-modal");
const messageModalTitle = document.getElementById("message-modal-title");
const messageModalText = document.getElementById("message-modal-text");
const messageModalOkButton = document.getElementById("message-modal-ok-button");


const notificationTimeouts = {};


function showMessageBox(title, message, callback = () => {}) {
    messageModalTitle.textContent = title;
    messageModalText.textContent = message;
    messageModal.classList.add("visible");

 
    messageModalOkButton.onclick = null; 
    messageModalOkButton.onclick = () => {
        messageModal.classList.remove("visible");
        callback();
    };
}

function showConfirmBox(title, message, onConfirm, onCancel = () => {}) {
   
    messageModalTitle.textContent = title;
    messageModalText.textContent = message;
    messageModal.classList.add("visible");


    let cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancelar';
    cancelButton.classList.add('modal-cancel-button');
    cancelButton.onclick = () => {
        messageModal.classList.remove("visible");
        onCancel();
        cancelButton.remove(); 
    };
    messageModalOkButton.parentNode.insertBefore(cancelButton, messageModalOkButton);

    messageModalOkButton.textContent = 'Confirmar'; 
    messageModalOkButton.onclick = () => {
        messageModal.classList.remove("visible");
        onConfirm();
        cancelButton.remove(); 
        messageModalOkButton.textContent = 'OK'; 
    };
}

function carregarTarefas() {
    const tarefasSalvas = localStorage.getItem("tarefas");
    if (tarefasSalvas) {
        tarefas = JSON.parse(tarefasSalvas);
        idAtual = tarefas.length > 0 ? Math.max(...tarefas.map(t => t.id)) + 1 : 0;

        tarefas.forEach(tarefa => {
           
            if (typeof tarefa.pomodorosCompletos === 'undefined') {
                tarefa.pomodorosCompletos = 0;
            }
            if (tarefa.lembreteAgendado && !tarefa.concluida && !tarefa.arquivada) {
                const agora = Date.now();
                if (tarefa.lembreteAgendado > agora) {
                    const tempoRestante = tarefa.lembreteAgendado - agora;
                    agendarNotificacaoReal(tarefa.id, tarefa.nome, tempoRestante);
                } else {
                    tarefa.lembreteAgendado = null;
                }
            }
        });
    }
}

function salvarTarefas() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// --- Funções de Tema ---
function aplicarTema(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    aplicarTema(true);
} else {
    aplicarTema(false);
}

themeToggleBtn.addEventListener("click", () => {
    const isCurrentlyDarkMode = document.body.classList.contains("dark-mode");
    aplicarTema(!isCurrentlyDarkMode);
    if (!isCurrentlyDarkMode) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});
function solicitarPermissaoNotificacao() {
    if (!("Notification" in window)) {
        console.warn("Este navegador não suporta notificações de desktop.");
        return Promise.resolve("unsupported");
    }
    if (Notification.permission === "granted") {
        return Promise.resolve("granted");
    }
    if (Notification.permission === "denied") {
        return Promise.resolve("denied");
    }
    return Notification.requestPermission();
}
document.addEventListener("DOMContentLoaded", () => {
    carregarTarefas();
    renderizarTarefas();
    setupDragAndDrop();
    solicitarPermissaoNotificacao();

    if (backButton) { 
        backButton.addEventListener("click", () => {
            history.back(); 
        });
    }
});

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const prioridade = selectPrioridade.value;
    const categoria = selectCategoria.value;

    if (nome === "") {
        showMessageBox("Erro", "O nome da tarefa não pode ser vazio!");
        return;
    }

    const novaTarefa = {
        id: idAtual++,
        nome,
        prioridade,
        categoria,
        concluida: false,
        arquivada: false,
        lembreteAgendado: null,
        pomodorosCompletos: 0
    };

    tarefas.push(novaTarefa);
    inputNome.value = "";
    selectPrioridade.value = "baixa";
    selectCategoria.value = "todos";
    salvarTarefas();
    renderizarTarefas();
});

filterCategorySelect.addEventListener("change", function () {
    filtroCategoriaAtual = this.value;
    renderizarTarefas();
});

exportTxtButton.addEventListener("click", exportarTarefasTxt);
exportJsonButton.addEventListener("click", exportarTarefasJson);


// --- Funções de Renderização e Lógica de Tarefas ---

function renderizarTarefas() {
    pendingTasksContainer.innerHTML = "";
    archivedTasksContainer.innerHTML = "";

    noPendingTasksMessage.classList.add("hidden");
    noArchivedTasksMessage.classList.add("hidden");

    const pendingTasks = tarefas.filter(t => !t.arquivada && (filtroCategoriaAtual === "todos" || t.categoria === filtroCategoriaAtual));
    const archivedTasks = tarefas.filter(t => t.arquivada && (filtroCategoriaAtual === "todos" || t.categoria === filtroCategoriaAtual));

    pendingTasks.forEach((tarefa) => {
        const div = criarElementoTarefa(tarefa);
        pendingTasksContainer.appendChild(div);
        
        lucide.createIcons({ container: div }); 
    });

    archivedTasks.forEach((tarefa) => {
        const div = criarElementoTarefa(tarefa);
        archivedTasksContainer.appendChild(div);
       
        lucide.createIcons({ container: div });
    });

    if (pendingTasks.length === 0) {
        noPendingTasksMessage.classList.remove("hidden");
    }
    if (archivedTasks.length === 0) {
        noArchivedTasksMessage.classList.remove("hidden");
    }
    
    configurarDragAndDropContainers();
}


function criarElementoTarefa(tarefa) {
    const div = document.createElement("div");
    div.className = `task prioridade-${tarefa.prioridade}`;
    div.dataset.id = tarefa.id;
    div.setAttribute('draggable', 'true');

    div.addEventListener('dragstart', (e) => {
        tarefaArrastadaId = tarefa.id;
        e.dataTransfer.setData('text/plain', tarefa.id);
        div.classList.add('dragging');
    });

    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
        tarefaArrastadaId = null;
    });

    div.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement || draggingElement === div) return;

        const bounding = div.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);

        if (e.clientY < offset) {
            div.classList.add('drag-over-top');
            div.classList.remove('drag-over-bottom');
        } else {
            div.classList.add('drag-over-bottom');
            div.classList.remove('drag-over-top');
        }
    });

    div.addEventListener('dragleave', () => {
        div.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    div.addEventListener('drop', (e) => {
        e.preventDefault();
        div.classList.remove('drag-over-top', 'drag-over-bottom');

        const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
        if (isNaN(draggedId) || draggedId === tarefa.id) return;

        reordenarTarefas(draggedId, tarefa.id, div.classList.contains('drag-over-bottom'));
    });


    const nomeSpan = document.createElement("span");
    const strongNome = document.createElement("strong");
    strongNome.textContent = tarefa.nome;

    const priorityBadge = document.createElement("span");
    priorityBadge.className = `task-priority-badge prioridade-${tarefa.prioridade}`;
    let priorityText = "";
    switch (tarefa.prioridade) {
        case "baixa": priorityText = "Baixa"; break;
        case "média": priorityText = "Média"; break;
        case "alta": priorityText = "Alta"; break;
        default: priorityText = tarefa.prioridade;
    }
    priorityBadge.textContent = priorityText;

    const categoryBadge = document.createElement("span");
    categoryBadge.className = `task-category-badge categoria-${tarefa.categoria}`;
    const categoryDisplayText = tarefa.categoria.charAt(0).toUpperCase() + tarefa.categoria.slice(1);
    categoryBadge.textContent = categoryDisplayText;

    nomeSpan.appendChild(strongNome);
    nomeSpan.appendChild(priorityBadge);
    nomeSpan.appendChild(categoryBadge);

    const btnConcluirOuDesarquivar = document.createElement("button");
    btnConcluirOuDesarquivar.classList.add("btn-concluir"); 
    if (tarefa.arquivada) {
        btnConcluirOuDesarquivar.innerHTML = `
            <span data-lucide="folder-open" class="lucide-icon"></span>
            <span class="button-text-hidden">Desarquivar</span>
        `;
        btnConcluirOuDesarquivar.onclick = () => desarquivarTarefa(tarefa.id);
    } else {
        btnConcluirOuDesarquivar.innerHTML = `
            <span data-lucide="check-circle" class="lucide-icon"></span>
            <span class="button-text-hidden">Concluir</span>
        `;
        btnConcluirOuDesarquivar.onclick = () => concluirTarefa(tarefa.id);
    }

    const btnEditar = document.createElement("button");
    btnEditar.classList.add("btn-editar");
    btnEditar.innerHTML = `
        <span data-lucide="pencil" class="lucide-icon"></span>
        <span class="button-text-hidden">Editar</span>
    `;
    btnEditar.onclick = () => abrirModalEdicao(tarefa.id);

    if (tarefa.arquivada) {
        btnEditar.disabled = true;
        btnEditar.style.opacity = 0.5;
        btnEditar.style.cursor = 'not-allowed';
    }

    const btnExcluir = document.createElement("button");
    btnExcluir.classList.add("btn-excluir");
    btnExcluir.innerHTML = `
        <span data-lucide="trash-2" class="lucide-icon"></span>
        <span class="button-text-hidden">Excluir</span>
    `;
    btnExcluir.onclick = () => showConfirmBox(
        "Confirmar Exclusão", 
        `Tem certeza que deseja excluir a tarefa "${tarefa.nome}"?`, 
        () => removerTarefa(tarefa.id, div)
    );

    if (tarefa.prioridade === 'alta') {
        btnExcluir.classList.add("btn-excluir-critico"); 
    }

    const pomodoroElement = document.createElement("span");
    if (!tarefa.arquivada) {
        if (tarefa.pomodorosCompletos > 0) {
            pomodoroElement.className = "pomodoro-counter";
            pomodoroElement.textContent = `Pomodoros: ${tarefa.pomodorosCompletos}`;
        }

        const btnPomodoro = document.createElement("button");
        btnPomodoro.classList.add("pomodoro-button"); 
        btnPomodoro.innerHTML = `
            <span data-lucide="timer" class="lucide-icon"></span>
            <span class="button-text-hidden">Pomodoro Concluído</span>
        `;
        btnPomodoro.onclick = () => {
            showConfirmBox(
                "Marcar Pomodoro",
                `Marcar um Pomodoro concluído para "${tarefa.nome}"?`,
                () => {
                    tarefa.pomodorosCompletos = (tarefa.pomodorosCompletos || 0) + 1;
                    salvarTarefas();
                    renderizarTarefas();
                }
            );
        };
        
        div.appendChild(btnPomodoro);
        if (tarefa.pomodorosCompletos > 0) {
            div.appendChild(pomodoroElement);
        }
    }


    div.appendChild(nomeSpan);
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'task-actions';
    actionsContainer.appendChild(btnConcluirOuDesarquivar);
    actionsContainer.appendChild(btnEditar);
    
    // Reorganiza a adição dos botões e contadores de pomodoro
    const existingBtnPomodoro = div.querySelector('.pomodoro-button');
    if (existingBtnPomodoro) actionsContainer.appendChild(existingBtnPomodoro);
    const existingPomodoroCounterSpan = div.querySelector('.pomodoro-counter');
    if (existingPomodoroCounterSpan) actionsContainer.appendChild(existingPomodoroCounterSpan);

    actionsContainer.appendChild(btnExcluir);
    
    div.appendChild(actionsContainer);

    return div;
}


function removerTarefa(id, element) {
    element.classList.add('hide');

    element.addEventListener('transitionend', function handler() {
        element.remove();
        tarefas = tarefas.filter((t) => t.id !== id);
        cancelarLembrete(id, false);
        salvarTarefas();
        renderizarTarefas();
    });
}

function concluirTarefa(id) {
    const tarefa = tarefas.find((t) => t.id === id);
    if (tarefa && !tarefa.concluida) {
        tarefa.concluida = true;
        tarefa.arquivada = true;
        cancelarLembrete(id, false);
        salvarTarefas();
        renderizarTarefas();
    }
}

function desarquivarTarefa(id) {
    const tarefa = tarefas.find((t) => t.id === id);
    if (tarefa && tarefa.arquivada) {
        tarefa.concluida = false;
        tarefa.arquivada = false;
        salvarTarefas();
        renderizarTarefas();
    }
}



function abrirModalEdicao(id) {
    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa || tarefa.arquivada) {
        showMessageBox("Edição Não Permitida", "Você não pode editar tarefas arquivadas. Por favor, desarquive-a primeiro.");
        return;
    }

    tarefaSendoEditadaId = id;

    editTaskNameInput.value = tarefa.nome;
    editTaskPrioritySelect.value = tarefa.prioridade;
    editTaskCategorySelect.value = tarefa.categoria;

    if (tarefa.lembreteAgendado) {
        const date = new Date(tarefa.lembreteAgendado);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        editTaskReminderDatetimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
        editTaskReminderDatetimeInput.value = "";
    }

    editTaskModal.classList.add("visible");
}

function fecharModalEdicao() {
    editTaskModal.classList.remove("visible");
    tarefaSendoEditadaId = null;
}

cancelEditButton.addEventListener("click", fecharModalEdicao);

editTaskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const tarefa = tarefas.find((t) => t.id === tarefaSendoEditadaId);
    if (!tarefa) return;

    const novoNome = editTaskNameInput.value.trim();
    const novaPrioridade = editTaskPrioritySelect.value;
    const novaCategoria = editTaskCategorySelect.value;
    const novoLembreteDatetime = editTaskReminderDatetimeInput.value;

    if (novoNome === "") {
        showMessageBox("Erro", "O nome da tarefa não pode ser vazio!");
        return;
    }

    tarefa.nome = novoNome;
    tarefa.prioridade = novaPrioridade;
    tarefa.categoria = novaCategoria;

    if (novoLembreteDatetime) {
        const dataLembrete = new Date(novoLembreteDatetime).getTime();
        const agora = Date.now();

        if (dataLembrete <= agora) {
            showMessageBox("Erro de Lembrete", "A data/hora do lembrete deve ser no futuro. Lembrete não agendado.");
            tarefa.lembreteAgendado = null;
            cancelarLembrete(tarefa.id, false);
        } else {
            tarefa.lembreteAgendado = dataLembrete;
            agendarNotificacaoReal(tarefa.id, tarefa.nome, dataLembrete - agora);
        }
    } else {
        tarefa.lembreteAgendado = null;
        cancelarLembrete(tarefa.id, false);
    }

    salvarTarefas();
    renderizarTarefas();
    fecharModalEdicao();
});



function agendarNotificacaoReal(id, nomeTarefa, tempoParaNotificarMs) {
    if (Notification.permission !== "granted") {
        console.warn(`Permissão de notificação não concedida. Não é possível agendar lembrete para ${nomeTarefa}.`);
        return;
    }

    if (notificationTimeouts[id]) {
        clearTimeout(notificationTimeouts[id]);
    }

    notificationTimeouts[id] = setTimeout(() => {
        new Notification("Lembrete de Tarefa", {
            body: `Não se esqueça de: "${nomeTarefa}"`,
            icon: 'icon.png'
        });
        delete notificationTimeouts[id];
        const tarefa = tarefas.find(t => t.id === id);
        if (tarefa) {
            tarefa.lembreteAgendado = null;
            salvarTarefas();
            renderizarTarefas();
        }
    }, tempoParaNotificarMs);

    console.log(`Lembrete agendado para "${nomeTarefa}" em ${tempoParaNotificarMs / 1000} segundos.`);
}


function cancelarLembrete(id, shouldRender = true) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    if (notificationTimeouts[id]) {
        clearTimeout(notificationTimeouts[id]);
        delete notificationTimeouts[id];
        tarefa.lembreteAgendado = null;
        salvarTarefas();
        if (shouldRender) {
            renderizarTarefas();
        }
        console.log(`Lembrete para "${tarefa.nome}" cancelado.`);
    } else {
        console.log("Não há lembrete agendado para esta tarefa.");
    }
}



function downloadFile(filename, text, type) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${type};charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function exportarTarefasTxt() {
    if (tarefas.length === 0) {
        showMessageBox("Aviso", "Não há tarefas para exportar.");
        return;
    }

    let textContent = "Lista de Tarefas:\n\n";
    
    const pendentes = tarefas.filter(t => !t.arquivada);
    const arquivadas = tarefas.filter(t => t.arquivada);

    textContent += "--- Tarefas Pendentes ---\n";
    if (pendentes.length > 0) {
        pendentes.forEach((tarefa, index) => {
            const lembreteInfo = tarefa.lembreteAgendado ?
                ` (Lembrete: ${new Date(tarefa.lembreteAgendado).toLocaleString()})` : '';
            const pomodoroInfo = tarefa.pomodorosCompletos > 0 ?
                ` (Pomodoros: ${tarefa.pomodorosCompletos})` : '';
            textContent += `${index + 1}. [${tarefa.prioridade.toUpperCase()}] [${tarefa.categoria.toUpperCase()}] ${tarefa.nome}${lembreteInfo}${pomodoroInfo}\n`;
        });
    } else {
        textContent += "Nenhuma tarefa pendente.\n";
    }

    textContent += "\n--- Histórico de Tarefas (Concluídas) ---\n";
    if (arquivadas.length > 0) {
        arquivadas.forEach((tarefa, index) => {
            const lembreteInfo = tarefa.lembreteAgendado ?
                ` (Lembrete Original: ${new Date(tarefa.lembreteAgendado).toLocaleString()})` : '';
            const pomodoroInfo = tarefa.pomodorosCompletos > 0 ?
                ` (Pomodoros: ${tarefa.pomodorosCompletos})` : '';
            textContent += `${index + 1}. [CONCLUÍDA] [${tarefa.prioridade.toUpperCase()}] [${tarefa.categoria.toUpperCase()}] ${tarefa.nome}${lembreteInfo}${pomodoroInfo}\n`;
        });
    } else {
        textContent += "Nenhuma tarefa arquivada.\n";
    }

    downloadFile("minhas_tarefas.txt", textContent, "text/plain");
    showMessageBox("Sucesso", "Tarefas exportadas como minhas_tarefas.txt!");
}

function exportarTarefasJson() {
    if (tarefas.length === 0) {
        showMessageBox("Aviso", "Não há tarefas para exportar.");
        return;
    }

    const jsonContent = JSON.stringify(tarefas, null, 2);

    downloadFile("minhas_tarefas.json", jsonContent, "application/json");
    showMessageBox("Sucesso", "Tarefas exportadas como minhas_tarefas.json!");
}




function setupDragAndDrop() { 
    configurarDragAndDropContainers();
}

function configurarDragAndDropContainers() {
    [pendingTasksContainer, archivedTasksContainer].forEach(container => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging');
            if (draggingElement && !container.contains(draggingElement)) {
                 container.classList.add('drag-over-container');
            }
        });

        container.addEventListener('dragleave', (e) => {
            if (!container.contains(e.relatedTarget)) {
                container.classList.remove('drag-over-container');
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over-container');

            const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
            if (isNaN(draggedId)) return;

            const draggedTask = tarefas.find(t => t.id === draggedId);
            if (!draggedTask) return;

            const isArchivedTarget = container.id === 'archived-tasks';

            if (isArchivedTarget && !draggedTask.arquivada) {
                draggedTask.arquivada = true;
                draggedTask.concluida = true;
                cancelarLembrete(draggedId, false);
                salvarTarefas();
                renderizarTarefas();
            } else if (!isArchivedTarget && draggedTask.arquivada) {
                draggedTask.arquivada = false;
                draggedTask.concluida = false;
                salvarTarefas();
                renderizarTarefas();
            } else if (!isArchivedTarget && !draggedTask.arquivada) {
                salvarTarefas();
                renderizarTarefas();
            }
        });
    });
}

function reordenarTarefas(draggedId, targetId, insertAfter) {
    const draggedIndex = tarefas.findIndex(t => t.id === draggedId);
    const targetIndex = tarefas.findIndex(t => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedTask] = tarefas.splice(draggedIndex, 1);

    let insertIndex = targetIndex;
    if (insertAfter) {
        if (draggedIndex < targetIndex) {
            insertIndex = targetIndex;
        } else {
            insertIndex = targetIndex + 1;
        }
    } else {
        if (draggedIndex > targetIndex) {
            insertIndex = targetIndex;
        } else {
            insertIndex = targetIndex;
        }
    }

    tarefas.splice(insertIndex, 0, draggedTask);

    salvarTarefas();
    renderizarTarefas();
}
