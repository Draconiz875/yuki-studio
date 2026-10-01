let contadorAtendente = 0;


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

    const input =
        document.getElementById("messageInput");

    const texto = input.value.trim();

    if (texto === "") {
        return;
    }


    const messages =
        document.getElementById("messages");


    /* MENSAGEM DO USUÁRIO */

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "message user";

    userMessage.textContent =
        texto;

    messages.appendChild(userMessage);

    input.value = "";

    messages.scrollTop =
        messages.scrollHeight;


    /* ESCOLHE O ATENDENTE */

    const atendente =
        contadorAtendente % 2 === 0
            ? "atendente1.png"
            : "atendente2.png";


    contadorAtendente++;


    /* RESPOSTA DO SUPORTE */

    setTimeout(function () {

        const supportMessage =
            document.createElement("div");

        supportMessage.className =
            "message support";


        supportMessage.innerHTML = `

            <div class="support-profile">

                <img
                    src="./${atendente}"
                    alt="Atendente"
                >

                <div>

                    <strong>Yuki Support</strong>

                    <span>
                        🟢 Atendente online
                    </span>

                </div>

            </div>

            <div class="support-text">

                Obrigado pela mensagem! 😊

                <br><br>

                Um de nossos atendentes
                está analisando sua solicitação
                e vai ajudar você em breve.

            </div>

        `;


        messages.appendChild(
            supportMessage
        );


        messages.scrollTop =
            messages.scrollHeight;


    }, 1000);
}


function verificarEnter(event) {

    if (event.key === "Enter") {

        enviarMensagem();

    }
}
