const SUPABASE_URL = "https://moaeniuahyipcklspjbs.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_DZ_bN0dLHYZ9LbBJR5vB7Q_viUUgnvQ";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================
   VARIÁVEIS
========================================= */

let clienteUID = null;
let atendimentoAtual = null;
let canalMensagens = null;

let atendenteAtual = 1;
let atendimentoEncerrado = false;


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarChat
);


async function iniciarChat() {

    try {

        const {
            data: sessaoAtual
        } = await db.auth.getSession();


        if (sessaoAtual.session) {

            clienteUID =
                sessaoAtual.session.user.id;

        } else {

            const {
                data,
                error
            } = await db.auth.signInAnonymously();


            if (error) {

                console.error(
                    "Erro ao criar sessão:",
                    error
                );

                return;

            }


            clienteUID =
                data.user.id;

        }


        console.log(
            "Cliente conectado:",
            clienteUID
        );


        await recuperarAtendimento();


    } catch (erro) {

        console.error(
            "Erro de conexão:",
            erro
        );

    }

}


/* =========================================
   RECUPERAR ATENDIMENTO
========================================= */

async function recuperarAtendimento() {

    if (!clienteUID) return;


    const {
        data,
        error
    } = await db

        .from("atendimentos")

        .select("*")

        .eq(
            "cliente_uid",
            clienteUID
        )

        .neq(
            "status",
            "encerrado"
        )

        .order(
            "criado_em",
            {
                ascending: false
            }
        )

        .limit(1);


    if (error) {

        console.error(
            "Erro ao recuperar atendimento:",
            error
        );

        return;

    }


    if (data && data.length > 0) {

        atendimentoAtual =
            data[0];

        atendimentoEncerrado = false;


        definirAtendenteVisual(
            atendimentoAtual.atendente
        );


        iniciarRealtime();

        await carregarHistorico();

    }

}


/* =========================================
   DEFINIR ATENDENTE VISUAL
========================================= */

function definirAtendenteVisual(
    nomeAtendente
) {

    if (
        nomeAtendente ===
        "Atendente 2"
    ) {

        atendenteAtual = 2;

    } else {

        atendenteAtual = 1;

    }

}


/* =========================================
   ABRIR CHAT
========================================= */

function abrirChat() {

    const chat =
        document.getElementById(
            "chatWindow"
        );


    chat.style.display = "flex";


    const botao =
        document.getElementById(
            "chatButton"
        );


    botao.style.display = "none";


    const input =
        document.getElementById(
            "messageInput"
        );


    input.focus();


    if (
        !atendimentoAtual &&
        !atendimentoEncerrado
    ) {

        prepararNovoAtendimento();

    }

}


/* =========================================
   FECHAR CHAT
========================================= */

function fecharChat() {

    document.getElementById(
        "chatWindow"
    ).style.display = "none";


    document.getElementById(
        "chatButton"
    ).style.display = "block";

}


/* =========================================
   PREPARAR NOVO ATENDIMENTO
========================================= */

function prepararNovoAtendimento() {

    atendimentoEncerrado = false;


    const input =
        document.getElementById(
            "messageInput"
        );


    const botaoEnviar =
        document.querySelector(
            ".chat-input button"
        );


    input.disabled = false;

    botaoEnviar.disabled = false;


    const messages =
        document.getElementById(
            "messages"
        );


    messages.innerHTML = `

        <div class="message support">

            <div class="support-profile">

                <img
                    src="./atendente1.png"
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

                Olá! 👋

                <br><br>

                Seja bem-vindo ao suporte
                da Yuki Studio.

                <br><br>

                Como podemos ajudar?

            </div>

        </div>

    `;


    const novo =
        document.getElementById(
            "novoAtendimentoButton"
        );


    if (novo) {

        novo.remove();

    }

}


/* =========================================
   CRIAR ATENDIMENTO
========================================= */

async function criarAtendimento() {

    if (!clienteUID) {

        alert(
            "Aguarde alguns segundos enquanto conectamos ao suporte."
        );

        return null;

    }


    /*
       O atendente NÃO é escolhido pelo navegador.

       O banco de dados possui um trigger que
       define automaticamente Atendente 1 ou 2.
    */

    const {
        data,
        error
    } = await db

        .from("atendimentos")

        .insert({

            cliente_id:
                clienteUID,

            cliente_uid:
                clienteUID,

            cliente_nome:
                "Cliente",

            status:
                "aguardando"

        })

        .select()

        .single();


    if (error) {

        console.error(
            "Erro ao criar atendimento:",
            error
        );

        alert(
            "Não foi possível iniciar o atendimento."
        );

        return null;

    }


    atendimentoAtual =
        data;


    atendimentoEncerrado =
        false;


    /*
       O banco decidiu qual atendente foi
       responsável pela conversa.
    */

    definirAtendenteVisual(
        data.atendente
    );


    iniciarRealtime();


    return data;

}


/* =========================================
   REALTIME
========================================= */

function iniciarRealtime() {

    if (!atendimentoAtual) return;


    if (canalMensagens) {

        db.removeChannel(
            canalMensagens
        );

    }


    canalMensagens =

        db

            .channel(
                "chat-" +
                atendimentoAtual.id
            )

            .on(

                "postgres_changes",

                {

                    event:
                        "INSERT",

                    schema:
                        "public",

                    table:
                        "mensagens",

                    filter:
                        "atendimento_id=eq." +
                        atendimentoAtual.id

                },

                function (payload) {

                    receberMensagem(
                        payload.new
                    );

                }

            )

            .subscribe();

}


