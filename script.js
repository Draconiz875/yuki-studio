/* ================================= */
/* CONFIGURAÇÃO DO ATENDIMENTO       */
/* ================================= */

let atendenteAtual = 1;


/*
    FALSE = atendimento acontecendo
    TRUE  = atendimento encerrado
*/

let atendimentoEncerrado = false;



/* ================================= */
/* ABRIR CHAT                         */
/* ================================= */

function abrirChat() {

    const chat =
        document.getElementById("chatWindow");

    chat.style.display = "flex";


    const botao =
        document.getElementById("chatButton");

    botao.style.display = "none";


    document
        .getElementById("messageInput")
        .focus();

}



/* ================================= */
/* FECHAR CHAT                        */
/* ================================= */

function fecharChat() {

    const chat =
        document.getElementById("chatWindow");

    chat.style.display = "none";


    const botao =
        document.getElementById("chatButton");

    botao.style.display = "block";

}



/* ================================= */
/* ENVIAR MENSAGEM                   */
/* ================================= */

function enviarMensagem() {

    const input =
        document.getElementById("messageInput");


    const texto =
        input.value.trim();


    if (texto === "") {

        return;

    }



    const messages =
        document.getElementById("messages");



    /* ============================== */
    /* MENSAGEM DO USUÁRIO             */
    /* ============================== */

    const userMessage =
        document.createElement("div");


    userMessage.className =
        "message user";


    userMessage.textContent =
        texto;


    messages.appendChild(
        userMessage
    );


    input.value = "";


    messages.scrollTop =
        messages.scrollHeight;



    /* ============================== */
    /* RESPOSTA DO ATENDENTE           */
    /* ============================== */

    setTimeout(function () {


        const supportMessage =
            document.createElement("div");


        supportMessage.className =
            "message support";



        /* ATENDENTE ATUAL */

        const foto =
            atendenteAtual === 1
                ? "atendente1.png"
                : "atendente2.png";



        supportMessage.innerHTML = `

            <div class="support-profile">

                <img
                    src="./${foto}"
                    alt="Atendente"
                >

                <div>

                    <strong>
                        Yuki Support
                    </strong>

                    <span>
                        🟢 Atendente online
                    </span>

                </div>

            </div>


            <div class="support-text">

                Obrigado pela mensagem! 😊

                <br><br>

                Estou analisando sua solicitação
                e vou ajudar você.

            </div>

        `;



        messages.appendChild(
            supportMessage
        );


        messages.scrollTop =
            messages.scrollHeight;



    }, 1000);

}



/* ================================= */
/* ENCERRAR ATENDIMENTO              */
/* ================================= */

function encerrarAtendimento() {


    const messages =
        document.getElementById("messages");



    /* MENSAGEM DE ENCERRAMENTO */

    const encerramento =
        document.createElement("div");


    encerramento.className =
        "message support";


    encerramento.innerHTML = `

        <div class="support-text">

            ✅ Atendimento encerrado.

            <br><br>

            Obrigado por entrar em contato
            com a Yuki Studio!

        </div>

    `;


    messages.appendChild(
        encerramento
    );


    messages.scrollTop =
        messages.scrollHeight;



    /*
        Só agora o próximo atendimento
        poderá usar outro atendente.
    */

    atendimentoEncerrado = true;



    /*
        Troca o atendente para o
        próximo atendimento.
    */

    if (atendenteAtual === 1) {

        atendenteAtual = 2;

    } else {

        atendenteAtual = 1;

    }


}



/* ================================= */
/* WHATSAPP                          */
/* ================================= */

function abrirWhatsApp() {


    /*
        TROQUE PELO NÚMERO REAL.

        Formato:

        55 + DDD + número

        Exemplo:
        5511999999999
    */


    const numero =
        "551193349778";


    const mensagem =
        "Olá! Vim pelo site da Yuki Studio e gostaria de falar com um atendente.";


    const url =
        "https://wa.me/"
        + numero
        + "?text="
        + encodeURIComponent(mensagem);


    window.open(
        url,
        "_blank"
    );

}



/* ================================= */
/* ENTER                             */
/* ================================= */

function verificarEnter(event) {

    if (event.key === "Enter") {

        enviarMensagem();

    }

}
