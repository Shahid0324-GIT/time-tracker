from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import StreamingResponse
from typing import List, Optional
from sqlmodel import Session, select, desc, func as sql_func
from uuid import UUID
from decimal import Decimal
from io import BytesIO

from reportlab.lib import colors # type: ignore 
from reportlab.lib.pagesizes import letter, A4 # type: ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle# type: ignore
from reportlab.lib.units import inch# type: ignore
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer# type: ignore

from db import get_session
from models import (
    Invoice, InvoiceLineItem, TimeEntry, Project, Client, User
)
from api_types import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse, 
    InvoiceWithDetails, InvoiceLineItemResponse, 
    InvoiceStatus, ClientResponse
)
from auth import get_current_user

router = APIRouter(prefix="/invoices", tags=["Invoices"])

# ============================================
# HELPER: Generate Invoice Number
# ============================================

def generate_invoice_number(session: Session, user_id: UUID) -> str:
    """
    Generate unique invoice number for user
    Format: INV-001, INV-002, etc.
    """
    statement = select(sql_func.count()).select_from(Invoice).where(Invoice.user_id == user_id)
    count = session.exec(statement).one()
    next_number = count + 1
    return f"INV-{next_number:03d}"


# ============================================
# HELPER: Calculate Invoice Totals
# ============================================

def calculate_invoice_totals(subtotal: Decimal, tax_rate: Decimal) -> tuple[Decimal, Decimal]:
    """
    Calculate tax amount and total
    Returns: (tax_amount, total)
    """
    tax_amount = subtotal * tax_rate
    total = subtotal + tax_amount
    
    # Round to 2 decimal places
    tax_amount = tax_amount.quantize(Decimal("0.01"))
    total = total.quantize(Decimal("0.01"))
    
    return tax_amount, total


# ============================================
# HELPER: Load Invoice with Details
# ============================================

def load_invoice_with_details(session: Session, invoice_id: UUID) -> dict:
    """Load invoice with client and line items"""
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice_dict = InvoiceWithDetails.model_validate(invoice).model_dump()
    
    # Load client
    if invoice.client_id:
        client = session.get(Client, invoice.client_id)
        if client:
            invoice_dict['client'] = ClientResponse.model_validate(client).model_dump()
    
    # Load line items
    statement = select(InvoiceLineItem).where(InvoiceLineItem.invoice_id == invoice_id)
    line_items = session.exec(statement).all()
    invoice_dict['line_items'] = [
        InvoiceLineItemResponse.model_validate(item).model_dump()
        for item in line_items
    ]
    
    return invoice_dict


# ============================================
# GENERATE INVOICE
# ============================================