/* =========================================
   ENVIAR MENSAGEM
========================================= */

async function enviarMensagem() {

    if (atendimentoEncerrado) {

        return;

    }


    const input =
        document.getElementById(
            "messageInput"
        );


    const texto =
        input.value.trim();


    if (texto === "") {

        return;

    }


    if (!atendimentoAtual) {

        const atendimento =
            await criarAtendimento();


        if (!atendimento) {

            return;

        }

    }


    input.value = "";


    /*
       Mostra imediatamente a mensagem
       no lado do cliente.
    */

    mostrarMensagemCliente(
        texto
    );


    const {
        error
    } = await db

        .from("mensagens")

        .insert({

            atendimento_id:
                atendimentoAtual.id,

            remetente:
                "cliente",

            mensagem:
                texto

        });


    if (error) {

        console.error(
            "Erro ao enviar mensagem:",
            error
        );


        input.value =
            texto;

        return;

    }

}


/* =========================================
   RECEBER MENSAGEM
========================================= */

function receberMensagem(
    mensagem
) {

    /*
       Não mostra novamente a mensagem
       que foi enviada pelo próprio cliente.
    */

    if (
        mensagem.remetente ===
        "cliente"
    ) {

        return;

    }


    mostrarMensagemAtendente(
        mensagem.mensagem
    );

}


/* =========================================
   MENSAGEM DO CLIENTE
========================================= */

function mostrarMensagemCliente(
    texto
) {

    const messages =
        document.getElementById(
            "messages"
        );


    const mensagem =
        document.createElement(
            "div"
        );


    mensagem.className =
        "message user";


    mensagem.textContent =
        texto;


    messages.appendChild(
        mensagem
    );


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================
   MENSAGEM DO ATENDENTE
========================================= */

function mostrarMensagemAtendente(
    texto
) {

    const messages =
        document.getElementById(
            "messages"
        );


    const mensagem =
        document.createElement(
            "div"
        );


    mensagem.className =
        "message support";


    const foto =
        atendenteAtual === 2
            ? "atendente2.png"
            : "atendente1.png";


    mensagem.innerHTML = `

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

            ${escaparHTML(texto)}

        </div>

    `;


    messages.appendChild(
        mensagem
    );


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================
   ENCERRAR ATENDIMENTO
========================================= */

async function encerrarAtendimento() {

    if (
        !atendimentoAtual ||
        atendimentoEncerrado
    ) {

        return;

    }


    atendimentoEncerrado = true;


    const {
        error
    } = await db

        .from("atendimentos")

        .update({

            status:
                "encerrado",

            encerrado_em:
                new Date().toISOString()

        })

        .eq(
            "id",
            atendimentoAtual.id
        );


    if (error) {

        console.error(
            "Erro ao encerrar:",
            error
        );

    }


    mostrarMensagemAtendente(
        "✅ Atendimento encerrado.\n\nObrigado por entrar em contato com a Yuki Studio!"
    );


    const input =
        document.getElementById(
            "messageInput"
        );


    const botaoEnviar =
        document.querySelector(
            ".chat-input button"
        );


    input.disabled = true;

    botaoEnviar.disabled = true;


    if (canalMensagens) {

        await db.removeChannel(
            canalMensagens
        );

        canalMensagens = null;

    }


    atendimentoAtual =
        null;


    criarBotaoNovoAtendimento();

}


/* =========================================
   NOVO ATENDIMENTO
========================================= */

function criarBotaoNovoAtendimento() {

    if (
        document.getElementById(
            "novoAtendimentoButton"
        )
    ) {

        return;

    }


    const actions =
        document.querySelector(
            ".chat-actions"
        );


    if (!actions) {

        return;

    }


    const botao =
        document.createElement(
            "button"
        );


    botao.id =
        "novoAtendimentoButton";


    botao.className =
        "encerrar-button";


    botao.textContent =
        "💬 Iniciar novo atendimento";


    botao.onclick =
        function () {

            prepararNovoAtendimento();

        };


    actions.appendChild(
        botao
    );

}


/* =========================================
   WHATSAPP
========================================= */

function abrirWhatsApp() {

    const numero =
        "5511933497788";


    const mensagem =
        "Olá! Vim pelo site da Yuki Studio e gostaria de falar com um atendente.";


    const url =
        "https://wa.me/" +
        numero +
        "?text=" +
        encodeURIComponent(
            mensagem
        );


    window.open(
        url,
        "_blank"
    );

}


/* =========================================
   ENTER
========================================= */

function verificarEnter(
    event
) {

    if (
        event.key ===
        "Enter"
    ) {

        event.preventDefault();

        enviarMensagem();

    }

}


/* =========================================
   SEGURANÇA HTML
========================================= */

function escaparHTML(
    texto
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML
        .replace(
            /\n/g,
            "<br>"
        );

}


/* =========================================
   HISTÓRICO
========================================= */

async function carregarHistorico() {

    if (!atendimentoAtual) {

        return;

    }


    const {
        data,
        error
    } = await db

        .from("mensagens")

        .select("*")

        .eq(
            "atendimento_id",
            atendimentoAtual.id
        )

        .order(
            "criado_em",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Erro ao carregar histórico:",
            error
        );

        return;

    }


    for (
        const mensagem of data
    ) {

        if (
            mensagem.remetente ===
            "cliente"
        ) {

            mostrarMensagemCliente(
                mensagem.mensagem
            );

        } else {

            mostrarMensagemAtendente(
                mensagem.mensagem
            );

        }

    }

}
