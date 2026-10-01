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
let clienteUsuario = null;

let atendimentoAtual = null;
let canalMensagens = null;

let atendenteAtual = 1;
let atendimentoEncerrado = false;


/* =========================================
   INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarSistema
);


async function iniciarSistema() {

    try {

        const {
            data,
            error
        } = await db.auth.getSession();


        if (error) {

            console.error(
                "Erro ao verificar sessão:",
                error
            );

            return;

        }


        if (data.session) {

            clienteUID =
                data.session.user.id;


            await carregarPerfilCliente();

            await recuperarAtendimento();

        }


        atualizarInterfaceConta();


    } catch (erro) {

        console.error(
            "Erro de inicialização:",
            erro
        );

    }

}


/* =========================================
   PERFIL DO CLIENTE
========================================= */

async function carregarPerfilCliente() {

    if (!clienteUID) {

        return;

    }


    const {
        data,
        error
    } = await db

        .from("clientes")

        .select("*")

        .eq(
            "auth_user_id",
            clienteUID
        )

        .maybeSingle();


    if (error) {

        console.error(
            "Erro ao carregar perfil:",
            error
        );

        return;

    }


    if (data) {

        clienteUsuario =
            data.usuario;

    }

}


/* =========================================
   INTERFACE DA CONTA
========================================= */

function atualizarInterfaceConta() {

    const loginButton =
        document.getElementById(
            "loginButton"
        );


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!loginButton || !logoutButton) {

        return;

    }


    if (clienteUID) {

        loginButton.textContent =
            "👤 " +
            (clienteUsuario || "Minha conta");


        loginButton.onclick =
            function () {

                mostrarInformacoesConta();

            };


        logoutButton.style.display =
            "block";


    } else {

        loginButton.textContent =
            "👤 Entrar";


        loginButton.onclick =
            function () {

                abrirLogin();

            };


        logoutButton.style.display =
            "none";

    }

}


/* =========================================
   ABRIR LOGIN
========================================= */