@router.post("/generate", status_code=status.HTTP_201_CREATED, response_model=InvoiceWithDetails)
def generate_invoice(
    invoice_data: InvoiceCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Generate an invoice from time entries
    
    - Marks time entries as invoiced
    - Creates invoice and line items
    - Calculates totals automatically
    """
    
    # Verify client belongs to user
    client = session.get(Client, invoice_data.client_id)
    if not client or client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Verify all time entries exist, belong to user, and are unbilled
    time_entries = []
    for entry_id in invoice_data.time_entry_ids:
        entry = session.get(TimeEntry, entry_id)
        
        if not entry or entry.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Time entry {entry_id} not found"
            )
        
        if entry.is_invoiced:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Time entry {entry_id} is already invoiced"
            )
        
        if not entry.is_billable:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Time entry {entry_id} is not billable"
            )
        
        time_entries.append(entry)
    
    if not time_entries:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid time entries provided"
        )
    
    # Generate invoice number
    invoice_number = generate_invoice_number(session, current_user.id)
    
    # Create invoice
    invoice = Invoice(
        user_id=current_user.id,
        client_id=invoice_data.client_id,
        invoice_number=invoice_number,
        status=InvoiceStatus.DRAFT,
        issue_date=invoice_data.issue_date,
        due_date=invoice_data.due_date,
        tax_rate=invoice_data.tax_rate,
        notes=invoice_data.notes,
        payment_terms=invoice_data.payment_terms
    )
    
    session.add(invoice)
    session.flush()  # Get invoice.id without committing
    
    # Create line items and calculate subtotal
    subtotal = Decimal("0.00")
    
    for entry in time_entries:
        # Get project for hourly rate
        project = session.get(Project, entry.project_id)
        if not project:
            continue
        
        # Calculate hours from seconds
        hours = Decimal(entry.duration_seconds or 0) / Decimal("3600")
        hours = hours.quantize(Decimal("0.01"))  # Round to 2 decimals
        
        # Calculate amount
        rate = project.hourly_rate
        amount = hours * rate
        amount = amount.quantize(Decimal("0.01"))
        
        # Create line item
        line_item = InvoiceLineItem(
            invoice_id=invoice.id,
            time_entry_id=entry.id,
            description=f"{project.name}: {entry.description or 'Time entry'}",
            quantity=hours,
            rate=rate,
            amount=amount
        )
        
        session.add(line_item)
        subtotal += amount
        
        # Mark time entry as invoiced
        entry.is_invoiced = True
        entry.invoice_id = invoice.id
        session.add(entry)
    
    # Calculate totals
    subtotal = subtotal.quantize(Decimal("0.01"))
    tax_amount, total = calculate_invoice_totals(subtotal, invoice_data.tax_rate)
    
    # Update invoice with totals
    invoice.subtotal = subtotal
    invoice.tax_amount = tax_amount
    invoice.total = total
    
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    
    # Load relationships for response
    return load_invoice_with_details(session, invoice.id)


# ============================================
# LIST INVOICES
# ============================================

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[InvoiceResponse])
def get_invoices(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    client_id: Optional[UUID] = None,
    status_filter: Optional[InvoiceStatus] = Query(None, alias="status"),
    limit: int = Query(100, le=500),
    offset: int = 0
):
    """
    Get all invoices for current user
    
    Query params:
    - client_id: Filter by client
    - status: Filter by status
    - limit: Max results
    - offset: Pagination offset
    """
    
    # Base query
    statement = select(Invoice).where(
        Invoice.user_id == current_user.id,
        Invoice.is_active == True
    )
    
    # Apply filters
    if client_id:
        statement = statement.where(Invoice.client_id == client_id)
    
    if status_filter:
        statement = statement.where(Invoice.status == status_filter)
    
    # Order and paginate
    statement = statement.order_by(desc(Invoice.issue_date)).offset(offset).limit(limit)
    
    invoices = session.exec(statement).all()
    
    return invoices


# ============================================
# GET SINGLE INVOICE
# ============================================

@router.get("/{invoice_id}", status_code=status.HTTP_200_OK, response_model=InvoiceWithDetails)
def get_invoice(
    invoice_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get invoice with all details"""
    
    invoice = session.get(Invoice, invoice_id)
    
    if not invoice or invoice.user_id != current_user.id or not invoice.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    return load_invoice_with_details(session, invoice_id)


# ============================================
# UPDATE INVOICE
# ============================================

@router.patch("/{invoice_id}", status_code=status.HTTP_200_OK, response_model=InvoiceResponse)
def update_invoice(
    invoice_id: UUID,
    invoice_data: InvoiceUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update invoice (cannot update if paid)"""
    
    invoice = session.get(Invoice, invoice_id)
    
    if not invoice or invoice.user_id != current_user.id or not invoice.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Can't modify paid invoices (except status)
    if invoice.status == InvoiceStatus.PAID:
        # Only allow status changes for paid invoices
        if set(invoice_data.model_dump(exclude_unset=True).keys()) != {"status"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot modify paid invoices except status"
            )
    
    # Update fields
    update_data = invoice_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(invoice, key, value)
    
    # Recalculate totals if tax rate changed
    if 'tax_rate' in update_data:
        tax_amount, total = calculate_invoice_totals(invoice.subtotal, invoice.tax_rate)
        invoice.tax_amount = tax_amount
        invoice.total = total
    
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    
    return invoice


# ============================================
# DELETE INVOICE
# ============================================

@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Soft delete invoice (cannot delete if paid)
    Also unmarks associated time entries
    """
    
    invoice = session.get(Invoice, invoice_id)
    
    if not invoice or invoice.user_id != current_user.id or not invoice.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Can't delete paid invoices
    if invoice.status == InvoiceStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete paid invoices"
        )
    
    # Unmark time entries
    statement = select(TimeEntry).where(TimeEntry.invoice_id == invoice_id)
    time_entries = session.exec(statement).all()
    
    for entry in time_entries:
        entry.is_invoiced = False
        entry.invoice_id = None
        session.add(entry)
    
    # Soft delete invoice
    invoice.is_active = False
    
    session.add(invoice)
    session.commit()


# ============================================
# UPDATE INVOICE STATUS
# ============================================

@router.patch("/{invoice_id}/status/{new_status}", response_model=InvoiceResponse)
def update_invoice_status(
    invoice_id: UUID,
    new_status: InvoiceStatus,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Quick endpoint to update invoice status"""
    
    invoice = session.get(Invoice, invoice_id)
    
    if not invoice or invoice.user_id != current_user.id or not invoice.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice.status = new_status
    
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    
    return invoice


# ============================================
# GENERATE PDF
# ============================================

@router.get("/{invoice_id}/pdf")
def generate_invoice_pdf(
    invoice_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Generate and download invoice as PDF"""
    
    # Get invoice with details
    invoice = session.get(Invoice, invoice_id)
    
    if not invoice or invoice.user_id != current_user.id or not invoice.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Get client
    client = session.get(Client, invoice.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get line items
    statement = select(InvoiceLineItem).where(InvoiceLineItem.invoice_id == invoice_id)
    line_items = session.exec(statement).all()
    
    # Create PDF in memory
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Container for PDF elements
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
    )
    
    # Title
    elements.append(Paragraph("INVOICE", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Invoice details table
    invoice_info = [
        ['Invoice Number:', invoice.invoice_number],
        ['Issue Date:', invoice.issue_date.strftime('%B %d, %Y')],
        ['Due Date:', invoice.due_date.strftime('%B %d, %Y')],
        ['Status:', invoice.status.value.upper()],
    ]
    
    invoice_info_table = Table(invoice_info, colWidths=[2*inch, 3*inch])
    invoice_info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(invoice_info_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Bill To section
    elements.append(Paragraph(f"<b>Bill To:</b>", styles['Normal']))
    elements.append(Spacer(1, 0.1*inch))
    bill_to_text = f"<b>{client.name}</b><br/>"
    if client.company:
        bill_to_text += f"{client.company}<br/>"
    if client.email:
        bill_to_text += f"{client.email}"
    elements.append(Paragraph(bill_to_text, styles['Normal']))
    elements.append(Spacer(1, 0.4*inch))
    
    # Line items table
    line_items_data = [
        ['Description', 'Hours', 'Rate', 'Amount']
    ]
    
    for item in line_items:
        line_items_data.append([
            item.description,
            f"{float(item.quantity):.2f}",
            f"${float(item.rate):.2f}",
            f"${float(item.amount):.2f}"
        ])
    
    line_items_table = Table(line_items_data, colWidths=[3.5*inch, 1*inch, 1*inch, 1*inch])
    line_items_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#1e40af')),
    ]))
    
    elements.append(line_items_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Totals table
    totals_data = [
        ['Subtotal:', f"${float(invoice.subtotal):.2f}"],
        [f'Tax ({float(invoice.tax_rate * 100):.2f}%):', f"${float(invoice.tax_amount):.2f}"],
        ['Total:', f"${float(invoice.total):.2f}"],
    ]
    
    totals_table = Table(totals_data, colWidths=[4.5*inch, 2*inch])
    totals_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 1), 'Helvetica'),
        ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('LINEABOVE', (0, 2), (-1, 2), 2, colors.black),
    ]))
    
    elements.append(totals_table)
    
    # Notes
    if invoice.notes:
        elements.append(Spacer(1, 0.4*inch))
        elements.append(Paragraph("<b>Notes:</b>", styles['Normal']))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(invoice.notes, styles['Normal']))
    
    # Payment terms
    if invoice.payment_terms:
        elements.append(Spacer(1, 0.3*inch))
        elements.append(Paragraph(f"<b>Payment Terms:</b> {invoice.payment_terms}", styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    
    # Get PDF data
    buffer.seek(0)
    
    # Return as downloadable file
    filename = f"invoice-{invoice.invoice_number}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )