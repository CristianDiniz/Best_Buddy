from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from usuarios.models import Usuario, PessoaFisica


class UsuarioAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.login_url = reverse("token_obtain_pair")
        self.perfil_url = reverse("perfil")
        self.verificar_tel_url = reverse("verificar-telefone")

    def test_registro_usuario_pf_sucesso(self):
        payload = {
            "nome": "João Silva",
            "email": "joao@teste.com",
            "password": "senhaForte123",
            "telefone": "(11) 98765-4321",
            "tipo": "PF",
        }
        res = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", res.data)
        self.assertEqual(res.data["user"]["email"], "joao@teste.com")
        self.assertTrue(Usuario.objects.filter(email="joao@teste.com").exists())

    def test_bloqueio_telefone_duplicado_no_registro(self):
        Usuario.objects.create_user(
            email="existente@teste.com",
            password="password123",
            telefone="11987654321"
        )
        payload = {
            "nome": "Outro Usuário",
            "email": "outro@teste.com",
            "password": "senhaForte123",
            "telefone": "11987654321",
            "tipo": "PF",
        }
        res = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verificar_telefone_endpoint(self):
        Usuario.objects.create_user(
            email="tel_ocupado@teste.com",
            password="password123",
            telefone="11999998888"
        )
        res_indisp = self.client.get(f"{self.verificar_tel_url}?telefone=11999998888")
        self.assertEqual(res_indisp.status_code, status.HTTP_200_OK)
        self.assertFalse(res_indisp.data["disponivel"])

        res_disp = self.client.get(f"{self.verificar_tel_url}?telefone=11911112222")
        self.assertEqual(res_disp.status_code, status.HTTP_200_OK)
        self.assertTrue(res_disp.data["disponivel"])

    def test_login_retorna_jwt_e_dados_usuario(self):
        user = Usuario.objects.create_user(
            email="login@teste.com",
            password="minhasenha",
            telefone="11977778888",
            telefone_validado=True,
            tipo="PF"
        )
        PessoaFisica.objects.create(usuario=user, nome="Carlos Oliveira")

        res = self.client.post(self.login_url, {"email": "login@teste.com", "password": "minhasenha"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertEqual(res.data["user"]["nome"], "Carlos Oliveira")

    def test_perfil_requer_autenticacao(self):
        res = self.client.get(self.perfil_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_perfil_patch_atualiza_telefone_e_bloqueia_alteracao_livre_nome(self):
        user = Usuario.objects.create_user(
            email="perfil@teste.com",
            password="password123",
            telefone="11966665555",
            tipo="PF"
        )
        PessoaFisica.objects.create(usuario=user, nome="Nome Antigo")
        self.client.force_authenticate(user=user)

        # Tentativa de alterar o nome livremente deve ser ignorada, mantendo o nome original
        res = self.client.patch(self.perfil_url, {"nome": "Nome Atualizado", "telefone": "11988889999"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["nome"], "Nome Antigo")
        self.assertEqual(res.data["telefone"], "11988889999")
        self.assertFalse(res.data["telefone_validado"])

    def test_bloqueio_listagem_usuarios_para_usuario_comum(self):
        user = Usuario.objects.create_user(
            email="comum@teste.com",
            password="password123",
            telefone="11955554444",
            tipo="PF"
        )
        self.client.force_authenticate(user=user)
        res = self.client.get("/api/usuarios/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_bloqueio_idor_exclusao_outro_usuario(self):
        vitima = Usuario.objects.create_user(
            email="vitima@teste.com",
            password="password123",
            telefone="11944443333",
            tipo="PF"
        )
        atacante = Usuario.objects.create_user(
            email="atacante@teste.com",
            password="password123",
            telefone="11933332222",
            tipo="PF"
        )
        self.client.force_authenticate(user=atacante)
        # Atacante tenta excluir a conta da vítima
        res = self.client.delete(f"/api/usuarios/{vitima.id}/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        # Conta da vítima permanece intacta
        self.assertTrue(Usuario.objects.filter(id=vitima.id).exists())

