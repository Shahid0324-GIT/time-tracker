import sys
import random
from datetime import datetime, timedelta, timezone, date
from decimal import Decimal
from sqlmodel import Session, select
from db import engine  # Assuming your db.py exports 'engine'
from models import User, Client, Project, TimeEntry, Invoice, InvoiceLineItem, ProjectStatus, InvoiceStatus

# --- CONFIGURATION ---
TARGET_EMAIL = input("Enter the email of the account you want to seed: ").strip()

def create_dummy_data():
    with Session(engine) as session:
        # 1. Get the User
        statement = select(User).where(User.email == TARGET_EMAIL)
        user = session.exec(statement).first()

        if not user:
            print(f"❌ Error: User with email '{TARGET_EMAIL}' not found.")
            return

        print(f"✅ Found user: {user.first_name} {user.last_name} ({user.id})")
        print("🌱 Starting data seed...")

        # 2. Create Clients
        clients = [
            Client(user_id=user.id, name="Acme Corp", company="Acme Inc.", email="billing@acme.com", notes="Enterprise client"),
            Client(user_id=user.id, name="Stark Industries", company="Stark Ind.", email="tony@stark.com", notes="Pays in crypto"),
            Client(user_id=user.id, name="Cyberdyne", company="Cyberdyne Systems", email="miles@cyberdyne.com", notes="AI Research"),
        ]
        for c in clients:
            session.add(c)
        session.commit()
        for c in clients: session.refresh(c)
        print(f"   - Created {len(clients)} clients")

        # 3. Create Projects
        projects = [
            Project(user_id=user.id, client_id=clients[0].id, name="Corporate Website Redesign", hourly_rate=Decimal("150.00"), budget_hours=Decimal("100"), color="#3B82F6", status=ProjectStatus.ACTIVE),
            Project(user_id=user.id, client_id=clients[0].id, name="Legacy Backend Migration", hourly_rate=Decimal("175.00"), budget_hours=Decimal("200"), color="#EF4444", status=ProjectStatus.ACTIVE),
            Project(user_id=user.id, client_id=clients[1].id, name="J.A.R.V.I.S UI Update", hourly_rate=Decimal("250.00"), budget_hours=Decimal("50"), color="#F59E0B", status=ProjectStatus.COMPLETED),
            Project(user_id=user.id, client_id=clients[2].id, name="Skynet Prevention Protocol", hourly_rate=Decimal("300.00"), budget_hours=Decimal("500"), color="#10B981", status=ProjectStatus.ACTIVE),
            Project(user_id=user.id, client_id=None, name="Internal Tools", hourly_rate=Decimal("0.00"), budget_hours=None, color="#6B7280", status=ProjectStatus.ACTIVE), # Internal project
        ]
        for p in projects:
            session.add(p)
        session.commit()
        for p in projects: session.refresh(p)
        print(f"   - Created {len(projects)} projects")

        # 4. Create Time Entries (Last 30 days)
        time_entries = []
        today = datetime.now(timezone.utc)
        
        for _ in range(30): # Generate 30 random entries
            project = random.choice(projects)
            # Random start time within last 30 days
            days_ago = random.randint(0, 30)
            start_hour = random.randint(9, 17)
            start_time = today - timedelta(days=days_ago)
            start_time = start_time.replace(hour=start_hour, minute=0, second=0, microsecond=0)
            
            # Random duration (30 mins to 4 hours)
            duration_minutes = random.randint(30, 240)
            end_time = start_time + timedelta(minutes=duration_minutes)
            
            entry = TimeEntry(
                user_id=user.id,
                project_id=project.id,
                description=f"Work on {project.name} features",
                start_time=start_time,
                end_time=end_time,
                duration_seconds=duration_minutes * 60,
                is_billable=project.hourly_rate > 0,
                is_invoiced=False
            )
            time_entries.append(entry)
            session.add(entry)
            
        session.commit()
        # Refresh to get IDs
        for t in time_entries: session.refresh(t)
        print(f"   - Created {len(time_entries)} time entries")

        # 5. Create Invoices (One Paid, One Draft)
        
        # Invoice 1: PAID (Acme Corp)
        inv1_entries = time_entries[:3] # Take first 3 entries
        # Mark entries as invoiced
        inv1_total = sum((Decimal(t.duration_seconds)/3600 * projects[0].hourly_rate) for t in inv1_entries) or Decimal("0.00")
        
        invoice1 = Invoice(
            user_id=user.id,
            client_id=clients[0].id,
            invoice_number="INV-001",
            status=InvoiceStatus.PAID,
            issue_date=date.today() - timedelta(days=10),
            due_date=date.today() + timedelta(days=20),
            subtotal=inv1_total,
            total=inv1_total, # Assuming 0 tax for simplicity
            notes="Thank you for your business!"
        )
        session.add(invoice1)
        session.flush() # Get ID

        for t in inv1_entries:
            t.is_invoiced = True
            t.invoice_id = invoice1.id
            session.add(t)
            
            # Line Item
            li = InvoiceLineItem(
                invoice_id=invoice1.id,
                time_entry_id=t.id,
                description=t.description,
                quantity=Decimal(t.duration_seconds)/3600,
                rate=projects[0].hourly_rate,
                amount=(Decimal(t.duration_seconds)/3600 * projects[0].hourly_rate)
            )
            session.add(li)

        # Invoice 2: DRAFT (Stark Ind)
        invoice2 = Invoice(
            user_id=user.id,
            client_id=clients[1].id,
            invoice_number="INV-002",
            status=InvoiceStatus.DRAFT,
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=30),
            subtotal=Decimal("0.00"),
            total=Decimal("0.00")
        )
        session.add(invoice2)

        session.commit()
        print(f"   - Created 2 Invoices (1 Paid, 1 Draft)")
        print("\n✨ Database seeded successfully! Restart your frontend to see the data.")

if __name__ == "__main__":
    create_dummy_data()