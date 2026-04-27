import csv

from django.http import HttpResponse
from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import APIView, action
from rest_framework.permissions import IsAuthenticated
from .models import Company, Client, Interaction, Task
from .serializers import CompanySerializer, ClientSerializer, InteractionSerializer, TaskSerializer
from django_filters.rest_framework import DjangoFilterBackend


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]

    # Configuramos los campos de búsqueda
    search_fields = ['name', 'industry']

    # Configuramos el orden: por defecto será alfabético por 'name'
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=False, methods=['get'], pagination_class=None)
    def all(self, request):
        companies = self.get_queryset().order_by('name')
        serializer = self.get_serializer(companies, many=True)
        return Response(serializer.data)


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'company__name']
    filterset_fields = ['status']

    def perform_create(self, serializer):
        # Cuando se guarda un nuevo cliente, le pasamos el usuario actual
        serializer.save(assigned_to=self.request.user)

    def get_queryset(self):
        user = self.request.user
        # Si es superusuario, ve todos los clientes
        if user.is_superuser:
            return Client.objects.all()
        # Si es un comercial normal, solo ve los que tiene asignados
        return Client.objects.filter(assigned_to=user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()

        total = qs.count()
        prospects = qs.filter(status='prospect').count()
        opportunities = qs.filter(status='opportunity').count()
        clients = qs.filter(status='client').count()

        return Response({
            'total': total,
            'prospects': prospects,
            'opportunities': opportunities,
            'clients': clients
        })

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        # Creamos la respuesta con el tipo de contenido correcto
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="clients.csv"'

        writer = csv.writer(response)
        # Cabeceras del CSV
        writer.writerow(['Nombre', 'Apellido', 'Email', 'Teléfono', 'Empresa', 'Estado'])

        # Datos de los clientes
        for client in self.get_queryset():
            writer.writerow([
                client.first_name,
                client.last_name,
                client.email,
                client.phone,
                client.company.name,
                client.get_status_display()
            ])

        return response


class InteractionViewSet(viewsets.ModelViewSet):
    queryset = Interaction.objects.all()
    serializer_class = InteractionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['client']

    # Bloqueamos el borrado a nivel de API
    def destroy(self, request, *args, **kwargs):
        from rest_framework import status
        return Response(
            {"detail": "No está permitido eliminar registros del historial de actividad."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['client', 'is_completed']
    ordering = ['due_date']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Task.objects.all()
        return Task.objects.filter(assigned_to=user)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email
        })
