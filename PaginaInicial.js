document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');

    // Função para atualizar os badges de notificação (exemplo)
    function updateNotificationBadge(cardType, count) {
        const badge = document.querySelector(`.notification-badge[data-card-target="${cardType}"]`);
        if (badge) {
            badge.textContent = count;
            if (count > 0) {
                badge.classList.add('visible');
            } else {
                badge.classList.remove('visible');
            }
        }
    }

    // Exemplo de como usar a função (você chamaria isso de onde suas notificações vêm)
    // updateNotificationBadge('gestor-tarefas', 5);
    // updateNotificationBadge('music', 2);
    // updateNotificationBadge('news', 0); // Remove o badge se for 0
});