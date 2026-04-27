from rest_framework import serializers
from .models import Company, Client, Interaction, Task


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class ClientSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    company_website = serializers.ReadOnlyField(source='company.website')
    company_industry = serializers.ReadOnlyField(source='company.industry')
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.username')

    class Meta:
        model = Client
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone',
            'status', 'company', 'company_name', 'company_website',
            'company_industry', 'assigned_to', 'assigned_to_name', 'created_at'
        ]


class InteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaction
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    company_name = serializers.ReadOnlyField(source='client.company.name')

    class Meta:
        model = Task
        fields = [
            'id', 'client', 'client_name', 'company_name', 'assigned_to',
            'description', 'due_date', 'is_completed', 'created_at'
        ]

    def get_client_name(self, obj):
        return f"{obj.client.first_name} {obj.client.last_name}"
