function abrirChat() {

    const chat = document.getElementById("chatWindow");

    chat.style.display = "flex";

    const botao = document.getElementById("chatButton");

    botao.style.display = "none";

    document.getElementById("messageInput").focus();
}


function fecharChat() {

    const chat = document.getElementById("chatWindow");

    chat.style.display = "none";

    const botao = document.getElementById("chatButton");

    botao.style.display = "block";
}


function enviarMensagem() {

    const input = document.getElementById("messageInput");

    const texto = input.value.trim();

    if (texto === "") {
        return;
    }


    const messages = document.getElementById("messages");


    /* MENSAGEM DO USUÁRIO */

    const userMessage = document.createElement("div");

    userMessage.className = "message user";

    userMessage.textContent = texto;

    messages.appendChild(userMessage);


    input.value = "";

    messages.scrollTop = messages.scrollHeight;


    /* RESPOSTA AUTOMÁTICA */

    setTimeout(function () {

        const supportMessage =
            document.createElement("div");

        supportMessage.className =
            "message support";

        supportMessage.textContent =
            "Obrigado pela mensagem! 😊 Um atendente poderá responder você em breve.";

        messages.appendChild(supportMessage);

        messages.scrollTop =
            messages.scrollHeight;

    }, 1000);
}


function verificarEnter(event) {

    if (event.key === "Enter") {

        enviarMensagem();

    }
}
