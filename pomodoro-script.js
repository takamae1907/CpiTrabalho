// --- Variáveis Globais para o Timer Pomodoro ---
const TEMPO_FOCU_MINUTOS = 25;
const TEMPO_PAUSA_CURTA_MINUTOS = 5;
const TEMPO_PAUSA_LONGA_MINUTOS = 15; 
const POMODOROS_PARA_PAUSA_LONGA = 4;

let pomodoroInterval;
let tempoRestanteSegundos;
let fasePomodoro = 'foco'; 
let pomodorosCompletosNestaSessao = 0; 
let isPaused = false;
const themeToggleBtn = document.getElementById("theme-toggle");
const pomodoroDisplay = document.getElementById("pomodoro-display");
const pomodoroStartButton = document.getElementById("pomodoro-start-button");
const pomodoroPauseResumeButton = document.getElementById("pomodoro-pause-resume-button");
const pomodoroResetButton = document.getElementById("pomodoro-reset-button");
const currentPomodoroTaskInfo = document.getElementById("current-pomodoro-task-info");
const pomodorosCountInfo = document.getElementById("pomodoros-count-info");


const backButton = document.getElementById("back-button");

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



function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
}

function updatePomodoroDisplay() {
    pomodoroDisplay.textContent = formatarTempo(tempoRestanteSegundos);
    document.title = `${formatarTempo(tempoRestanteSegundos)} - Pomodoro`;
    
   
    if (pomodoroInterval) { 
        pomodoroStartButton.disabled = true;
        pomodoroPauseResumeButton.innerHTML = `
            <span data-lucide="pause-circle" class="lucide-icon"></span>
            <span class="button-text-hidden">Pausar</span>
        `;
        pomodoroPauseResumeButton.disabled = false;
        document.body.classList.add('pomodoro-active');
    } else { 
        pomodoroStartButton.disabled = isPaused; 
        pomodoroPauseResumeButton.innerHTML = `
            <span data-lucide="play-circle" class="lucide-icon"></span>
            <span class="button-text-hidden">Retomar</span>
        `;
        pomodoroPauseResumeButton.disabled = !isPaused; 
        document.body.classList.remove('pomodoro-active');
    }

    if (tempoRestanteSegundos === TEMPO_FOCU_MINUTOS * 60 && !pomodoroInterval && !isPaused) {
       
        currentPomodoroTaskInfo.classList.add('hidden');
        pomodoroStartButton.disabled = false;
        pomodoroPauseResumeButton.disabled = true;
    } else {
        currentPomodoroTaskInfo.classList.remove('hidden');
        currentPomodoroTaskInfo.textContent = `Fase: ${fasePomodoro === 'foco' ? 'Foco' : fasePomodoro === 'pausa-curta' ? 'Pausa Curta' : 'Pausa Longa'}`;
    }

    pomodorosCountInfo.textContent = `Pomodoros Completos: ${pomodorosCompletosNestaSessao}`;
    pomodorosCountInfo.classList.remove('hidden');

   
    lucide.createIcons();
}

function iniciarPomodoro() {
    if (pomodoroInterval) { 
        console.warn("Pomodoro já está ativo.");
        return;
    }
    
    
    if (tempoRestanteSegundos === undefined || tempoRestanteSegundos <= 0 || isPaused === false) {
        tempoRestanteSegundos = TEMPO_FOCU_MINUTOS * 60;
        fasePomodoro = 'foco';
        isPaused = false; 
    }
    
    pomodoroInterval = setInterval(contarPomodoro, 1000);
    console.log(`Pomodoro iniciado. Fase: ${fasePomodoro}`);
    updatePomodoroDisplay();
}

function contarPomodoro() {
    tempoRestanteSegundos--;

    if (tempoRestanteSegundos <= 0) {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        isPaused = false;
        
        let notificationTitle = "";
        let notificationBody = "";
        let nextPhase = "";

        if (fasePomodoro === 'foco') {
            pomodorosCompletosNestaSessao++;

            notificationTitle = "Pomodoro Concluído!";
            notificationBody = `Hora de uma pausa! Você completou ${pomodorosCompletosNestaSessao} Pomodoros nesta sessão.`;
 
            new Audio('bell.mp3').play().catch(e => console.error("Erro ao tocar áudio:", e));

            if (pomodorosCompletosNestaSessao % POMODOROS_PARA_PAUSA_LONGA === 0) {
                tempoRestanteSegundos = TEMPO_PAUSA_LONGA_MINUTOS * 60;
                nextPhase = 'pausa-longa';
                notificationTitle = "Pausa Longa!";
                notificationBody = "Você merece um descanso mais longo!";
            } else {
                tempoRestanteSegundos = TEMPO_PAUSA_CURTA_MINUTOS * 60;
                nextPhase = 'pausa-curta';
                notificationTitle = "Pausa Curta!";
                notificationBody = "Descanse um pouco antes de voltar!";
            }
        } else { 
            notificationTitle = "Pausa Terminada!";
            notificationBody = "Hora de voltar ao foco!";
           
            new Audio('bell.mp3').play().catch(e => console.error("Erro ao tocar áudio:", e));
            
            tempoRestanteSegundos = TEMPO_FOCU_MINUTOS * 60;
            nextPhase = 'foco';
           
            if (fasePomodoro === 'pausa-longa') {
                pomodorosCompletosNestaSessao = 0;
            }
        }
        
        fasePomodoro = nextPhase;
        new Notification(notificationTitle, { body: notificationBody, icon: 'icon.png' });
        
  
        iniciarPomodoro();
    }
    updatePomodoroDisplay();
}

function togglePomodoroPauseResume() {
    if (pomodoroInterval) { 
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        isPaused = true;
        console.log(`Pomodoro Pausado. Tempo restante: ${formatarTempo(tempoRestanteSegundos)}`);
    } else { 
        if (isPaused && tempoRestanteSegundos > 0) {
            pomodoroInterval = setInterval(contarPomodoro, 1000);
            isPaused = false;
            console.log(`Pomodoro Retomado. Tempo restante: ${formatarTempo(tempoRestanteSegundos)}`);
        } else {
            
            iniciarPomodoro();
            return;
        }
    }
    updatePomodoroDisplay();
}

function resetPomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    tempoRestanteSegundos = TEMPO_FOCU_MINUTOS * 60;
    fasePomodoro = 'foco';
    pomodorosCompletosNestaSessao = 0;
    isPaused = false; 
    updatePomodoroDisplay();
    console.log("Pomodoro Resetado.");
}



pomodoroStartButton.addEventListener("click", iniciarPomodoro);
pomodoroPauseResumeButton.addEventListener("click", togglePomodoroPauseResume);
pomodoroResetButton.addEventListener("click", resetPomodoro);

document.addEventListener("DOMContentLoaded", () => {
    tempoRestanteSegundos = TEMPO_FOCU_MINUTOS * 60; 
    updatePomodoroDisplay();
    solicitarPermissaoNotificacao(); 

    if (backButton) {
        backButton.addEventListener("click", () => {
            history.back(); 
        });
    }
});
