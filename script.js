function abrirChat() {
    const chat = document.getElementById("chatWindow");
    chat.style.display = "flex";
}

function fecharChat() {
    const chat = document.getElementById("chatWindow");
    chat.style.display = "none";
}

function enviarMensagem() {
    const input = document.getElementById("messageInput");
    const texto = input.value.trim();

    if (texto === "") {
        return;
    }

    const messages = document.getElementById("messages");

    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = texto;

    messages.appendChild(userMessage);

    input.value = "";

    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
        const supportMessage = document.createElement("div");

        supportMessage.className = "message support";

        supportMessage.textContent =
            "Obrigado pela mensagem! Um atendente poderá responder você em breve. 😊";

        messages.appendChild(supportMessage);

        messages.scrollTop = messages.scrollHeight;

    }, 1000);
}

function verificarEnter(event) {
    if (event.key === "Enter") {
        enviarMensagem();
    }
}
