document.addEventListener("DOMContentLoaded", () => {
    const daysTag = document.querySelector(".days");
    const currentDateTag = document.querySelector(".current-date");
    const prevNextIcon = document.querySelectorAll(".nav-arrow");
    const noteTitle = document.getElementById("note-title");
    const noteBody = document.getElementById("note-body");
    const modal = document.getElementById("reminder-modal");
    const modalDateTag = document.getElementById("modal-date");
    const reminderText = document.getElementById("reminder-text");
    const closeModalBtn = document.getElementById("close-modal");
    const saveReminderBtn = document.getElementById("save-reminder");
    const deleteReminderBtn = document.getElementById("delete-reminder");

  
    const backButton = document.getElementById("back-button");

    let date = new Date();
    let currYear = date.getFullYear();
    let currMonth = date.getMonth();
    let selectedDateKey = null;

   
    let reminders = JSON.parse(localStorage.getItem("reminders")) || {};

    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
                  "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const renderCalendar = () => {
        let firstDayofMonth = new Date(currYear, currMonth, 1).getDay();
        let lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate();
        let lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay();
        let lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
        let liTag = "";

        for (let i = firstDayofMonth; i > 0; i--) {
            liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
        }

        for (let i = 1; i <= lastDateofMonth; i++) {
            let isToday = i === date.getDate() && currMonth === new Date().getMonth() 
                         && currYear === new Date().getFullYear() ? "active" : "";
            
            const dateKey = `${currYear}-${currMonth + 1}-${i}`;
            let hasReminder = reminders[dateKey] ? "has-reminder" : "";

            liTag += `<li class="${isToday} ${hasReminder}" data-date="${dateKey}">${i}</li>`;
        }

        for (let i = lastDayofMonth; i < 6; i++) {
            liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
        }
        currentDateTag.innerText = `${months[currMonth]} ${currYear}`;
        daysTag.innerHTML = liTag;

      
        addDayClickEvents();
    }

    const addDayClickEvents = () => {
        document.querySelectorAll('.days li:not(.inactive)').forEach(day => {
            day.addEventListener('click', () => {
                selectedDateKey = day.dataset.date;
                const [year, month, dayNum] = selectedDateKey.split('-');
                
             
                noteTitle.innerText = `Lembretes de ${dayNum} de ${months[month - 1]}`;
                noteBody.innerText = reminders[selectedDateKey] || "Nenhum lembrete para este dia. Clique novamente para adicionar um.";

            
                openModal(selectedDateKey);
            });
        });
    }

    const openModal = (dateKey) => {
        const [year, month, day] = dateKey.split('-');
        modalDateTag.innerText = `Data: ${day} de ${months[month - 1]} de ${year}`;
        reminderText.value = reminders[dateKey] || '';
        modal.classList.add('show');
    }

    const closeModal = () => {
        modal.classList.remove('show');
    }

    const saveReminder = () => {
        const text = reminderText.value.trim();
        if (text) {
            reminders[selectedDateKey] = text;
        } else {
          
            delete reminders[selectedDateKey];
        }
        localStorage.setItem("reminders", JSON.stringify(reminders));
        closeModal();
        renderCalendar();
       
        noteBody.innerText = reminders[selectedDateKey] || "Lembrete salvo! Clique em outro dia para ver.";
    }
    
    const deleteReminder = () => {
        delete reminders[selectedDateKey];
        localStorage.setItem("reminders", JSON.stringify(reminders));
        closeModal();
        renderCalendar();
        noteBody.innerText = "Lembrete excluído.";
    }

 
    prevNextIcon.forEach(icon => {
        icon.addEventListener("click", () => {
            currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
            if (currMonth < 0 || currMonth > 11) {
                date = new Date(currYear, currMonth);
                currYear = date.getFullYear();
                currMonth = date.getMonth();
            }
            renderCalendar();
        });
    });

    
    closeModalBtn.addEventListener('click', closeModal);
    saveReminderBtn.addEventListener('click', saveReminder);
    deleteReminderBtn.addEventListener('click', deleteReminder);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    renderCalendar();

    if (backButton) { 
        backButton.addEventListener("click", () => {
            history.back();
        });
    }
});
