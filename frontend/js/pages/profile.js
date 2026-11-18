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

  // Elementos de edição de foto e nome
  const editNameInput = document.getElementById("edit-profile-name");
  const avatarInput = document.getElementById("input-profile-avatar");
  const avatarImg = document.getElementById("profile-avatar-img");
  const avatarInitials = document.getElementById("profile-avatar-initials");
  const btnRemoveAvatar = document.getElementById("btn-remove-avatar");
  const formBasicProfile = document.getElementById("form-edit-basic-profile");

  const phoneStatusBadge = document.getElementById("user-phone-status-badge");
  let currentAvatarData = null;

  function showAlert(msg, isSuccess = true, shouldScroll = true) {
    if (!alertContainer) return;
    const bg = isSuccess
      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
      : "bg-rose-500/10 border-rose-500/40 text-rose-300";
    alertContainer.innerHTML = `
      <div class="bb-alert border p-3 rounded-lg mb-6 flex items-center gap-2 ${bg}">
        <span>${msg}</span>
      </div>
    `;
    if (isSuccess && shouldScroll) {
      alertContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => {
      alertContainer.innerHTML = "";
    }, 6000);
  }

  function showAnimalsAlert(msg, isSuccess = true) {
    const alertEl = document.getElementById("my-animals-alert");
    if (!alertEl) {
      showAlert(msg, isSuccess, false);
      return;
    }
    const bg = isSuccess
      ? "background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46;"
      : "background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;";
    alertEl.style = `padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 14px; ${bg}`;
    alertEl.innerHTML = `<span>${isSuccess ? '✅' : '⚠️'}</span> <span>${msg}</span>`;
    alertEl.classList.remove("hidden");

    setTimeout(() => {
      alertEl.classList.add("hidden");
      alertEl.innerHTML = "";
    }, 5000);
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

    // Carrega avatar do storage se existente
    updateAvatarPreview(storedUser.avatar, effectiveName);

    // Carrega os anúncios publicados pelo usuário
    loadMyAnimals(currentProfile);
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

  // 4. Salvar Alterações de Foto de Perfil (Nome é imutável, Telefone via 2FA)
  if (formBasicProfile) {
    formBasicProfile.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const btn = document.getElementById("btn-save-basic-profile");
      btn.disabled = true;
      btn.innerHTML = '<span class="bb-btn__spinner" aria-hidden="true"></span> Salvando foto...';

      try {
        const user = bbStorage.getUser() || {};
        user.avatar = currentAvatarData;
        bbStorage.setUser(user);

        // Re-renderiza a navegação superior para refletir a nova foto imediatamente
        if (typeof bbRenderNavigation === "function") {
          bbRenderNavigation("#bb-nav", "profile");
        }

        showAlert("Foto de perfil atualizada com sucesso!");
      } catch (err) {
        showAlert("Erro ao salvar foto de perfil.", false);
      } finally {
        btn.disabled = false;
        btn.textContent = "Salvar Foto de Perfil";
      }
    });
  }

  // 5. Carregar e Renderizar os Anúncios do Usuário com Design Premium
  async function loadMyAnimals(profile) {
    const container = document.getElementById("my-animals-container");
    const countBadge = document.getElementById("my-animals-active-count");
    if (!container || !profile || !profile.id) return;

    try {
      if (typeof animalService === "undefined") {
        container.innerHTML = '<p class="text-xs text-ink-300 p-4 text-center">Módulo de animais não disponível.</p>';
        return;
      }

      const animals = await animalService.list({ tutor_id: profile.id });
      const list = Array.isArray(animals) ? animals : [];

      const activeAnimals = list.filter((a) => a.status === "DISPONIVEL" || a.status === "PERDIDO");
      const isOng = profile.tipo === "ONG" || profile.is_superuser || profile.is_staff;

      if (countBadge) {
        if (isOng) {
          countBadge.textContent = `${activeAnimals.length} ativos • Sem limite (ONG)`;
          countBadge.className = "text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/25";
        } else if (activeAnimals.length >= 5) {
          countBadge.innerHTML = `⚠️ <strong class="font-bold">${activeAnimals.length}/5</strong> ativos (Limite atingido)`;
          countBadge.className = "text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30 shadow-xs";
        } else {
          countBadge.innerHTML = `<strong class="font-bold">${activeAnimals.length}/5</strong> anúncios ativos`;
          countBadge.className = "text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 border border-brand-500/20";
        }
      }

      if (list.length === 0) {
        container.innerHTML = `
          <div class="p-8 sm:p-10 text-center bg-surface-700/30 rounded-2xl border-2 border-dashed border-border/80 my-2">
            <div class="w-16 h-16 rounded-2xl bg-white shadow-xs border border-border flex items-center justify-center text-3xl mx-auto mb-3">
              🐾
            </div>
            <h3 class="text-base font-extrabold text-ink-100 mb-1">Você ainda não tem anúncios ativos</h3>
            <p class="text-xs text-ink-300 max-w-md mx-auto mb-5 leading-relaxed">
              Ajude um animalzinho a encontrar uma família responsável ou divulgue um pet que desapareceu para que a comunidade possa ajudar.
            </p>
            <a href="/pages/animals/index.html" class="bb-btn bb-btn--primary !text-xs !py-2.5 !px-5 inline-flex items-center gap-2 shadow-sm hover:shadow-md transition-all">
              <span>+</span> Publicar Primeiro Anúncio
            </a>
          </div>
        `;
        return;
      }

      function getAnimalBadge(animal) {
        if (animal.tipo_servico === "PERDIDO") {
          if (animal.status === "ENCONTRADO") {
            return '<span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 3px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;"><span>🎉</span> Encontrado (Concluído)</span>';
          }
          return '<span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 3px; background: #fff1f2; color: #be123c; border: 1px solid #fecdd3;"><span>🚨</span> Desaparecido</span>';
        }

        if (animal.status === "ADOTADO") {
          return '<span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 3px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;"><span>✓</span> Adotado (Concluído)</span>';
        }
        if (animal.status === "DISPONIVEL") {
          return '<span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 3px; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;"><span>●</span> Disponível para Adoção</span>';
        }
        if (animal.status === "INATIVO") {
          return '<span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 3px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;"><span>⏸️</span> Inativo</span>';
        }
        return `<span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 3px; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;"><span>●</span> ${escapeHtml(animal.status || "Ativo")}</span>`;
      }

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${list.map((animal) => {
        const isPerdido = animal.tipo_servico === "PERDIDO";
        const badgeHtml = getAnimalBadge(animal);

        const localStr = [animal.cidade, animal.estado].filter(Boolean).join(" - ") || "Local não informado";
        const racaSexoStr = [animal.raca || "SRD", animal.sexo === "M" ? "Macho" : animal.sexo === "F" ? "Fêmea" : "", animal.idade_aproximada].filter(Boolean).join(" • ");
        const imgSrc = animal.imagem || "";
        const isFinished = animal.status === "ADOTADO" || animal.status === "ENCONTRADO";
        const postedTime = typeof bbFormatTimeAgo === "function" ? bbFormatTimeAgo(animal.created_at) : (animal.created_at ? new Date(animal.created_at).toLocaleDateString("pt-BR") : "");

        return `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); flex-wrap: wrap;">
                <!-- Bloco Esquerdo: Foto + Informações -->
                <div style="display: flex; align-items: center; gap: 14px; min-width: 250px; flex: 1;">
                  <!-- Foto do Pet Rigidamente Dimensionada -->
                  <div style="width: 72px; height: 72px; min-width: 72px; max-width: 72px; border-radius: 12px; overflow: hidden; background-color: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${imgSrc
            ? `<img src="${imgSrc}" alt="${escapeHtml(animal.nome)}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />`
            : `<span style="font-size: 30px; line-height: 1; user-select: none;">${animal.tipo_animal === 'GATO' ? '🐱' : '🐶'}</span>`
          }
                  </div>

                  <!-- Detalhes do Anúncio -->
                  <div style="min-width: 0; flex: 1;">
                    <!-- Nome + Badge Única -->
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
                      <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.2;">
                        ${escapeHtml(animal.nome)}
                      </h4>
                      ${badgeHtml}
                    </div>

                    <!-- Raça / Sexo / Idade -->
                    <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0; font-weight: 500;">
                      ${escapeHtml(racaSexoStr)}
                    </p>

                    <!-- Local e Data -->
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 11px; color: #94a3b8;">
                      <span style="display: inline-flex; align-items: center; gap: 4px;">
                        <span>📍</span> <span style="color: #64748b;">${escapeHtml(localStr)}</span>
                      </span>
                      <span style="display: inline-flex; align-items: center; gap: 4px;" title="${animal.created_at ? new Date(animal.created_at).toLocaleString('pt-BR') : ''}">
                        <span>🕒</span> <span style="color: #64748b;">Publicado ${postedTime}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Bloco Direito: Botões de Ação -->
                <div style="display: flex; align-items: center; gap: 8px; margin-left: auto; flex-wrap: wrap;">
                  <a href="/pages/animals/detail.html?id=${animal.id}" style="font-size: 12px; font-weight: 600; color: #2563eb; text-decoration: none; padding: 6px 12px; border-radius: 8px; border: 1px solid #bfdbfe; background: #eff6ff; display: inline-flex; align-items: center; gap: 4px; transition: background 0.15s ease;">
                    Ver Anúncio →
                  </a>

                  <a href="/pages/animals/index.html?edit=${animal.id}" style="font-size: 12px; font-weight: 600; color: #334155; text-decoration: none; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; display: inline-flex; align-items: center; gap: 4px; transition: background 0.15s ease;">
                    ✏️ Editar
                  </a>

                  ${!isFinished ? `
                    <button type="button" class="btn-quick-finish" data-id="${animal.id}" data-target-status="${isPerdido ? 'ENCONTRADO' : 'ADOTADO'}" style="font-size: 12px; font-weight: 600; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 12px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: background 0.15s ease;">
                      ${isPerdido ? '🎉 Marcar Encontrado' : '✓ Marcar Adotado'}
                    </button>
                  ` : ''}

                  <button type="button" class="btn-delete-animal" data-id="${animal.id}" data-name="${escapeHtml(animal.nome)}" style="font-size: 12px; font-weight: 600; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 6px 12px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: background 0.15s ease;">
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            `;
      }).join("")}
        </div>
      `;

      // Event listeners para botões de conclusão rápida de anúncio
      container.querySelectorAll(".btn-quick-finish").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const id = btn.dataset.id;
          const targetStatus = btn.dataset.targetStatus;
          const isEncontrado = targetStatus === "ENCONTRADO";
          const confirmText = isEncontrado
            ? "Confirmar que este pet foi ENCONTRADO? O anúncio será concluído e liberará espaço para novos cadastros."
            : "Confirmar que este pet foi ADOTADO? O anúncio será concluído e liberará espaço para novos cadastros.";

          if (!confirm(confirmText)) return;

          btn.disabled = true;
          btn.textContent = "Atualizando...";
          try {
            await animalService.update(id, { status: targetStatus });
            showAnimalsAlert(isEncontrado ? "Parabéns! Pet marcado como encontrado." : "Parabéns! Pet marcado como adotado.", true);
            await loadMyAnimals(profile);
          } catch (err) {
            showAnimalsAlert("Erro ao atualizar status: " + (err.message || "Tente novamente."), false);
            btn.disabled = false;
            btn.textContent = isEncontrado ? "🎉 Marcar Encontrado" : "✓ Marcar Adotado";
          }
        });
      });

      // Event listeners para botões de exclusão de anúncio
      container.querySelectorAll(".btn-delete-animal").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const id = btn.dataset.id;
          const petName = btn.dataset.name || "este animal";
          const confirmText = `Tem certeza que deseja excluir o anúncio de "${petName}"?\n\nEsta ação é definitiva e removerá o anúncio do site.`;

          if (!confirm(confirmText)) return;

          btn.disabled = true;
          btn.textContent = "Excluindo...";
          try {
            await animalService.delete(id);
            showAnimalsAlert(`Anúncio de "${petName}" excluído com sucesso!`, true);
            await loadMyAnimals(profile);
          } catch (err) {
            showAnimalsAlert("Erro ao excluir anúncio: " + (err.message || "Tente novamente."), false);
            btn.disabled = false;
            btn.textContent = "🗑️ Excluir";
          }
        });
      });
    } catch (err) {
      console.error("Erro ao carregar anúncios do usuário:", err);
      container.innerHTML = `
        <div class="p-4 bg-rose-500/10 text-rose-400 rounded-lg text-xs">
          Não foi possível carregar seus anúncios no momento.
        </div>
      `;
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
            { test: bbValidation.isRequired, message: "Informe a nova senha." },
            { test: bbValidation.isStrongPassword, message: "A nova senha deve ter no mínimo 8 caracteres, contendo letra maiúscula, minúscula, número e caractere especial." },
          ],
          "confirm-new-password": [
            { test: bbValidation.isRequired, message: "Confirme a nova senha." },
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
