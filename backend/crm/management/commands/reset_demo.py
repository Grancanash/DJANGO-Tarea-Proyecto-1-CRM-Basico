import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from crm.models import Company, Client, Interaction, Task


class Command(BaseCommand):
    help = 'Resetea la base de datos al estado inicial de la demo'

    def handle(self, *args, **kwargs):
        self.stdout.write("Iniciando reseteo de la base de datos...")

        # 1. Limpieza de datos existentes
        Task.objects.all().delete()
        Interaction.objects.all().delete()
        Client.objects.all().delete()
        Company.objects.all().delete()

        # 2. Configuración de Usuarios
        v_prin, _ = User.objects.get_or_create(username='vendedor_1', defaults={'email': 'vendedor1@basiccrm.com'})
        otros = list(User.objects.exclude(username='vendedor_1'))
        if not otros:
            otros = [v_prin]

        # 3. Creación de 30 Empresas Legendarias
        empresas_ficticias = [
            ("Pollos Hermanos", "https://lospollos.com", "Comida Rápida"),
            ("Vandalay Industries", "https://latexpro.com", "Importación de Látex"),
            ("Prestige Worldwide", "https://boats-n-hoes.biz", "Eventos"),
            ("Dunder Mifflin", "https://paper-king.com", "Papelería"),
            ("Pied Piper", "https://middle-out.io", "Software"),
            ("Acme Corp", "https://yoyocoyote.com", "Explosivos"),
            ("Cyberdyne Systems", "https://skynet.com", "Robótica"),
            ("Black Mesa", "https://resonance.com", "Física"),
            ("Stark Industries", "https://ironman.com", "Tecnología"),
            ("Oscorp", "https://goblin.com", "Genética"),
            ("Duff Beer", "https://duff.com", "Bebidas"),
            ("Initech", "https://office.com", "Consultoría"),
            ("Globex Corporation", "https://villain.pw", "Energía"),
            ("Willy Wonka Factory", "https://wonka.com", "Dulces"),
            ("Genco Pura Olive Oil", "https://genco.it", "Aceite de Oliva"),
            ("Wayne Enterprises", "https://wayne.com", "Defensa"),
            ("Buy n Large", "https://bnl.com", "Retail"),
            ("Bluth Company", "https://bluth.com", "Inmobiliaria"),
            ("Central Perk", "https://central.com", "Cafetería"),
            ("Jurassic Park", "https://dino.com", "Turismo"),
            ("Planet Express", "https://planet.com", "Logística"),
            ("Sterling Cooper", "https://madmen.com", "Publicidad"),
            ("Oceanic Airlines", "https://lost.com", "Aerolínea"),
            ("Weyland-Yutani", "https://aliens.com", "Minería"),
            ("Tyrell Corp", "https://replicant.com", "Bioingeniería"),
            ("Soylent Corp", "https://soylent.com", "Alimentación"),
            ("Aperture Science", "https://glados.com", "I+D"),
            ("Gringotts", "https://bank.com", "Banca"),
            ("S-Mart", "https://smart.com", "Retail"),
            ("Monsters Inc", "https://boo.com", "Energía")
        ]

        for n, w, i in empresas_ficticias:
            Company.objects.create(name=n, website=w, industry=i)

        emps = {c.name: c for c in Company.objects.all()}

        # 4. Lista de 40 Clientes
        # El email y el teléfono se generan automáticamente abajo
        clientes_base = [
            ("Walter", "White", "Pollos Hermanos"), ("Jesse", "Pinkman", "Pollos Hermanos"),
            ("Saul", "Goodman", "Pollos Hermanos"), ("Michael", "Scott", "Dunder Mifflin"),
            ("Dwight", "Schrute", "Dunder Mifflin"), ("Jim", "Halpert", "Dunder Mifflin"),
            ("Pam", "Beesly", "Dunder Mifflin"), ("George", "Costanza", "Vandalay Industries"),
            ("Cosmo", "Kramer", "Vandalay Industries"), ("Brennan", "Huff", "Prestige Worldwide"),
            ("Dale", "Doback", "Prestige Worldwide"), ("Richard", "Hendricks", "Pied Piper"),
            ("Bertram", "Gilfoyle", "Pied Piper"), ("Dinesh", "Chugtai", "Pied Piper"),
            ("Wile E.", "Coyote", "Acme Corp"), ("Road", "Runner", "Acme Corp"),
            ("Sarah", "Connor", "Cyberdyne Systems"), ("T-800", "Terminator", "Cyberdyne Systems"),
            ("Gordon", "Freeman", "Black Mesa"), ("Isaac", "Kleiner", "Black Mesa"),
            ("Tony", "Stark", "Stark Industries"), ("Pepper", "Potts", "Stark Industries"),
            ("Norman", "Osborn", "Oscorp"), ("Peter", "Parker", "Oscorp"),
            ("Homer", "Simpson", "Duff Beer"), ("Barney", "Gumble", "Duff Beer"),
            ("Peter", "Gibbons", "Initech"), ("Milton", "Waddams", "Initech"),
            ("Hank", "Scorpio", "Globex Corporation"), ("Willy", "Wonka", "Willy Wonka Factory"),
            ("Charlie", "Bucket", "Willy Wonka Factory"), ("Vito", "Corleone", "Genco Pura Olive Oil"),
            ("Tom", "Hagen", "Genco Pura Olive Oil"), ("Bruce", "Wayne", "Wayne Enterprises"),
            ("Alfred", "Pennyworth", "Wayne Enterprises"), ("Wall-E", "Robot", "Buy n Large"),
            ("Michael", "Bluth", "Bluth Company"), ("Gob", "Bluth", "Bluth Company"),
            ("Gunther", "Central", "Central Perk"), ("Ian", "Malcolm", "Jurassic Park")
        ]

        p_n = ["Llamada en frío, no contesta.", "Hablé con secretaría, dejo recado.",
               "Enviado email de presentación.", "Enviado catálogo general."]
        o_n = ["Reunión de demo realizada.", "Pide presupuesto detallado.", "Negociando descuento.", "Revisión técnica."]
        c_n = ["Llamada de cortesía mensual.", "Problema resuelto.",
               "Interesado en ampliar servicios.", "Sesión de formación."]

        stats = ['prospect', 'opportunity', 'client']

        # 5. Bucle de Creación Lógico y Coherente
        overdue_tasks_count = 0

        pools = {
            'call': {
                'prospect': ["Llamada de prospección, no contesta.", "Hablé con secretaría, volveré a llamar.", "Breve llamada de presentación muy positiva."],
                'opportunity': ["Llamada para revisar dudas del presupuesto.", "Negociación telefónica de las cláusulas.", "Llamada de seguimiento tras la demo."],
                'client': ["Llamada de cortesía para ver cómo va todo.", "Seguimiento telefónico del servicio.", "Soporte telefónico puntual resuelto."]
            },
            'email': {
                'prospect': ["Enviado email con el catálogo general.", "Correo de presentación enviado a RRHH.", "Seguimiento de contacto por email."],
                'opportunity': ["Enviada propuesta económica detallada.", "Correo con respuesta a dudas técnicas.", "Enviado borrador de contrato para revisión."],
                'client': ["Envío de factura mensual.", "Enviada encuesta de satisfacción.", "Email informativo sobre nuevas funciones."]
            },
            'meeting': {
                'prospect': ["Breve encuentro en feria del sector.", "Visita presencial de presentación.", "Reunión de toma de requisitos."],
                'opportunity': ["Reunión de demostración de producto.", "Presentación oficial de la propuesta.", "Cita presencial para firma de contrato."],
                'client': ["Comida de fidelización con el cliente.", "Reunión trimestral de seguimiento.", "Visita técnica de mantenimiento."]
            }
        }

        task_pools = {
            'prospect': ["Llamada de prospección", "Enviar catálogo", "Seguimiento de contacto"],
            'opportunity': ["Preparar presupuesto", "Revisión técnica", "Enviar contrato"],
            'client': ["Llamada de cortesía", "Solicitar feedback", "Renovación"]
        }

        # Usamos (nombre, apellido, n_empresa) para no equivocarnos con los índices
        for i, (nombre, apellido, n_empresa) in enumerate(clientes_base):
            emp = emps.get(n_empresa)

            if emp:
                agente = v_prin if i < 20 else otros[i % len(otros)]
                status = random.choice(['prospect', 'opportunity', 'client'])

                # Generación de Email y Teléfono
                dominio = emp.website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
                email_auto = f"{nombre.lower()}.{apellido.lower()}@{dominio}"
                telefono_auto = f"+34 6{random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)}"

                client = Client.objects.create(
                    first_name=nombre,
                    last_name=apellido,
                    email=email_auto,
                    phone=telefono_auto,
                    company=emp,
                    assigned_to=agente,
                    status=status
                )

                # Crear Interacciones COHERENTES
                for _ in range(random.randint(3, 5)):
                    t_act = random.choice(['call', 'email', 'meeting'])
                    nota = random.choice(pools[t_act][status])

                    it = Interaction.objects.create(
                        client=client, agent=agente,
                        type=t_act,
                        notes=nota
                    )
                    Interaction.objects.filter(id=it.id).update(
                        created_at=timezone.now() - timedelta(days=random.randint(2, 20))
                    )

                # --- TAREAS ---
                Task.objects.create(
                    client=client,
                    assigned_to=agente,
                    description="Contacto inicial",
                    due_date=timezone.now() - timedelta(days=15),
                    is_completed=True
                )

                desc_t = random.choice(task_pools[status])
                if agente == v_prin and overdue_tasks_count < 2:
                    f_t = timezone.now() - timedelta(days=2)
                    overdue_tasks_count += 1
                else:
                    f_t = timezone.now() + timedelta(days=random.randint(1, 10))

                Task.objects.create(
                    client=client,
                    assigned_to=agente,
                    description=desc_t,
                    due_date=f_t,
                    is_completed=False
                )

        self.stdout.write(self.style.SUCCESS(f'¡Demo reseteada con éxito!'))
