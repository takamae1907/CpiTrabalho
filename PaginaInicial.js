document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');

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


});