bbRenderAuthHeader("#bb-header");
bbRenderFooter("#bb-footer");

const bbRequestForm = document.getElementById("bb-request-form");
const bbConfirmForm = document.getElementById("bb-confirm-form");
const bbFormAlert = document.getElementById("bb-form-alert");
let bbResetEmail = "";

function bbClearErrors() {
  bbFormAlert.innerHTML = "";
  document.querySelectorAll(".bb-error-text").forEach((el) => (el.textContent = ""));
}

bbRequestForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  bbClearErrors();

  const email = document.getElementById("email").value.trim();
  if (!bbValidation.isEmail(email)) {
    document.getElementById("email-error").textContent = "Email inválido.";
    return;
  }

  const btn = document.getElementById("bb-request-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Enviando...';

  try {
    await authService.requestPasswordReset(email);
    bbResetEmail = email;
    bbRequestForm.style.display = "none";
    bbConfirmForm.style.display = "block";
    bbFormAlert.innerHTML = `<div class="bb-alert bb-alert--success">PIN enviado! Confira sua caixa de entrada.</div>`;
  } catch (err) {
    bbFormAlert.innerHTML = `<div class="bb-alert bb-alert--error">${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Enviar PIN";
  }
});

bbConfirmForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  bbClearErrors();

  const pin = document.getElementById("pin").value.trim();
  const novaSenha = document.getElementById("nova-senha").value;

  if (!bbValidation.isRequired(pin)) {
    document.getElementById("pin-error").textContent = "Informe o PIN recebido.";
    return;
  }
  if (!bbValidation.minLength(novaSenha, 6)) {
    document.getElementById("nova-senha-error").textContent = "Senha deve ter ao menos 6 caracteres.";
    return;
  }

  const btn = document.getElementById("bb-confirm-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Redefinindo...';

  try {
    await authService.confirmPasswordReset({ email: bbResetEmail, pin, password: novaSenha });
    bbFormAlert.innerHTML = `<div class="bb-alert bb-alert--success">Senha redefinida! Redirecionando para o login...</div>`;
    setTimeout(() => (window.location.href = "login.html"), 1200);
  } catch (err) {
    bbFormAlert.innerHTML = `<div class="bb-alert bb-alert--error">${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "Redefinir senha";
  }
});
