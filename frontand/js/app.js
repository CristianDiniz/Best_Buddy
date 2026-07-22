console.log("App.js carregado!");
document.getElementById("loginForm").addEventListener("submit", async function (event) {

    // Impede que a página recarregue
    event.preventDefault();

    // Pega os valores digitados
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://127.0.0.1:8000/api/token/", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const data = await response.json();

        if (response.ok) {

            // Salva os tokens
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            alert("Login realizado com sucesso!");

            console.log(data);

        } else {

            alert("Email ou senha inválidos.");

            console.log(data);

        }

    } catch (erro) {

        console.error(erro);

        alert("Erro ao conectar com o servidor.");

    }

});