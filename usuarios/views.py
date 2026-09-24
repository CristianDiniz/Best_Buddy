from django.conf import settings
from django.core import signing
from django.core.mail import send_mail
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Usuario
from .serializer import (
    AlterarEmailSerializer,
    AlterarSenhaSerializer,
    ConfirmarEmailSerializer,
    RecuperarSenhaSerializer,
    RedefinirSenhaSerializer,
    RegisterUsuarioSerializer,
    TwilioEnviarCodigoSerializer,
    TwilioVerificarCodigoSerializer,
    UsuarioSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterUsuarioSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()
        return Response(data, status=status.HTTP_201_CREATED)


class PerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        nome = ""
        cpf = ""
        if user.tipo == "PF" and hasattr(user, "perfil_pf"):
            nome = user.perfil_pf.nome
        elif user.tipo == "PJ" and hasattr(user, "perfil_pj"):
            nome = user.perfil_pj.nome_fantasia or user.perfil_pj.razao_social
            cpf = user.perfil_pj.cnpj

        return Response({
            "id": user.id,
            "email": user.email,
            "tipo": user.tipo,
            "nome": nome or user.email.split("@")[0],
            "cpf_cnpj": cpf,
            "telefone": user.telefone or "",
            "telefone_validado": user.telefone_validado,
            "created_at": user.created_at,
        })

    def patch(self, request):
        user = request.user
        nome = request.data.get("nome")
        if nome is not None:
            if user.tipo == "PF" and hasattr(user, "perfil_pf"):
                user.perfil_pf.nome = nome
                user.perfil_pf.save()
            elif user.tipo == "PJ" and hasattr(user, "perfil_pj"):
                user.perfil_pj.nome_fantasia = nome
                user.perfil_pj.save()
        return self.get(request)


class AlterarEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AlterarEmailSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        senha_atual = serializer.validated_data["senha_atual"]
        novo_email = serializer.validated_data["novo_email"]

        if not request.user.check_password(senha_atual):
            return Response({"error": "A senha atual informada está incorreta."}, status=status.HTTP_400_BAD_REQUEST)

        # Gera token assinado com validade
        token = signing.dumps({"user_id": request.user.id, "novo_email": novo_email}, salt="alterar-email")

        # Dispara email de revalidação
        subject = "Confirmação de alteração de e-mail - Best Buddy"
        message = (
            f"Olá!\n\nVocê solicitou a alteração do seu e-mail para {novo_email}.\n"
            f"Use o seguinte token de confirmação ou acerte a validação no sistema:\n\n{token}\n\n"
            f"Se você não solicitou esta alteração, ignore este e-mail."
        )
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL if hasattr(settings, "DEFAULT_FROM_EMAIL") else "no-reply@bestbuddy.org", [novo_email], fail_silently=True)
        except Exception:
            pass

        return Response({
            "message": f"Código de confirmação enviado para o e-mail {novo_email}.",
            "token_dev": token
        }, status=status.HTTP_200_OK)


class ConfirmarEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ConfirmarEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]

        try:
            payload = signing.loads(token, salt="alterar-email", max_age=86400)  # 24h
            user_id = payload["user_id"]
            novo_email = payload["novo_email"]

            if Usuario.objects.filter(email__iexact=novo_email).exclude(pk=user_id).exists():
                return Response({"error": "Este email já está sendo utilizado por outro usuário."}, status=status.HTTP_400_BAD_REQUEST)

            user = Usuario.objects.get(pk=user_id)
            user.email = novo_email
            user.save()

            return Response({"message": "E-mail atualizado com sucesso!", "email": novo_email}, status=status.HTTP_200_OK)
        except signing.BadSignature:
            return Response({"error": "Token de confirmação inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)


class AlterarSenhaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AlterarSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        senha_atual = serializer.validated_data["senha_atual"]
        nova_senha = serializer.validated_data["nova_senha"]

        if not request.user.check_password(senha_atual):
            return Response({"error": "A senha atual informada está incorreta."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(nova_senha)
        request.user.save()

        return Response({"message": "Senha alterada com sucesso!"}, status=status.HTTP_200_OK)


class TwilioEnviarCodigoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TwilioEnviarCodigoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        telefone = serializer.validated_data["telefone"]

        # Formatação para formato E.164
        digits = "".join(filter(str.isdigit, telefone))
        if not digits.startswith("55"):
            digits = "55" + digits
        formatted_whatsapp = f"whatsapp:+{digits}"

        # Se houver credenciais reais de Twilio no settings, faz a chamada real
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_VERIFY_SERVICE_SID:
            try:
                from twilio.rest import Client
                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                client.verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID).verifications.create(
                    to=formatted_whatsapp,
                    channel="whatsapp"
                )
                return Response({"message": f"Código enviado via WhatsApp para {telefone}."})
            except Exception as e:
                return Response({"error": f"Erro na API Twilio: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)

        # Fallback de ambiente de desenvolvimento/testes
        return Response({
            "message": f"[DEV] Código de verificação enviado via WhatsApp para {telefone}. Utilize '123456' para confirmar.",
            "codigo_dev": "123456"
        }, status=status.HTTP_200_OK)


class TwilioVerificarCodigoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TwilioVerificarCodigoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        telefone = serializer.validated_data["telefone"]
        codigo = serializer.validated_data["codigo"].strip()

        approved = False

        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_VERIFY_SERVICE_SID:
            try:
                from twilio.rest import Client
                digits = "".join(filter(str.isdigit, telefone))
                if not digits.startswith("55"):
                    digits = "55" + digits
                formatted_whatsapp = f"whatsapp:+{digits}"

                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                check = client.verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID).verification_checks.create(
                    to=formatted_whatsapp,
                    code=codigo
                )
                approved = (check.status == "approved")
            except Exception as e:
                return Response({"error": f"Erro na verificação Twilio: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)
        else:
            # Em modo dev/mock, aceita '123456' ou qualquer código de 6 dígitos
            approved = (codigo == "123456" or len(codigo) == 6)

        if approved:
            request.user.telefone = telefone
            request.user.telefone_validado = True
            request.user.save()

            # Sincroniza também no perfil PF/PJ se existir
            if request.user.tipo == "PF" and hasattr(request.user, "perfil_pf"):
                request.user.perfil_pf.telefone = telefone
                request.user.perfil_pf.save()
            elif request.user.tipo == "PJ" and hasattr(request.user, "perfil_pj"):
                request.user.perfil_pj.telefone = telefone
                request.user.perfil_pj.save()

            return Response({
                "message": "WhatsApp verificado com sucesso!",
                "telefone": request.user.telefone,
                "telefone_validado": request.user.telefone_validado
            }, status=status.HTTP_200_OK)

        return Response({"error": "Código de verificação incorreto ou expirado."}, status=status.HTTP_400_BAD_REQUEST)


class UsuariosView(generics.ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]


class UsuariosDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]


class RecuperarSenhaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RecuperarSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = Usuario.objects.filter(email__iexact=email).first()
        token = None
        if user:
            token = signing.dumps({"user_id": user.id, "email": user.email}, salt="recuperar-senha")
            subject = "Recuperação de Senha - Best Buddy"
            message = (
                f"Olá!\n\nVocê solicitou a redefinição de senha da sua conta no Best Buddy.\n"
                f"Utilize o token abaixo para redefinir sua senha:\n\n{token}\n\n"
                f"Se não foi você que solicitou, ignore esta mensagem."
            )
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL if hasattr(settings, "DEFAULT_FROM_EMAIL") else "no-reply@bestbuddy.org",
                    [email],
                    fail_silently=True
                )
            except Exception:
                pass

        return Response({
            "message": "Se o e-mail informado estiver cadastrado, as instruções para redefinição foram enviadas.",
            "token_dev": token
        }, status=status.HTTP_200_OK)


class RedefinirSenhaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RedefinirSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        nova_senha = serializer.validated_data["nova_senha"]

        try:
            payload = signing.loads(token, salt="recuperar-senha", max_age=86400)
            user_id = payload.get("user_id")
            user = Usuario.objects.get(pk=user_id)
        except (signing.SignatureExpired, signing.BadSignature, Usuario.DoesNotExist):
            return Response({"error": "Token de redefinição inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(nova_senha)
        user.save()

        return Response({"message": "Senha redefinida com sucesso! Você já pode entrar com a nova senha."}, status=status.HTTP_200_OK)