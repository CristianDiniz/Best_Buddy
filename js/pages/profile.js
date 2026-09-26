document.addEventListener("DOMContentLoaded", async () => {
  // 1. Renderiza navegação e footer
  if (typeof bbRenderNavigation === "function") {
    bbRenderNavigation("#bb-nav", "profile");
  }
  if (typeof bbRenderFooter === "function") {
    bbRenderFooter("#bb-footer");
  }

  const alertContainer = document.getElementById("profile-global-alert");
  const displayPhone = document.getElementById("user-display-phone");
  const whatsappBadge = document.getElementById("user-whatsapp-badge");
  const currentEmail = document.getElementById("user-current-email");
  const phoneInput = document.getElementById("whatsapp-phone-input");

  function showAlert(msg, isSuccess = true) {
    if (!alertContainer) return;
    const bg = isSuccess ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300" : "bg-rose-500/10 border-rose-500/40 text-rose-300";
    alertContainer.innerHTML = `
      <div class="bb-alert border p-3 rounded-lg mb-6 flex items-center gap-2 ${bg}">
        <span>${isSuccess ? "✅" : "⚠️"}</span>
        <span>${msg}</span>
      </div>
    `;
    setTimeout(() => {
      alertContainer.innerHTML = "";
    }, 6000);
  }

  function updateWhatsappBadge(isValidated, phone) {
    if (displayPhone) {
      displayPhone.textContent = phone || "Não informado";
    }
    if (whatsappBadge) {
      if (isValidated) {
        whatsappBadge.innerHTML = `
          <span class="px-2.5 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-semibold">
            <span>✅</span> WhatsApp Validado
          </span>
        `;
      } else {
        whatsappBadge.innerHTML = `
          <span class="px-2.5 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-semibold">
            <span>⚠️</span> Não validado
          </span>
        `;
      }
    }
  }

  // 2. Carrega perfil atual
  let currentProfile = null;
  try {
    currentProfile = await authService.getProfile();
    if (currentEmail) {
      currentEmail.textContent = currentProfile.email || "";
    }
    if (phoneInput && currentProfile.telefone) {
      phoneInput.value = currentProfile.telefone;
    }
    updateWhatsappBadge(currentProfile.telefone_validado, currentProfile.telefone);
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    showAlert("Não foi possível carregar os dados do perfil.", false);
  }

  // 3. Fluxo de Validação WhatsApp via Twilio
  const btnSendCode = document.getElementById("btn-send-whatsapp-code");
  const btnVerifyCode = document.getElementById("btn-verify-whatsapp-code");
  const step2 = document.getElementById("whatsapp-step-2");
  const codeInput = document.getElementById("whatsapp-code-input");
  const step2Hint = document.getElementById("whatsapp-step2-hint");
  const btnResend = document.getElementById("btn-resend-code");

  let pendingPhone = "";

  async function handleSendCode() {
    const rawPhone = phoneInput ? phoneInput.value.trim() : "";
    if (!rawPhone || rawPhone.length < 10) {
      showAlert("Informe um telefone válido com DDD (ex: 11999998888).", false);
      return;
    }

    pendingPhone = rawPhone;
    btnSendCode.disabled = true;
    btnSendCode.textContent = "Enviando...";

    try {
      const resp = await authService.enviarCodigoWhatsApp(rawPhone);
      step2.classList.remove("hidden");
      if (resp.codigo_dev && step2Hint) {
        step2Hint.innerHTML = `Código enviado via WhatsApp! <em>(Modo DEV: use o código <strong>${resp.codigo_dev}</strong>)</em>`;
        if (codeInput) codeInput.value = resp.codigo_dev;
      }
      showAlert(resp.message || "Código enviado via WhatsApp!");
    } catch (err) {
      showAlert(err.error || "Falha ao enviar código via WhatsApp. Tente novamente.", false);
    } finally {
      btnSendCode.disabled = false;
      btnSendCode.textContent = "Enviar Código PIN";
    }
  }

  if (btnSendCode) btnSendCode.addEventListener("click", handleSendCode);
  if (btnResend) btnResend.addEventListener("click", handleSendCode);

  if (btnVerifyCode) {
    btnVerifyCode.addEventListener("click", async () => {
      const code = codeInput ? codeInput.value.trim() : "";
      if (!code) {
        showAlert("Digite o código PIN recebido.", false);
        return;
      }

      btnVerifyCode.disabled = true;
      btnVerifyCode.textContent = "Verificando...";

      try {
        const resp = await authService.verificarCodigoWhatsApp({
          telefone: pendingPhone,
          codigo: code,
        });

        updateWhatsappBadge(true, resp.telefone || pendingPhone);
        step2.classList.add("hidden");
        showAlert(resp.message || "WhatsApp verificado com sucesso!");

        // Atualiza dados na sessão local
        const u = bbStorage.getUser();
        if (u) {
          u.telefone = resp.telefone || pendingPhone;
          u.telefone_validado = true;
          bbStorage.setUser(u);
        }
      } catch (err) {
        showAlert(err.error || "Código de verificação incorreto.", false);
      } finally {
        btnVerifyCode.disabled = false;
        btnVerifyCode.textContent = "Confirmar WhatsApp";
      }
    });
  }

  // 4. Fluxo de Alteração de E-mail
  const formEmail = document.getElementById("form-change-email");
  const boxConfirmEmail = document.getElementById("box-confirm-email");
  const tokenInput = document.getElementById("email-confirmation-token");
  const btnConfirmToken = document.getElementById("btn-confirm-email-token");

  if (formEmail) {
    formEmail.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newEmail = document.getElementById("new-email").value.trim();
      const currentPassword = document.getElementById("current-password-email").value;

      const btn = document.getElementById("btn-submit-change-email");
      btn.disabled = true;
      btn.textContent = "Enviando solicitação...";

      try {
        const resp = await authService.alterarEmail({
          novo_email: newEmail,
          senha_atual: currentPassword,
        });

        showAlert(resp.message || "E-mail de confirmação enviado!");
        boxConfirmEmail.classList.remove("hidden");
        if (resp.token_dev && tokenInput) {
          tokenInput.value = resp.token_dev;
        }
      } catch (err) {
        showAlert(err.error || "Erro ao solicitar alteração de e-mail.", false);
      } finally {
        btn.disabled = false;
        btn.textContent = "Solicitar Alteração de E-mail";
      }
    });
  }

  if (btnConfirmToken) {
    btnConfirmToken.addEventListener("click", async () => {
      const token = tokenInput ? tokenInput.value.trim() : "";
      if (!token) {
        showAlert("Informe o token de confirmação.", false);
        return;
      }

      btnConfirmToken.disabled = true;
      btnConfirmToken.textContent = "Confirmando...";

      try {
        const resp = await authService.confirmarEmail({ token });
        showAlert(resp.message || "E-mail alterado com sucesso!");
        if (currentEmail) currentEmail.textContent = resp.email;
        boxConfirmEmail.classList.add("hidden");
        formEmail.reset();

        const u = bbStorage.getUser();
        if (u) {
          u.email = resp.email;
          bbStorage.setUser(u);
        }
      } catch (err) {
        showAlert(err.error || "Token inválido ou expirado.", false);
      } finally {
        btnConfirmToken.disabled = false;
        btnConfirmToken.textContent = "Validar";
      }
    });
  }

  // 5. Fluxo de Alteração de Senha
  const formPassword = document.getElementById("form-change-password");
  if (formPassword) {
    formPassword.addEventListener("submit", async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById("current-password-pwd").value;
      const newPassword = document.getElementById("new-password").value;
      const confirmNewPassword = document.getElementById("confirm-new-password").value;

      if (newPassword !== confirmNewPassword) {
        showAlert("A nova senha e a confirmação não coincidem.", false);
        return;
      }

      const btn = document.getElementById("btn-submit-change-password");
      btn.disabled = true;
      btn.textContent = "Atualizando senha...";

      try {
        const resp = await authService.alterarSenha({
          senha_atual: currentPassword,
          nova_senha: newPassword,
          confirmar_nova_senha: confirmNewPassword,
        });

        showAlert(resp.message || "Senha atualizada com sucesso!");
        formPassword.reset();
      } catch (err) {
        showAlert(err.error || "Erro ao atualizar senha. Verifique a senha atual.", false);
      } finally {
        btn.disabled = false;
        btn.textContent = "Atualizar Senha";
      }
    });
  }
});
