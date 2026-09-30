document.addEventListener("DOMContentLoaded", async () => {
  // 1. Renderiza navegação e footer
  if (typeof bbRenderNavigation === "function") {
    bbRenderNavigation("#bb-nav", "profile");
  }
  if (typeof bbRenderFooter === "function") {
    bbRenderFooter("#bb-footer");
  }

  const alertContainer = document.getElementById("profile-global-alert");
  const displayName = document.getElementById("user-display-name");
  const displayEmail = document.getElementById("user-current-email");
  const displayPhone = document.getElementById("user-display-phone");
  const displayTipo = document.getElementById("user-display-tipo");

  // Elementos de edição de foto, nome e telefone
  const editNameInput = document.getElementById("edit-profile-name");
  const editPhoneInput = document.getElementById("edit-profile-phone");
  const avatarInput = document.getElementById("input-profile-avatar");
  const avatarImg = document.getElementById("profile-avatar-img");
  const avatarInitials = document.getElementById("profile-avatar-initials");
  const btnRemoveAvatar = document.getElementById("btn-remove-avatar");
  const formBasicProfile = document.getElementById("form-edit-basic-profile");

  // Elementos de validação de WhatsApp
  const phoneStatusBadge = document.getElementById("user-phone-status-badge");
  const boxVerifyWhatsapp = document.getElementById("box-verify-whatsapp");
  const btnSendWhatsappCode = document.getElementById("btn-send-whatsapp-code");
  const boxCodeWhatsapp = document.getElementById("box-code-whatsapp");
  const whatsappCodeInput = document.getElementById("whatsapp-confirmation-code");
  const btnVerifyWhatsappCode = document.getElementById("btn-verify-whatsapp-code");
  const whatsappVerifyError = document.getElementById("whatsapp-verify-error");

  let currentAvatarData = null;

  function showAlert(msg, isSuccess = true) {
    if (!alertContainer) return;
    const bg = isSuccess
      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
      : "bg-rose-500/10 border-rose-500/40 text-rose-300";
    alertContainer.innerHTML = `
      <div class="bb-alert border p-3 rounded-lg mb-6 flex items-center gap-2 ${bg}">
        <span>${isSuccess ? "✅" : "⚠️"}</span>
        <span>${msg}</span>
      </div>
    `;
    if (isSuccess) {
      alertContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      alertContainer.innerHTML = "";
    }, 6000);
  }

  function clearErrors() {
    document.querySelectorAll(".bb-error-text").forEach((el) => (el.textContent = ""));
    document.querySelectorAll(".bb-input").forEach((el) => el.classList.remove("bb-input--error"));
  }

  function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (input) input.classList.add("bb-input--error");
    if (errorEl) errorEl.textContent = message;
  }

  function updateAvatarPreview(avatarSrc, name) {
    const initial = (name || "U").trim().charAt(0).toUpperCase();
    if (avatarSrc) {
      if (avatarImg) {
        avatarImg.src = avatarSrc;
        avatarImg.classList.remove("hidden");
      }
      if (avatarInitials) avatarInitials.classList.add("hidden");
      if (btnRemoveAvatar) btnRemoveAvatar.classList.remove("hidden");
      currentAvatarData = avatarSrc;
    } else {
      if (avatarImg) {
        avatarImg.src = "";
        avatarImg.classList.add("hidden");
      }
      if (avatarInitials) {
        avatarInitials.textContent = initial;
        avatarInitials.classList.remove("hidden");
      }
      if (btnRemoveAvatar) btnRemoveAvatar.classList.add("hidden");
      currentAvatarData = null;
    }
  }

  function updatePhoneUI(telefone, isValidated) {
    const formatted = telefone ? bbValidation.formatPhone(telefone) : "";
    if (displayPhone) {
      displayPhone.textContent = formatted || "Não informado";
    }
    if (phoneStatusBadge) {
      if (!telefone) {
        phoneStatusBadge.classList.add("hidden");
      } else if (isValidated) {
        phoneStatusBadge.className = "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
        phoneStatusBadge.textContent = "Verificado";
        phoneStatusBadge.classList.remove("hidden");
      } else {
        phoneStatusBadge.className = "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30";
        phoneStatusBadge.textContent = "Não validado";
        phoneStatusBadge.classList.remove("hidden");
      }
    }
    if (boxVerifyWhatsapp) {
      if (telefone && !isValidated) {
        boxVerifyWhatsapp.classList.remove("hidden");
      } else {
        boxVerifyWhatsapp.classList.add("hidden");
      }
    }
  }

  // Máscara de telefone
  if (editPhoneInput) {
    editPhoneInput.addEventListener("input", (e) => {
      e.target.value = bbValidation.formatPhone(e.target.value);
    });
  }

  // 2. Carrega perfil atual
  let currentProfile = null;
  try {
    currentProfile = await authService.getProfile();
    const storedUser = bbStorage.getUser() || {};
    const effectiveName = currentProfile.nome || storedUser.nome || currentProfile.email?.split("@")[0] || "Usuário";
    const effectivePhone = currentProfile.telefone || storedUser.telefone || "";
    const isValidated = Boolean(currentProfile.telefone_validado ?? storedUser.telefone_validado);

    if (displayName) displayName.textContent = effectiveName;
    if (displayEmail) displayEmail.textContent = currentProfile.email || "";
    if (displayTipo) displayTipo.textContent = currentProfile.tipo === "PJ" ? "Pessoa Jurídica (ONG / Clínica)" : "Pessoa Física";

    updatePhoneUI(effectivePhone, isValidated);

    if (editNameInput) editNameInput.value = effectiveName;
    if (editPhoneInput) editPhoneInput.value = effectivePhone ? bbValidation.formatPhone(effectivePhone) : "";

    // Carrega avatar do storage se existente
    updateAvatarPreview(storedUser.avatar, effectiveName);
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    showAlert("Não foi possível carregar os dados do perfil.", false);
  }

  // 3. Manipulação do Upload de Foto
  if (avatarInput) {
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showAlert("Por favor, selecione um arquivo de imagem válido.", false);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        showAlert("A imagem deve ter no máximo 2MB.", false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target.result;
        updateAvatarPreview(base64, editNameInput?.value);
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnRemoveAvatar) {
    btnRemoveAvatar.addEventListener("click", () => {
      updateAvatarPreview(null, editNameInput?.value);
      if (avatarInput) avatarInput.value = "";
    });
  }

  // 4. Salvar Alterações de Nome, Telefone e Foto
  if (formBasicProfile) {
    formBasicProfile.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const newName = editNameInput.value.trim();
      const newPhone = editPhoneInput ? editPhoneInput.value.trim() : "";

      if (!bbValidation.isRequired(newName)) {
        showFieldError("edit-profile-name", "Informe seu nome completo.");
        return;
      }

      if (newPhone && !bbValidation.isPhone(newPhone)) {
        showFieldError("edit-profile-phone", "Informe um telefone válido com DDD (ex: (11) 99999-9999) ou deixe em branco.");
        return;
      }

      const btn = document.getElementById("btn-save-basic-profile");
      btn.disabled = true;
      btn.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Salvando...';

      try {
        const resp = await authService.updateProfile({
          nome: newName,
          telefone: newPhone,
        });

        // Atualiza a sessão local
        const user = bbStorage.getUser() || {};
        user.nome = newName;
        user.telefone = newPhone;
        user.avatar = currentAvatarData;
        if (resp && typeof resp.telefone_validado !== "undefined") {
          user.telefone_validado = resp.telefone_validado;
        }
        bbStorage.setUser(user);

        if (displayName) displayName.textContent = newName;
        updatePhoneUI(newPhone, user.telefone_validado);

        // Re-renderiza a navegação superior para refletir a nova foto e nome imediatamente
        if (typeof bbRenderNavigation === "function") {
          bbRenderNavigation("#bb-nav", "profile");
        }

        showAlert("Dados do perfil atualizados com sucesso!");
      } catch (err) {
        showAlert(err.error || err.message || "Erro ao atualizar dados do perfil.", false);
      } finally {
        btn.disabled = false;
        btn.textContent = "Salvar Dados do Perfil";
      }
    });
  }

  // Validação de WhatsApp via código com limitador de cliques (Anti-Spam)
  let whatsappLimiter = null;
  if (btnSendWhatsappCode) {
    whatsappLimiter = typeof bbClickLimiter !== "undefined"
      ? bbClickLimiter.attach(btnSendWhatsappCode, {
          storageKey: "whatsapp_send_code",
          blockedText: "Aguarde {s}s para reenviar",
          onUnlocked: () => {
            if (btnSendWhatsappCode) btnSendWhatsappCode.textContent = "Reenviar Código";
          }
        })
      : null;

    btnSendWhatsappCode.addEventListener("click", async () => {
      if (whatsappLimiter && whatsappLimiter.isBlocked()) {
        return;
      }

      const user = bbStorage.getUser() || {};
      const telefone = editPhoneInput?.value?.trim() || user.telefone;
      if (!telefone) {
        showAlert("Informe e salve um número de telefone antes de validar.", false);
        return;
      }
      if (whatsappVerifyError) whatsappVerifyError.textContent = "";
      btnSendWhatsappCode.disabled = true;
      btnSendWhatsappCode.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Enviando...';

      try {
        const resp = await authService.enviarCodigoWhatsApp(telefone);
        if (boxCodeWhatsapp) boxCodeWhatsapp.classList.remove("hidden");
        showAlert(resp.message || "Código enviado via WhatsApp!");

        if (whatsappLimiter) {
          whatsappLimiter.recordClick();
          whatsappLimiter.setOriginalText("Reenviar Código");
        }
      } catch (err) {
        if (whatsappVerifyError) {
          whatsappVerifyError.textContent = err.payload?.error || err.error || err.message || "Erro ao enviar código.";
        }
      } finally {
        if (!whatsappLimiter || !whatsappLimiter.isBlocked()) {
          btnSendWhatsappCode.disabled = false;
          btnSendWhatsappCode.textContent = "Reenviar Código";
        }
      }
    });
  }

  if (btnVerifyWhatsappCode) {
    btnVerifyWhatsappCode.addEventListener("click", async () => {
      const user = bbStorage.getUser() || {};
      const telefone = editPhoneInput?.value?.trim() || user.telefone;
      const codigo = whatsappCodeInput?.value?.trim();

      if (!codigo) {
        if (whatsappVerifyError) whatsappVerifyError.textContent = "Digite o código recebido.";
        return;
      }

      btnVerifyWhatsappCode.disabled = true;
      btnVerifyWhatsappCode.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Validando...';

      try {
        const resp = await authService.verificarCodigoWhatsApp({ telefone, codigo });
        showAlert(resp.message || "WhatsApp verificado com sucesso!");

        user.telefone_validado = true;
        bbStorage.setUser(user);
        updatePhoneUI(telefone, true);
        if (whatsappLimiter) whatsappLimiter.reset();
        if (boxCodeWhatsapp) boxCodeWhatsapp.classList.add("hidden");
        if (whatsappCodeInput) whatsappCodeInput.value = "";
      } catch (err) {
        if (whatsappVerifyError) {
          whatsappVerifyError.textContent = err.payload?.error || err.error || err.message || "Código inválido.";
        }
      } finally {
        btnVerifyWhatsappCode.disabled = false;
        btnVerifyWhatsappCode.textContent = "Validar";
      }
    });
  }

  // 5. Fluxo de Alteração de E-mail (RF01.1)
  const formEmail = document.getElementById("form-change-email");
  const boxConfirmEmail = document.getElementById("box-confirm-email");
  const tokenInput = document.getElementById("email-confirmation-token");
  const btnConfirmToken = document.getElementById("btn-confirm-email-token");

  if (formEmail) {
    formEmail.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const newEmail = document.getElementById("new-email").value.trim();
      const currentPassword = document.getElementById("current-password-email").value;

      const errors = bbValidation.runRules(
        { "new-email": newEmail, "current-password-email": currentPassword },
        {
          "new-email": [
            { test: bbValidation.isRequired, message: "Informe o novo e-mail." },
            { test: bbValidation.isEmail, message: "Informe um e-mail válido (ex: seu@email.com)." },
          ],
          "current-password-email": [
            { test: bbValidation.isRequired, message: "Informe sua senha atual para segurança." },
          ],
        }
      );

      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, msg]) => showFieldError(field, msg));
        return;
      }

      const btn = document.getElementById("btn-submit-change-email");
      btn.disabled = true;
      btn.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Atualizando e-mail...';

      try {
        const resp = await authService.alterarEmail({
          novo_email: newEmail,
          senha_atual: currentPassword,
        });

        const updatedEmail = resp.email || newEmail;
        if (displayEmail) displayEmail.textContent = updatedEmail;

        const u = bbStorage.getUser();
        if (u) {
          u.email = updatedEmail;
          bbStorage.setUser(u);
        }

        formEmail.reset();
        if (boxConfirmEmail) boxConfirmEmail.classList.add("hidden");

        showAlert(resp.message || "E-mail alterado com sucesso!");
      } catch (err) {
        const errMsg = err.payload?.error || err.payload?.detail || err.error || err.message || "A senha atual informada está incorreta.";
        showFieldError("current-password-email", errMsg);
      } finally {
        btn.disabled = false;
        btn.textContent = "Atualizar E-mail";
      }
    });
  }

  if (btnConfirmToken) {
    btnConfirmToken.addEventListener("click", async () => {
      const token = tokenInput ? tokenInput.value.trim() : "";
      if (!token) {
        showFieldError("email-confirmation-token", "Informe o token de confirmação.");
        return;
      }

      btnConfirmToken.disabled = true;
      btnConfirmToken.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Confirmando...';

      try {
        const resp = await authService.confirmarEmail({ token });
        showAlert(resp.message || "E-mail alterado com sucesso!");
        if (displayEmail) displayEmail.textContent = resp.email;
        boxConfirmEmail.classList.add("hidden");
        formEmail.reset();

        const u = bbStorage.getUser();
        if (u) {
          u.email = resp.email;
          bbStorage.setUser(u);
        }
      } catch (err) {
        showAlert(err.error || err.message || "Token inválido ou expirado.", false);
      } finally {
        btnConfirmToken.disabled = false;
        btnConfirmToken.textContent = "Validar E-mail";
      }
    });
  }

  // 6. Fluxo de Alteração de Senha (RF01.1)
  const formPassword = document.getElementById("form-change-password");
  if (formPassword) {
    formPassword.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const currentPassword = document.getElementById("current-password-pwd").value;
      const newPassword = document.getElementById("new-password").value;
      const confirmNewPassword = document.getElementById("confirm-new-password").value;

      const errors = bbValidation.runRules(
        {
          "current-password-pwd": currentPassword,
          "new-password": newPassword,
          "confirm-new-password": confirmNewPassword,
        },
        {
          "current-password-pwd": [
            { test: bbValidation.isRequired, message: "Informe sua senha atual." },
          ],
          "new-password": [
            { test: (v) => bbValidation.minLength(v, 6), message: "A nova senha deve ter ao menos 6 caracteres." },
          ],
          "confirm-new-password": [
            { test: (v, all) => bbValidation.passwordsMatch(v, all["new-password"]), message: "As novas senhas não coincidem." },
          ],
        }
      );

      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, msg]) => showFieldError(field, msg));
        return;
      }

      const btn = document.getElementById("btn-submit-change-password");
      btn.disabled = true;
      btn.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Atualizando senha...';

      try {
        const resp = await authService.alterarSenha({
          senha_atual: currentPassword,
          nova_senha: newPassword,
          confirmar_nova_senha: confirmNewPassword,
        });

        showAlert(resp.message || "Senha atualizada com sucesso!");
        formPassword.reset();
      } catch (err) {
        const errMsg = err.payload?.error || err.payload?.detail || err.error || err.message || "A senha atual informada está incorreta.";
        showFieldError("current-password-pwd", errMsg);
      } finally {
        btn.disabled = false;
        btn.textContent = "Atualizar Senha";
      }
    });
  }
});
