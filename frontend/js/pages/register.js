bbRenderAuthHeader("#bb-header");
bbRenderFooter("#bb-footer");

const bbRegisterForm = document.getElementById("bb-register-form");
const bbSubmitBtn = document.getElementById("bb-submit-btn");
const bbFormAlert = document.getElementById("bb-form-alert");

function bbClearErrors() {
  bbFormAlert.innerHTML = "";
  document.querySelectorAll(".bb-error-text").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".bb-input").forEach((el) => el.classList.remove("bb-input--error"));
}

function bbShowFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  input.classList.add("bb-input--error");
  errorEl.textContent = message;
}

function bbSetLoading(isLoading) {
  bbSubmitBtn.disabled = isLoading;
  bbSubmitBtn.innerHTML = isLoading
    ? '<span class="bb-btn__spinner" aria-hidden="true"></span> Criando conta...'
    : "Criar conta";
}

bbRegisterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  bbClearErrors();

  const data = {
    nome: document.getElementById("nome").value.trim(),
    cpf: document.getElementById("cpf").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    senha: document.getElementById("senha").value,
    confirmar_senha: document.getElementById("confirmar-senha").value,
  };

  const errors = bbValidation.runRules(data, {
    nome: [{ test: bbValidation.isRequired, message: "Informe seu nome." }],
    cpf: [{ test: bbValidation.isCPF, message: "CPF inválido." }],
    email: [
      { test: bbValidation.isRequired, message: "Informe seu email." },
      { test: bbValidation.isEmail, message: "Email inválido." },
    ],
    senha: [{ test: (v) => bbValidation.minLength(v, 6), message: "Senha deve ter ao menos 6 caracteres." }],
    confirmar_senha: [
      { test: (v, all) => bbValidation.passwordsMatch(v, all.senha), message: "As senhas não coincidem." },
    ],
  });

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, message]) =>
      bbShowFieldError(field.replace("_", "-"), message)
    );
    return;
  }

  bbSetLoading(true);
  try {
    await authService.register({
      nome: data.nome,
      cpf: data.cpf,
      email: data.email,
      telefone: data.telefone,
      password: data.senha,
      tipo: "PF",
    });
    bbFormAlert.innerHTML = `<div class="bb-alert bb-alert--success">Conta criada com sucesso! Redirecionando para o login...</div>`;
    setTimeout(() => (window.location.href = "login.html"), 1200);
  } catch (err) {
    bbFormAlert.innerHTML = `<div class="bb-alert bb-alert--error">${err.message}</div>`;
  } finally {
    bbSetLoading(false);
  }
});