function abrirLogin() {

    const modal =
        document.getElementById(
            "authModal"
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "flex";


    mostrarLogin();


    const campo =
        document.getElementById(
            "loginUsuario"
        );


    if (campo) {

        campo.focus();

    }

}


/* =========================================
   FECHAR LOGIN
========================================= */

function fecharLogin() {

    const modal =
        document.getElementById(
            "authModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    limparMensagemAuth();

}


/* =========================================
   MOSTRAR LOGIN
========================================= */

function mostrarLogin() {

    const login =
        document.getElementById(
            "loginForm"
        );


    const cadastro =
        document.getElementById(
            "cadastroForm"
        );


    if (login) {

        login.style.display =
            "block";

    }


    if (cadastro) {

        cadastro.style.display =
            "none";

    }


    limparMensagemAuth();

}


/* =========================================
   MOSTRAR CADASTRO
========================================= */

function mostrarCadastro() {

    const login =
        document.getElementById(
            "loginForm"
        );


    const cadastro =
        document.getElementById(
            "cadastroForm"
        );


    if (login) {

        login.style.display =
            "none";

    }


    if (cadastro) {

        cadastro.style.display =
            "block";

    }


    limparMensagemAuth();


    const campo =
        document.getElementById(
            "cadastroUsuario"
        );


    if (campo) {

        campo.focus();

    }

}


/* =========================================
   MENSAGEM DO LOGIN
========================================= */

function mostrarMensagemAuth(
    mensagem,
    sucesso = false
) {

    const elemento =
        document.getElementById(
            "authMensagem"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        mensagem;


    elemento.style.display =
        "block";


    if (sucesso) {

        elemento.style.color =
            "#69ff9b";

    } else {

        elemento.style.color =
            "#ff7070";

    }

}


/* =========================================
   LIMPAR MENSAGEM
========================================= */

function limparMensagemAuth() {

    const elemento =
        document.getElementById(
            "authMensagem"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent = "";

    elemento.style.display =
        "none";

}


/* =========================================
   VALIDAR USUÁRIO
========================================= */

function validarUsuario(
    usuario
) {

    if (!usuario) {

        return false;

    }


    /*
       Permitimos apenas:

       letras
       números
       _
       -
       .
    */

    return /^[a-zA-Z0-9_.-]{3,20}$/
        .test(usuario);

}


/* =========================================
   EMAIL INTERNO
========================================= */

function gerarEmailInterno(
    usuario
) {

    return (
        usuario.toLowerCase() +
        "@yukistudio.local"
    );

}


/* =========================================
   CRIAR CONTA
========================================= */

async function criarConta() {

    limparMensagemAuth();


    const usuarioInput =
        document.getElementById(
            "cadastroUsuario"
        );


    const senhaInput =
        document.getElementById(
            "cadastroSenha"
        );


    const confirmarInput =
        document.getElementById(
            "cadastroConfirmarSenha"
        );


    const usuario =
        usuarioInput.value.trim();


    const senha =
        senhaInput.value;


    const confirmarSenha =
        confirmarInput.value;


    if (!validarUsuario(usuario)) {

        mostrarMensagemAuth(
            "O usuário deve ter de 3 a 20 caracteres e usar apenas letras, números, ponto, hífen ou _."
        );

        return;

    }


    if (senha.length < 6) {

        mostrarMensagemAuth(
            "A senha precisa ter pelo menos 6 caracteres."
        );

        return;

    }


    if (senha !== confirmarSenha) {

        mostrarMensagemAuth(
            "As senhas não são iguais."
        );

        return;

    }


    const emailInterno =
        gerarEmailInterno(
            usuario
        );


    mostrarMensagemAuth(
        "Criando sua conta...",
        true
    );


    try {

        /*
           O cliente não vê esse e-mail.

           Ele é usado internamente pelo
           sistema de autenticação do Supabase.
        */

        const {
            data,
            error
        } = await db.auth.signUp({

            email:
                emailInterno,

            password:
                senha

        });


        if (error) {

            console.error(
                "Erro no cadastro:",
                error
            );


            if (
                error.message
                    .toLowerCase()
                    .includes("already registered")
            ) {

                mostrarMensagemAuth(
                    "Esse usuário já está cadastrado."
                );

            } else {

                mostrarMensagemAuth(
                    "Não foi possível criar a conta: " +
                    error.message
                );

            }

            return;

        }


        if (
            !data.user
        ) {

            mostrarMensagemAuth(
                "Não foi possível criar o usuário."
            );

            return;

        }


        /*
           O Confirm email foi desativado,
           então esperamos receber uma sessão.
        */

        if (!data.session) {

            mostrarMensagemAuth(
                "A conta foi criada, mas não foi possível iniciar a sessão automaticamente."
            );

            return;

        }


        clienteUID =
            data.user.id;


        clienteUsuario =
            usuario;


        /*
           Salva o perfil na tabela clientes.
        */

        const {
            error:
                perfilError
        } = await db

            .from("clientes")

            .insert({

                auth_user_id:
                    clienteUID,

                usuario:
                    usuario.toLowerCase()

            });


        if (perfilError) {

            console.error(
                "Erro ao criar perfil:",
                perfilError
            );


            await db.auth.signOut();


            clienteUID =
                null;

            clienteUsuario =
                null;


            if (
                perfilError.code ===
                "23505"
            ) {

                mostrarMensagemAuth(
                    "Esse usuário já está cadastrado."
                );

            } else {

                mostrarMensagemAuth(
                    "A conta foi criada, mas ocorreu um erro ao salvar o perfil."
                );

            }

            return;

        }


        atualizarInterfaceConta();


        mostrarMensagemAuth(
            "Conta criada com sucesso! 🎉",
            true
        );


        setTimeout(
            function () {

                fecharLogin();

                abrirChat();

            },
            800
        );


    } catch (erro) {

        console.error(
            "Erro inesperado:",
            erro
        );


        mostrarMensagemAuth(
            "Ocorreu um erro ao criar a conta."
        );

    }

}


/* =========================================
   LOGIN
========================================= */

async function fazerLogin() {

    limparMensagemAuth();


    const usuarioInput =
        document.getElementById(
            "loginUsuario"
        );


    const senhaInput =
        document.getElementById(
            "loginSenha"
        );


    const usuario =
        usuarioInput.value.trim();


    const senha =
        senhaInput.value;


    if (!validarUsuario(usuario)) {

        mostrarMensagemAuth(
            "Digite um usuário válido."
        );

        return;

    }


    if (!senha) {

        mostrarMensagemAuth(
            "Digite sua senha."
        );

        return;

    }


    const emailInterno =
        gerarEmailInterno(
            usuario
        );


    mostrarMensagemAuth(
        "Entrando...",
        true
    );


    try {

        const {
            data,
            error
        } = await db.auth.signInWithPassword({

            email:
                emailInterno,

            password:
                senha

        });


        if (error) {

            console.error(
                "Erro no login:",
                error
            );


            mostrarMensagemAuth(
                "Usuário ou senha incorretos."
            );

            return;

        }


        clienteUID =
            data.user.id;


        await carregarPerfilCliente();


        if (!clienteUsuario) {

            clienteUsuario =
                usuario.toLowerCase();

        }


        atualizarInterfaceConta();


        await recuperarAtendimento();


        mostrarMensagemAuth(
            "Login realizado com sucesso! ✅",
            true
        );


        setTimeout(
            function () {

                fecharLogin();

                abrirChat();

            },
            700
        );


    } catch (erro) {

        console.error(
            "Erro inesperado:",
            erro
        );


        mostrarMensagemAuth(
            "Ocorreu um erro ao entrar."
        );

    }

}


/* =========================================
   SAIR DA CONTA
========================================= */

async function sairConta() {

    try {

        if (canalMensagens) {

            await db.removeChannel(
                canalMensagens
            );

            canalMensagens =
                null;

        }


        const {
            error
        } = await db.auth.signOut();


        if (error) {

            console.error(
                "Erro ao sair:",
                error
            );

            return;

        }


        clienteUID =
            null;

        clienteUsuario =
            null;

        atendimentoAtual =
            null;

        atendimentoEncerrado =
            false;


        atualizarInterfaceConta();


        fecharChat();


        const messages =
            document.getElementById(
                "messages"
            );


        if (messages) {

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

                        Entre na sua conta
                        para iniciar um atendimento.

                    </div>

                </div>

            `;

        }


    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

    }

}


/* =========================================
   INFORMAÇÕES DA CONTA
========================================= */

function mostrarInformacoesConta() {

    alert(
        "Conta Yuki Studio\n\n" +
        "Usuário: " +
        (clienteUsuario || "Cliente")
    );

}


/* =========================================
   RECUPERAR ATENDIMENTO
========================================= */

async function recuperarAtendimento() {

    if (!clienteUID) {

        return;

    }


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


    if (
        data &&
        data.length > 0
    ) {

        atendimentoAtual =
            data[0];

        atendimentoEncerrado =
            false;


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

    /*
       Agora o suporte exige conta.
    */

    if (!clienteUID) {

        abrirLogin();

        mostrarMensagemAuth(
            "Entre ou crie uma conta para falar com o suporte."
        );

        return;

    }


    const chat =
        document.getElementById(
            "chatWindow"
        );


    chat.style.display =
        "flex";


    const botao =
        document.getElementById(
            "chatButton"
        );


    botao.style.display =
        "none";


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
    ).style.display =
        "none";


    document.getElementById(
        "chatButton"
    ).style.display =
        "block";

}


/* =========================================
   PREPARAR NOVO ATENDIMENTO
========================================= */

function prepararNovoAtendimento() {

    atendimentoEncerrado =
        false;


    const input =
        document.getElementById(
            "messageInput"
        );


    const botaoEnviar =
        document.querySelector(
            ".chat-input button"
        );


    input.disabled =
        false;


    botaoEnviar.disabled =
        false;


    const messages =
        document.getElementById(
            "messages"
        );


    const foto =
        atendenteAtual === 2
            ? "atendente2.png"
            : "atendente1.png";


    messages.innerHTML = `

        <div class="message support">

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

        abrirLogin();

        return null;

    }


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
                clienteUsuario || "Cliente",

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

    if (!atendimentoAtual) {

        return;

    }


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


    if (!clienteUID) {

        abrirLogin();

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


    atendimentoEncerrado =
        true;


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


    input.disabled =
        true;


    botaoEnviar.disabled =
        true;


    if (canalMensagens) {

        await db.removeChannel(
            canalMensagens
        );

        canalMensagens =
            null;

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


    const messages =
        document.getElementById(
            "messages"
        );


    if (messages) {

        messages.innerHTML = "";

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
