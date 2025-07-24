function showMessageBox(title, message, callback = () => {}) {
    console.log(`[${title}] ${message}`);
    if (callback) callback();
}

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const cardType = card.dataset.cardType;
            let message = `Você clicou no card: "${cardType}"`;

            if (cardType === 'gestor-tarefas') {
                message += '\nRedirecionando para o Gestor de Tarefas...';
                window.location.href = 'index.html';
            } else if (cardType === 'pomodoro') {
                message = 'Você clicou no card Pomodoro!';
                window.location.href = 'pomodoro.html';
            } else if (cardType === 'calendar') {
                message = 'Você clicou no card Calendário!';
                window.location.href = 'calendario.html';
            }

            showMessageBox("Navegação", message);
        });
    });

    function updateNotificationBadges() {
        const notificationsData = {
            'gestor-tarefas': Math.floor(Math.random() * 10),
            'event-calendar': Math.floor(Math.random() * 5),
            'news': Math.floor(Math.random() * 100),
            'calendar': Math.floor(Math.random() * 7),
            'emails': Math.floor(Math.random() * 150),
            'contacts': Math.floor(Math.random() * 3)
        };

        document.querySelectorAll('.notification-badge').forEach(badge => {
            const cardTarget = badge.dataset.cardTarget;
            let count = notificationsData[cardTarget] || 0;

            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.add('visible');
            } else {
                badge.textContent = '0';
                badge.classList.remove('visible');
            }
        });
    }

    updateNotificationBadges();
});