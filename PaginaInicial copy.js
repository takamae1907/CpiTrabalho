// Funções auxiliares para substituir alert/confirm (se ainda não as tiver)
function showMessageBox(title, message, callback = () => {}) {
    // Implemente seu modal de mensagem aqui, ou use um polyfill
    // Por enquanto, usaremos console.log para demonstração
    console.log(`[${title}] ${message}`);
    if (callback) callback();
}

// ... (código anterior do PaginaInicial.js) ...

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const cardType = card.dataset.cardType;
            let message = `Você clicou no card: "${cardType}"`;

            if (cardType === 'gestor-tarefas') {
                message += '\nRedirecionando para o Gestor de Tarefas...';
                window.location.href = 'index.html'; // Redireciona para o gestor de tarefas
            } else if (cardType === 'pomodoro') {
                message = 'Você clicou no card Pomodoro!';
                window.location.href = 'pomodoro.html'; // Redireciona para a página do Pomodoro
            } else if (cardType === 'calendar') {
                message = 'Você clicou no card Calendário!';
                window.location.href = 'calendario.html'; // Redireciona para a página do Calendário
            }
            // Adicione mais `else if` para outros tipos de card, se necessário

            showMessageBox("Navegação", message); // Usando a função de modal
        });
    });

    // NOVO: Função para atualizar os contadores de notificação
    function updateNotificationBadges() {
        // Exemplo de dados de notificação (em um cenário real, viriam de uma API ou localStorage)
        const notificationsData = {
            'gestor-tarefas': Math.floor(Math.random() * 10), // Exemplo: 0-9 tarefas novas
            'event-calendar': Math.floor(Math.random() * 5),  // Exemplo: 0-4 eventos novos
            'news': Math.floor(Math.random() * 100),         // Exemplo: 0-99 notícias novas
            'calendar': Math.floor(Math.random() * 7),       // Exemplo: 0-6 lembretes
            'emails': Math.floor(Math.random() * 150),       // Exemplo: 0-149 e-mails
            'contacts': Math.floor(Math.random() * 3)        // Exemplo: 0-2 novos contatos
        };

        document.querySelectorAll('.notification-badge').forEach(badge => {
            const cardTarget = badge.dataset.cardTarget;
            let count = notificationsData[cardTarget] || 0;

            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count; // Exibe '99+' se for maior que 99
                badge.classList.add('visible'); // Torna o badge visível
            } else {
                badge.textContent = '0'; // Ou você pode deixar vazio se preferir
                badge.classList.remove('visible'); // Esconde o badge se não houver notificações
            }
        });
    }

    // Chama a função para atualizar os badges quando a página carregar
    updateNotificationBadges();

    // Opcional: Atualiza os badges a cada X segundos para simular novas notificações
    // setInterval(updateNotificationBadges, 5000); // Atualiza a cada 5 segundos
});