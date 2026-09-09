bbRenderAuthHeader("#bb-header");
bbRenderFooter("#bb-footer");

const bbLoginForm = document.getElementById("bb-login-form");
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
    ? '<span class="bb-btn__spinner" aria-hidden="true"></span> Entrando...'
    : "Entrar";
}

bbLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  bbClearErrors();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const errors = bbValidation.runRules(
    { email, password },
    {
      email: [
        { test: bbValidation.isRequired, message: "Informe seu email." },
        { test: bbValidation.isEmail, message: "Email inválido." },
      ],
      password: [{ test: bbValidation.isRequired, message: "Informe sua senha." }],
    }
  );

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([field, message]) => bbShowFieldError(field, message));
    return;
  }

  bbSetLoading(true);
  try {
    const session = await authService.login({ email, password });
    bbStorage.setSession(session);

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/pages/home/index.html";
    window.location.href = next;
  } catch (err) {
    bbFormAlert.innerHTML = `<div class="bb-alert bb-alert--error">${err.message}</div>`;
  } finally {
    bbSetLoading(false);
  }
});
